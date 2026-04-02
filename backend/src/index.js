import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import path from 'path';
import { existsSync } from 'fs';
import routes from './routes/index.js';
import pool from './config/database.js';
import { runStartupMigrations } from './config/runMigrations.js';
import { FRONTEND_DIST_DIR, FRONTEND_INDEX_FILE, UPLOADS_DIR } from './config/paths.js';

const app = express();
const PORT = process.env.PORT || 5000;
const hasFrontendBuild = existsSync(FRONTEND_INDEX_FILE);
const allowedOrigins = [
  process.env.FRONTEND_URL,
  'http://localhost:3000',
  'http://localhost:5173',
]
  .flatMap((value) => (value ? value.split(',') : []))
  .map((value) => value.trim())
  .filter(Boolean);

app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
}));

app.use(cors({
  origin: allowedOrigins,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  message: { success: false, message: 'Too many requests, please try again later' },
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { success: false, message: 'Too many auth attempts' },
});

app.use('/api/', apiLimiter);
app.use('/api/auth/login', authLimiter);
app.use('/api/auth/register', authLimiter);

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

app.use('/uploads', express.static(UPLOADS_DIR, {
  maxAge: '7d',
  etag: true,
}));

app.use('/api', routes);

app.get('/health', async (req, res) => {
  try {
    await pool.query('SELECT 1');
    res.json({ status: 'ok', db: 'connected', timestamp: new Date().toISOString() });
  } catch {
    res.status(503).json({ status: 'error', db: 'disconnected' });
  }
});

if (process.env.NODE_ENV === 'production' && hasFrontendBuild) {
  app.use(express.static(FRONTEND_DIST_DIR, {
    etag: true,
    maxAge: '1h',
  }));

  app.get('*', (req, res, next) => {
    if (req.path === '/health' || req.path.startsWith('/api') || req.path.startsWith('/uploads')) {
      return next();
    }

    if (path.extname(req.path)) {
      return next();
    }

    return res.sendFile(FRONTEND_INDEX_FILE);
  });
}

app.use('*', (req, res) => {
  res.status(404).json({ success: false, message: `Route ${req.originalUrl} not found` });
});

app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);

  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({ success: false, message: 'File too large (max 5MB)' });
  }

  return res.status(err.status || 500).json({
    success: false,
    message: process.env.NODE_ENV === 'production' ? 'Internal server error' : err.message,
  });
});

const startServer = async () => {
  try {
    await runStartupMigrations();

    app.listen(PORT, () => {
      console.log(`Portfolio API Server running on port ${PORT}`);
      console.log(`Health: http://localhost:${PORT}/health`);
      console.log(`API Base: http://localhost:${PORT}/api`);
      console.log(`Uploads Dir: ${UPLOADS_DIR}`);
      if (process.env.NODE_ENV === 'production') {
        console.log(`Frontend Build: ${hasFrontendBuild ? FRONTEND_DIST_DIR : 'not found'}`);
      }
      console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
    });
  } catch (error) {
    console.error('Startup migration failed:', error);
    process.exit(1);
  }
};

startServer();

export default app;
