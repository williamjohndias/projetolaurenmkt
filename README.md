# 🎄 Rumo ao Natal Campeão - Dashboard

Dashboard interativo para a campanha de vendas "Rumo ao Natal Campeão", que monitora o desempenho das equipes Caroline, Ana e Caio.

## 🚀 Tecnologias

- **Next.js 14** - Framework React
- **TypeScript** - Tipagem estática
- **PostgreSQL** - Banco de dados (RDS AWS)
- **CSS Modules** - Estilização

## 📋 Pré-requisitos

- Node.js 18+ instalado
- Acesso ao banco de dados RDS configurado

## 🔧 Instalação

1. Instale as dependências:
```bash
npm install
```

2. Execute o servidor de desenvolvimento:
```bash
npm run dev
```

3. Acesse o dashboard em: `http://localhost:3000`

## 📊 Estrutura do Banco de Dados

O dashboard espera uma tabela `dashmetas` no banco `dashmetas` com os seguintes campos:

- `equipe` (VARCHAR) - Nome da equipe (Caroline, Ana, Caio)
- `propostas_apresentadas` (INTEGER) - Número de propostas apresentadas
- `propostas_adquiridas` (INTEGER) - Número de propostas adquiridas/vendidas
- `meta_mes` (INTEGER) - Meta do mês em valor
- `meta_atual` (INTEGER) - Valor atual atingido
- `pontos` (INTEGER) - Pontos da equipe (opcional, será calculado automaticamente)

### Exemplo de SQL para criar a tabela:

```sql
CREATE TABLE IF NOT EXISTS dashmetas (
  id SERIAL PRIMARY KEY,
  equipe VARCHAR(50) NOT NULL,
  propostas_apresentadas INTEGER DEFAULT 0,
  propostas_adquiridas INTEGER DEFAULT 0,
  meta_mes INTEGER DEFAULT 0,
  meta_atual INTEGER DEFAULT 0,
  pontos INTEGER DEFAULT 0,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Inserir equipes iniciais
INSERT INTO dashmetas (equipe, propostas_apresentadas, propostas_adquiridas, meta_mes, meta_atual)
VALUES 
  ('Caroline', 0, 0, 100000, 0),
  ('Ana', 0, 0, 100000, 0),
  ('Caio', 0, 0, 100000, 0)
ON CONFLICT DO NOTHING;
```

## 🎯 Funcionalidades

- ✅ Visualização em tempo real das métricas das 3 equipes
- ✅ Sistema de pontuação automático:
  - +1 ponto por proposta apresentada
  - +5 pontos por proposta adquirida
  - +30 pontos bônus ao bater 100% da meta
- ✅ Ranking automático baseado em pontos e taxa de conversão
- ✅ Atualização automática a cada 30 segundos
- ✅ Design responsivo e moderno
- ✅ Tema natalino com animações

## 📝 Atualização de Dados

Os dados podem ser atualizados diretamente no banco de dados PostgreSQL. O dashboard atualiza automaticamente a cada 30 segundos.

## 🚀 Deploy

Para fazer deploy em produção:

```bash
npm run build
npm start
```

## 🔒 Segurança

⚠️ **Importante**: As credenciais do banco de dados estão hardcoded no código. Para produção, recomenda-se usar variáveis de ambiente:

```env
DB_HOST=bdunicoprecs.c50cwuocuwro.sa-east-1.rds.amazonaws.com
DB_PORT=5432
DB_NAME=dashmetas
DB_USER=postgres
DB_PASSWORD=$P^iFe27^YP5cpBU3J&tqa
```

E atualizar `lib/db.ts` para usar essas variáveis.
