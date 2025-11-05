import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

// Função para garantir que a tabela fechamentos exista
async function ensureFechamentosTable(client: any) {
  await client.query(`
    CREATE TABLE IF NOT EXISTS fechamentos (
      id SERIAL PRIMARY KEY,
      numero VARCHAR(255) NOT NULL,
      proprietario VARCHAR(255) NOT NULL,
      valor NUMERIC(15, 2),
      data_fechamento DATE DEFAULT CURRENT_DATE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      UNIQUE (numero, proprietario)
    );
  `);
}

export async function GET() {
  let client;
  try {
    client = await pool.connect();
    await ensureFechamentosTable(client);
    const result = await client.query('SELECT id, numero, proprietario, valor, data_fechamento::text as data_fechamento FROM fechamentos ORDER BY data_fechamento DESC');
    
    // Garantir que data_fechamento seja sempre uma string no formato YYYY-MM-DD
    const fechamentos = result.rows.map((row: any) => {
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
    
    return NextResponse.json({ fechamentos });
  } catch (error: any) {
    console.error('Erro ao buscar fechamentos:', error);
    return NextResponse.json({ error: 'Erro ao buscar fechamentos', details: error.message }, { status: 500 });
  } finally {
    if (client) client.release();
  }
}

export async function POST(request: Request) {
  let client;
  try {
    const { numero, proprietario, valor, data_fechamento } = await request.json();

    if (!numero || !proprietario) {
      return NextResponse.json({ error: 'Número e Proprietário são obrigatórios' }, { status: 400 });
    }

    client = await pool.connect();
    await ensureFechamentosTable(client);

    const parsedValor = valor ? parseFloat(valor) : null;
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

    const result = await client.query(
      `INSERT INTO fechamentos (numero, proprietario, valor, data_fechamento) VALUES ($1, $2, $3, $4::date) ON CONFLICT (numero, proprietario) DO UPDATE SET valor = EXCLUDED.valor, data_fechamento = EXCLUDED.data_fechamento, created_at = CURRENT_TIMESTAMP RETURNING *`,
      [numero, proprietario, parsedValor, parsedDataFechamento]
    );
    return NextResponse.json({ fechamento: result.rows[0] });
  } catch (error: any) {
    console.error('Erro ao adicionar fechamento:', error);
    return NextResponse.json({ error: 'Erro ao adicionar fechamento', details: error.message }, { status: 500 });
  } finally {
    if (client) client.release();
  }
}

export async function DELETE(request: Request) {
  let client;
  try {
    const { id } = await request.json();

    if (!id) {
      return NextResponse.json({ error: 'ID do fechamento é obrigatório' }, { status: 400 });
    }

    client = await pool.connect();
    await ensureFechamentosTable(client);

    const result = await client.query('DELETE FROM fechamentos WHERE id = $1 RETURNING *', [id]);

    if (result.rowCount === 0) {
      return NextResponse.json({ error: 'Fechamento não encontrado' }, { status: 404 });
    }
    return NextResponse.json({ message: 'Fechamento removido com sucesso', fechamento: result.rows[0] });
  } catch (error: any) {
    console.error('Erro ao remover fechamento:', error);
    return NextResponse.json({ error: 'Erro ao remover fechamento', details: error.message }, { status: 500 });
  } finally {
    if (client) client.release();
  }
}

