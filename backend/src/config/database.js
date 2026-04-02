import pg from 'pg';
import { getPgConfig } from './getPgConfig.js';

const { Pool } = pg;

const pool = new Pool(getPgConfig({
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
}));

pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
  process.exit(-1);
});

export const query = async (text, params) => {
  const start = Date.now();
  const res = await pool.query(text, params);
  const duration = Date.now() - start;
  if (process.env.NODE_ENV === 'development') {
    console.log('Query executed', { text: text.slice(0, 80), duration, rows: res.rowCount });
  }
  return res;
};

export const getClient = () => pool.connect();

export default pool;
