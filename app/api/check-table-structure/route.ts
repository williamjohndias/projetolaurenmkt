import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  let client;
  try {
    client = await pool.connect();
    
    // Verificar estrutura da tabela
    const columns = await client.query(`
      SELECT 
        column_name,
        data_type,
        is_nullable,
        column_default
      FROM information_schema.columns
      WHERE table_schema = 'public' 
      AND table_name = 'dashmetas'
      ORDER BY ordinal_position;
    `);
    
    // Verificar alguns registros de exemplo
    const sampleData = await client.query(`
      SELECT * FROM dashmetas LIMIT 5;
    `);
    
    // Verificar se há dados das equipes específicas
    const equipesCheck = await client.query(`
      SELECT DISTINCT equipe FROM dashmetas LIMIT 10;
    `);
    
    return NextResponse.json({
      success: true,
      structure: {
        columns: columns.rows,
        sampleRecord: sampleData.rows[0] || null,
        sampleRecordsCount: sampleData.rows.length,
        uniqueEquipes: equipesCheck.rows.map(r => r.equipe)
      }
    });
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error?.message
    }, { status: 500 });
  } finally {
    if (client) {
      client.release();
    }
  }
}
