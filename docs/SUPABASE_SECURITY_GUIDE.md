# 🔒 Guia de Configuração Segura do Supabase

## ⚠️ Problema de Segurança Identificado

As chaves do Supabase estão atualmente no arquivo `.env`, que pode ser commitado no repositório Git. Isso expõe suas chaves publicamente.

## ✅ Solução Recomendada

### 1. Mover Chaves para `.env.local`

O arquivo `.env.local` é automaticamente ignorado pelo Git (devido à regra `*.local` no `.gitignore`), tornando-o seguro para chaves sensíveis.

**Passos manuais (necessário devido a restrições de segurança):**

1. **Remova as chaves do `.env`**:
   ```bash
   # Edite o arquivo .env e deixe apenas comentários ou remova as linhas com chaves
   ```

2. **Crie/edite `.env.local`** com suas chaves:
   ```bash
   # .env.local (NÃO commitar no Git)
   SUPABASE_URL=https://ucesipxemhrugmqwxtei.supabase.co
   SUPABASE_PUBLISHABLE_KEY=sb_publishable_Sf19DBS7HhDQRi4h1pxXWQ_pd-rjTSr
   SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVjZXNpcHhlbWhydWdtcXd4dGVpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODAzNjAwOTAsImV4cCI6MjA5NTkzNjA5MH0.h4_gP9fH7RCmRLUmAOgcrzpKyyQWGMbxuIAjKwFfX_o
   
   VITE_SUPABASE_URL=https://ucesipxemhrugmqwxtei.supabase.co
   VITE_SUPABASE_PUBLISHABLE_KEY=sb_publishable_Sf19DBS7HhDQRi4h1pxXWQ_pd-rjTSr
   VITE_SUPABASE_PROJECT_ID=ucesipxemhrugmqwxtei
   ```

### 2. Atualizar `.gitignore`

O `.gitignore` já foi atualizado para incluir:
```
# Environment variables
.env
.env.local
.env.*.local
```

### 3. Verificar Chaves Expostas

```bash
# Verificar se há chaves no histórico do Git
git log --all --full-history --source -- "*.env" "*.env.local"

# Se encontrar chaves expostas, considere:
# 1. Revogar as chaves no painel do Supabase
# 2. Gerar novas chaves
# 3. Usar git-filter-repo ou BFG para remover do histórico
```

## 🔐 Boas Práticas de Segurança

### Chaves Públicas vs Privadas

**Chaves Públicas (podem ficar no .env):**
- `SUPABASE_URL` - URL do projeto
- `SUPABASE_PUBLISHABLE_KEY` - Chave pública/anon
- `VITE_SUPABASE_*` - Variáveis do Vite

**Chaves Privadas (devem ficar no .env.local):**
- `SUPABASE_SERVICE_ROLE_KEY` - Chave de serviço com permissões completas
- `SUPABASE_ANON_KEY` - Chave anônima (embora seja pública, é melhor proteger)

### Para Produção (Cloudflare Workers)

Use secrets do Cloudflare Workers em vez de variáveis de ambiente:

```bash
# Adicionar secrets ao Cloudflare
npx wrangler secret put SUPABASE_URL
npx wrangler secret put SUPABASE_PUBLISHABLE_KEY
npx wrangler secret put SUPABASE_SERVICE_ROLE_KEY
```

### Para Desenvolvimento Local

Use `.env.local` para todas as chaves sensíveis.

## 🚀 Configuração de Autenticação

Com as chaves configuradas, o sistema de autenticação do Supabase já está integrado no projeto:

### Estrutura Existente

- **`src/integrations/supabase/client.ts`** - Cliente Supabase configurado
- **`src/lib/auth.tsx`** - Contexto de autenticação
- **`src/lib/use-auth.ts`** - Hook para autenticação
- **`src/routes/_authenticated/`** - Rotas protegidas

### Funcionalidades Disponíveis

1. **Login/Registro**: Sistema completo de autenticação
2. **Proteção de Rotas**: Rotas admin já protegidas
3. **Gerenciamento de Sessão**: Auto-refresh de tokens
4. **SSR**: Suporte para server-side rendering

## 🔍 Verificação de Segurança

### Checklist de Segurança

- [ ] Chaves movidas de `.env` para `.env.local`
- [ ] `.env.local` no `.gitignore`
- [ ] Nenhuma chave sensível no histórico do Git
- [ ] Chaves de serviço não expostas no frontend
- [ ] RLS (Row Level Security) configurado no Supabase
- [ ] Secrets do Cloudflare configurados para produção

### Testar Configuração

```bash
# Verificar se as variáveis estão carregadas
npm run dev

# No console do navegador:
console.log(import.meta.env.VITE_SUPABASE_URL)
console.log(import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY)
```

## 📝 Resumo das Ações Necessárias

1. **Imediato**: Mover chaves do `.env` para `.env.local`
2. **Verificação**: Revogar chaves se estiverem expostas no Git
3. **Produção**: Configurar secrets do Cloudflare Workers
4. **Monitoramento**: Ativar alertas de segurança no Supabase

## 🆘 Suporte

Se precisar revogar chaves no Supabase:
1. Acesse: https://supabase.com/dashboard
2. Selecione seu projeto
3. Settings → API
4. Role as chaves (regenerate keys)
5. Atualize os arquivos de ambiente

## ⚠️ Importante

- **Nunca** commit chaves privadas no repositório
- **Sempre** use `.env.local` para desenvolvimento
- **Use** secrets do Cloudflare para produção
- **Revogue** chaves se houver exposição acidental