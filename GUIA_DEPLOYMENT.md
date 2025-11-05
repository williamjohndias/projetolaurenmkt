# 📚 Guia Completo de Deployment - Rumo ao Natal Campeão

## Guia para Iniciantes: Como Fazer Deploy do Dashboard no Vercel

---

## 📋 Sumário

1. [Introdução](#introdução)
2. [Pré-requisitos](#pré-requisitos)
3. [Preparação do Projeto](#preparação-do-projeto)
4. [Configuração no GitHub](#configuração-no-github)
5. [Deploy no Vercel](#deploy-no-vercel)
6. [Configuração de Variáveis de Ambiente](#configuração-de-variáveis-de-ambiente)
7. [Testando o Deploy](#testando-o-deploy)
8. [Troubleshooting](#troubleshooting)
9. [FAQ](#faq)

---

## 📖 Introdução

Este guia vai te ajudar passo a passo a fazer o deploy do dashboard "Rumo ao Natal Campeão" na plataforma Vercel. O Vercel é uma plataforma gratuita e fácil de usar que permite fazer deploy de aplicações Next.js em minutos.

### O que você vai aprender:

- Como preparar seu projeto para deployment
- Como conectar seu código ao GitHub
- Como fazer deploy no Vercel
- Como configurar variáveis de ambiente
- Como resolver problemas comuns

---

## ✅ Pré-requisitos

Antes de começar, você precisa ter:

1. **Conta no GitHub** (gratuita)
   - Acesse: https://github.com
   - Crie uma conta se não tiver

2. **Conta no Vercel** (gratuita)
   - Acesse: https://vercel.com
   - Você pode criar com sua conta GitHub

3. **Node.js instalado** (versão 18 ou superior)
   - Download: https://nodejs.org
   - Verifique a instalação: `node --version`

4. **Git instalado**
   - Windows: https://git-scm.com/download/win
   - Mac: Já vem instalado
   - Linux: `sudo apt install git`

5. **Acesso ao banco de dados PostgreSQL**
   - Você precisa das credenciais do banco de dados RDS

---

## 🔧 Preparação do Projeto

### Passo 1: Verificar se o projeto está completo

Certifique-se de que você tem todos os arquivos necessários:

```
projetolaurenmkt/
├── app/
├── lib/
├── package.json
├── next.config.js
├── tsconfig.json
└── README.md
```

### Passo 2: Instalar dependências

Abra o terminal na pasta do projeto e execute:

```bash
npm install
```

Isso vai instalar todas as dependências necessárias (Next.js, React, PostgreSQL, etc.)

### Passo 3: Testar localmente

Antes de fazer deploy, teste se o projeto funciona localmente:

```bash
npm run dev
```

Acesse `http://localhost:3000` no navegador. Se tudo estiver funcionando, você pode prosseguir.

---

## 🔗 Configuração no GitHub

### Passo 1: Criar um repositório no GitHub

1. Acesse https://github.com e faça login
2. Clique no botão **"+"** no canto superior direito
3. Selecione **"New repository"**
4. Preencha:
   - **Repository name**: `projetolaurenmkt` (ou o nome que preferir)
   - **Description**: "Dashboard Rumo ao Natal Campeão"
   - **Visibilidade**: Público ou Privado (sua escolha)
5. **NÃO** marque "Initialize with README" (já temos um)
6. Clique em **"Create repository"**

### Passo 2: Inicializar Git no projeto (se ainda não foi feito)

No terminal, na pasta do projeto:

```bash
# Inicializar Git (se ainda não foi feito)
git init

# Adicionar todos os arquivos
git add .

# Fazer o primeiro commit
git commit -m "Initial commit - Dashboard Rumo ao Natal Campeão"
```

### Passo 3: Conectar ao GitHub

```bash
# Adicionar o repositório remoto (substitua SEU_USUARIO pelo seu usuário do GitHub)
git remote add origin https://github.com/SEU_USUARIO/projetolaurenmkt.git

# Enviar o código para o GitHub
git branch -M main
git push -u origin main
```

**Nota**: Se pedir usuário e senha, você pode precisar criar um **Personal Access Token** no GitHub:
1. Vá em Settings → Developer settings → Personal access tokens
2. Gere um novo token com permissões de repositório
3. Use o token como senha

---

## 🚀 Deploy no Vercel

### Passo 1: Criar conta no Vercel

1. Acesse https://vercel.com
2. Clique em **"Sign Up"**
3. Selecione **"Continue with GitHub"**
4. Autorize o Vercel a acessar sua conta GitHub

### Passo 2: Importar o projeto

1. No dashboard do Vercel, clique em **"Add New..."**
2. Selecione **"Project"**
3. Clique em **"Import Git Repository"**
4. Selecione seu repositório `projetolaurenmkt`
5. Clique em **"Import"**

### Passo 3: Configurar o projeto

O Vercel vai detectar automaticamente que é um projeto Next.js. Você verá:

- **Framework Preset**: Next.js (já selecionado)
- **Root Directory**: `./` (deixe como está)
- **Build Command**: `npm run build` (já preenchido)
- **Output Directory**: `.next` (já preenchido)

**IMPORTANTE**: Não clique em "Deploy" ainda! Primeiro precisamos configurar as variáveis de ambiente.

---

## 🔐 Configuração de Variáveis de Ambiente

### Por que isso é importante?

As variáveis de ambiente armazenam informações sensíveis (como senhas do banco de dados) de forma segura, sem expor no código.

### Passo 1: Adicionar variáveis no Vercel

Antes de fazer o deploy, configure as variáveis de ambiente:

1. Na página de configuração do projeto no Vercel, role até a seção **"Environment Variables"**
2. Adicione as seguintes variáveis (uma por uma):

| Nome | Valor | Descrição |
|------|-------|-----------|
| `DB_HOST` | `bdunicoprecs.c50cwuocuwro.sa-east-1.rds.amazonaws.com` | Endereço do banco de dados |
| `DB_PORT` | `5432` | Porta do PostgreSQL |
| `DB_NAME` | `dashmetas` | Nome do banco de dados |
| `DB_USER` | `postgres` | Usuário do banco |
| `DB_PASSWORD` | `$P^iFe27^YP5cpBU3J&tqa` | Senha do banco (⚠️ mantenha segredo!) |

**Como adicionar cada variável:**
1. Clique em **"Add"** ou **"Add Another"**
2. Digite o **Name** (ex: `DB_HOST`)
3. Digite o **Value** (ex: `bdunicoprecs.c50cwuocuwro.sa-east-1.rds.amazonaws.com`)
4. Marque **"Production"**, **"Preview"** e **"Development"** (ou pelo menos Production)
5. Clique em **"Add"**

### Passo 2: Verificar se o código usa as variáveis

O arquivo `lib/db.ts` já deve estar configurado para usar variáveis de ambiente. Verifique se está assim:

```typescript
const pool = new Pool({
  host: process.env.DB_HOST || 'bdunicoprecs.c50cwuocuwro.sa-east-1.rds.amazonaws.com',
  port: parseInt(process.env.DB_PORT || '5432', 10),
  database: process.env.DB_NAME || 'dashmetas',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || '$P^iFe27^YP5cpBU3J&tqa',
  // ... resto do código
});
```

---

## 🎯 Fazendo o Deploy

### Passo 1: Iniciar o deploy

1. Após configurar todas as variáveis de ambiente, clique em **"Deploy"**
2. O Vercel vai começar a construir seu projeto
3. Você verá o progresso em tempo real

### Passo 2: Aguardar o build

O processo pode levar 2-5 minutos. Você verá:

- ✅ **Installing dependencies** - Instalando pacotes npm
- ✅ **Building** - Compilando o projeto Next.js
- ✅ **Deploying** - Publicando na internet

### Passo 3: Deploy concluído!

Quando terminar, você verá:

- ✅ **"Congratulations! Your project has been deployed."**
- Um link do tipo: `https://projetolaurenmkt.vercel.app`

---

## 🧪 Testando o Deploy

### Passo 1: Acessar o site

1. Clique no link fornecido pelo Vercel
2. Ou acesse: `https://seu-projeto.vercel.app`

### Passo 2: Verificar se está funcionando

- ✅ A página carrega?
- ✅ O dashboard mostra as equipes?
- ✅ Os dados aparecem corretamente?

### Passo 3: Verificar logs (se houver problemas)

1. No dashboard do Vercel, vá em **"Deployments"**
2. Clique no deploy mais recente
3. Clique em **"Functions"** ou **"Logs"** para ver erros

---

## 🔧 Troubleshooting (Resolução de Problemas)

### Problema 1: "Build failed"

**Solução:**
- Verifique os logs de build no Vercel
- Certifique-se de que todas as dependências estão no `package.json`
- Verifique se não há erros de TypeScript: `npm run build` localmente

### Problema 2: "Cannot connect to database"

**Solução:**
- Verifique se as variáveis de ambiente estão configuradas corretamente
- Certifique-se de que o Security Group do RDS permite conexões do Vercel
- Verifique se o banco de dados está acessível publicamente

### Problema 3: "Page not found" ou "404"

**Solução:**
- Verifique se o `next.config.js` está configurado corretamente
- Certifique-se de que todas as rotas estão na pasta `app/`

### Problema 4: "Environment variable not found"

**Solução:**
- Verifique se você adicionou todas as variáveis no Vercel
- Certifique-se de que marcou "Production" ao adicionar as variáveis
- Faça um novo deploy após adicionar variáveis

### Problema 5: Site muito lento

**Solução:**
- O Vercel pode estar fazendo cold start (primeira requisição)
- Aguarde alguns segundos e recarregue
- Se persistir, verifique o tamanho do bundle

---

## 📝 FAQ (Perguntas Frequentes)

### P: O Vercel é gratuito?

**R:** Sim! O plano gratuito do Vercel oferece:
- Deploys ilimitados
- 100GB de bandwidth por mês
- SSL automático
- Domínios personalizados

### P: Posso usar meu próprio domínio?

**R:** Sim! No Vercel:
1. Vá em **Settings** → **Domains**
2. Adicione seu domínio
3. Configure os DNS conforme as instruções

### P: Como atualizar o site após fazer mudanças?

**R:** É automático! Quando você fizer push no GitHub:
1. O Vercel detecta automaticamente
2. Faz um novo build
3. Faz deploy da nova versão

### P: Onde ficam os logs de erro?

**R:** 
- No dashboard do Vercel, vá em **Deployments**
- Clique no deploy
- Veja **"Functions"** ou **"Logs"**

### P: Posso fazer rollback para uma versão anterior?

**R:** Sim! No Vercel:
1. Vá em **Deployments**
2. Encontre o deploy anterior
3. Clique nos três pontos (**...**)
4. Selecione **"Promote to Production"**

### P: Como proteger o acesso ao dashboard?

**R:** Você pode:
- Adicionar autenticação (NextAuth.js)
- Usar Vercel Password Protection (planos pagos)
- Restringir por IP no backend

---

## 🎉 Próximos Passos

Após fazer o deploy com sucesso:

1. ✅ **Teste todas as funcionalidades**
   - Dashboard principal
   - Ranking de pontos
   - Gerenciamento de vendas

2. ✅ **Configure um domínio personalizado** (opcional)
   - Adicione seu domínio no Vercel
   - Configure DNS

3. ✅ **Monitore o desempenho**
   - Use o Analytics do Vercel
   - Monitore os logs

4. ✅ **Configure backups** (recomendado)
   - Faça backup do banco de dados regularmente
   - Mantenha o código no GitHub

---

## 📞 Suporte

Se você encontrar problemas:

1. **Documentação oficial:**
   - Vercel: https://vercel.com/docs
   - Next.js: https://nextjs.org/docs

2. **Comunidade:**
   - Vercel Discord
   - Stack Overflow

3. **Verifique os logs:**
   - Sempre a primeira coisa a fazer
   - Muitos erros são auto-explicativos

---

## ✅ Checklist Final

Antes de considerar o deploy completo, verifique:

- [ ] Todas as variáveis de ambiente estão configuradas
- [ ] O build local funciona (`npm run build`)
- [ ] O projeto está no GitHub
- [ ] O deploy no Vercel foi bem-sucedido
- [ ] O site está acessível e funcionando
- [ ] As conexões com o banco de dados estão funcionando
- [ ] Todas as páginas carregam corretamente

---

## 🎊 Parabéns!

Você fez o deploy do dashboard "Rumo ao Natal Campeão" com sucesso! 🎉

Agora seu dashboard está online e acessível para toda a equipe.

---

**Versão do Guia:** 1.0  
**Última atualização:** Novembro 2024  
**Projeto:** Rumo ao Natal Campeão - Dashboard

---

## 📄 Licença

Este guia foi criado especificamente para o projeto "Rumo ao Natal Campeão".

---

**Fim do Guia**

