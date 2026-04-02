import { query } from '../config/database.js';
import slugify from '../utils/slugify.js';

const getLegacyAdminUserId = async () => {
  const { rows } = await query("SELECT id FROM users WHERE role = 'superadmin' ORDER BY created_at ASC LIMIT 1");
  return rows[0]?.id || null;
};

export const getProjects = async (req, res) => {
  try {
    const {
      page = 1, limit = 12, search = '', category = '', status = '',
      featured = '', sort = 'sort_order', order = 'ASC', lang = 'en'
    } = req.query;

    const offset = (parseInt(page) - 1) * parseInt(limit);
    const params = [];
    const adminId = await getLegacyAdminUserId();
    if (!adminId) return res.status(404).json({ success: false, message: 'Бастапқы портфолио табылмады' });
    let where = ['is_published = true', `user_id = $1`];
    params.push(adminId);

    if (search) {
      params.push(`%${search}%`);
      where.push(`(title_${lang} ILIKE $${params.length} OR description_${lang} ILIKE $${params.length})`);
    }

    if (category) {
      params.push(category);
      where.push(`category = $${params.length}`);
    }

    if (status) {
      params.push(status);
      where.push(`status = $${params.length}`);
    }

    if (featured === 'true') where.push('is_featured = true');

    const whereClause = where.length ? `WHERE ${where.join(' AND ')}` : '';
    const validSorts = ['sort_order', 'created_at', 'views', 'title_en'];
    const sortCol = validSorts.includes(sort) ? sort : 'sort_order';
    const sortDir = order === 'DESC' ? 'DESC' : 'ASC';

    params.push(parseInt(limit));
    params.push(offset);

    const countResult = await query(
      `SELECT COUNT(*) FROM projects ${whereClause}`,
      params.slice(0, -2)
    );

    const { rows } = await query(
      `SELECT id, slug, title_kz, title_ru, title_en, description_kz, description_ru, description_en,
        cover_image, tech_stack, category, status, demo_url, github_url, is_featured,
        is_published, views, likes, sort_order, created_at, updated_at
       FROM projects ${whereClause}
       ORDER BY ${sortCol} ${sortDir}
       LIMIT $${params.length - 1} OFFSET $${params.length}`,
      params
    );

    const total = parseInt(countResult.rows[0].count);

    res.json({
      success: true,
      data: rows,
      pagination: { total, page: parseInt(page), limit: parseInt(limit), pages: Math.ceil(total / parseInt(limit)) },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Failed to fetch projects' });
  }
};

export const getProject = async (req, res) => {
  try {
    const { slug } = req.params;
    const adminId = await getLegacyAdminUserId();
    if (!adminId) return res.status(404).json({ success: false, message: 'Бастапқы портфолио табылмады' });
    const { rows } = await query('SELECT * FROM projects WHERE user_id = $1 AND slug = $2', [adminId, slug]);

    if (!rows.length) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }

    // Increment views
    await query('UPDATE projects SET views = views + 1 WHERE user_id = $1 AND slug = $2', [adminId, slug]);

    res.json({ success: true, data: { ...rows[0], views: rows[0].views + 1 } });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch project' });
  }
};

export const createProject = async (req, res) => {
  try {
    const {
      title_kz, title_ru, title_en, description_kz, description_ru, description_en,
      content_kz, content_ru, content_en, tech_stack, category, status,
      demo_url, github_url, is_featured, is_published, sort_order
    } = req.body;

    if (!title_en) {
      return res.status(400).json({ success: false, message: 'English title is required' });
    }

    const slug = slugify(title_en);
    const coverImage = req.file ? `/uploads/projects/${req.file.filename}` : null;

    const { rows } = await query(`
      INSERT INTO projects (user_id, slug, title_kz, title_ru, title_en, description_kz, description_ru, description_en,
        content_kz, content_ru, content_en, cover_image, tech_stack, category, status,
        demo_url, github_url, is_featured, is_published, sort_order)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20)
      RETURNING *
    `, [
      req.user.id, slug, title_kz, title_ru, title_en, description_kz, description_ru, description_en,
      content_kz, content_ru, content_en, coverImage,
      JSON.parse(tech_stack || '[]'), category, status || 'completed',
      demo_url, github_url, is_featured === 'true', is_published !== 'false',
      parseInt(sort_order || '0')
    ]);

    res.status(201).json({ success: true, data: rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Failed to create project' });
  }
};

export const updateProject = async (req, res) => {
  try {
    const { id } = req.params;
    const fields = req.body;
    const updates = [];
    const params = [];

    const allowed = [
      'title_kz','title_ru','title_en','description_kz','description_ru','description_en',
      'content_kz','content_ru','content_en','category','status','demo_url','github_url',
      'is_featured','is_published','sort_order'
    ];

    for (const key of allowed) {
      if (fields[key] !== undefined) {
        params.push(fields[key]);
        updates.push(`${key} = $${params.length}`);
      }
    }

    if (fields.tech_stack) {
      params.push(JSON.parse(fields.tech_stack));
      updates.push(`tech_stack = $${params.length}`);
    }

    if (req.file) {
      params.push(`/uploads/projects/${req.file.filename}`);
      updates.push(`cover_image = $${params.length}`);
    }

    if (!updates.length) {
      return res.status(400).json({ success: false, message: 'No fields to update' });
    }

    params.push(id);
    const { rows } = await query(
      `UPDATE projects SET ${updates.join(', ')}, updated_at = NOW() WHERE id = $${params.length} AND user_id = $${params.length + 1} RETURNING *`,
      [...params, req.user.id]
    );

    if (!rows.length) return res.status(404).json({ success: false, message: 'Project not found' });

    res.json({ success: true, data: rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to update project' });
  }
};

export const deleteProject = async (req, res) => {
  try {
    const { id } = req.params;
    const { rowCount } = await query('DELETE FROM projects WHERE id = $1 AND user_id = $2', [id, req.user.id]);
    if (!rowCount) return res.status(404).json({ success: false, message: 'Project not found' });
    res.json({ success: true, message: 'Project deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to delete project' });
  }
};

// ============================================================
// ME — Projects (жеке портфолио)
// ============================================================
export const getMyProjects = async (req, res) => {
  try {
    const { rows } = await query(
      `SELECT id, slug, title_kz, title_ru, title_en, description_kz, description_ru, description_en,
              cover_image, tech_stack, category, status, demo_url, github_url, is_featured,
              is_published, views, likes, sort_order, created_at, updated_at
       FROM projects
       WHERE user_id = $1
       ORDER BY sort_order, created_at DESC`,
      [req.user.id]
    );
    res.json({ success: true, data: rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Жобаларды алу мүмкін болмады' });
  }
};

export const getMyProjectById = async (req, res) => {
  try {
    const { rows } = await query('SELECT * FROM projects WHERE id = $1 AND user_id = $2', [req.params.id, req.user.id]);
    if (!rows.length) return res.status(404).json({ success: false, message: 'Жоба табылмады' });
    res.json({ success: true, data: rows[0] });
  } catch {
    res.status(500).json({ success: false, message: 'Жобаны алу мүмкін болмады' });
  }
};

export const createMyProject = createProject;
export const updateMyProject = updateProject;
export const deleteMyProject = deleteProject;
