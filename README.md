# FCDA

Site oficial da Federação Cearense de Desportos Aquáticos, com conteúdo público, transparência, calendário esportivo e painel administrativo.

Produção: [fcda.org.br](https://fcda.org.br)

## Visão geral

O projeto reúne:

- Notícias, eventos, modalidades, clubes e cursos.
- Rankings e recordes cearenses.
- Portal da Transparência com documentos e relação oficial de atletas.
- Formulários de contato, filiação e newsletter.
- Painel administrativo protegido por Supabase Auth e roles.
- Busca global com `Cmd+K` ou `Ctrl+K`.
- Exportação de dados em CSV e Excel (`.xlsx`).
- Sitemap, `robots.txt`, Schema.org e metadados sociais.
- PWA instalável com manifest, service worker e prompt de instalação.

## Stack

- React 19 e TypeScript
- TanStack Start, Router e Query
- Vite com SSR
- Tailwind CSS 4, Radix UI, shadcn/ui e Lucide
- Supabase: Database, Auth, Storage e Row Level Security
- Cloudflare Workers
- XLSX para exportação de planilhas

## Requisitos

- Node.js 18 ou superior, ou Bun
- Conta e projeto no Supabase
- Docker, caso queira usar o banco local do Supabase
- Wrangler autenticado para deploy

## Configuração local

Instale as dependências:

```bash
npm install
# ou
bun install
```

Crie um arquivo `.env.local` com as variáveis públicas do projeto:

```env
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=sua-chave-publica
VITE_SUPABASE_PROJECT_ID=seu-project-id
```

Para operações administrativas no servidor, configure `SUPABASE_SERVICE_ROLE_KEY` em `.dev.vars` localmente ou como secret no Cloudflare. Nunca coloque essa chave no Git, no frontend ou no README.

## Comandos

```bash
npm run dev              # servidor Vite
npm run dev:proxy       # proxy local do ranking/transparência
npm run dev:all         # Vite + proxy
npm run typecheck       # verificação TypeScript
npm run lint            # ESLint
npm run format:check    # validação Prettier
npm run check           # format, lint, tipos e build
npm run build           # gera sitemap e build de produção
npm run preview         # preview do build
npm run deploy          # build e deploy no Cloudflare
```

O comando `build` executa `generate:sitemap` antes da compilação. O sitemap usa `SITE_URL` quando definida e consulta notícias e eventos publicados usando as variáveis públicas do Supabase.

## Banco de dados

As migrations ficam em [`supabase/migrations`](supabase/migrations) e devem ser aplicadas em ordem cronológica.

Para aplicar no projeto remoto:

```bash
npx supabase login
npx supabase link --project-ref seu-project-id
npx supabase db push
```

Para usar o banco local, inicie o Supabase antes do lint:

```bash
npx supabase start
npx supabase db reset
npx supabase db lint --local
```

O schema cobre autenticação e perfis, modalidades, categorias, notícias, eventos, PDFs, transparência, rankings, recordes, cursos, parceiros, clubes, filiação, newsletter, auditoria administrativa e preferências de tema.

### Segurança

- RLS está habilitado nas tabelas públicas e administrativas.
- Visitantes podem consultar apenas conteúdo publicado/ativo.
- Admins e editores gerenciam o conteúdo autorizado.
- A service role key deve existir somente no servidor ou nos secrets do ambiente de deploy.
- O bucket `site-images` é usado para imagens e documentos públicos do site.

## Estrutura

```text
src/
├── components/       # Layout, site, painel admin e UI reutilizável
├── integrations/     # Cliente e integração Supabase
├── lib/              # Queries, autenticação, exportação e utilitários
├── routes/           # Rotas públicas e rotas autenticadas do admin
├── router.tsx        # Configuração do roteador
├── server.ts         # Wrapper SSR e tratamento de erros
└── start.ts          # Inicialização TanStack Start
public/
├── manifest.json     # Metadados da PWA
├── sw.js             # Service worker
├── sitemap.xml       # Fallback gerado no build
└── robots.txt        # Diretivas para buscadores
supabase/migrations/  # Evolução do schema e políticas RLS
scripts/              # Importações e geração do sitemap
```

## Deploy

Configure no Cloudflare Workers:

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_PUBLISHABLE_KEY`
- `VITE_SUPABASE_PROJECT_ID`
- `SUPABASE_SERVICE_ROLE_KEY` como secret, quando necessário

Depois execute:

```bash
npm run deploy
```

O arquivo `wrangler.jsonc` define a configuração do Worker. Consulte [`DEPLOYMENT.md`](DEPLOYMENT.md) para detalhes específicos do ambiente.

O plano de migração tecnológica prevista para 2027 está em [`docs/MIGRACAO_NEXTJS_2027.md`](docs/MIGRACAO_NEXTJS_2027.md). A migração não está em execução; o documento serve como referência para inventário, spike e decisão técnica.

## Scripts de dados

```bash
npm run generate:sitemap
npm run import:clubes
npm run import:atletas
```

Os scripts de importação podem exigir `SUPABASE_SERVICE_ROLE_KEY` e arquivos de entrada locais. Verifique os caminhos e permissões antes de executar.

## Troubleshooting

### A aplicação não carrega dados

Confirme `VITE_SUPABASE_URL` e `VITE_SUPABASE_PUBLISHABLE_KEY`, além das policies RLS aplicadas no Supabase.

### O painel retorna acesso negado

Confirme se o usuário possui uma entrada em `user_roles` com `admin` ou `editor` e se o trigger de criação de usuário está ativo.

### O proxy não responde

Execute `npm run dev:proxy` em um terminal separado ou use `npm run dev:all`. O proxy local usa a porta `3001`.

### O lint do banco não conecta

`npx supabase db lint --local` exige que o Supabase local esteja iniciado com `npx supabase start`. Para validar o projeto remoto, use o dashboard ou o fluxo de migrations do ambiente de CI/deploy.

## Licença e contato

Projeto institucional da Federação Cearense de Desportos Aquáticos.

Contato: [secretaria@fcda.org.br](mailto:secretaria@fcda.org.br)
