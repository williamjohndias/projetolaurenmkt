# 🔍 Guia de Diagnóstico de Problemas

## Problema: Erro ao carregar dados

Siga estes passos para diagnosticar e resolver o problema:

### 1. Testar Conexão com o Banco

Acesse: `http://localhost:3000/api/test-connection`

Isso mostrará:
- ✅ Se a conexão com o RDS está funcionando
- ✅ Se o banco de dados existe
- ✅ Se a tabela `dashmetas` existe
- ✅ Quantos registros existem na tabela

### 2. Verificar Logs do Servidor

No terminal onde está rodando `npm run dev`, verifique as mensagens de log:
- `Tentando conectar ao banco de dados...`
- `Conexão estabelecida com sucesso`
- `Dados encontrados: X equipes`

Se houver erros, eles aparecerão aqui com detalhes.

### 3. Problemas Comuns e Soluções

#### ❌ Erro: "ECONNREFUSED" ou "ETIMEDOUT"
**Causa:** O servidor RDS não está acessível ou o firewall está bloqueando.

**Solução:**
1. Verifique o Security Group do RDS na AWS
2. Adicione uma regra permitindo conexões na porta 5432 do seu IP
3. Verifique se o RDS está em estado "available"

#### ❌ Erro: "ENOTFOUND"
**Causa:** O hostname do RDS está incorreto.

**Solução:**
1. Verifique o endpoint do RDS no console AWS
2. Confirme que está usando: `bdunicoprecs.c50cwuocuwro.sa-east-1.rds.amazonaws.com`

#### ❌ Erro: "password authentication failed"
**Causa:** Usuário ou senha incorretos.

**Solução:**
1. Verifique as credenciais no arquivo `lib/db.ts`
2. Confirme o usuário é `postgres`
3. Confirme a senha está correta (incluindo caracteres especiais)

#### ❌ Erro: "database does not exist"
**Causa:** O banco de dados `dashmetas` não foi criado.

**Solução:**
```sql
CREATE DATABASE dashmetas;
```

#### ❌ Erro: "Tabela dashmetas não encontrada"
**Causa:** A tabela não existe no banco.

**Solução:**
Execute o script `database-setup.sql`:
```bash
psql -h bdunicoprecs.c50cwuocuwro.sa-east-1.rds.amazonaws.com -U postgres -d dashmetas -f database-setup.sql
```

### 4. Testar Conexão Manualmente

Você pode testar a conexão diretamente usando `psql`:

```bash
psql -h bdunicoprecs.c50cwuocuwro.sa-east-1.rds.amazonaws.com -U postgres -d dashmetas -p 5432
```

Se conseguir conectar, o problema está no código. Se não conseguir, o problema está na infraestrutura/firewall.

### 5. Verificar Dados na Tabela

Uma vez conectado, verifique se há dados:

```sql
SELECT * FROM dashmetas;
```

Se não houver dados, insira dados de teste:

```sql
UPDATE dashmetas 
SET 
  propostas_apresentadas = 10,
  propostas_adquiridas = 3,
  meta_mes = 100000,
  meta_atual = 45000
WHERE equipe = 'Caroline';
```

### 6. Verificar Variáveis de Ambiente (Opcional)

Se quiser usar variáveis de ambiente ao invés de hardcode, crie um arquivo `.env.local`:

```env
DB_HOST=bdunicoprecs.c50cwuocuwro.sa-east-1.rds.amazonaws.com
DB_PORT=5432
DB_NAME=dashmetas
DB_USER=postgres
DB_PASSWORD=$P^iFe27^YP5cpBU3J&tqa
```

E atualize `lib/db.ts` para usar essas variáveis.

### 7. Contato para Suporte

Se nenhuma das soluções acima funcionar, verifique:
- Console do AWS RDS para ver status do banco
- Logs de eventos do RDS
- Security Groups e regras de firewall
