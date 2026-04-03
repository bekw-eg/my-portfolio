import pg from 'pg';
import bcrypt from 'bcryptjs';
import { getPgConfig } from './getPgConfig.js';

const { Pool } = pg;

async function createAdmin() {
  const email = (process.env.ADMIN_EMAIL || '').trim().toLowerCase();
  const password = process.env.ADMIN_PASSWORD || '';
  const username = (process.env.ADMIN_USERNAME || email.split('@')[0] || 'admin').trim().toLowerCase();
  const fullName = (process.env.ADMIN_FULL_NAME || 'Portfolio Admin').trim();

  if (!email || !password) {
    throw new Error('ADMIN_EMAIL and ADMIN_PASSWORD are required');
  }

  if (password.length < 6) {
    throw new Error('ADMIN_PASSWORD must be at least 6 characters long');
  }

  const pool = new Pool(getPgConfig());
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    const passwordHash = await bcrypt.hash(password, 12);

    const userResult = await client.query(
      `
        INSERT INTO users (username, email, password_hash, role, is_active)
        VALUES ($1, $2, $3, 'superadmin', true)
        ON CONFLICT (email) DO UPDATE
        SET username = COALESCE(users.username, EXCLUDED.username),
            password_hash = EXCLUDED.password_hash,
            role = 'superadmin',
            is_active = true
        RETURNING id, email, role
      `,
      [username, email, passwordHash],
    );

    const user = userResult.rows[0];

    await client.query(
      `
        INSERT INTO profiles (user_id, full_name, title_kz, title_ru, title_en)
        VALUES ($1, $2, 'Администратор', 'Администратор', 'Administrator')
        ON CONFLICT (user_id) DO UPDATE
        SET full_name = COALESCE(profiles.full_name, EXCLUDED.full_name)
      `,
      [user.id, fullName],
    );

    await client.query(
      `
        INSERT INTO user_settings (user_id, portfolio_slug, is_published, onboarding_step, onboarding_completed, primary_color)
        VALUES ($1, $2, false, 1, false, 'blue')
        ON CONFLICT (user_id) DO NOTHING
      `,
      [user.id, username],
    );

    await client.query('COMMIT');

    console.log('Superadmin is ready');
    console.log(`Email: ${user.email}`);
    console.log(`Role: ${user.role}`);
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

createAdmin().catch((error) => {
  console.error('Failed to create superadmin:', error.message);
  process.exit(1);
});
