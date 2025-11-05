import { Pool } from 'pg';

const pool = new Pool({
  host: process.env.DB_HOST || 'bdunicoprecs.c50cwuocuwro.sa-east-1.rds.amazonaws.com',
  port: parseInt(process.env.DB_PORT || '5432', 10),
  database: process.env.DB_NAME || 'dashmetas',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || '$P^iFe27^YP5cpBU3J&tqa',
  ssl: {
    rejectUnauthorized: false
  },
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000,
});

// Tratamento de erros do pool
pool.on('error', (err) => {
  console.error('Erro inesperado no pool de conexões:', err);
});

export default pool;
