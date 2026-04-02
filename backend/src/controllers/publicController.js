import { query } from '../config/database.js';
import { normalizeHandle } from '../utils/account.js';

const resolveTheme = (settings) => {
  if (!settings) {
    return {
      preset: 'blue',
      customHex: null,
      resolved: '#2563eb',
    };
  }

  const palette = {
    blue: '#2563eb',
    purple: '#7c3aed',
    green: '#16a34a',
    red: '#dc2626',
    orange: '#ea580c',
    teal: '#0f766e',
  };

  if (settings.primary_color === 'custom' && settings.primary_color_hex) {
    return {
      preset: 'custom',
      customHex: settings.primary_color_hex,
      resolved: settings.primary_color_hex,
    };
  }

  return {
    preset: settings.primary_color || 'blue',
    customHex: settings.primary_color_hex || null,
    resolved: palette[settings.primary_color] || palette.blue,
  };
};

export const getPublicPortfolio = async (req, res) => {
  try {
    const handle = normalizeHandle(req.params.username);

    if (!handle) {
      return res.status(404).json({ success: false, message: 'Портфолио табылмады' });
    }

    const userRes = await query(
      `SELECT u.id, u.username, u.email, u.is_active, us.portfolio_slug, us.is_published, us.seo_title, us.seo_description,
              us.primary_color, us.primary_color_hex
       FROM users u
       LEFT JOIN user_settings us ON us.user_id = u.id
       WHERE (LOWER(u.username) = $1 OR LOWER(us.portfolio_slug) = $1)
       LIMIT 1`,
      [handle]
    );

    const user = userRes.rows[0];

    if (!user || !user.is_active) {
      return res.status(404).json({ success: false, message: 'Портфолио табылмады' });
    }

    if (!user.is_published) {
      return res.status(404).json({ success: false, message: 'Портфолио жарияланбаған' });
    }

    const userId = user.id;

    const [profileRes, skillsRes, projectsRes, expRes, eduRes, certsRes, blogRes, contactsRes] = await Promise.all([
      query(
        `SELECT p.*, u.email
         FROM profiles p
         JOIN users u ON u.id = p.user_id
         WHERE p.user_id = $1`,
        [userId]
      ),
      query('SELECT * FROM skills WHERE user_id = $1 ORDER BY sort_order, name', [userId]),
      query(
        `SELECT id, slug, title_kz, title_ru, title_en, description_kz, description_ru, description_en,
                cover_image, tech_stack, category, status, demo_url, github_url, is_featured, views, likes, sort_order, created_at, updated_at
         FROM projects
         WHERE user_id = $1 AND is_published = true
         ORDER BY is_featured DESC, sort_order, created_at DESC`,
        [userId]
      ),
      query('SELECT * FROM experience WHERE user_id = $1 ORDER BY sort_order, start_date DESC', [userId]),
      query('SELECT * FROM education WHERE user_id = $1 ORDER BY sort_order, start_date DESC', [userId]),
      query('SELECT * FROM certificates WHERE user_id = $1 ORDER BY sort_order, issue_date DESC', [userId]),
      query(
        `SELECT id, slug, title_kz, title_ru, title_en, excerpt_kz, excerpt_ru, excerpt_en,
                cover_image, tags, category, is_featured, views, read_time, published_at, created_at
         FROM blog_posts
         WHERE user_id = $1 AND is_published = true
         ORDER BY published_at DESC NULLS LAST`,
        [userId]
      ),
      query('SELECT COUNT(*) AS total FROM contacts WHERE portfolio_user_id = $1', [userId]),
    ]);

    const profile = profileRes.rows[0] || null;
    const theme = resolveTheme(user);
    const publicHandle = user.portfolio_slug || user.username;

    res.json({
      success: true,
      data: {
        user: {
          id: userId,
          username: user.username,
          publicHandle,
          publicUrl: `/u/${publicHandle}`,
        },
        settings: {
          primaryColor: user.primary_color,
          primaryColorHex: user.primary_color_hex,
          theme,
          seoTitle: user.seo_title || `${profile?.full_name || user.username} | Портфолио`,
          seoDescription: user.seo_description || profile?.intro_kz || profile?.about_kz || '',
        },
        profile,
        stats: {
          projects: projectsRes.rows.length,
          skills: skillsRes.rows.length,
          experience: expRes.rows.length,
          education: eduRes.rows.length,
          certificates: certsRes.rows.length,
          blogPosts: blogRes.rows.length,
          messages: parseInt(contactsRes.rows[0]?.total || '0', 10),
        },
        sections: {
          hero: {
            fullName: profile?.full_name || user.username,
            profession: profile?.profession || profile?.title_kz || '',
            intro: profile?.intro_kz || '',
            about: profile?.about_kz || profile?.bio_kz || '',
          },
          skills: skillsRes.rows,
          projects: projectsRes.rows,
          experience: expRes.rows,
          education: eduRes.rows,
          certificates: certsRes.rows,
          blog: blogRes.rows,
          contact: {
            email: profile?.email || user.email,
            phone: profile?.phone || null,
            location: profile?.location || null,
            website: profile?.website || null,
            github: profile?.github || null,
            linkedin: profile?.linkedin || null,
            telegram: profile?.telegram || null,
            instagram: profile?.instagram || null,
          },
        },
      },
    });
  } catch (err) {
    console.error('getPublicPortfolio error:', err);
    res.status(500).json({ success: false, message: 'Сервер қатесі' });
  }
};
