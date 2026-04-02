import multer from 'multer';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { mkdirSync } from 'fs';
import { UPLOADS_DIR } from '../config/paths.js';

const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif', 'application/pdf'];

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const type = req.uploadType || 'misc';
    const dir = path.join(UPLOADS_DIR, type);
    try { mkdirSync(dir, { recursive: true }); } catch {}
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `${uuidv4()}${ext}`);
  },
});

const fileFilter = (req, file, cb) => {
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Allowed: JPEG, PNG, WEBP, GIF, PDF'), false);
  }
};

export const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: parseInt(process.env.MAX_FILE_SIZE || '5242880') },
});

export const setUploadType = (type) => (req, res, next) => {
  req.uploadType = type;
  next();
};
