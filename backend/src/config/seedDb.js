import pg from 'pg';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;

const skills = [
  ['React', 'frontend', 92, 'react', '#61DAFB', true],
  ['TypeScript', 'frontend', 88, 'typescript', '#3178C6', true],
  ['Next.js', 'frontend', 85, 'nextjs', '#111111', true],
  ['Vue.js', 'frontend', 78, 'vue', '#42B883', false],
  ['Node.js', 'backend', 90, 'nodejs', '#68A063', true],
  ['Express', 'backend', 88, 'express', '#111111', false],
  ['PostgreSQL', 'database', 85, 'postgresql', '#336791', true],
  ['MongoDB', 'database', 75, 'mongodb', '#47A248', false],
  ['Redis', 'database', 70, 'redis', '#DC382D', false],
  ['Docker', 'devops', 80, 'docker', '#2496ED', true],
  ['AWS', 'devops', 72, 'aws', '#FF9900', false],
  ['Figma', 'design', 80, 'figma', '#F24E1E', true],
];

const projects = [
  {
    slug: 'ecommerce-platform',
    title: 'E-commerce Platform',
    description: 'Full-featured e-commerce platform with payments, analytics, and inventory management.',
    content: `## Overview

Comprehensive e-commerce solution built with a modern web stack.

## Features

- Product catalog with filtering
- Cart and checkout
- Payment integration
- Inventory management
- Admin analytics dashboard`,
    tech: ['React', 'Node.js', 'PostgreSQL', 'Stripe', 'Redis', 'Docker'],
    demo: 'https://demo.portfolio.com',
    github: 'https://github.com/bekw-eg/ecommerce',
    featured: true,
    views: 1240,
  },
  {
    slug: 'ai-chat-app',
    title: 'AI Chat Application',
    description: 'Multi-model AI chat experience with streaming responses and conversation history.',
    content: `## Overview

Advanced AI chat application with real-time responses and flexible prompting.

## Features

- Multi-model support
- Streaming responses
- Conversation history
- Custom system prompts
- Attachments support`,
    tech: ['Next.js', 'TypeScript', 'OpenAI API', 'WebSocket', 'PostgreSQL'],
    demo: 'https://chat.portfolio.com',
    github: 'https://github.com/bekw-eg/ai-chat',
    featured: true,
    views: 980,
  },
  {
    slug: 'task-management-system',
    title: 'Task Management System',
    description: 'Kanban-style task manager with collaboration and real-time notifications.',
    content: `## Overview

Project management tool inspired by modern collaborative products.

## Features

- Drag and drop boards
- Team collaboration
- Due dates and assignments
- Activity feed
- Sprint planning`,
    tech: ['React', 'DnD Kit', 'Socket.io', 'Node.js', 'MongoDB', 'JWT'],
    demo: 'https://tasks.portfolio.com',
    github: 'https://github.com/bekw-eg/taskmanager',
    featured: true,
    views: 756,
  },
];

const experienceItems = [
  {
    company: 'TechCorp Kazakhstan',
    positionRu: 'Senior Full Stack Developer',
    positionEn: 'Senior Full Stack Developer',
    descriptionRu: 'Developing high-load web applications and mentoring a small engineering team.',
    descriptionEn: 'Developing high-load web applications and mentoring a small engineering team.',
    location: 'Almaty',
    type: 'full-time',
    startDate: '2022-03-01',
    isCurrent: true,
    techStack: ['React', 'Node.js', 'PostgreSQL', 'AWS', 'Docker'],
    sortOrder: 0,
  },
  {
    company: 'StartupHub',
    positionRu: 'Frontend Developer',
    positionEn: 'Frontend Developer',
    descriptionRu: 'Building interactive UI components and improving application performance.',
    descriptionEn: 'Building interactive UI components and improving application performance.',
    location: 'Remote',
    type: 'full-time',
    startDate: '2020-06-01',
    isCurrent: false,
    techStack: ['React', 'TypeScript', 'GraphQL', 'Figma'],
    sortOrder: 1,
  },
  {
    company: 'Freelance',
    positionRu: 'Full Stack Freelancer',
    positionEn: 'Full Stack Freelancer',
    descriptionRu: 'Delivering web products for clients in different markets.',
    descriptionEn: 'Delivering web products for clients in different markets.',
    location: 'Remote',
    type: 'freelance',
    startDate: '2019-01-01',
    isCurrent: false,
    techStack: ['React', 'Node.js', 'MySQL', 'WordPress'],
    sortOrder: 2,
  },
];

const educationItems = [
  {
    institution: 'Kazakh National Technical University',
    degreeRu: 'Bachelor',
    degreeEn: 'Bachelor',
    fieldRu: 'Information Technology',
    fieldEn: 'Information Technology',
    descriptionRu: 'Specialization in software development and computer science.',
    descriptionEn: 'Specialization in software development and computer science.',
    startDate: '2016-09-01',
    endDate: '2020-06-01',
    gpa: '3.8/4.0',
    sortOrder: 0,
  },
  {
    institution: 'Coursera / Meta',
    degreeRu: 'Professional Certificate',
    degreeEn: 'Professional Certificate',
    fieldRu: 'Front-End Web Development',
    fieldEn: 'Front-End Web Development',
    descriptionRu: 'Advanced coursework on React and modern frontend development.',
    descriptionEn: 'Advanced coursework on React and modern frontend development.',
    startDate: '2021-01-01',
    endDate: '2021-06-01',
    gpa: null,
    sortOrder: 1,
  },
];

const certificateItems = [
  {
    nameRu: 'AWS Certified Developer',
    nameEn: 'AWS Certified Developer',
    issuer: 'Amazon Web Services',
    issueDate: '2023-06-15',
    credentialUrl: 'https://aws.amazon.com/verify',
    category: 'Cloud',
    isFeatured: true,
    sortOrder: 0,
  },
  {
    nameRu: 'Google Cloud Professional Data Engineer',
    nameEn: 'Google Cloud Professional Data Engineer',
    issuer: 'Google',
    issueDate: '2023-03-20',
    credentialUrl: 'https://google.com/verify',
    category: 'Cloud',
    isFeatured: true,
    sortOrder: 1,
  },
  {
    nameRu: 'Meta Front-End Developer Professional Certificate',
    nameEn: 'Meta Front-End Developer Professional Certificate',
    issuer: 'Meta',
    issueDate: '2022-11-10',
    credentialUrl: 'https://coursera.org/verify',
    category: 'Frontend',
    isFeatured: false,
    sortOrder: 2,
  },
  {
    nameRu: 'Docker Certified Associate',
    nameEn: 'Docker Certified Associate',
    issuer: 'Docker Inc',
    issueDate: '2022-08-05',
    credentialUrl: 'https://docker.com/verify',
    category: 'DevOps',
    isFeatured: false,
    sortOrder: 3,
  },
];

const blogPosts = [
  {
    slug: 'modern-react-patterns-2024',
    title: 'Modern React Patterns in 2024',
    excerpt: 'A compact guide to the React patterns that matter in production applications.',
    content: `## Introduction

React keeps evolving quickly. This post highlights the patterns that improve maintainability and performance in real projects.`,
    tags: ['React', 'JavaScript', 'Frontend', 'Architecture'],
    category: 'Frontend',
    isFeatured: true,
    views: 2340,
    readTime: 8,
    publishedInterval: "7 days",
  },
  {
    slug: 'postgresql-performance-tips',
    title: 'PostgreSQL Performance Optimization Tips',
    excerpt: 'Practical ways to improve query speed and database efficiency.',
    content: `## Introduction

PostgreSQL gives strong performance out of the box, but indexes, query shape, and schema choices still matter.`,
    tags: ['PostgreSQL', 'Database', 'Performance', 'Backend'],
    category: 'Backend',
    isFeatured: true,
    views: 1890,
    readTime: 12,
    publishedInterval: "14 days",
  },
  {
    slug: 'building-design-systems',
    title: 'Building Design Systems from Scratch',
    excerpt: 'How to create a design system that stays useful as a team and product grow.',
    content: `## Introduction

Design systems work when they balance consistency, flexibility, and maintenance cost.`,
    tags: ['Design', 'CSS', 'UI', 'Frontend'],
    category: 'Design',
    isFeatured: false,
    views: 1245,
    readTime: 10,
    publishedInterval: "21 days",
  },
];

async function seedDb() {
  const pool = new Pool({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432', 10),
    database: process.env.DB_NAME || 'portfolio_db',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || '',
  });

  const client = await pool.connect();

  try {
    await client.query('BEGIN');
    console.log('Seeding database...');

    const adminEmail = process.env.ADMIN_EMAIL || 'admin@portfolio.com';
    const adminPassword = process.env.ADMIN_PASSWORD || 'Admin@123456';
    const adminHash = await bcrypt.hash(adminPassword, 12);

    const adminResult = await client.query(
      `
        INSERT INTO users (username, email, password_hash, role, is_active)
        VALUES ($1, $2, $3, 'superadmin', true)
        ON CONFLICT (email) DO UPDATE
        SET username = COALESCE(users.username, EXCLUDED.username),
            password_hash = EXCLUDED.password_hash,
            role = EXCLUDED.role,
            is_active = EXCLUDED.is_active
        RETURNING id
      `,
      ['bekw', adminEmail, adminHash]
    );

    const adminId = adminResult.rows[0].id;

    await client.query(
      `
        INSERT INTO profiles (
          user_id, full_name, title_kz, title_ru, title_en,
          bio_kz, bio_ru, bio_en, location, github, linkedin, telegram,
          years_experience, available_for_work
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
        ON CONFLICT (user_id) DO UPDATE
        SET full_name = EXCLUDED.full_name,
            title_kz = EXCLUDED.title_kz,
            title_ru = EXCLUDED.title_ru,
            title_en = EXCLUDED.title_en,
            bio_kz = EXCLUDED.bio_kz,
            bio_ru = EXCLUDED.bio_ru,
            bio_en = EXCLUDED.bio_en,
            location = EXCLUDED.location,
            github = EXCLUDED.github,
            linkedin = EXCLUDED.linkedin,
            telegram = EXCLUDED.telegram,
            years_experience = EXCLUDED.years_experience,
            available_for_work = EXCLUDED.available_for_work
      `,
      [
        adminId,
        'Berdibek Egeubay',
        'Full Stack Developer',
        'Full Stack Developer',
        'Full Stack Developer',
        'Full Stack developer focused on modern web products.',
        'Full Stack developer focused on modern web products.',
        'Full Stack developer focused on modern web products.',
        'Almaty, Kazakhstan',
        'github.com/bekw-eg',
        'www.instagram.com/bekw.eg/',
        '@bekw_dev',
        5,
        true,
      ]
    );

    await client.query(
      `INSERT INTO user_settings (user_id, portfolio_slug, is_published, onboarding_step, onboarding_completed, primary_color)
       VALUES ($1, $2, true, 9, true, 'blue')
       ON CONFLICT (user_id) DO UPDATE
       SET portfolio_slug = EXCLUDED.portfolio_slug,
           is_published = EXCLUDED.is_published,
           onboarding_step = EXCLUDED.onboarding_step,
           onboarding_completed = EXCLUDED.onboarding_completed`,
      [adminId, 'bekw']
    );

    for (let i = 0; i < skills.length; i += 1) {
      const [name, category, level, icon, color, featured] = skills[i];
      await client.query(
        `
          INSERT INTO skills (user_id, name, category, level, icon, color, is_featured, sort_order)
          SELECT
            $1::uuid,
            $2::varchar(100),
            $3::varchar(50),
            $4::integer,
            $5::varchar(100),
            $6::varchar(20),
            $7::boolean,
            $8::integer
          WHERE NOT EXISTS (
            SELECT 1
            FROM skills
            WHERE user_id = $1::uuid AND name = $2::varchar(100) AND category = $3::varchar(50)
          )
        `,
        [adminId, name, category, level, icon, color, featured, i]
      );
    }

    for (let i = 0; i < projects.length; i += 1) {
      const project = projects[i];
      await client.query(
        `
          INSERT INTO projects (
            user_id, slug, title_kz, title_ru, title_en, description_kz, description_ru, description_en,
            content_kz, content_ru, content_en, tech_stack, demo_url, github_url,
            is_featured, views, sort_order
          )
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17)
          ON CONFLICT (user_id, slug) DO UPDATE
          SET title_kz = EXCLUDED.title_kz,
              title_ru = EXCLUDED.title_ru,
              title_en = EXCLUDED.title_en,
              description_kz = EXCLUDED.description_kz,
              description_ru = EXCLUDED.description_ru,
              description_en = EXCLUDED.description_en,
              content_kz = EXCLUDED.content_kz,
              content_ru = EXCLUDED.content_ru,
              content_en = EXCLUDED.content_en,
              tech_stack = EXCLUDED.tech_stack,
              demo_url = EXCLUDED.demo_url,
              github_url = EXCLUDED.github_url,
              is_featured = EXCLUDED.is_featured,
              views = EXCLUDED.views,
              sort_order = EXCLUDED.sort_order
        `,
        [
          adminId,
          project.slug,
          project.title,
          project.title,
          project.title,
          project.description,
          project.description,
          project.description,
          project.content,
          project.content,
          project.content,
          project.tech,
          project.demo,
          project.github,
          project.featured,
          project.views,
          i,
        ]
      );
    }

    for (const item of experienceItems) {
      await client.query(
        `
          INSERT INTO experience (
            user_id, company, position_ru, position_en, description_ru, description_en,
            location, type, start_date, is_current, tech_stack, sort_order
          )
          SELECT
            $1::uuid,
            $2::varchar(255),
            $3::varchar(255),
            $4::varchar(255),
            $5::text,
            $6::text,
            $7::varchar(255),
            $8::varchar(20),
            $9::date,
            $10::boolean,
            $11::text[],
            $12::integer
          WHERE NOT EXISTS (
            SELECT 1
            FROM experience
            WHERE user_id = $1::uuid
              AND company = $2::varchar(255)
              AND position_en = $4::varchar(255)
              AND start_date = $9::date
          )
        `,
        [
          adminId,
          item.company,
          item.positionRu,
          item.positionEn,
          item.descriptionRu,
          item.descriptionEn,
          item.location,
          item.type,
          item.startDate,
          item.isCurrent,
          item.techStack,
          item.sortOrder,
        ]
      );
    }

    for (const item of educationItems) {
      await client.query(
        `
          INSERT INTO education (
            user_id, institution, degree_ru, degree_en, field_ru, field_en,
            description_ru, description_en, start_date, end_date, gpa, sort_order
          )
          SELECT
            $1::uuid,
            $2::varchar(255),
            $3::varchar(255),
            $4::varchar(255),
            $5::varchar(255),
            $6::varchar(255),
            $7::text,
            $8::text,
            $9::date,
            $10::date,
            $11::varchar(20),
            $12::integer
          WHERE NOT EXISTS (
            SELECT 1
            FROM education
            WHERE user_id = $1::uuid
              AND institution = $2::varchar(255)
              AND degree_en = $4::varchar(255)
              AND start_date = $9::date
          )
        `,
        [
          adminId,
          item.institution,
          item.degreeRu,
          item.degreeEn,
          item.fieldRu,
          item.fieldEn,
          item.descriptionRu,
          item.descriptionEn,
          item.startDate,
          item.endDate,
          item.gpa,
          item.sortOrder,
        ]
      );
    }

    for (const item of certificateItems) {
      await client.query(
        `
          INSERT INTO certificates (
            user_id, name_ru, name_en, issuer, issue_date, credential_url, category, is_featured, sort_order
          )
          SELECT
            $1::uuid,
            $2::varchar(255),
            $3::varchar(255),
            $4::varchar(255),
            $5::date,
            $6::varchar(500),
            $7::varchar(50),
            $8::boolean,
            $9::integer
          WHERE NOT EXISTS (
            SELECT 1
            FROM certificates
            WHERE user_id = $1::uuid
              AND name_en = $3::varchar(255)
              AND issuer = $4::varchar(255)
              AND issue_date = $5::date
          )
        `,
        [
          adminId,
          item.nameRu,
          item.nameEn,
          item.issuer,
          item.issueDate,
          item.credentialUrl,
          item.category,
          item.isFeatured,
          item.sortOrder,
        ]
      );
    }

    for (const post of blogPosts) {
      await client.query(
        `
          INSERT INTO blog_posts (
            user_id, slug, title_ru, title_en, excerpt_ru, excerpt_en, content_ru, content_en,
            tags, category, is_published, is_featured, views, read_time, published_at
          )
          VALUES (
            $1, $2, $3, $4, $5, $6, $7, $8,
            $9, $10, true, $11, $12, $13, NOW() - ($14::interval)
          )
          ON CONFLICT (user_id, slug) DO UPDATE
          SET title_ru = EXCLUDED.title_ru,
              title_en = EXCLUDED.title_en,
              excerpt_ru = EXCLUDED.excerpt_ru,
              excerpt_en = EXCLUDED.excerpt_en,
              content_ru = EXCLUDED.content_ru,
              content_en = EXCLUDED.content_en,
              tags = EXCLUDED.tags,
              category = EXCLUDED.category,
              is_published = EXCLUDED.is_published,
              is_featured = EXCLUDED.is_featured,
              views = EXCLUDED.views,
              read_time = EXCLUDED.read_time,
              published_at = EXCLUDED.published_at
        `,
        [
          adminId,
          post.slug,
          post.title,
          post.title,
          post.excerpt,
          post.excerpt,
          post.content,
          post.content,
          post.tags,
          post.category,
          post.isFeatured,
          post.views,
          post.readTime,
          post.publishedInterval,
        ]
      );
    }

    await client.query(`
      INSERT INTO site_settings (key, value, type)
      VALUES
        ('site_name', 'Portfolio', 'string'),
        ('site_description', 'Full Stack Developer Portfolio', 'string'),
        ('maintenance_mode', 'false', 'boolean'),
        ('show_hire_me', 'true', 'boolean')
      ON CONFLICT (key) DO UPDATE
      SET value = EXCLUDED.value,
          type = EXCLUDED.type
    `);

    await client.query('COMMIT');
    console.log('Database seeded successfully');
    console.log(`Admin: ${adminEmail}`);
    console.log(`Password: ${adminPassword}`);
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Seeding failed:', err.message);
    throw err;
  } finally {
    client.release();
    await pool.end();
  }
}

seedDb();
