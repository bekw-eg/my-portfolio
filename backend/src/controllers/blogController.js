import { query } from '../config/database.js';
import slugify from '../utils/slugify.js';

const getLegacyAdminUserId = async () => {
  const { rows } = await query("SELECT id FROM users WHERE role = 'superadmin' ORDER BY created_at ASC LIMIT 1");
  return rows[0]?.id || null;
};

export const getBlogPosts = async (req, res) => {
  try {
    const { page = 1, limit = 10, search = '', category = '', tag = '', featured = '', lang = 'en' } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);
    const params = [];
    const adminId = await getLegacyAdminUserId();
    if (!adminId) return res.status(404).json({ success: false, message: 'Бастапқы портфолио табылмады' });
    let where = ['is_published = true', 'user_id = $1'];
    params.push(adminId);

    if (search) {
      params.push(`%${search}%`);
      where.push(`(title_${lang} ILIKE $${params.length} OR excerpt_${lang} ILIKE $${params.length})`);
    }

    if (category) {
      params.push(category);
      where.push(`category = $${params.length}`);
    }

    if (tag) {
      params.push(tag);
      where.push(`$${params.length} = ANY(tags)`);
    }

    if (featured === 'true') where.push('is_featured = true');

    const whereClause = where.length ? `WHERE ${where.join(' AND ')}` : '';

    params.push(parseInt(limit));
    params.push(offset);

    const countRes = await query(
      `SELECT COUNT(*) FROM blog_posts ${whereClause}`,
      params.slice(0, -2)
    );

    const { rows } = await query(
      `SELECT id, slug, title_kz, title_ru, title_en, excerpt_kz, excerpt_ru, excerpt_en,
        cover_image, tags, category, is_published, is_featured, views, read_time, published_at, created_at
       FROM blog_posts ${whereClause}
       ORDER BY published_at DESC NULLS LAST
       LIMIT $${params.length - 1} OFFSET $${params.length}`,
      params
    );

    const total = parseInt(countRes.rows[0].count);
    res.json({
      success: true,
      data: rows,
      pagination: { total, page: parseInt(page), limit: parseInt(limit), pages: Math.ceil(total / parseInt(limit)) },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch posts' });
  }
};

export const getBlogPost = async (req, res) => {
  try {
    const { slug } = req.params;
    const adminId = await getLegacyAdminUserId();
    if (!adminId) return res.status(404).json({ success: false, message: 'Бастапқы портфолио табылмады' });
    const { rows } = await query('SELECT * FROM blog_posts WHERE user_id = $1 AND slug = $2', [adminId, slug]);
    if (!rows.length) return res.status(404).json({ success: false, message: 'Post not found' });

    await query('UPDATE blog_posts SET views = views + 1 WHERE user_id = $1 AND slug = $2', [adminId, slug]);
    res.json({ success: true, data: { ...rows[0], views: rows[0].views + 1 } });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch post' });
  }
};

export const createBlogPost = async (req, res) => {
  try {
    const {
      title_kz, title_ru, title_en, excerpt_kz, excerpt_ru, excerpt_en,
      content_kz, content_ru, content_en, tags, category,
      is_published, is_featured, read_time
    } = req.body;

    if (!title_en) return res.status(400).json({ success: false, message: 'English title required' });

    const slug = slugify(title_en);
    const coverImage = req.file ? `/uploads/blog/${req.file.filename}` : null;
    const publishedAt = is_published === 'true' ? new Date() : null;

    const { rows } = await query(`
      INSERT INTO blog_posts (user_id, slug, title_kz, title_ru, title_en, excerpt_kz, excerpt_ru, excerpt_en,
        content_kz, content_ru, content_en, cover_image, tags, category,
        is_published, is_featured, read_time, published_at)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18)
      RETURNING *
    `, [
      req.user.id, slug, title_kz, title_ru, title_en, excerpt_kz, excerpt_ru, excerpt_en,
      content_kz, content_ru, content_en, coverImage,
      JSON.parse(tags || '[]'), category,
      is_published === 'true', is_featured === 'true',
      parseInt(read_time || '5'), publishedAt
    ]);

    res.status(201).json({ success: true, data: rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to create post' });
  }
};

export const updateBlogPost = async (req, res) => {
  try {
    const { id } = req.params;
    const fields = req.body;
    const updates = [];
    const params = [];

    const allowed = [
      'title_kz','title_ru','title_en','excerpt_kz','excerpt_ru','excerpt_en',
      'content_kz','content_ru','content_en','category','is_featured','read_time'
    ];

    for (const key of allowed) {
      if (fields[key] !== undefined) {
        params.push(fields[key]);
        updates.push(`${key} = $${params.length}`);
      }
    }

    if (fields.tags) {
      params.push(JSON.parse(fields.tags));
      updates.push(`tags = $${params.length}`);
    }

    if (fields.is_published !== undefined) {
      params.push(fields.is_published === 'true');
      updates.push(`is_published = $${params.length}`);
      if (fields.is_published === 'true') {
        updates.push(`published_at = COALESCE(published_at, NOW())`);
      }
    }

    if (req.file) {
      params.push(`/uploads/blog/${req.file.filename}`);
      updates.push(`cover_image = $${params.length}`);
    }

    params.push(id);
    const { rows } = await query(
      `UPDATE blog_posts SET ${updates.join(', ')}, updated_at = NOW() WHERE id = $${params.length} AND user_id = $${params.length + 1} RETURNING *`,
      [...params, req.user.id]
    );

    if (!rows.length) return res.status(404).json({ success: false, message: 'Post not found' });
    res.json({ success: true, data: rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to update post' });
  }
};

export const deleteBlogPost = async (req, res) => {
  try {
    const { rowCount } = await query('DELETE FROM blog_posts WHERE id = $1 AND user_id = $2', [req.params.id, req.user.id]);
    if (!rowCount) return res.status(404).json({ success: false, message: 'Post not found' });
    res.json({ success: true, message: 'Post deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to delete post' });
  }
};

// ============================================================
// ME — Blog
// ============================================================
export const getMyBlogPosts = async (req, res) => {
  try {
    const { rows } = await query(
      `SELECT id, slug, title_kz, title_ru, title_en, excerpt_kz, excerpt_ru, excerpt_en,
              cover_image, tags, category, is_published, is_featured, views, read_time, published_at, created_at, updated_at
       FROM blog_posts
       WHERE user_id = $1
       ORDER BY created_at DESC`,
      [req.user.id]
    );
    res.json({ success: true, data: rows });
  } catch {
    res.status(500).json({ success: false, message: 'Блог жазбаларын алу мүмкін болмады' });
  }
};

export const getMyBlogPostById = async (req, res) => {
  try {
    const { rows } = await query('SELECT * FROM blog_posts WHERE id = $1 AND user_id = $2', [req.params.id, req.user.id]);
    if (!rows.length) return res.status(404).json({ success: false, message: 'Жазба табылмады' });
    res.json({ success: true, data: rows[0] });
  } catch {
    res.status(500).json({ success: false, message: 'Жазбаны алу мүмкін болмады' });
  }
};

export const createMyBlogPost = createBlogPost;
export const updateMyBlogPost = updateBlogPost;
export const deleteMyBlogPost = deleteBlogPost;
