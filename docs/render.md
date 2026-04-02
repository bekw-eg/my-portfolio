# Render Deployment

This repository is prepared for Render as a single full-stack deployment:

- one Render Web Service for the Express API and the built Vite frontend
- one Render Postgres database
- one persistent disk for uploaded files

This layout matches the current app structure because the frontend already uses relative `/api` and `/uploads` paths.

## Why a single service

Deploying the frontend and backend behind the same Render web service keeps these existing paths working without extra proxying:

- `/api/*` for the API
- `/uploads/*` for uploaded files
- React Router routes such as `/projects/...` and `/u/:handle`

## Files added for Render

- `render.yaml` creates the Render resources
- `backend/.env.example` documents required environment variables
- `backend/src/index.js` now serves `frontend/dist` in production
- `backend/src/config/getPgConfig.js` adds `DATABASE_URL` support
- `backend/src/config/paths.js` centralizes paths for `.env`, uploads, and the frontend build

## Before you push

This repo previously tracked local-only files. Clean them out of git before deploying:

```bash
git rm -r --cached backend/node_modules frontend/node_modules frontend/dist backend/uploads
git rm --cached backend/.env
git add .
git commit -m "Prepare portfolio for Render deployment"
```

If `backend/.env` was ever pushed to a public remote, rotate those secrets before going live.

## Deploy with Blueprint

1. Push the repo to GitHub.
2. In Render, click `New > Blueprint`.
3. Select this repository.
4. Review the resources from `render.yaml`:
   - `portfolio-fullstack` web service
   - `portfolio-db` Postgres database
5. During setup, provide values for:
   - `ADMIN_EMAIL`
   - `ADMIN_PASSWORD`
6. Deploy the Blueprint.

The web service build does this automatically:

- installs backend dependencies
- installs frontend dependencies
- builds the frontend
- runs `npm run db:init --prefix backend` before starting the app

## After the first deploy

Initialize demo/admin data once from the Render Shell or a one-off job:

```bash
npm run db:seed --prefix backend
```

Then verify:

```bash
curl https://your-service.onrender.com/health
```

You should see a JSON response with `status: "ok"` and `db: "connected"`.

## Upload persistence

Uploads are stored under:

```text
/opt/render/project/src/backend/uploads
```

Render persistent disks only preserve files written under the disk mount path. Without the disk, uploaded images will disappear after restarts or redeploys.

## Notes

- Render documentation says Postgres services should use the internal connection string whenever possible, and `render.yaml` wires `DATABASE_URL` from the managed database connection string.
- Render documentation also states that service filesystems are ephemeral by default, so the persistent disk is required for this app's local uploads.
