import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

interface DashboardData {
  equipe: string;
  propostas_apresentadas: number;
  propostas_adquiridas: number;
  meta_mes: number;
  meta_atual: number;
  pontos: number;
  taxa_conversao: number;
}

export async function GET() {
  let client;
  try {
    console.log('Tentando conectar ao banco de dados...');
    client = await pool.connect();
    console.log('Conexão estabelecida com sucesso');
    
    // Verificar se a tabela existe
    const tableCheck = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'dashmetas'
      );
    `);
    
    if (!tableCheck.rows[0].exists) {
      console.error('Tabela dashmetas não existe');
      return NextResponse.json(
        { 
          error: 'Tabela dashmetas não encontrada.',
          details: 'A tabela dashmetas não existe no banco de dados.'
        },
        { status: 500 }
      );
    }
    
    // Mapeamento de todos os membros para suas equipes
    const equipeMapping: { [key: string]: string } = {
      // Equipe Ana Carolina (faixa marrom)
      'Ana Carolina': 'Ana Carolina',
      'Ana Campos': 'Ana Carolina',
      'Ana Regnier': 'Ana Carolina',
      'Agatha Oliveira': 'Ana Carolina',
      'Bruno': 'Ana Carolina',
      // Equipe Caroline Dandara (faixa azul)
      'Caroline Dandara': 'Caroline Dandara',
      'Davi': 'Caroline Dandara',
      'Alex Henrique': 'Caroline Dandara',
      'Assib Zattar Neto': 'Caroline Dandara',
      // Equipe Caio (faixa azul)
      'Caio': 'Caio',
      'Kauany': 'Caio',
      'Daniely': 'Caio',
      'Byanka': 'Caio'
    };
    
    // Lista de todos os proprietários que pertencem às equipes
    const proprietariosEquipes = Object.keys(equipeMapping);
    
    // Buscar dados agregados por equipe (agregando todos os membros)
    console.log('Buscando dados da tabela dashmetas...');
    
    // Período da campanha: 05/11 a 20/12 (período fixo)
    const anoAtual = new Date().getFullYear();
    const dataInicio = `${anoAtual}-11-05`; // 05 de novembro
    const dataFim = `${anoAtual}-12-20`;   // 20 de dezembro
    
    console.log(`Filtrando dados do período da campanha: ${dataInicio} até ${dataFim}`);
    
    // Query que agrega dados por equipe
    // Regra: considerar apenas o primeiro registro de cada id_negocio (ordenado por data)
    // "Negociações iniciadas" = propostas apresentadas
    // Propostas adquiridas = vendas marcadas manualmente na tabela vendas_fechadas
    const proprietariosList = proprietariosEquipes.map(p => `'${p.replace(/'/g, "''")}'`).join(', ');
    
    // Verificar se as tabelas existem
    const vendasFechadasCheck = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'vendas_fechadas'
      );
    `);
    const temTabelaVendasFechadas = vendasFechadasCheck.rows[0].exists;

    const fechamentosCheck = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'fechamentos'
      );
    `);
    const temTabelaFechamentos = fechamentosCheck.rows[0].exists;
    
    const query = `
      WITH primeiro_registro AS (
        SELECT DISTINCT ON (id_negocio)
          id_negocio,
          proprietario,
          id_etapa,
          valor,
          data
        FROM dashmetas
        WHERE proprietario IN (${proprietariosList})
          AND id_negocio IS NOT NULL
          AND data::date >= '${dataInicio}'::date
          AND data::date <= '${dataFim}'::date
        ORDER BY id_negocio, data ASC
      ),
      propostas_apresentadas_por_equipe AS (
        SELECT 
          CASE 
            WHEN pr.proprietario IN ('Ana Carolina', 'Ana Campos', 'Ana Regnier', 'Agatha Oliveira', 'Bruno') THEN 'Ana Carolina'
            WHEN pr.proprietario IN ('Caroline Dandara', 'Davi', 'Alex Henrique', 'Assib Zattar Neto') THEN 'Caroline Dandara'
            WHEN pr.proprietario IN ('Caio', 'Kauany', 'Daniely', 'Byanka') THEN 'Caio'
          END as equipe,
          COUNT(DISTINCT CASE WHEN pr.id_etapa = 'Negociações iniciadas' THEN pr.id_negocio END) as propostas_apresentadas
        FROM primeiro_registro pr
        WHERE (
          pr.proprietario IN ('Ana Carolina', 'Ana Campos', 'Ana Regnier', 'Agatha Oliveira', 'Bruno') OR
          pr.proprietario IN ('Caroline Dandara', 'Davi', 'Alex Henrique', 'Assib Zattar Neto') OR
          pr.proprietario IN ('Caio', 'Kauany', 'Daniely', 'Byanka')
        )
        GROUP BY 
          CASE 
            WHEN pr.proprietario IN ('Ana Carolina', 'Ana Campos', 'Ana Regnier', 'Agatha Oliveira', 'Bruno') THEN 'Ana Carolina'
            WHEN pr.proprietario IN ('Caroline Dandara', 'Davi', 'Alex Henrique', 'Assib Zattar Neto') THEN 'Caroline Dandara'
            WHEN pr.proprietario IN ('Caio', 'Kauany', 'Daniely', 'Byanka') THEN 'Caio'
          END
      ),
      vendas_fechadas_por_equipe AS (
        ${temTabelaVendasFechadas ? `
        SELECT 
          CASE 
            WHEN vf.proprietario IN ('Ana Carolina', 'Ana Campos', 'Ana Regnier', 'Agatha Oliveira', 'Bruno') THEN 'Ana Carolina'
            WHEN vf.proprietario IN ('Caroline Dandara', 'Davi', 'Alex Henrique', 'Assib Zattar Neto') THEN 'Caroline Dandara'
            WHEN vf.proprietario IN ('Caio', 'Kauany', 'Daniely', 'Byanka') THEN 'Caio'
          END as equipe,
          COUNT(DISTINCT vf.id_negocio) as propostas_adquiridas,
          COALESCE(SUM(vf.valor), 0) as valor_vendido
        FROM vendas_fechadas vf
        WHERE vf.data_fechamento >= '${dataInicio}'::date
          AND vf.data_fechamento <= '${dataFim}'::date
          AND (
            vf.proprietario IN ('Ana Carolina', 'Ana Campos', 'Ana Regnier', 'Agatha Oliveira', 'Bruno') OR
            vf.proprietario IN ('Caroline Dandara', 'Davi', 'Alex Henrique', 'Assib Zattar Neto') OR
            vf.proprietario IN ('Caio', 'Kauany', 'Daniely', 'Byanka')
          )
        GROUP BY 
          CASE 
            WHEN vf.proprietario IN ('Ana Carolina', 'Ana Campos', 'Ana Regnier', 'Agatha Oliveira', 'Bruno') THEN 'Ana Carolina'
            WHEN vf.proprietario IN ('Caroline Dandara', 'Davi', 'Alex Henrique', 'Assib Zattar Neto') THEN 'Caroline Dandara'
            WHEN vf.proprietario IN ('Caio', 'Kauany', 'Daniely', 'Byanka') THEN 'Caio'
          END
        ` : `
        SELECT 'Ana Carolina' as equipe, 0 as propostas_adquiridas, 0 as valor_vendido
        UNION ALL SELECT 'Caroline Dandara', 0, 0
        UNION ALL SELECT 'Caio', 0, 0
        WHERE false
        `}
      ),
      fechamentos_por_equipe AS (
        ${temTabelaFechamentos ? `
        SELECT 
          CASE 
            WHEN f.proprietario IN ('Ana Carolina', 'Ana Campos', 'Ana Regnier', 'Agatha Oliveira', 'Bruno') THEN 'Ana Carolina'
            WHEN f.proprietario IN ('Caroline Dandara', 'Davi', 'Alex Henrique', 'Assib Zattar Neto') THEN 'Caroline Dandara'
            WHEN f.proprietario IN ('Caio', 'Kauany', 'Daniely', 'Byanka') THEN 'Caio'
          END as equipe,
          COUNT(*) as fechamentos
        FROM fechamentos f
        WHERE f.data_fechamento >= '${dataInicio}'::date
          AND f.data_fechamento <= '${dataFim}'::date
          AND (
            f.proprietario IN ('Ana Carolina', 'Ana Campos', 'Ana Regnier', 'Agatha Oliveira', 'Bruno') OR
            f.proprietario IN ('Caroline Dandara', 'Davi', 'Alex Henrique', 'Assib Zattar Neto') OR
            f.proprietario IN ('Caio', 'Kauany', 'Daniely', 'Byanka')
          )
        GROUP BY 
          CASE 
            WHEN f.proprietario IN ('Ana Carolina', 'Ana Campos', 'Ana Regnier', 'Agatha Oliveira', 'Bruno') THEN 'Ana Carolina'
            WHEN f.proprietario IN ('Caroline Dandara', 'Davi', 'Alex Henrique', 'Assib Zattar Neto') THEN 'Caroline Dandara'
            WHEN f.proprietario IN ('Caio', 'Kauany', 'Daniely', 'Byanka') THEN 'Caio'
          END
        ` : `
        SELECT 'Ana Carolina' as equipe, 0 as fechamentos
        UNION ALL SELECT 'Caroline Dandara', 0
        UNION ALL SELECT 'Caio', 0
        WHERE false
        `}
      )
      SELECT 
        COALESCE(pa.equipe, COALESCE(vf.equipe, fe.equipe)) as equipe,
        COALESCE(pa.propostas_apresentadas, 0) as propostas_apresentadas,
        COALESCE(vf.propostas_adquiridas, 0) as propostas_adquiridas,
        COALESCE(fe.fechamentos, 0) as fechamentos,
        COALESCE(vf.valor_vendido, 0) as valor_vendido
      FROM propostas_apresentadas_por_equipe pa
      FULL OUTER JOIN vendas_fechadas_por_equipe vf ON pa.equipe = vf.equipe
      FULL OUTER JOIN fechamentos_por_equipe fe ON COALESCE(pa.equipe, vf.equipe) = fe.equipe
      ORDER BY equipe;
    `;
    
    // Query para dados agregados por equipe
    const result = await client.query(query);
    console.log(`Dados encontrados: ${result.rows.length} equipes`);

    // Query para dados individuais de cada membro
    const queryIndividual = `
      WITH primeiro_registro AS (
        SELECT DISTINCT ON (id_negocio)
          id_negocio,
          proprietario,
          id_etapa,
          valor,
          data
        FROM dashmetas
        WHERE proprietario IN (${proprietariosList})
          AND id_negocio IS NOT NULL
          AND data::date >= '${dataInicio}'::date
          AND data::date <= '${dataFim}'::date
        ORDER BY id_negocio, data ASC
      ),
      propostas_apresentadas_por_membro AS (
        SELECT 
          pr.proprietario,
          COUNT(DISTINCT CASE WHEN pr.id_etapa = 'Negociações iniciadas' THEN pr.id_negocio END) as propostas_apresentadas
        FROM primeiro_registro pr
        WHERE pr.proprietario IN (${proprietariosList})
        GROUP BY pr.proprietario
      ),
      vendas_fechadas_por_membro AS (
        ${temTabelaVendasFechadas ? `
        SELECT 
          vf.proprietario,
          COUNT(DISTINCT vf.id_negocio) as propostas_adquiridas,
          COALESCE(SUM(vf.valor), 0) as valor_vendido
        FROM vendas_fechadas vf
        WHERE vf.data_fechamento >= '${dataInicio}'::date
          AND vf.data_fechamento <= '${dataFim}'::date
          AND vf.proprietario IN (${proprietariosList})
        GROUP BY vf.proprietario
        ` : `
        SELECT NULL::varchar as proprietario, 0::bigint as propostas_adquiridas, 0::numeric as valor_vendido
        WHERE false
        `}
      )
      SELECT 
        COALESCE(pa.proprietario, vf.proprietario) as proprietario,
        COALESCE(pa.propostas_apresentadas, 0) as propostas_apresentadas,
        COALESCE(vf.propostas_adquiridas, 0) as propostas_adquiridas,
        COALESCE(vf.valor_vendido, 0) as valor_vendido
      FROM propostas_apresentadas_por_membro pa
      FULL OUTER JOIN vendas_fechadas_por_membro vf ON pa.proprietario = vf.proprietario
      ORDER BY proprietario;
    `;

    const resultIndividual = await client.query(queryIndividual);
    console.log(`Dados individuais encontrados: ${resultIndividual.rows.length} membros`);

    // Criar mapa de membros por equipe com todos os membros definidos
    const membrosPorEquipe: { [key: string]: any[] } = {
      'Ana Carolina': [
        { nome: 'Ana Carolina', propostas_apresentadas: 0, propostas_adquiridas: 0, valor_vendido: 0, taxa_conversao: 0 },
        { nome: 'Ana Campos', propostas_apresentadas: 0, propostas_adquiridas: 0, valor_vendido: 0, taxa_conversao: 0 },
        { nome: 'Ana Regnier', propostas_apresentadas: 0, propostas_adquiridas: 0, valor_vendido: 0, taxa_conversao: 0 },
        { nome: 'Agatha Oliveira', propostas_apresentadas: 0, propostas_adquiridas: 0, valor_vendido: 0, taxa_conversao: 0 },
        { nome: 'Bruno', propostas_apresentadas: 0, propostas_adquiridas: 0, valor_vendido: 0, taxa_conversao: 0 }
      ],
      'Caroline Dandara': [
        { nome: 'Caroline Dandara', propostas_apresentadas: 0, propostas_adquiridas: 0, valor_vendido: 0, taxa_conversao: 0 },
        { nome: 'Davi', propostas_apresentadas: 0, propostas_adquiridas: 0, valor_vendido: 0, taxa_conversao: 0 },
        { nome: 'Alex Henrique', propostas_apresentadas: 0, propostas_adquiridas: 0, valor_vendido: 0, taxa_conversao: 0 },
        { nome: 'Assib Zattar Neto', propostas_apresentadas: 0, propostas_adquiridas: 0, valor_vendido: 0, taxa_conversao: 0 }
      ],
      'Caio': [
        { nome: 'Caio', propostas_apresentadas: 0, propostas_adquiridas: 0, valor_vendido: 0, taxa_conversao: 0 },
        { nome: 'Kauany', propostas_apresentadas: 0, propostas_adquiridas: 0, valor_vendido: 0, taxa_conversao: 0 },
        { nome: 'Daniely', propostas_apresentadas: 0, propostas_adquiridas: 0, valor_vendido: 0, taxa_conversao: 0 },
        { nome: 'Byanka', propostas_apresentadas: 0, propostas_adquiridas: 0, valor_vendido: 0, taxa_conversao: 0 }
      ]
    };

    // Atualizar com dados reais do banco
    resultIndividual.rows.forEach(row => {
      const proprietario = row.proprietario;
      let equipe = '';
      
      if (['Ana Carolina', 'Ana Campos', 'Ana Regnier', 'Agatha Oliveira', 'Bruno'].includes(proprietario)) {
        equipe = 'Ana Carolina';
      } else if (['Caroline Dandara', 'Davi', 'Alex Henrique', 'Assib Zattar Neto'].includes(proprietario)) {
        equipe = 'Caroline Dandara';
      } else if (['Caio', 'Kauany', 'Daniely', 'Byanka'].includes(proprietario)) {
        equipe = 'Caio';
      }

      if (equipe) {
        const propostasApresentadas = typeof row.propostas_apresentadas === 'string' 
          ? parseInt(row.propostas_apresentadas) || 0 
          : (row.propostas_apresentadas || 0);
        const propostasAdquiridas = typeof row.propostas_adquiridas === 'string'
          ? parseInt(row.propostas_adquiridas) || 0
          : (row.propostas_adquiridas || 0);
        const valorVendido = typeof row.valor_vendido === 'string'
          ? parseFloat(row.valor_vendido) || 0
          : (row.valor_vendido || 0);

        const taxaConversao = propostasApresentadas > 0 
          ? Math.round((propostasAdquiridas / propostasApresentadas) * 100 * 100) / 100
          : 0;

        // Atualizar o membro correspondente
        const membroIndex = membrosPorEquipe[equipe].findIndex(m => m.nome === proprietario);
        if (membroIndex !== -1) {
          membrosPorEquipe[equipe][membroIndex] = {
            nome: proprietario,
            propostas_apresentadas: propostasApresentadas,
            propostas_adquiridas: propostasAdquiridas,
            valor_vendido: valorVendido,
            taxa_conversao: taxaConversao
          };
        }
      }
    });

    // Mapeamento de nomes de equipes para nomes de exibição
    const nomesEquipes: { [key: string]: string } = {
      'Ana Carolina': 'Time da Diligência',
      'Caroline Dandara': 'Ninjas do Fechamento',
      'Caio': 'Os Gênios da Comissão'
    };

    // Cores das equipes
    const coresEquipes: { [key: string]: string } = {
      'Ana Carolina': '#8B5CF6', // Roxo
      'Caroline Dandara': '#10B981', // Verde
      'Caio': '#EF4444' // Vermelho
    };

    // Definir metas (R$ 800.000 por equipe)
    const metasPorEquipe: { [key: string]: number } = {
      'Ana Carolina': 800000,    // R$ 800 mil
      'Caroline Dandara': 800000, // R$ 800 mil
      'Caio': 800000            // R$ 800 mil
    };

    // Calcular micro-metas semanais
    // Micro-meta: meta semanal = (meta_mes / número de semanas da campanha)
    const dataInicioObj = new Date(dataInicio);
    const dataFimObj = new Date(dataFim);
    const hoje = new Date();
    const dataFimCalculo = hoje < dataFimObj ? hoje : dataFimObj;
    const diffTime = Math.abs(dataFimCalculo.getTime() - dataInicioObj.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    const semanasTotais = Math.ceil((new Date(dataFim).getTime() - new Date(dataInicio).getTime()) / (1000 * 60 * 60 * 24 * 7));
    const semanasDecorridas = Math.ceil(diffDays / 7);
    const metaSemanal = 800000 / semanasTotais; // Meta semanal = R$ 800k / número de semanas

    const equipes = result.rows.map(row => {
      const equipe = row.equipe;
      
      // Converter valores do PostgreSQL (pode vir como string ou number)
      const propostasApresentadas = typeof row.propostas_apresentadas === 'string' 
        ? parseInt(row.propostas_apresentadas) || 0 
        : (row.propostas_apresentadas || 0);
      const propostasAdquiridas = typeof row.propostas_adquiridas === 'string'
        ? parseInt(row.propostas_adquiridas) || 0
        : (row.propostas_adquiridas || 0);
      const fechamentos = typeof row.fechamentos === 'string'
        ? parseInt(row.fechamentos) || 0
        : (row.fechamentos || 0);
      const valorVendido = typeof row.valor_vendido === 'string'
        ? parseFloat(row.valor_vendido) || 0
        : (row.valor_vendido || 0);
      
      const metaMes = metasPorEquipe[equipe] || 800000;
      const metaAtual = valorVendido;
      
      // Calcular taxa de conversão
      const taxaConversao = propostasApresentadas > 0 
        ? Math.round((propostasAdquiridas / propostasApresentadas) * 100 * 100) / 100
        : 0;
      
      // Calcular micro-metas semanais batidas
      // Para simplificar, vamos contar quantas semanas a equipe bateu a meta semanal
      // Isso seria mais preciso com dados semanais, mas vamos usar uma aproximação
      let microMetasBatidas = 0;
      if (metaSemanal > 0 && valorVendido > 0) {
        // Aproximação: quantas metas semanais a equipe já atingiu
        microMetasBatidas = Math.floor(valorVendido / metaSemanal);
        // Limitar ao número de semanas decorridas
        microMetasBatidas = Math.min(microMetasBatidas, semanasDecorridas);
      }
      
      return {
        equipe: equipe,
        nome_display: nomesEquipes[equipe] || equipe,
        cor_equipe: coresEquipes[equipe] || '#D2AF52',
        propostas_apresentadas: propostasApresentadas,
        propostas_adquiridas: propostasAdquiridas,
        fechamentos: fechamentos,
        meta_mes: metaMes,
        meta_atual: metaAtual,
        pontos: 0, // Será calculado no frontend
        taxa_conversao: taxaConversao,
        meta_percentual: metaMes > 0 
          ? Math.round((metaAtual / metaMes) * 100) 
          : 0,
        micro_metas_batidas: microMetasBatidas,
        membros: membrosPorEquipe[equipe] || []
      };
    });

    // Garantir que todas as 3 equipes apareçam, mesmo que não tenham dados
    const equipesEsperadas = ['Ana Carolina', 'Caroline Dandara', 'Caio'];
    equipesEsperadas.forEach(equipeNome => {
      const existe = equipes.find(e => e.equipe === equipeNome);
      if (!existe) {
        equipes.push({
          equipe: equipeNome,
          nome_display: nomesEquipes[equipeNome] || equipeNome,
          cor_equipe: coresEquipes[equipeNome] || '#D2AF52',
          propostas_apresentadas: 0,
          propostas_adquiridas: 0,
          fechamentos: 0,
          meta_mes: metasPorEquipe[equipeNome] || 800000,
          meta_atual: 0,
          pontos: 0,
          taxa_conversao: 0,
          meta_percentual: 0,
          micro_metas_batidas: 0,
          membros: membrosPorEquipe[equipeNome] || []
        });
      } else {
        // Garantir que a equipe existente tenha o array de membros
        const index = equipes.findIndex(e => e.equipe === equipeNome);
        if (index !== -1) {
          equipes[index].membros = membrosPorEquipe[equipeNome] || [];
        }
      }
    });

    // Se não houver equipes, retornar array vazio mas com sucesso
    if (equipes.length === 0) {
      console.warn('Nenhuma equipe encontrada. Verifique se os nomes das equipes estão corretos.');
      return NextResponse.json({ 
        equipes: [],
        warning: 'Nenhuma equipe encontrada. Verifique se os nomes das equipes (Caroline, Ana, Caio) estão corretos na tabela.'
      });
    }
    
    return NextResponse.json({ equipes });
  } catch (error: any) {
    console.error('Erro detalhado ao buscar dados:', {
      message: error?.message,
      code: error?.code,
      stack: error?.stack
    });
    
    let errorMessage = 'Erro ao buscar dados do dashboard';
    let errorDetails = error?.message || 'Erro desconhecido';
    
    // Mensagens de erro mais específicas
    if (error?.code === 'ECONNREFUSED') {
      errorMessage = 'Não foi possível conectar ao banco de dados';
      errorDetails = 'Verifique se o servidor RDS está acessível e se as credenciais estão corretas';
    } else if (error?.code === 'ENOTFOUND') {
      errorMessage = 'Host do banco de dados não encontrado';
      errorDetails = 'Verifique o endereço do servidor RDS';
    } else if (error?.code === 'ETIMEDOUT') {
      errorMessage = 'Timeout ao conectar ao banco de dados';
      errorDetails = 'Verifique se o servidor RDS está acessível e se o firewall permite conexões';
    } else if (error?.message?.includes('password authentication failed')) {
      errorMessage = 'Falha na autenticação';
      errorDetails = 'Usuário ou senha incorretos';
    } else if (error?.message?.includes('does not exist') || error?.message?.includes('column') || error?.message?.includes('undefined column')) {
      errorMessage = 'Estrutura da tabela incompatível';
      errorDetails = error?.message || 'A tabela existe mas as colunas esperadas não foram encontradas. Verifique a estrutura da tabela.';
    }
    
    return NextResponse.json(
      { 
        error: errorMessage,
        details: errorDetails,
        code: error?.code
      },
      { status: 500 }
    );
  } finally {
    if (client) {
      client.release();
      console.log('Conexão liberada');
    }
  }
}
