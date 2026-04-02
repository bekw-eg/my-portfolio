import { query } from './database.js';

const migrations = [
  {
    name: 'expand-users-role-check',
    sql: `
      DO $$
      BEGIN
        IF EXISTS (
          SELECT 1
          FROM pg_constraint
          WHERE conname = 'users_role_check'
        ) THEN
          ALTER TABLE users DROP CONSTRAINT users_role_check;
        END IF;

        UPDATE users
        SET role = 'superadmin'
        WHERE role = 'admin';

        ALTER TABLE users
        ADD CONSTRAINT users_role_check
        CHECK (role IN ('user', 'builder', 'portfolio_admin', 'superadmin'));
      EXCEPTION
        WHEN duplicate_object THEN NULL;
      END $$;
    `,
  },
  {
    name: 'ensure-profile-saas-columns',
    sql: `
      ALTER TABLE profiles ADD COLUMN IF NOT EXISTS profession VARCHAR(255);
      ALTER TABLE profiles ADD COLUMN IF NOT EXISTS intro_kz TEXT;
      ALTER TABLE profiles ADD COLUMN IF NOT EXISTS about_kz TEXT;
      ALTER TABLE profiles ADD COLUMN IF NOT EXISTS instagram VARCHAR(255);

      UPDATE profiles
      SET
        profession = COALESCE(profession, title_kz, title_en, title_ru),
        intro_kz = COALESCE(intro_kz, bio_kz, bio_en, bio_ru),
        about_kz = COALESCE(about_kz, bio_kz, bio_en, bio_ru)
      WHERE
        profession IS NULL
        OR intro_kz IS NULL
        OR about_kz IS NULL;
    `,
  },
];

export const runStartupMigrations = async () => {
  for (const migration of migrations) {
    await query(migration.sql);

    if (process.env.NODE_ENV === 'development') {
      console.log(`Migration applied: ${migration.name}`);
    }
  }
};
