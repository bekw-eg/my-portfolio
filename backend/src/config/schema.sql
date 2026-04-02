-- ============================================================
-- PORTFOLIO PLATFORM — DATABASE SCHEMA
-- PostgreSQL 14+
-- ============================================================

-- Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- ============================================================
-- USERS
-- ============================================================
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  username VARCHAR(50) UNIQUE,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role VARCHAR(20) DEFAULT 'user' CHECK (role IN ('user', 'builder', 'portfolio_admin', 'superadmin')),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- USER SETTINGS (theme + onboarding + publish)
-- ============================================================
CREATE TABLE IF NOT EXISTS user_settings (
  user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  primary_color VARCHAR(20) DEFAULT 'blue', -- blue|purple|green|red|orange|teal|custom
  primary_color_hex VARCHAR(7),             -- #RRGGBB when primary_color='custom'
  portfolio_slug VARCHAR(80) UNIQUE,        -- public URL segment, default = username
  is_published BOOLEAN DEFAULT false,
  seo_title VARCHAR(120),
  seo_description VARCHAR(200),
  onboarding_step INTEGER DEFAULT 1 CHECK (onboarding_step BETWEEN 1 AND 9),
  onboarding_completed BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- PROFILES
-- ============================================================
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  full_name VARCHAR(255),
  profession VARCHAR(255),
  intro_kz TEXT,
  about_kz TEXT,
  title_kz VARCHAR(255),
  title_ru VARCHAR(255),
  title_en VARCHAR(255),
  bio_kz TEXT,
  bio_ru TEXT,
  bio_en TEXT,
  avatar_url VARCHAR(500),
  location VARCHAR(255),
  phone VARCHAR(50),
  website VARCHAR(255),
  github VARCHAR(255),
  linkedin VARCHAR(255),
  twitter VARCHAR(255),
  telegram VARCHAR(255),
  instagram VARCHAR(255),
  resume_url VARCHAR(500),
  years_experience INTEGER DEFAULT 0,
  available_for_work BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- SKILLS
-- ============================================================
CREATE TABLE IF NOT EXISTS skills (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  category VARCHAR(50) NOT NULL CHECK (category IN ('frontend','backend','database','devops','mobile','design','other')),
  level INTEGER CHECK (level BETWEEN 1 AND 100),
  icon VARCHAR(100),
  color VARCHAR(20),
  sort_order INTEGER DEFAULT 0,
  is_featured BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- PROJECTS
-- ============================================================
CREATE TABLE IF NOT EXISTS projects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  slug VARCHAR(255) NOT NULL,
  title_kz VARCHAR(255) NOT NULL,
  title_ru VARCHAR(255) NOT NULL,
  title_en VARCHAR(255) NOT NULL,
  description_kz TEXT,
  description_ru TEXT,
  description_en TEXT,
  content_kz TEXT,
  content_ru TEXT,
  content_en TEXT,
  cover_image VARCHAR(500),
  gallery JSONB DEFAULT '[]',
  tech_stack TEXT[] DEFAULT '{}',
  category VARCHAR(50),
  status VARCHAR(20) DEFAULT 'completed' CHECK (status IN ('in_progress','completed','archived')),
  demo_url VARCHAR(500),
  github_url VARCHAR(500),
  is_featured BOOLEAN DEFAULT false,
  is_published BOOLEAN DEFAULT true,
  views INTEGER DEFAULT 0,
  likes INTEGER DEFAULT 0,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- EXPERIENCE
-- ============================================================
CREATE TABLE IF NOT EXISTS experience (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  company VARCHAR(255) NOT NULL,
  position_kz VARCHAR(255),
  position_ru VARCHAR(255),
  position_en VARCHAR(255),
  description_kz TEXT,
  description_ru TEXT,
  description_en TEXT,
  location VARCHAR(255),
  type VARCHAR(20) DEFAULT 'full-time' CHECK (type IN ('full-time','part-time','freelance','internship','contract')),
  start_date DATE NOT NULL,
  end_date DATE,
  is_current BOOLEAN DEFAULT false,
  logo_url VARCHAR(500),
  company_url VARCHAR(500),
  tech_stack TEXT[] DEFAULT '{}',
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- EDUCATION
-- ============================================================
CREATE TABLE IF NOT EXISTS education (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  institution VARCHAR(255) NOT NULL,
  degree_kz VARCHAR(255),
  degree_ru VARCHAR(255),
  degree_en VARCHAR(255),
  field_kz VARCHAR(255),
  field_ru VARCHAR(255),
  field_en VARCHAR(255),
  description_kz TEXT,
  description_ru TEXT,
  description_en TEXT,
  start_date DATE NOT NULL,
  end_date DATE,
  is_current BOOLEAN DEFAULT false,
  gpa VARCHAR(20),
  logo_url VARCHAR(500),
  institution_url VARCHAR(500),
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- CERTIFICATES
-- ============================================================
CREATE TABLE IF NOT EXISTS certificates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  name_kz VARCHAR(255),
  name_ru VARCHAR(255),
  name_en VARCHAR(255),
  issuer VARCHAR(255) NOT NULL,
  description_kz TEXT,
  description_ru TEXT,
  description_en TEXT,
  issue_date DATE NOT NULL,
  expiry_date DATE,
  credential_id VARCHAR(255),
  credential_url VARCHAR(500),
  image_url VARCHAR(500),
  category VARCHAR(50),
  is_featured BOOLEAN DEFAULT false,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- BLOG POSTS
-- ============================================================
CREATE TABLE IF NOT EXISTS blog_posts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  slug VARCHAR(255) NOT NULL,
  title_kz VARCHAR(500),
  title_ru VARCHAR(500),
  title_en VARCHAR(500),
  excerpt_kz TEXT,
  excerpt_ru TEXT,
  excerpt_en TEXT,
  content_kz TEXT,
  content_ru TEXT,
  content_en TEXT,
  cover_image VARCHAR(500),
  tags TEXT[] DEFAULT '{}',
  category VARCHAR(100),
  is_published BOOLEAN DEFAULT false,
  is_featured BOOLEAN DEFAULT false,
  views INTEGER DEFAULT 0,
  read_time INTEGER DEFAULT 5,
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- CONTACTS
-- ============================================================
CREATE TABLE IF NOT EXISTS contacts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  portfolio_user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  subject VARCHAR(500),
  message TEXT NOT NULL,
  status VARCHAR(20) DEFAULT 'new' CHECK (status IN ('new','read','replied','archived')),
  ip_address VARCHAR(50),
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- ANALYTICS
-- ============================================================
CREATE TABLE IF NOT EXISTS page_views (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  page VARCHAR(255) NOT NULL,
  referrer VARCHAR(500),
  country VARCHAR(100),
  device VARCHAR(50),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- REFRESH TOKENS
-- ============================================================
CREATE TABLE IF NOT EXISTS refresh_tokens (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  token VARCHAR(500) UNIQUE NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- SITE SETTINGS
-- ============================================================
CREATE TABLE IF NOT EXISTS site_settings (
  key VARCHAR(100) PRIMARY KEY,
  value TEXT,
  type VARCHAR(20) DEFAULT 'string',
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- INDEXES
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_projects_slug ON projects(slug);
CREATE INDEX IF NOT EXISTS idx_projects_published ON projects(is_published);
CREATE INDEX IF NOT EXISTS idx_projects_featured ON projects(is_featured);
CREATE INDEX IF NOT EXISTS idx_blog_slug ON blog_posts(slug);
CREATE INDEX IF NOT EXISTS idx_blog_published ON blog_posts(is_published);
CREATE INDEX IF NOT EXISTS idx_contacts_status ON contacts(status);
CREATE INDEX IF NOT EXISTS idx_page_views_page ON page_views(page);
CREATE INDEX IF NOT EXISTS idx_page_views_created ON page_views(created_at);

-- ============================================================
-- TRIGGERS — auto update updated_at
-- ============================================================
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_users_updated ON users;
CREATE TRIGGER trg_users_updated BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS trg_profiles_updated ON profiles;
CREATE TRIGGER trg_profiles_updated BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS trg_user_settings_updated ON user_settings;
CREATE TRIGGER trg_user_settings_updated BEFORE UPDATE ON user_settings FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS trg_projects_updated ON projects;
CREATE TRIGGER trg_projects_updated BEFORE UPDATE ON projects FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS trg_blog_updated ON blog_posts;
CREATE TRIGGER trg_blog_updated BEFORE UPDATE ON blog_posts FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================================
-- SAFE ALTERs for existing DBs (idempotent upgrades)
-- ============================================================
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='users' AND column_name='username') THEN
    ALTER TABLE users ADD COLUMN username VARCHAR(50);
  END IF;
EXCEPTION WHEN duplicate_column THEN NULL;
END $$;

-- Expand role CHECK constraint safely (existing DB upgrade)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'users_role_check') THEN
    ALTER TABLE users DROP CONSTRAINT users_role_check;
  END IF;
  -- legacy деректерді сақтау үшін ескі "admin" рөлін "superadmin"-ға көшіреміз
  UPDATE users SET role = 'superadmin' WHERE role = 'admin';
  ALTER TABLE users ADD CONSTRAINT users_role_check CHECK (role IN ('user', 'builder', 'portfolio_admin', 'superadmin'));
EXCEPTION WHEN undefined_object THEN NULL;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name='user_settings') THEN
    CREATE TABLE user_settings (
      user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
      primary_color VARCHAR(20) DEFAULT 'blue',
      primary_color_hex VARCHAR(7),
      portfolio_slug VARCHAR(80) UNIQUE,
      is_published BOOLEAN DEFAULT false,
      seo_title VARCHAR(120),
      seo_description VARCHAR(200),
      onboarding_step INTEGER DEFAULT 1 CHECK (onboarding_step BETWEEN 1 AND 9),
      onboarding_completed BOOLEAN DEFAULT false,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );
    DROP TRIGGER IF EXISTS trg_user_settings_updated ON user_settings;
    CREATE TRIGGER trg_user_settings_updated BEFORE UPDATE ON user_settings FOR EACH ROW EXECUTE FUNCTION update_updated_at();
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='profiles' AND column_name='profession') THEN
    ALTER TABLE profiles ADD COLUMN profession VARCHAR(255);
  END IF;
EXCEPTION WHEN duplicate_column THEN NULL;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='profiles' AND column_name='intro_kz') THEN
    ALTER TABLE profiles ADD COLUMN intro_kz TEXT;
  END IF;
EXCEPTION WHEN duplicate_column THEN NULL;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='profiles' AND column_name='about_kz') THEN
    ALTER TABLE profiles ADD COLUMN about_kz TEXT;
  END IF;
EXCEPTION WHEN duplicate_column THEN NULL;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='profiles' AND column_name='instagram') THEN
    ALTER TABLE profiles ADD COLUMN instagram VARCHAR(255);
  END IF;
EXCEPTION WHEN duplicate_column THEN NULL;
END $$;

UPDATE profiles
SET
  profession = COALESCE(profession, title_kz, title_en, title_ru),
  intro_kz = COALESCE(intro_kz, bio_kz, bio_en, bio_ru),
  about_kz = COALESCE(about_kz, bio_kz, bio_en, bio_ru)
WHERE
  profession IS NULL
  OR intro_kz IS NULL
  OR about_kz IS NULL;

-- Add missing columns for multi-tenant support (existing DB upgrade)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='skills' AND column_name='user_id') THEN
    ALTER TABLE skills ADD COLUMN user_id UUID REFERENCES users(id) ON DELETE CASCADE;
  END IF;
EXCEPTION WHEN duplicate_column THEN NULL;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='projects' AND column_name='user_id') THEN
    ALTER TABLE projects ADD COLUMN user_id UUID REFERENCES users(id) ON DELETE CASCADE;
  END IF;
EXCEPTION WHEN duplicate_column THEN NULL;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='experience' AND column_name='user_id') THEN
    ALTER TABLE experience ADD COLUMN user_id UUID REFERENCES users(id) ON DELETE CASCADE;
  END IF;
EXCEPTION WHEN duplicate_column THEN NULL;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='education' AND column_name='user_id') THEN
    ALTER TABLE education ADD COLUMN user_id UUID REFERENCES users(id) ON DELETE CASCADE;
  END IF;
EXCEPTION WHEN duplicate_column THEN NULL;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='certificates' AND column_name='user_id') THEN
    ALTER TABLE certificates ADD COLUMN user_id UUID REFERENCES users(id) ON DELETE CASCADE;
  END IF;
EXCEPTION WHEN duplicate_column THEN NULL;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='blog_posts' AND column_name='user_id') THEN
    ALTER TABLE blog_posts ADD COLUMN user_id UUID REFERENCES users(id) ON DELETE CASCADE;
  END IF;
EXCEPTION WHEN duplicate_column THEN NULL;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='contacts' AND column_name='portfolio_user_id') THEN
    ALTER TABLE contacts ADD COLUMN portfolio_user_id UUID REFERENCES users(id) ON DELETE CASCADE;
  END IF;
EXCEPTION WHEN duplicate_column THEN NULL;
END $$;

-- Backfill legacy rows to the oldest superadmin user
DO $$
DECLARE
  admin_id UUID;
BEGIN
  SELECT id INTO admin_id FROM users WHERE role='superadmin' ORDER BY created_at ASC LIMIT 1;
  IF admin_id IS NOT NULL THEN
    UPDATE skills SET user_id = admin_id WHERE user_id IS NULL;
    UPDATE projects SET user_id = admin_id WHERE user_id IS NULL;
    UPDATE experience SET user_id = admin_id WHERE user_id IS NULL;
    UPDATE education SET user_id = admin_id WHERE user_id IS NULL;
    UPDATE certificates SET user_id = admin_id WHERE user_id IS NULL;
    UPDATE blog_posts SET user_id = admin_id WHERE user_id IS NULL;
  END IF;
END $$;

-- Ensure composite unique indexes exist (user_id, slug)
CREATE UNIQUE INDEX IF NOT EXISTS idx_projects_user_slug ON projects(user_id, slug);
CREATE UNIQUE INDEX IF NOT EXISTS idx_blog_user_slug ON blog_posts(user_id, slug);
CREATE INDEX IF NOT EXISTS idx_contacts_portfolio_user ON contacts(portfolio_user_id);
