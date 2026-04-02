import { query } from '../config/database.js';
import { isReservedHandle, isTrue, normalizeHandle, sanitizeThemeSettings } from '../utils/account.js';

const getLegacyAdminUserId = async () => {
  const { rows } = await query("SELECT id FROM users WHERE role = 'superadmin' ORDER BY created_at ASC LIMIT 1");
  return rows[0]?.id || null;
};

const parseJsonArray = (value) => {
  if (!value) {
    return [];
  }

  if (Array.isArray(value)) {
    return value;
  }

  try {
    return JSON.parse(value);
  } catch {
    return [];
  }
};

const getContactTargetUserId = async (portfolioHandle) => {
  const handle = normalizeHandle(portfolioHandle);

  if (!handle) {
    return null;
  }

  const { rows } = await query(
    `SELECT u.id
     FROM users u
     LEFT JOIN user_settings us ON us.user_id = u.id
     WHERE u.is_active = true
       AND (LOWER(u.username) = $1 OR LOWER(us.portfolio_slug) = $1)
     LIMIT 1`,
    [handle]
  );

  return rows[0]?.id || null;
};

const buildSettingsInsert = async (userId, username) => {
  const fallbackSlug = normalizeHandle(username || `user-${userId.slice(0, 8)}`);
  const { rows } = await query(
    `INSERT INTO user_settings (
      user_id,
      portfolio_slug,
      primary_color,
      is_published,
      onboarding_step,
      onboarding_completed
    ) VALUES ($1, $2, 'blue', false, 1, false)
    ON CONFLICT (user_id) DO UPDATE SET updated_at = NOW()
    RETURNING *`,
    [userId, fallbackSlug]
  );

  return rows[0];
};

// ============================================================
// PROFILE
// ============================================================
export const getProfile = async (req, res) => {
  try {
    const { rows } = await query(
      `SELECT p.*, u.email, u.role
       FROM profiles p
       JOIN users u ON u.id = p.user_id
       WHERE u.role = 'superadmin'
       LIMIT 1`
    );

    if (!rows.length) {
      return res.status(404).json({ success: false, message: 'Профиль табылмады' });
    }

    res.json({ success: true, data: rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Профильді жүктеу мүмкін болмады' });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const avatarUrl = req.file ? `/uploads/avatars/${req.file.filename}` : undefined;
    const updates = [];
    const params = [];

    const fields = {
      full_name: req.body.full_name,
      title_kz: req.body.title_kz,
      title_ru: req.body.title_ru,
      title_en: req.body.title_en,
      bio_kz: req.body.bio_kz,
      bio_ru: req.body.bio_ru,
      bio_en: req.body.bio_en,
      location: req.body.location,
      phone: req.body.phone,
      website: req.body.website,
      github: req.body.github,
      linkedin: req.body.linkedin,
      twitter: req.body.twitter,
      telegram: req.body.telegram,
      years_experience: req.body.years_experience,
      available_for_work: req.body.available_for_work,
    };

    for (const [key, value] of Object.entries(fields)) {
      if (value !== undefined) {
        params.push(value);
        updates.push(`${key} = $${params.length}`);
      }
    }

    if (avatarUrl) {
      params.push(avatarUrl);
      updates.push(`avatar_url = $${params.length}`);
    }

    if (!updates.length) {
      return res.status(400).json({ success: false, message: 'Жаңартатын дерек жоқ' });
    }

    params.push(req.user.id);
    const { rows } = await query(
      `UPDATE profiles
       SET ${updates.join(', ')}, updated_at = NOW()
       WHERE user_id = $${params.length}
       RETURNING *`,
      params
    );

    res.json({ success: true, data: rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Профильді жаңарту мүмкін болмады' });
  }
};

export const getMyProfile = async (req, res) => {
  try {
    const { rows } = await query('SELECT * FROM profiles WHERE user_id = $1', [req.user.id]);

    if (!rows.length) {
      return res.status(404).json({ success: false, message: 'Профиль табылмады' });
    }

    res.json({ success: true, data: rows[0] });
  } catch {
    res.status(500).json({ success: false, message: 'Профильді алу мүмкін болмады' });
  }
};

export const updateMyProfile = async (req, res) => {
  try {
    const avatarUrl = req.file ? `/uploads/avatars/${req.file.filename}` : undefined;
    const updates = [];
    const params = [];

    const allowedFields = [
      'full_name',
      'profession',
      'intro_kz',
      'about_kz',
      'title_kz',
      'bio_kz',
      'location',
      'phone',
      'website',
      'github',
      'linkedin',
      'telegram',
      'instagram',
      'years_experience',
      'available_for_work',
    ];

    for (const key of allowedFields) {
      if (req.body[key] !== undefined) {
        params.push(req.body[key]);
        updates.push(`${key} = $${params.length}`);
      }
    }

    if (avatarUrl) {
      params.push(avatarUrl);
      updates.push(`avatar_url = $${params.length}`);
    }

    if (!updates.length) {
      return res.status(400).json({ success: false, message: 'Өзгертуге дерек жоқ' });
    }

    params.push(req.user.id);
    const { rows } = await query(
      `UPDATE profiles
       SET ${updates.join(', ')}, updated_at = NOW()
       WHERE user_id = $${params.length}
       RETURNING *`,
      params
    );

    res.json({ success: true, data: rows[0] });
  } catch (err) {
    console.error('updateMyProfile error:', err);
    res.status(500).json({ success: false, message: 'Профильді жаңарту мүмкін болмады' });
  }
};

export const getMySettings = async (req, res) => {
  try {
    const { rows } = await query('SELECT * FROM user_settings WHERE user_id = $1', [req.user.id]);

    if (rows.length) {
      return res.json({ success: true, data: rows[0] });
    }

    const settings = await buildSettingsInsert(req.user.id, req.user.username);
    res.json({ success: true, data: settings });
  } catch {
    res.status(500).json({ success: false, message: 'Баптауларды алу мүмкін болмады' });
  }
};

export const updateMySettings = async (req, res) => {
  try {
    const existing = await query('SELECT * FROM user_settings WHERE user_id = $1', [req.user.id]);
    const currentSettings = existing.rows[0] || (await buildSettingsInsert(req.user.id, req.user.username));
    const updates = [];
    const params = [];

    if (req.body.primary_color !== undefined) {
      const theme = sanitizeThemeSettings({
        primaryColor: req.body.primary_color,
        primaryColorHex: req.body.primary_color_hex ?? currentSettings.primary_color_hex,
      });

      params.push(theme.primaryColor);
      updates.push(`primary_color = $${params.length}`);
      params.push(theme.primaryColorHex);
      updates.push(`primary_color_hex = $${params.length}`);
    } else if (req.body.primary_color_hex !== undefined && currentSettings.primary_color === 'custom') {
      const theme = sanitizeThemeSettings({
        primaryColor: 'custom',
        primaryColorHex: req.body.primary_color_hex,
      });

      params.push(theme.primaryColorHex);
      updates.push(`primary_color_hex = $${params.length}`);
    }

    if (req.body.portfolio_slug !== undefined) {
      const normalizedSlug = normalizeHandle(req.body.portfolio_slug);

      if (!normalizedSlug || normalizedSlug.length < 3) {
        return res.status(400).json({ success: false, message: 'Портфолио URL кемінде 3 таңбадан тұруы керек' });
      }

      if (isReservedHandle(normalizedSlug)) {
        return res.status(400).json({ success: false, message: 'Бұл public URL қолдануға болмайды' });
      }

      const slugCheck = await query(
        'SELECT user_id FROM user_settings WHERE portfolio_slug = $1 AND user_id <> $2',
        [normalizedSlug, req.user.id]
      );

      if (slugCheck.rows.length) {
        return res.status(409).json({ success: false, message: 'Бұл public URL бос емес' });
      }

      params.push(normalizedSlug);
      updates.push(`portfolio_slug = $${params.length}`);
    }

    if (req.body.is_published !== undefined) {
      params.push(isTrue(req.body.is_published));
      updates.push(`is_published = $${params.length}`);
    }

    if (req.body.seo_title !== undefined) {
      params.push(String(req.body.seo_title || '').trim().slice(0, 120) || null);
      updates.push(`seo_title = $${params.length}`);
    }

    if (req.body.seo_description !== undefined) {
      params.push(String(req.body.seo_description || '').trim().slice(0, 200) || null);
      updates.push(`seo_description = $${params.length}`);
    }

    if (req.body.onboarding_step !== undefined) {
      params.push(Math.min(9, Math.max(1, parseInt(req.body.onboarding_step, 10) || 1)));
      updates.push(`onboarding_step = $${params.length}`);
    }

    if (req.body.onboarding_completed !== undefined) {
      params.push(isTrue(req.body.onboarding_completed));
      updates.push(`onboarding_completed = $${params.length}`);
    }

    if (!updates.length) {
      return res.status(400).json({ success: false, message: 'Өзгертуге дерек жоқ' });
    }

    params.push(req.user.id);
    const { rows } = await query(
      `UPDATE user_settings
       SET ${updates.join(', ')}, updated_at = NOW()
       WHERE user_id = $${params.length}
       RETURNING *`,
      params
    );

    res.json({ success: true, data: rows[0] });
  } catch (err) {
    console.error('updateMySettings error:', err);
    res.status(500).json({ success: false, message: 'Баптауларды жаңарту мүмкін болмады' });
  }
};

// ============================================================
// SKILLS
// ============================================================
export const getSkills = async (req, res) => {
  try {
    const params = [];
    const where = [];
    const adminId = await getLegacyAdminUserId();

    if (!adminId) {
      return res.status(404).json({ success: false, message: 'Бастапқы портфолио табылмады' });
    }

    params.push(adminId);
    where.push(`user_id = $${params.length}`);

    if (req.query.category) {
      params.push(req.query.category);
      where.push(`category = $${params.length}`);
    }

    if (req.query.featured === 'true') {
      where.push('is_featured = true');
    }

    const { rows } = await query(
      `SELECT * FROM skills
       WHERE ${where.join(' AND ')}
       ORDER BY sort_order, name`,
      params
    );

    res.json({ success: true, data: rows });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Дағдыларды алу мүмкін болмады' });
  }
};

export const createSkill = async (req, res) => {
  try {
    const { rows } = await query(
      `INSERT INTO skills (user_id, name, category, level, icon, color, sort_order, is_featured)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`,
      [
        req.user.id,
        req.body.name,
        req.body.category,
        req.body.level,
        req.body.icon,
        req.body.color,
        req.body.sort_order || 0,
        isTrue(req.body.is_featured),
      ]
    );

    res.status(201).json({ success: true, data: rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Дағдыны қосу мүмкін болмады' });
  }
};

export const updateSkill = async (req, res) => {
  try {
    const { rows } = await query(
      `UPDATE skills
       SET name = $1, category = $2, level = $3, icon = $4, color = $5, sort_order = $6, is_featured = $7
       WHERE id = $8 AND user_id = $9
       RETURNING *`,
      [
        req.body.name,
        req.body.category,
        req.body.level,
        req.body.icon,
        req.body.color,
        req.body.sort_order || 0,
        isTrue(req.body.is_featured),
        req.params.id,
        req.user.id,
      ]
    );

    if (!rows.length) {
      return res.status(404).json({ success: false, message: 'Дағды табылмады' });
    }

    res.json({ success: true, data: rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Дағдыны жаңарту мүмкін болмады' });
  }
};

export const deleteSkill = async (req, res) => {
  try {
    const { rowCount } = await query('DELETE FROM skills WHERE id = $1 AND user_id = $2', [req.params.id, req.user.id]);

    if (!rowCount) {
      return res.status(404).json({ success: false, message: 'Дағды табылмады' });
    }

    res.json({ success: true, message: 'Дағды өшірілді' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Дағдыны өшіру мүмкін болмады' });
  }
};

export const getMySkills = async (req, res) => {
  try {
    const { rows } = await query('SELECT * FROM skills WHERE user_id = $1 ORDER BY sort_order, name', [req.user.id]);
    res.json({ success: true, data: rows });
  } catch {
    res.status(500).json({ success: false, message: 'Дағдыларды алу мүмкін болмады' });
  }
};

export const createMySkill = createSkill;
export const updateMySkill = updateSkill;
export const deleteMySkill = deleteSkill;

// ============================================================
// EXPERIENCE
// ============================================================
export const getExperience = async (req, res) => {
  try {
    const adminId = await getLegacyAdminUserId();

    if (!adminId) {
      return res.status(404).json({ success: false, message: 'Бастапқы портфолио табылмады' });
    }

    const { rows } = await query(
      'SELECT * FROM experience WHERE user_id = $1 ORDER BY sort_order, start_date DESC',
      [adminId]
    );

    res.json({ success: true, data: rows });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Тәжірибені алу мүмкін болмады' });
  }
};

export const createExperience = async (req, res) => {
  try {
    const { rows } = await query(
      `INSERT INTO experience (
        user_id, company, position_kz, position_ru, position_en, description_kz, description_ru, description_en,
        location, type, start_date, end_date, is_current, logo_url, company_url, tech_stack, sort_order
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17)
      RETURNING *`,
      [
        req.user.id,
        req.body.company,
        req.body.position_kz,
        req.body.position_ru,
        req.body.position_en,
        req.body.description_kz,
        req.body.description_ru,
        req.body.description_en,
        req.body.location,
        req.body.type || 'full-time',
        req.body.start_date,
        req.body.end_date || null,
        isTrue(req.body.is_current),
        req.body.logo_url || null,
        req.body.company_url || null,
        parseJsonArray(req.body.tech_stack),
        req.body.sort_order || 0,
      ]
    );

    res.status(201).json({ success: true, data: rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Тәжірибені қосу мүмкін болмады' });
  }
};

export const updateExperience = async (req, res) => {
  try {
    const { rows } = await query(
      `UPDATE experience
       SET company = $1, position_kz = $2, position_ru = $3, position_en = $4,
           description_kz = $5, description_ru = $6, description_en = $7, location = $8, type = $9,
           start_date = $10, end_date = $11, is_current = $12, logo_url = $13, company_url = $14,
           tech_stack = $15, sort_order = $16
       WHERE id = $17 AND user_id = $18
       RETURNING *`,
      [
        req.body.company,
        req.body.position_kz,
        req.body.position_ru,
        req.body.position_en,
        req.body.description_kz,
        req.body.description_ru,
        req.body.description_en,
        req.body.location,
        req.body.type || 'full-time',
        req.body.start_date,
        req.body.end_date || null,
        isTrue(req.body.is_current),
        req.body.logo_url || null,
        req.body.company_url || null,
        parseJsonArray(req.body.tech_stack),
        req.body.sort_order || 0,
        req.params.id,
        req.user.id,
      ]
    );

    if (!rows.length) {
      return res.status(404).json({ success: false, message: 'Тәжірибе табылмады' });
    }

    res.json({ success: true, data: rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Тәжірибені жаңарту мүмкін болмады' });
  }
};

export const deleteExperience = async (req, res) => {
  try {
    const { rowCount } = await query('DELETE FROM experience WHERE id = $1 AND user_id = $2', [req.params.id, req.user.id]);

    if (!rowCount) {
      return res.status(404).json({ success: false, message: 'Тәжірибе табылмады' });
    }

    res.json({ success: true, message: 'Тәжірибе өшірілді' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Тәжірибені өшіру мүмкін болмады' });
  }
};

export const getMyExperience = async (req, res) => {
  try {
    const { rows } = await query(
      'SELECT * FROM experience WHERE user_id = $1 ORDER BY sort_order, start_date DESC',
      [req.user.id]
    );

    res.json({ success: true, data: rows });
  } catch {
    res.status(500).json({ success: false, message: 'Тәжірибені алу мүмкін болмады' });
  }
};

export const createMyExperience = createExperience;
export const updateMyExperience = updateExperience;
export const deleteMyExperience = deleteExperience;

// ============================================================
// EDUCATION
// ============================================================
export const getEducation = async (req, res) => {
  try {
    const adminId = await getLegacyAdminUserId();

    if (!adminId) {
      return res.status(404).json({ success: false, message: 'Бастапқы портфолио табылмады' });
    }

    const { rows } = await query(
      'SELECT * FROM education WHERE user_id = $1 ORDER BY sort_order, start_date DESC',
      [adminId]
    );

    res.json({ success: true, data: rows });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Білім деректерін алу мүмкін болмады' });
  }
};

export const createEducation = async (req, res) => {
  try {
    const { rows } = await query(
      `INSERT INTO education (
        user_id, institution, degree_kz, degree_ru, degree_en, field_kz, field_ru, field_en,
        description_kz, description_ru, description_en, start_date, end_date, is_current,
        gpa, logo_url, institution_url, sort_order
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18)
      RETURNING *`,
      [
        req.user.id,
        req.body.institution,
        req.body.degree_kz,
        req.body.degree_ru,
        req.body.degree_en,
        req.body.field_kz,
        req.body.field_ru,
        req.body.field_en,
        req.body.description_kz,
        req.body.description_ru,
        req.body.description_en,
        req.body.start_date,
        req.body.end_date || null,
        isTrue(req.body.is_current),
        req.body.gpa || null,
        req.body.logo_url || null,
        req.body.institution_url || null,
        req.body.sort_order || 0,
      ]
    );

    res.status(201).json({ success: true, data: rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Білім бөлімін қосу мүмкін болмады' });
  }
};

export const updateEducation = async (req, res) => {
  try {
    const { rows } = await query(
      `UPDATE education
       SET institution = $1, degree_kz = $2, degree_ru = $3, degree_en = $4, field_kz = $5, field_ru = $6, field_en = $7,
           description_kz = $8, description_ru = $9, description_en = $10, start_date = $11, end_date = $12, is_current = $13,
           gpa = $14, logo_url = $15, institution_url = $16, sort_order = $17
       WHERE id = $18 AND user_id = $19
       RETURNING *`,
      [
        req.body.institution,
        req.body.degree_kz,
        req.body.degree_ru,
        req.body.degree_en,
        req.body.field_kz,
        req.body.field_ru,
        req.body.field_en,
        req.body.description_kz,
        req.body.description_ru,
        req.body.description_en,
        req.body.start_date,
        req.body.end_date || null,
        isTrue(req.body.is_current),
        req.body.gpa || null,
        req.body.logo_url || null,
        req.body.institution_url || null,
        req.body.sort_order || 0,
        req.params.id,
        req.user.id,
      ]
    );

    if (!rows.length) {
      return res.status(404).json({ success: false, message: 'Білім жазбасы табылмады' });
    }

    res.json({ success: true, data: rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Білім жазбасын жаңарту мүмкін болмады' });
  }
};

export const deleteEducation = async (req, res) => {
  try {
    const { rowCount } = await query('DELETE FROM education WHERE id = $1 AND user_id = $2', [req.params.id, req.user.id]);

    if (!rowCount) {
      return res.status(404).json({ success: false, message: 'Білім жазбасы табылмады' });
    }

    res.json({ success: true, message: 'Білім жазбасы өшірілді' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Білім жазбасын өшіру мүмкін болмады' });
  }
};

export const getMyEducation = async (req, res) => {
  try {
    const { rows } = await query(
      'SELECT * FROM education WHERE user_id = $1 ORDER BY sort_order, start_date DESC',
      [req.user.id]
    );

    res.json({ success: true, data: rows });
  } catch {
    res.status(500).json({ success: false, message: 'Білім деректерін алу мүмкін болмады' });
  }
};

export const createMyEducation = createEducation;
export const updateMyEducation = updateEducation;
export const deleteMyEducation = deleteEducation;

// ============================================================
// CERTIFICATES
// ============================================================
export const getCertificates = async (req, res) => {
  try {
    const adminId = await getLegacyAdminUserId();

    if (!adminId) {
      return res.status(404).json({ success: false, message: 'Бастапқы портфолио табылмады' });
    }

    const params = [adminId];
    const where = ['user_id = $1'];

    if (req.query.featured === 'true') {
      where.push('is_featured = true');
    }

    if (req.query.category) {
      params.push(req.query.category);
      where.push(`category = $${params.length}`);
    }

    const { rows } = await query(
      `SELECT * FROM certificates
       WHERE ${where.join(' AND ')}
       ORDER BY sort_order, issue_date DESC`,
      params
    );

    res.json({ success: true, data: rows });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Сертификаттарды алу мүмкін болмады' });
  }
};

export const createCertificate = async (req, res) => {
  try {
    const imageUrl = req.file ? `/uploads/certificates/${req.file.filename}` : null;
    const { rows } = await query(
      `INSERT INTO certificates (
        user_id, name_kz, name_ru, name_en, issuer, description_kz, description_ru, description_en,
        issue_date, expiry_date, credential_id, credential_url, image_url, category, is_featured, sort_order
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)
      RETURNING *`,
      [
        req.user.id,
        req.body.name_kz,
        req.body.name_ru,
        req.body.name_en,
        req.body.issuer,
        req.body.description_kz,
        req.body.description_ru,
        req.body.description_en,
        req.body.issue_date,
        req.body.expiry_date || null,
        req.body.credential_id || null,
        req.body.credential_url || null,
        imageUrl,
        req.body.category || null,
        isTrue(req.body.is_featured),
        req.body.sort_order || 0,
      ]
    );

    res.status(201).json({ success: true, data: rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Сертификатты қосу мүмкін болмады' });
  }
};

export const updateCertificate = async (req, res) => {
  try {
    const imageUrl = req.file ? `/uploads/certificates/${req.file.filename}` : undefined;
    const updates = [];
    const params = [];
    const fields = [
      'name_kz',
      'name_ru',
      'name_en',
      'issuer',
      'description_kz',
      'description_ru',
      'description_en',
      'issue_date',
      'expiry_date',
      'credential_id',
      'credential_url',
      'category',
      'is_featured',
      'sort_order',
    ];

    for (const field of fields) {
      if (req.body[field] !== undefined) {
        params.push(field === 'is_featured' ? isTrue(req.body[field]) : req.body[field]);
        updates.push(`${field} = $${params.length}`);
      }
    }

    if (imageUrl) {
      params.push(imageUrl);
      updates.push(`image_url = $${params.length}`);
    }

    if (!updates.length) {
      return res.status(400).json({ success: false, message: 'Өзгертуге дерек жоқ' });
    }

    params.push(req.params.id);
    params.push(req.user.id);
    const { rows } = await query(
      `UPDATE certificates
       SET ${updates.join(', ')}
       WHERE id = $${params.length - 1} AND user_id = $${params.length}
       RETURNING *`,
      params
    );

    if (!rows.length) {
      return res.status(404).json({ success: false, message: 'Сертификат табылмады' });
    }

    res.json({ success: true, data: rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Сертификатты жаңарту мүмкін болмады' });
  }
};

export const deleteCertificate = async (req, res) => {
  try {
    const { rowCount } = await query('DELETE FROM certificates WHERE id = $1 AND user_id = $2', [req.params.id, req.user.id]);

    if (!rowCount) {
      return res.status(404).json({ success: false, message: 'Сертификат табылмады' });
    }

    res.json({ success: true, message: 'Сертификат өшірілді' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Сертификатты өшіру мүмкін болмады' });
  }
};

export const getMyCertificates = async (req, res) => {
  try {
    const { rows } = await query(
      'SELECT * FROM certificates WHERE user_id = $1 ORDER BY sort_order, issue_date DESC',
      [req.user.id]
    );

    res.json({ success: true, data: rows });
  } catch {
    res.status(500).json({ success: false, message: 'Сертификаттарды алу мүмкін болмады' });
  }
};

export const createMyCertificate = createCertificate;
export const updateMyCertificate = updateCertificate;
export const deleteMyCertificate = deleteCertificate;

// ============================================================
// CONTACTS
// ============================================================
export const submitContact = async (req, res) => {
  try {
    const { portfolioUsername, portfolioHandle, name, email, subject, message } = req.body;

    if (!name || !email || !message) {
      return res.status(400).json({ success: false, message: 'Аты, email және хабарлама міндетті' });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ success: false, message: 'Email форматы қате' });
    }

    const targetUserId = await getContactTargetUserId(portfolioHandle || portfolioUsername);

    if (!targetUserId) {
      return res.status(404).json({ success: false, message: 'Портфолио табылмады' });
    }

    const { rows } = await query(
      `INSERT INTO contacts (portfolio_user_id, name, email, subject, message, ip_address, user_agent)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [
        targetUserId,
        String(name).trim(),
        String(email).trim().toLowerCase(),
        subject ? String(subject).trim() : null,
        String(message).trim(),
        req.ip || req.connection.remoteAddress || null,
        req.headers['user-agent'] || null,
      ]
    );

    res.status(201).json({
      success: true,
      message: 'Хабарлама сәтті жіберілді',
      data: { id: rows[0].id },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Хабарламаны жіберу мүмкін болмады' });
  }
};

export const getContacts = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit || '20', 10);
    const offset = (parseInt(req.query.page || '1', 10) - 1) * limit;
    const params = [];
    let where = '';

    if (req.query.status) {
      params.push(req.query.status);
      where = `WHERE status = $${params.length}`;
    }

    params.push(limit);
    params.push(offset);
    const { rows } = await query(
      `SELECT * FROM contacts ${where} ORDER BY created_at DESC LIMIT $${params.length - 1} OFFSET $${params.length}`,
      params
    );
    const total = await query(`SELECT COUNT(*) FROM contacts ${where}`, params.slice(0, -2));

    res.json({ success: true, data: rows, total: parseInt(total.rows[0].count, 10) });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Хабарламаларды алу мүмкін болмады' });
  }
};

export const updateContactStatus = async (req, res) => {
  try {
    const validStatuses = ['new', 'read', 'replied', 'archived'];

    if (!validStatuses.includes(req.body.status)) {
      return res.status(400).json({ success: false, message: 'Статус дұрыс емес' });
    }

    const { rows } = await query(
      'UPDATE contacts SET status = $1 WHERE id = $2 RETURNING *',
      [req.body.status, req.params.id]
    );

    if (!rows.length) {
      return res.status(404).json({ success: false, message: 'Хабарлама табылмады' });
    }

    res.json({ success: true, data: rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Статусты жаңарту мүмкін болмады' });
  }
};

export const getMyContacts = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit || '20', 10);
    const offset = (parseInt(req.query.page || '1', 10) - 1) * limit;
    const params = [req.user.id];
    let where = 'WHERE portfolio_user_id = $1';

    if (req.query.status) {
      params.push(req.query.status);
      where += ` AND status = $${params.length}`;
    }

    params.push(limit);
    params.push(offset);
    const { rows } = await query(
      `SELECT * FROM contacts ${where} ORDER BY created_at DESC LIMIT $${params.length - 1} OFFSET $${params.length}`,
      params
    );
    const total = await query(`SELECT COUNT(*) FROM contacts ${where}`, params.slice(0, -2));

    res.json({ success: true, data: rows, total: parseInt(total.rows[0].count, 10) });
  } catch {
    res.status(500).json({ success: false, message: 'Хабарламаларды алу мүмкін болмады' });
  }
};

export const updateMyContactStatus = async (req, res) => {
  try {
    const validStatuses = ['new', 'read', 'replied', 'archived'];

    if (!validStatuses.includes(req.body.status)) {
      return res.status(400).json({ success: false, message: 'Статус дұрыс емес' });
    }

    const { rows } = await query(
      `UPDATE contacts
       SET status = $1
       WHERE id = $2 AND portfolio_user_id = $3
       RETURNING *`,
      [req.body.status, req.params.id, req.user.id]
    );

    if (!rows.length) {
      return res.status(404).json({ success: false, message: 'Хабарлама табылмады' });
    }

    res.json({ success: true, data: rows[0] });
  } catch {
    res.status(500).json({ success: false, message: 'Статусты жаңарту мүмкін болмады' });
  }
};

// ============================================================
// ANALYTICS
// ============================================================
export const getAnalytics = async (req, res) => {
  try {
    const [projects, posts, contacts, views, topProjects, topPosts] = await Promise.all([
      query('SELECT COUNT(*) AS total, COUNT(*) FILTER (WHERE is_featured) AS featured FROM projects'),
      query('SELECT COUNT(*) AS total, COUNT(*) FILTER (WHERE is_published) AS published FROM blog_posts'),
      query("SELECT COUNT(*) AS total, COUNT(*) FILTER (WHERE status = 'new') AS new FROM contacts"),
      query("SELECT COUNT(*) AS total FROM page_views WHERE created_at > NOW() - INTERVAL '30 days'"),
      query('SELECT title_en, views FROM projects ORDER BY views DESC LIMIT 5'),
      query('SELECT title_en, views FROM blog_posts ORDER BY views DESC LIMIT 5'),
    ]);

    res.json({
      success: true,
      data: {
        projects: projects.rows[0],
        posts: posts.rows[0],
        contacts: contacts.rows[0],
        views: views.rows[0].total,
        topProjects: topProjects.rows,
        topPosts: topPosts.rows,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Аналитиканы алу мүмкін болмады' });
  }
};

export const trackPageView = async (req, res) => {
  try {
    if (!req.body.page) {
      return res.status(400).json({ success: false, message: 'Page міндетті' });
    }

    await query('INSERT INTO page_views (page, referrer) VALUES ($1, $2)', [req.body.page, req.headers.referer || null]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Қаралымды тіркеу мүмкін болмады' });
  }
};
