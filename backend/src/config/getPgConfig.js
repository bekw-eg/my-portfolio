import './paths.js';

const parsePort = (value, fallback = 5432) => {
  const parsed = parseInt(value || '', 10);
  return Number.isNaN(parsed) ? fallback : parsed;
};

const buildBaseConfig = () => {
  if (process.env.DATABASE_URL) {
    return { connectionString: process.env.DATABASE_URL };
  }

  return {
    host: process.env.DB_HOST || 'localhost',
    port: parsePort(process.env.DB_PORT),
    database: process.env.DB_NAME || 'portfolio_db',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || '',
  };
};

export const getPgConfig = (overrides = {}) => {
  const isProduction = process.env.NODE_ENV === 'production';

  return {
    ...buildBaseConfig(),
    ssl: isProduction ? { rejectUnauthorized: false } : false,
    ...overrides,
  };
};
