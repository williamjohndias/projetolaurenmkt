# 🚀 Guia de Instalação Rápida

## Passo 1: Instalar Dependências

```bash
npm install
```

## Passo 2: Configurar Banco de Dados

Execute o script SQL `database-setup.sql` no seu banco de dados PostgreSQL para criar a tabela e inserir as equipes iniciais.

Você pode usar o psql ou qualquer cliente PostgreSQL:

```bash
psql -h bdunicoprecs.c50cwuocuwro.sa-east-1.rds.amazonaws.com -U postgres -d dashmetas -f database-setup.sql
```

Ou copie e cole o conteúdo do arquivo `database-setup.sql` no seu cliente SQL favorito.

## Passo 3: Iniciar o Servidor

```bash
npm run dev
```

## Passo 4: Acessar o Dashboard

Abra seu navegador em: `http://localhost:3000`

## 📝 Atualizando Dados

Para atualizar os dados das equipes, você pode fazer UPDATE direto no banco:

```sql
UPDATE dashmetas 
SET 
  propostas_apresentadas = 15,
  propostas_adquiridas = 5,
  meta_atual = 75000,
  updated_at = CURRENT_TIMESTAMP
WHERE equipe = 'Caroline';
```

O dashboard atualiza automaticamente a cada 30 segundos.

## 🔧 Troubleshooting

### Erro de conexão com o banco
- Verifique se as credenciais estão corretas
- Verifique se o RDS permite conexões do seu IP
- Verifique se a porta 5432 está acessível

### Erro "tabela não existe"
- Execute o script `database-setup.sql` primeiro

### Dados não aparecem
- Verifique se os nomes das equipes no banco são exatamente: "Caroline", "Ana", "Caio"
- Verifique se há dados na tabela com `SELECT * FROM dashmetas;`
