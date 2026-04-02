import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

const configDir = path.dirname(fileURLToPath(import.meta.url));

export const BACKEND_DIR = path.resolve(configDir, '..', '..');
export const REPO_ROOT = path.resolve(BACKEND_DIR, '..');
export const ENV_FILE = path.join(BACKEND_DIR, '.env');
export const FRONTEND_DIST_DIR = path.join(REPO_ROOT, 'frontend', 'dist');
export const FRONTEND_INDEX_FILE = path.join(FRONTEND_DIST_DIR, 'index.html');
export const DEFAULT_UPLOADS_DIR = path.join(BACKEND_DIR, 'uploads');

dotenv.config({ path: ENV_FILE });

export const UPLOADS_DIR = path.resolve(
  process.env.UPLOAD_PATH || process.env.UPLOADS_DIR || DEFAULT_UPLOADS_DIR
);
