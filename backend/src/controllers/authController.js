import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import { query } from '../config/database.js';
import { isReservedHandle, normalizeHandle } from '../utils/account.js';

const generateTokens = (userId) => {
  const accessToken = jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });

  const refreshToken = jwt.sign(
    { userId },
    process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '30d' }
  );

  return { accessToken, refreshToken };
};

const getProfileTitles = (profileType) => {
  const titlesByType = {
    student: { title_kz: 'Студент', title_ru: 'Студент', title_en: 'Student' },
    teacher: { title_kz: 'Мұғалім', title_ru: 'Учитель', title_en: 'Teacher' },
    other: { title_kz: 'Маман', title_ru: 'Специалист', title_en: 'Specialist' },
  };

  return titlesByType[profileType] || titlesByType.other;
};

const loadUserBundle = async (userId) => {
  const [userRes, profileRes, settingsRes] = await Promise.all([
    query('SELECT id, username, email, role, is_active FROM users WHERE id = $1', [userId]),
    query('SELECT * FROM profiles WHERE user_id = $1', [userId]),
    query('SELECT * FROM user_settings WHERE user_id = $1', [userId]),
  ]);

  const user = userRes.rows[0];

  if (!user) {
    return null;
  }

  return {
    ...user,
    profile: profileRes.rows[0] || null,
    settings: settingsRes.rows[0] || null,
  };
};

export const register = async (req, res) => {
  try {
    const {
      email,
      password,
      fullName,
      profileType,
      activityMode,
      yearsExperience,
      whoAreYou,
      username,
    } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email және құпиясөз міндетті' });
    }

    if (password.length < 6) {
      return res.status(400).json({ success: false, message: 'Құпиясөз кемінде 6 таңбадан тұруы керек' });
    }

    const normalizedEmail = String(email).trim().toLowerCase();
    const existing = await query('SELECT id FROM users WHERE email = $1', [normalizedEmail]);

    if (existing.rows.length) {
      return res.status(409).json({ success: false, message: 'Бұл email бұрын тіркелген' });
    }

    const safeUsername = normalizeHandle(username || normalizedEmail.split('@')[0]).slice(0, 50);

    if (!safeUsername || safeUsername.length < 3) {
      return res.status(400).json({ success: false, message: 'Пайдаланушы аты кемінде 3 таңбадан тұруы керек' });
    }

    if (isReservedHandle(safeUsername)) {
      return res.status(400).json({ success: false, message: 'Бұл пайдаланушы атын қолдануға болмайды' });
    }

    const usernameTaken = await query('SELECT id FROM users WHERE username = $1', [safeUsername]);

    if (usernameTaken.rows.length) {
      return res.status(409).json({ success: false, message: 'Бұл пайдаланушы аты бос емес' });
    }

    const allowedProfileTypes = new Set(['student', 'teacher', 'other']);
    const safeProfileType = allowedProfileTypes.has(profileType) ? profileType : 'other';

    const allowedActivityModes = new Set(['study', 'work', 'both', 'other']);
    const safeActivityMode = allowedActivityModes.has(activityMode) ? activityMode : 'other';

    const availableForWork = safeActivityMode === 'work' || safeActivityMode === 'both';
    const yearsExp = availableForWork ? Math.max(0, parseInt(yearsExperience, 10) || 0) : 0;

    const titles = getProfileTitles(safeProfileType);
    const passwordHash = await bcrypt.hash(password, 12);
    const userId = uuidv4();
    const role = whoAreYou === 'resume' ? 'portfolio_admin' : 'user';

    await query(
      'INSERT INTO users (id, username, email, password_hash, role) VALUES ($1, $2, $3, $4, $5)',
      [userId, safeUsername, normalizedEmail, passwordHash, role]
    );

    await query(
      `INSERT INTO profiles (
        user_id,
        full_name,
        title_kz,
        title_ru,
        title_en,
        years_experience,
        available_for_work
      ) VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [userId, fullName || normalizedEmail.split('@')[0], titles.title_kz, titles.title_ru, titles.title_en, yearsExp, availableForWork]
    );

    await query(
      `INSERT INTO user_settings (
        user_id,
        portfolio_slug,
        is_published,
        onboarding_step,
        onboarding_completed,
        primary_color
      ) VALUES ($1, $2, false, 1, false, 'blue')`,
      [userId, safeUsername]
    );

    const { accessToken, refreshToken } = generateTokens(userId);

    await query(
      'INSERT INTO refresh_tokens (user_id, token, expires_at) VALUES ($1, $2, NOW() + INTERVAL \'30 days\')',
      [userId, refreshToken]
    );

    const user = await loadUserBundle(userId);

    res.status(201).json({
      success: true,
      message: 'Тіркелу сәтті аяқталды',
      data: { accessToken, refreshToken, user },
    });
  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({ success: false, message: 'Тіркелу кезінде қате шықты' });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email және құпиясөз міндетті' });
    }

    const normalizedEmail = String(email).trim().toLowerCase();
    const { rows } = await query('SELECT * FROM users WHERE email = $1', [normalizedEmail]);

    if (!rows.length || !(await bcrypt.compare(password, rows[0].password_hash))) {
      return res.status(401).json({ success: false, message: 'Email немесе құпиясөз қате' });
    }

    if (!rows[0].is_active) {
      return res.status(403).json({ success: false, message: 'Аккаунт белсенді емес' });
    }

    const { accessToken, refreshToken } = generateTokens(rows[0].id);

    await query(
      'INSERT INTO refresh_tokens (user_id, token, expires_at) VALUES ($1, $2, NOW() + INTERVAL \'30 days\')',
      [rows[0].id, refreshToken]
    );

    const user = await loadUserBundle(rows[0].id);

    res.json({
      success: true,
      message: 'Кіру сәтті аяқталды',
      data: { accessToken, refreshToken, user },
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ success: false, message: 'Кіру мүмкін болмады' });
  }
};

export const refreshToken = async (req, res) => {
  try {
    const { refreshToken: token } = req.body;

    if (!token) {
      return res.status(400).json({ success: false, message: 'Refresh token міндетті' });
    }

    const tokenRow = await query(
      'SELECT * FROM refresh_tokens WHERE token = $1 AND expires_at > NOW()',
      [token]
    );

    if (!tokenRow.rows.length) {
      return res.status(401).json({ success: false, message: 'Refresh token жарамсыз немесе мерзімі өткен' });
    }

    const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET);
    const { accessToken, refreshToken: nextRefreshToken } = generateTokens(decoded.userId);

    await query('DELETE FROM refresh_tokens WHERE token = $1', [token]);
    await query(
      'INSERT INTO refresh_tokens (user_id, token, expires_at) VALUES ($1, $2, NOW() + INTERVAL \'30 days\')',
      [decoded.userId, nextRefreshToken]
    );

    res.json({
      success: true,
      data: { accessToken, refreshToken: nextRefreshToken },
    });
  } catch (err) {
    res.status(401).json({ success: false, message: 'Refresh token жаңарту сәтсіз аяқталды' });
  }
};

export const logout = async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (refreshToken) {
      await query('DELETE FROM refresh_tokens WHERE token = $1', [refreshToken]);
    }

    res.json({ success: true, message: 'Шығу сәтті аяқталды' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Шығу мүмкін болмады' });
  }
};

export const getMe = async (req, res) => {
  try {
    const user = await loadUserBundle(req.user.id);
    res.json({ success: true, data: user });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Пайдаланушы деректерін алу мүмкін болмады' });
  }
};

export const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const { rows } = await query('SELECT password_hash FROM users WHERE id = $1', [req.user.id]);

    if (!rows.length || !(await bcrypt.compare(currentPassword, rows[0].password_hash))) {
      return res.status(401).json({ success: false, message: 'Ағымдағы құпиясөз қате' });
    }

    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({ success: false, message: 'Жаңа құпиясөз кемінде 6 таңба болуы керек' });
    }

    const passwordHash = await bcrypt.hash(newPassword, 12);

    await query('UPDATE users SET password_hash = $1 WHERE id = $2', [passwordHash, req.user.id]);
    await query('DELETE FROM refresh_tokens WHERE user_id = $1', [req.user.id]);

    res.json({ success: true, message: 'Құпиясөз жаңартылды' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Құпиясөзді өзгерту мүмкін болмады' });
  }
};
