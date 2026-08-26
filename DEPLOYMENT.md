# Configuração de Variáveis de Ambiente - FCDA

## Visão Geral

Este projeto usa o Supabase como backend e precisa de credenciais para funcionar corretamente. As variáveis estão configuradas de forma segura, separando chaves públicas de privadas.

## Variáveis Públicas (já configuradas)

Estas variáveis estão nos arquivos `.env` e `wrangler.toml` e são seguras para commit:

- `SUPABASE_URL`: URL do projeto Supabase
- `SUPABASE_PUBLISHABLE_KEY`: Chave pública do Supabase
- `SUPABASE_ANON_KEY`: Chave anônima do Supabase (acesso público limitado)
- `VITE_SUPABASE_*`: Variáveis para o frontend (Vite)

## Variáveis Privadas (configuração manual necessária)

### `SUPABASE_SERVICE_ROLE_KEY`

Esta chave possui permissões elevadas (bypass RLS) e **NUNCA** deve ser commitada no git.

#### Configuração Local (Desenvolvimento)

**CRIE MANUALMENTE** o arquivo `.dev.vars` na raiz do projeto com este conteúdo:

```bash
# .dev.vars
SUPABASE_SERVICE_ROLE_KEY=cole-sua-chave-secreta-aqui
```

**Como criar o arquivo manualmente:**
```bash
# Na raiz do projeto, execute:
echo 'SUPABASE_SERVICE_ROLE_KEY=cole-sua-chave-secreta-aqui' > .dev.vars
```

O arquivo `.dev.vars` já está no `.gitignore`, então não será commitado.

#### Configuração Cloudflare Workers (Produção)

**IMPORTANTE**: Para deployments em produção, a chave `SERVICE_ROLE_KEY` deve ser configurada como **secreta** no Cloudflare:

1. Faça login no [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. Vá para: Workers & Pages → Seu projeto → Settings → Environment Variables
3. Adicione a variável:
   - Nome: `SUPABASE_SERVICE_ROLE_KEY`
   - Valor: configure uma nova chave secreta diretamente no Cloudflare
   - Marque como "Encrypted" (secreta)

## Segurança

### ✅ Práticas Seguras Implementadas

1. **Separação de chaves**: Chaves públicas no git, privadas fora
2. **.gitignore configurado**: Arquivos sensíveis não são commitados
3. **wrangler.toml**: Contém apenas variáveis públicas
4. **.dev.vars**: Para desenvolvimento local (já no .gitignore)
5. **Variáveis de ambiente**: Usadas no Cloudflare para secrets

### ⚠️ NUNCA Commitar

- Chaves `SERVICE_ROLE_KEY` ou secretas
- Arquivos `.dev.vars` ou `.env.local`
- Qualquer chave que comece com `sb_secret_`

## Verificação

Para verificar se as variáveis estão configuradas corretamente:

```bash
# Ver variáveis de ambiente locais
echo $SUPABASE_URL
echo $SUPABASE_SERVICE_ROLE_KEY

# Verificar arquivo .env (apenas públicas)
cat .env

# Verificar wrangler.toml (apenas públicas)
cat wrangler.toml
```

## Deploy
SUPABASE_SERVICE_ROLE_KEY=cole-sua-chave-secreta-aqui
Para fazer deploy no Cloudflare:

```bash
npm run deploy
```

O comando `deploy` usará automaticamente:
- Variáveis públicas do `wrangler.toml`
   - Valor: configure uma nova chave secreta diretamente no Cloudflare

## Troubleshooting

### Erro: "SUPABASE_SERVICE_ROLE_KEY not found"

**Solução**: Configure a variável no `.dev.vars` (local) ou no Cloudflare Dashboard (produção).

### Erro: "Permission denied" no Supabase

**Solução**: Verifique se está usando a chave correta:
- Use `ANON_KEY` para operações públicas
- Use `SERVICE_ROLE_KEY` apenas no servidor para operações admin

### Chave expirou

As chaves Supabase têm data de expiração. Se receber erro de chave expirada:
1. Gere novas chaves no [Supabase Dashboard](https://supabase.com/dashboard)
2. Atualize os arquivos correspondentes
3. Faça deploy novamente