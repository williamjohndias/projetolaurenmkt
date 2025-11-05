import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  let client;
  try {
    console.log('Testando conexão com o banco de dados...');
    
    // Testar conexão básica
    client = await pool.connect();
    console.log('✅ Conexão estabelecida');
    
    // Testar query simples
    const testQuery = await client.query('SELECT NOW() as current_time, version() as pg_version');
    console.log('✅ Query de teste executada com sucesso');
    
    // Verificar se o banco existe
    const dbCheck = await client.query(`
      SELECT datname FROM pg_database WHERE datname = 'dashmetas'
    `);
    
    // Verificar se a tabela existe
    const tableCheck = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'dashmetas'
      ) as table_exists;
    `);
    
    // Contar registros se a tabela existir
    let recordCount = 0;
    if (tableCheck.rows[0].table_exists) {
      const countResult = await client.query('SELECT COUNT(*) as count FROM dashmetas');
      recordCount = parseInt(countResult.rows[0].count);
    }
    
    return NextResponse.json({
      success: true,
      message: 'Conexão estabelecida com sucesso',
      details: {
        database: 'dashmetas',
        databaseExists: dbCheck.rows.length > 0,
        tableExists: tableCheck.rows[0].table_exists,
        recordsInTable: recordCount,
        serverTime: testQuery.rows[0].current_time,
        postgresVersion: testQuery.rows[0].pg_version.split(',')[0]
      }
    });
  } catch (error: any) {
    console.error('❌ Erro no teste de conexão:', {
      message: error?.message,
      code: error?.code,
      stack: error?.stack
    });
    
    return NextResponse.json({
      success: false,
      error: {
        message: error?.message || 'Erro desconhecido',
        code: error?.code,
        type: error?.name
      },
      troubleshooting: {
        connectionRefused: error?.code === 'ECONNREFUSED' 
          ? 'O servidor RDS pode não estar acessível ou a porta 5432 está bloqueada'
          : null,
        hostNotFound: error?.code === 'ENOTFOUND'
          ? 'O hostname do RDS está incorreto ou não existe'
          : null,
        timeout: error?.code === 'ETIMEDOUT'
          ? 'Timeout na conexão - verifique firewall e security groups do RDS'
          : null,
        authFailed: error?.message?.includes('password authentication failed')
          ? 'Usuário ou senha incorretos'
          : null,
        databaseNotFound: error?.message?.includes('database') && error?.message?.includes('does not exist')
          ? 'O banco de dados "dashmetas" não existe. Crie-o primeiro.'
          : null
      }
    }, { status: 500 });
  } finally {
    if (client) {
      client.release();
    }
  }
}
