# SaaS Portfolio Platform Architecture

## 1. Жобаның қысқаша мақсаты

Қазіргі single-user портфолионы көпқолданушылы SaaS платформаға айналдыру:

- пайдаланушы тіркеледі;
- onboarding арқылы өз деректерін толтырады;
- барлық мәлімет `user_id` бойынша бөлек сақталады;
- әр қолданушыға жеке public URL беріледі;
- theme color дерекқорда сақталып, қайта кіргенде автоматты жүктеледі;
- бастапқы legacy портфолио өзгеріссіз қалады.

## 2. Ұсынылатын технологиялар

### Қазіргі репода іске асқан шешім

- Frontend: React + Vite
- Backend: Express
- Database: PostgreSQL
- Auth: JWT access/refresh token
- Validation: серверлік guard + route-level checks
- Upload: `multer`
- Icons: Hugeicons alias layer

### Ұзақ мерзімді production v2 stack

- Next.js 15
- TypeScript
- Tailwind CSS
- Prisma
- PostgreSQL
- Auth.js немесе JWT + refresh token
- Zod
- S3-compatible storage

Неге дәл қазір толық Next.js migration жасалмады:

- осы репода Vite + Express архитектурасы бар;
- legacy портфолионы бұзбай incremental migrate жасау қауіпсіз;
- multi-tenant logic қазірдің өзінде осы codebase ішінде тезірек интеграцияланды.

## 3. Архитектура

### Domain model

- `users` — аккаунт
- `user_settings` — theme, public slug, publish, SEO, onboarding
- `profiles` — негізгі профиль
- `projects`, `skills`, `experience`, `education`, `certificates`, `blog_posts`
- `contacts` — public contact form хабарламалары

### Негізгі принцип

- барлық контент `user_id` арқылы бөлінген;
- legacy портфолио тек `superadmin` арқылы басқарылады;
- жаңа “Түйіндеме үшін” қолданушысы `portfolio_admin` рөлімен тек өз деректерін өңдейді.

## 4. Database schema

Негізгі схема:

- `backend/src/config/schema.sql`

Маңызды өрістер:

- `users.role`: `user | builder | portfolio_admin | superadmin`
- `user_settings.portfolio_slug`
- `user_settings.primary_color`
- `user_settings.primary_color_hex`
- `user_settings.is_published`
- `contacts.portfolio_user_id`

Legacy сақтау логикасы:

- бұрынғы жазбалар ең алғашқы `superadmin` қолданушысына байланады;
- жаңа қолданушылардың барлық дерегі бөлек сақталады.

## 5. Backend API құрылымы

### Auth

- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/auth/refresh`
- `POST /api/auth/logout`
- `GET /api/auth/me`
- `PUT /api/auth/password`

### User-scoped API

- `GET/PUT /api/me/profile`
- `GET/PUT /api/me/settings`
- `GET/POST/PUT/DELETE /api/me/projects`
- `GET/POST/PUT/DELETE /api/me/skills`
- `GET/POST/PUT/DELETE /api/me/experience`
- `GET/POST/PUT/DELETE /api/me/education`
- `GET/POST/PUT/DELETE /api/me/certificates`
- `GET/POST/PUT/DELETE /api/me/blog`
- `GET /api/me/contacts`
- `PUT /api/me/contacts/:id/status`

### Public

- `GET /api/public/u/:username`
- `GET /api/public/portfolio/:username`
- `POST /api/contacts`
- `POST /api/analytics/track`

## 6. Frontend page structure

### Public

- `/`
- `/about`
- `/projects`
- `/skills`
- `/experience`
- `/education`
- `/certificates`
- `/blog`
- `/contact`
- `/u/:username`
- `/portfolio/:username`

### Private

- `/login`
- `/register`
- `/dashboard`
- `/dashboard/onboarding`
- `/admin/*` тек `superadmin`

## 7. Component structure

Негізгі файлдар:

- `frontend/src/context/AppContext.jsx`
- `frontend/src/pages/RegisterPage.jsx`
- `frontend/src/pages/LoginPage.jsx`
- `frontend/src/pages/DashboardBuilderPage.jsx`
- `frontend/src/pages/PublicPortfolioPage.jsx`
- `frontend/src/components/layout/Navbar.jsx`
- `frontend/src/components/layout/Footer.jsx`
- `frontend/src/lib/lucide-react.jsx`

## 8. Auth implementation

Тіркелу flow:

1. қолданушы email, password, full name, username, `whoAreYou` жібереді
2. `whoAreYou === "resume"` болса `portfolio_admin` рөлі беріледі
3. `profiles` және `user_settings` бірден жасалады
4. access/refresh token қайтарылады

Protection:

- frontend route guard: `ProtectedRoute`
- backend guard: `authenticate`
- legacy admin guard: `requireAdmin`

## 9. Portfolio CRUD implementation

CRUD backend-та user-scoped route-тармен ашылған.

Frontend-та:

- onboarding: бастапқы profile + social + content entry
- dashboard: progress, preview, blog/messages summary, status management
- public page: saved data негізінде автоматты render

## 10. Theme color implementation

Сақталатын өрістер:

- `primary_color`
- `primary_color_hex`

Flow:

1. user theme таңдайды
2. `PUT /api/me/settings`
3. `AppContext.applyPrimaryColor()` CSS variables жаңартады
4. public page `settings.theme.resolved` арқылы render болады

## 11. Hugeicons интеграциясы

`lucide-react` импорттары Vite alias арқылы Hugeicons-қа бағытталған:

- `frontend/vite.config.js`
- `frontend/src/lib/lucide-react.jsx`

Бұл тәсілдің пайдасы:

- ескі беттерді толық қолмен refactor жасамаймыз;
- барлық иконка бір provider арқылы өтеді;
- жаңа UI да Hugeicons-пен бірдей болады.

## 12. Public portfolio rendering

Public page:

- profile
- hero
- projects
- skills
- experience
- education
- certificates
- blog
- contact form
- SEO title/description

Негізгі файл:

- `frontend/src/pages/PublicPortfolioPage.jsx`

## 13. Dashboard implementation

Dashboard-та:

- onboarding progress
- publish status
- theme preview
- public URL
- content module summary
- latest blog posts
- latest messages

Негізгі файл:

- `frontend/src/pages/DashboardBuilderPage.jsx`

## 14. Қауіпсіздік бойынша ескертулер

- password `bcryptjs` арқылы hash жасалады
- refresh token бөлек сақталады
- reserved usernames блокталады
- public slug uniqueness тексеріледі
- user тек өз `user_id` жазбаларын өңдейді
- contact messages иесіне ғана көрінеді
- legacy admin операциялары `superadmin` үшін ғана ашық

## 15. Болашақта қосуға болатын функциялар

- dedicated user blog editor pages
- drag-and-drop portfolio blocks
- custom domain mapping
- media library
- portfolio templates
- analytics dashboard
- email notifications for contact messages
- Prisma + TypeScript migration

## 16. Дайын код мысалдары

Маңызды код нүктелері:

- backend auth: `backend/src/controllers/authController.js`
- backend settings/profile CRUD: `backend/src/controllers/mainController.js`
- backend public render API: `backend/src/controllers/publicController.js`
- backend routes: `backend/src/routes/index.js`
- public UI: `frontend/src/pages/PublicPortfolioPage.jsx`
- builder dashboard: `frontend/src/pages/DashboardBuilderPage.jsx`
- register flow: `frontend/src/pages/RegisterPage.jsx`

## Onboarding flow

1. Негізгі ақпарат
2. Әлеуметтік сілтемелер
3. Жобалар
4. Дағдылар
5. Тәжірибе
6. Білім
7. Сертификаттар
8. Theme color
9. Preview және publish
