# GitHub Actions Workflows

Este projeto possui duas workflows principais:

## CI Workflow (`.github/workflows/ci.yml`)

Executa em todo push e pull request para branches `main` e `develop`:

1. **Lint & Type Check**: Executa ESLint, Prettier e TypeScript check
2. **Unit Tests**: Executa testes unitários com Vitest
3. **Build**: Build do projeto para produção
4. **E2E Tests**: Executa testes end-to-end com Playwright

## Deploy Workflow (`.github/workflows/deploy.yml`)

Executa automaticamente em push para branch `main`:

1. Executa type check e build
2. Deploy para Cloudflare Workers

## Configuração de Secrets

Para que o deploy funcione, configure os seguintes secrets no repositório GitHub:

### Cloudflare Workers Secrets

- `CLOUDFLARE_API_TOKEN`: Token de API do Cloudflare
  - Obtido em: https://dash.cloudflare.com/profile/api-tokens
  - Permissões necessárias: `Account > Cloudflare Workers > Edit`
  
- `CLOUDFLARE_ACCOUNT_ID`: ID da conta Cloudflare
  - Encontrado na URL do dashboard ou em: https://dash.cloudflare.com/

### Como configurar secrets:

1. Vá para: Settings > Secrets and variables > Actions
2. Clique em "New repository secret"
3. Adicione cada secret com o nome e valor correspondente

## Deploy Manual

Para deploy manual:

1. Vá para a aba "Actions" no repositório
2. Selecione o workflow "Deploy"
3. Clique em "Run workflow"
4. Selecione a branch e clique em "Run workflow"
