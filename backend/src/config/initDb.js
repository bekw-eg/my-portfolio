import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import pg from 'pg';
import { getPgConfig } from './getPgConfig.js';

const { Pool } = pg;
const __dirname = dirname(fileURLToPath(import.meta.url));

async function initDb() {
  const pool = new Pool(getPgConfig());

  try {
    console.log('🚀 Initializing database...');
    const schema = readFileSync(join(__dirname, 'schema.sql'), 'utf8');
    await pool.query(schema);
    console.log('✅ Database schema created successfully');
  } catch (err) {
    console.error('❌ Database initialization failed:', err.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

initDb();
