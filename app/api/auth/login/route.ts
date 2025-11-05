import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

// Credenciais de acesso (em produção, use variáveis de ambiente)
const USUARIO = 'admin';
const SENHA = 'natal2024';

export async function POST(request: Request) {
  try {
    const { usuario, senha } = await request.json();

    if (!usuario || !senha) {
      return NextResponse.json(
        { error: 'Usuário e senha são obrigatórios' },
        { status: 400 }
      );
    }

    if (usuario === USUARIO && senha === SENHA) {
      return NextResponse.json({ success: true });
    } else {
      return NextResponse.json(
        { error: 'Usuário ou senha incorretos' },
        { status: 401 }
      );
    }
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Erro ao processar login', details: error.message },
      { status: 500 }
    );
  }
}

