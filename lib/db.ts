import { Pool } from 'pg';

const pool = new Pool({
  host: 'bdunicoprecs.c50cwuocuwro.sa-east-1.rds.amazonaws.com',
  port: 5432,
  database: 'dashmetas',
  user: 'postgres',
  password: '$P^iFe27^YP5cpBU3J&tqa',
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
