import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export const dynamic = 'force-dynamic';

// GET - Listar vendas fechadas
export async function GET() {
  let client;
  try {
    client = await pool.connect();
    
    // Verificar se a tabela de vendas fechadas existe
    const tableCheck = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'vendas_fechadas'
      );
    `);
    
    if (!tableCheck.rows[0].exists) {
      // Criar tabela se não existir
      await client.query(`
        CREATE TABLE IF NOT EXISTS vendas_fechadas (
          id SERIAL PRIMARY KEY,
          id_negocio BIGINT NOT NULL UNIQUE,
          proprietario VARCHAR(255) NOT NULL,
          valor NUMERIC(15, 2),
          data_fechamento DATE DEFAULT CURRENT_DATE,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
      `);
    }
    
    const result = await client.query(`
      SELECT 
        id_negocio,
        proprietario,
        valor,
        data_fechamento::text as data_fechamento,
        created_at
      FROM vendas_fechadas
      ORDER BY data_fechamento DESC, created_at DESC;
    `);
    
    // Garantir que data_fechamento seja sempre uma string no formato YYYY-MM-DD
    const vendas = result.rows.map((row: any) => {
      if (row.data_fechamento) {
        // Se for um objeto Date, converter para string YYYY-MM-DD
        if (row.data_fechamento instanceof Date) {
          const year = row.data_fechamento.getFullYear();
          const month = String(row.data_fechamento.getMonth() + 1).padStart(2, '0');
          const day = String(row.data_fechamento.getDate()).padStart(2, '0');
          row.data_fechamento = `${year}-${month}-${day}`;
        } else if (typeof row.data_fechamento === 'string') {
          // Se já for string, garantir formato YYYY-MM-DD
          const dateMatch = row.data_fechamento.match(/^(\d{4}-\d{2}-\d{2})/);
          if (dateMatch) {
            row.data_fechamento = dateMatch[1];
          }
        }
      }
      return row;
    });
    
    return NextResponse.json({ vendas });
  } catch (error: any) {
    console.error('Erro ao buscar vendas fechadas:', error);
    return NextResponse.json(
      { error: error?.message || 'Erro ao buscar vendas fechadas' },
      { status: 500 }
    );
  } finally {
    if (client) {
      client.release();
    }
  }
}

// POST - Adicionar venda fechada
export async function POST(request: Request) {
  let client;
  try {
    const body = await request.json();
    const { id_negocio, proprietario, valor, data_fechamento } = body;
    
    if (!id_negocio || !proprietario) {
      return NextResponse.json(
        { error: 'id_negocio e proprietario são obrigatórios' },
        { status: 400 }
      );
    }
    
    client = await pool.connect();
    
    // Verificar se a tabela existe
    const tableCheck = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'vendas_fechadas'
      );
    `);
    
    if (!tableCheck.rows[0].exists) {
      await client.query(`
        CREATE TABLE IF NOT EXISTS vendas_fechadas (
          id SERIAL PRIMARY KEY,
          id_negocio BIGINT NOT NULL UNIQUE,
          proprietario VARCHAR(255) NOT NULL,
          valor NUMERIC(15, 2),
          data_fechamento DATE DEFAULT CURRENT_DATE,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
      `);
    }
    
    // Inserir ou atualizar venda fechada
    // Usar a data como string diretamente (formato YYYY-MM-DD) para evitar problemas de timezone
    let parsedDataFechamento = data_fechamento;
    if (!parsedDataFechamento) {
      // Se não fornecer data, usar a data atual no timezone local
      const hoje = new Date();
      const ano = hoje.getFullYear();
      const mes = String(hoje.getMonth() + 1).padStart(2, '0');
      const dia = String(hoje.getDate()).padStart(2, '0');
      parsedDataFechamento = `${ano}-${mes}-${dia}`;
    }
    
    const result = await client.query(`
      INSERT INTO vendas_fechadas (id_negocio, proprietario, valor, data_fechamento)
      VALUES ($1, $2, $3, $4::date)
      ON CONFLICT (id_negocio) 
      DO UPDATE SET 
        proprietario = EXCLUDED.proprietario,
        valor = EXCLUDED.valor,
        data_fechamento = EXCLUDED.data_fechamento
      RETURNING *;
    `, [id_negocio, proprietario, valor || null, parsedDataFechamento]);
    
    return NextResponse.json({ 
      success: true, 
      venda: result.rows[0] 
    });
  } catch (error: any) {
    console.error('Erro ao adicionar venda fechada:', error);
    return NextResponse.json(
      { error: error?.message || 'Erro ao adicionar venda fechada' },
      { status: 500 }
    );
  } finally {
    if (client) {
      client.release();
    }
  }
}

// DELETE - Remover venda fechada
export async function DELETE(request: Request) {
  let client;
  try {
    const { searchParams } = new URL(request.url);
    const id_negocio = searchParams.get('id_negocio');
    
    if (!id_negocio) {
      return NextResponse.json(
        { error: 'id_negocio é obrigatório' },
        { status: 400 }
      );
    }
    
    client = await pool.connect();
    
    const result = await client.query(`
      DELETE FROM vendas_fechadas 
      WHERE id_negocio = $1
      RETURNING *;
    `, [id_negocio]);
    
    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'Venda fechada não encontrada' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ 
      success: true, 
      message: 'Venda fechada removida com sucesso' 
    });
  } catch (error: any) {
    console.error('Erro ao remover venda fechada:', error);
    return NextResponse.json(
      { error: error?.message || 'Erro ao remover venda fechada' },
      { status: 500 }
    );
  } finally {
    if (client) {
      client.release();
    }
  }
}

