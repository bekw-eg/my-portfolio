# 🚀 Portfolio Platform — Full Stack App

A **production-ready**, multilingual portfolio platform built with **React + Node.js + Express + PostgreSQL**.

## ✨ Feature Overview

| Feature | Details |
|---|---|
| 🔐 Auth | JWT access + refresh tokens, role-based (user/admin) |
| 🌐 i18n | KZ / RU / EN with runtime switching |
| 🎨 Theme | Light / Dark mode with CSS variables |
| 📱 Responsive | Mobile-first, fully adaptive |
| ⚡ Animated BG | Particle canvas, gradient orbs, parallax effects |
| 🎯 CRUD | Projects, Blog, Certificates, Skills, Experience, Education |
| 📊 Analytics | Dashboard with views, top content, message stats |
| 📬 Contact Form | DB-stored messages with admin inbox |
| 🖼 File Uploads | Avatar, project covers, certificate images |
| 🔍 Search & Filter | Full-text search, category/status filters, pagination |
| 🛡 Security | Helmet, CORS, rate limiting, bcrypt, validation |

## 📁 Project Structure

```
portfolio/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   ├── database.js       # PostgreSQL connection pool
│   │   │   ├── schema.sql        # Full DB schema with triggers
│   │   │   ├── initDb.js         # DB initializer script
│   │   │   └── seedDb.js         # Demo data seeder
│   │   ├── controllers/
│   │   │   ├── authController.js     # Login, register, refresh, logout
│   │   │   ├── projectsController.js # Full CRUD for projects
│   │   │   ├── blogController.js     # Full CRUD for blog posts
│   │   │   └── mainController.js     # Profile, skills, exp, edu, certs, contacts, analytics
│   │   ├── middleware/
│   │   │   ├── auth.js           # JWT authenticate, requireAdmin, optionalAuth
│   │   │   └── upload.js         # Multer file upload handler
│   │   ├── routes/
│   │   │   └── index.js          # All API routes
│   │   ├── utils/
│   │   │   └── slugify.js        # Cyrillic-aware slug generator
│   │   └── index.js              # Express app entry point
│   ├── uploads/                  # Uploaded files (gitignored)
│   ├── .env.example
│   └── package.json
│
└── frontend/
    ├── src/
    │   ├── components/
    │   │   └── layout/
    │   │       ├── Navbar.jsx        # Responsive nav, lang/theme/user controls
    │   │       ├── Footer.jsx        # Footer with social links
    │   │       └── AdminLayout.jsx   # Sidebar layout for admin
    │   ├── context/
    │   │   └── AppContext.jsx        # Theme, language, auth state
    │   ├── i18n/
    │   │   └── translations.js       # KZ / RU / EN translations
    │   ├── pages/
    │   │   ├── HomePage.jsx          # Animated hero + featured projects
    │   │   ├── OtherPages.jsx        # About, Skills, Experience, Education, Certificates
    │   │   ├── ProjectsPage.jsx      # Projects with search/filter/pagination
    │   │   ├── ProjectDetailPage.jsx # Project detail with markdown content
    │   │   ├── BlogPage.jsx          # Blog with search/category filter
    │   │   ├── BlogPostPage.jsx      # Blog post detail with markdown
    │   │   ├── ContactPage.jsx       # Contact form with validation
    │   │   ├── LoginPage.jsx         # Login with demo credentials hint
    │   │   ├── RegisterPage.jsx      # Registration form
    │   │   ├── NotFoundPage.jsx      # 404 page
    │   │   └── admin/
    │   │       ├── DashboardPage.jsx         # Analytics overview
    │   │       ├── AdminProjectsPage.jsx     # Projects CRUD table
    │   │       ├── AdminPages.jsx            # Blog, Contacts, Skills, Certs, Profile
    │   │       └── Admin*Page.jsx            # Re-export wrappers
    │   ├── services/
    │   │   └── api.js                # Axios instance with token refresh
    │   ├── styles/
    │   │   └── globals.css           # Design tokens, glass, buttons, etc.
    │   ├── utils/
    │   │   └── format.js             # Date formatting, truncation
    │   ├── App.jsx                   # Router + protected routes
    │   └── main.jsx                  # Entry point
    ├── index.html
    ├── vite.config.js
    ├── tailwind.config.js
    └── package.json
```

## 🛠 Prerequisites

- **Node.js** v18+
- **PostgreSQL** v14+
- **npm** or **yarn**

## ⚙️ Setup Guide

### 1. Create PostgreSQL Database

```bash
psql -U postgres
CREATE DATABASE portfolio_db;
\q
```

### 2. Backend Setup

```bash
cd portfolio/backend

# Install dependencies
npm install

# Configure environment
cp .env.example .env
# Edit .env with your DB credentials and JWT secrets:
#   DB_HOST=localhost
#   DB_PORT=5432
#   DB_NAME=portfolio_db
#   DB_USER=postgres
#   DB_PASSWORD=your_password
#   JWT_SECRET=your_super_secret_key_min_32_chars
#   ADMIN_EMAIL=admin@portfolio.com
#   ADMIN_PASSWORD=Admin@123456

# Initialize database schema
npm run db:init

# Seed demo data
npm run db:seed

# Start development server
npm run dev
```

Backend runs at: **http://localhost:5000**

### 3. Frontend Setup

```bash
cd portfolio/frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

Frontend runs at: **http://localhost:3000**

### 4. Login

Visit http://localhost:3000/login

```
Email:    admin@portfolio.com
Password: Admin@123456
```

Admin Dashboard: http://localhost:3000/admin

---

## 🗃️ Database Schema Overview

| Table | Purpose |
|---|---|
| `users` | Auth accounts with role |
| `profiles` | Extended profile info (multilingual) |
| `skills` | Tech skills with level/category |
| `projects` | Portfolio projects (multilingual + JSONB gallery) |
| `experience` | Work history |
| `education` | Academic history |
| `certificates` | Professional certs |
| `blog_posts` | Blog articles (multilingual, markdown) |
| `contacts` | Contact form submissions |
| `page_views` | Analytics tracking |
| `refresh_tokens` | JWT refresh token store |
| `site_settings` | Key-value site config |

---

## 🔌 API Reference

### Auth
```
POST /api/auth/register   — Create account
POST /api/auth/login      — Login, get tokens
POST /api/auth/refresh    — Refresh access token
POST /api/auth/logout     — Revoke refresh token
GET  /api/auth/me         — Get current user (protected)
PUT  /api/auth/password   — Change password (protected)
```

### Public API
```
GET  /api/profile              — Public profile
GET  /api/skills               — Skills list
GET  /api/projects             — Projects (paginated, searchable)
GET  /api/projects/:slug       — Project detail + increment views
GET  /api/experience           — Work history
GET  /api/education            — Education history
GET  /api/certificates         — Certificates
GET  /api/blog                 — Blog posts (paginated)
GET  /api/blog/:slug           — Blog post detail
POST /api/contacts             — Submit contact form
```

### Admin API (requires JWT + admin role)
```
PUT    /api/profile                 — Update profile (multipart)
POST   /api/skills                  — Create skill
PUT    /api/skills/:id              — Update skill
DELETE /api/skills/:id              — Delete skill
POST   /api/projects                — Create project (multipart)
PUT    /api/projects/:id            — Update project
DELETE /api/projects/:id            — Delete project
POST   /api/blog                    — Create post (multipart)
PUT    /api/blog/:id                — Update post
DELETE /api/blog/:id                — Delete post
POST   /api/certificates            — Add certificate
PUT    /api/certificates/:id        — Update certificate
DELETE /api/certificates/:id        — Delete certificate
GET    /api/contacts                — View messages
PUT    /api/contacts/:id/status     — Update message status
GET    /api/analytics               — Dashboard stats
```

---

## 🎨 Design System

### Colors (CSS Variables)
```css
--color-bg           /* Page background */
--color-surface      /* Card background */
--color-border       /* Borders */
--color-text         /* Primary text */
--color-text-2       /* Secondary text */
--color-text-3       /* Muted text */
--color-primary      /* Brand blue #2563eb */
--color-accent       /* Sky blue #0ea5e9 */
--color-glow         /* Blue glow rgba */
```

### Utility Classes
```css
.glass-card          /* Glassmorphism card with hover */
.btn .btn-primary    /* Primary CTA button */
.btn .btn-secondary  /* Secondary button */
.btn .btn-ghost      /* Ghost button */
.btn-sm / .btn-lg    /* Size variants */
.badge-*             /* Status badges */
.tech-tag            /* Technology tag pill */
.gradient-text       /* Blue→cyan gradient text */
.section-label       /* Section category label */
.input-field         /* Styled form input */
.skill-bar-track     /* Animated skill bar */
.data-table          /* Admin data table */
```

---

## 🚀 Production Deployment

### Backend (Node.js server)
```bash
# Build / start
NODE_ENV=production npm start

# Recommended: use PM2
npm install -g pm2
pm2 start src/index.js --name portfolio-api
pm2 save
```

### Frontend (Static build)
```bash
npm run build
# Outputs to /dist — deploy to Netlify, Vercel, or serve with Nginx
```

### Nginx reverse proxy example
```nginx
server {
    listen 80;
    server_name yourdomain.com;

    # Frontend
    root /var/www/portfolio/frontend/dist;
    try_files $uri $uri/ /index.html;

    # API proxy
    location /api/ {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    # Uploads
    location /uploads/ {
        proxy_pass http://localhost:5000;
    }
}
```

---

## 🛡 Security Features

- **Helmet** — HTTP security headers
- **CORS** — Origin whitelist
- **Rate limiting** — 300 req/15min API, 10 req/15min auth
- **bcryptjs** — Password hashing (cost factor 12)
- **JWT** — Short-lived access (7d) + refresh (30d) tokens
- **Input validation** — Server-side validation on all forms
- **SQL injection protection** — Parameterized queries only
- **File upload validation** — Type and size checks (max 5MB)

---

## 📝 Tech Stack Summary

**Frontend:** React 18, React Router 6, Vite, Tailwind CSS, Framer-ready, Axios, React Hot Toast, React Markdown, React Intersection Observer

**Backend:** Node.js, Express 4, PostgreSQL (pg), bcryptjs, jsonwebtoken, multer, helmet, express-rate-limit, uuid

**Database:** PostgreSQL 14+ with UUID primary keys, JSONB for galleries, array columns for tags/tech stacks, full-text search ready, auto-update triggers

---

Built with ❤️ — Production-ready Portfolio Platform
