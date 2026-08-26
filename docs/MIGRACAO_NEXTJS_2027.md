# Plano de Migração para Next.js — 2027

## Status

- **Status:** planejado
- **Janela prevista:** 2027
- **Origem:** TanStack Start + Vite
- **Destino proposto:** Next.js + React + TypeScript
- **Estratégia:** spike técnico seguido de migração incremental
- **Banco e backend:** Supabase preservado

Este documento orienta uma futura migração tecnológica. Ele não autoriza a substituição imediata da aplicação atual.

## Objetivos

- Reduzir a complexidade de roteamento e SSR.
- Padronizar a estrutura de páginas, layouts e carregamento de dados.
- Facilitar a entrada de novos desenvolvedores no projeto.
- Preservar segurança, SEO, performance e comportamento do painel administrativo.
- Manter o Supabase como fonte de dados, autenticação, Storage e camada de RLS.

## Fora do escopo inicial

- Reescrever o banco de dados.
- Alterar policies RLS sem justificativa e revisão de segurança.
- Migrar para outro provedor de backend.
- Refatorar regras de negócio sem cobertura de testes.
- Remover o TanStack antes da paridade funcional da nova aplicação.

## Arquitetura atual

```text
React 19
└── TanStack Start
    ├── TanStack Router
    ├── TanStack Query
    ├── Vite + SSR
    └── Cloudflare Workers

Supabase
├── Database + RLS
├── Auth
└── Storage
```

## Arquitetura alvo

```text
React
└── Next.js App Router
    ├── Server Components para páginas públicas
    ├── Client Components para interações
    ├── Route Handlers para endpoints necessários
    ├── Metadata API para SEO
    └── Middleware apenas para casos de autenticação/roteamento

Supabase
├── Database + RLS
├── Auth
└── Storage
```

A hospedagem final deve ser decidida durante o spike. Next.js precisa ser validado no ambiente Cloudflare atual; caso existam limitações relevantes, devem ser comparados Cloudflare Workers, Cloudflare Pages e uma hospedagem Node compatível.

## Regras de migração

1. O banco Supabase continua sendo o contrato principal.
2. Nenhuma chave `service_role` pode chegar ao bundle do navegador.
3. RLS permanece obrigatória mesmo quando existirem guards no frontend.
4. Cada rota migrada precisa ter paridade funcional e visual verificável.
5. Toda etapa deve ser reversível por deploy.
6. Alterações de framework não devem ser misturadas com mudanças de produto sem necessidade.
7. Migrations SQL existentes devem permanecer imutáveis; novas mudanças usam novas migrations.

## Fase 0 — Inventário e baseline

**Resultado esperado:** mapa confiável da aplicação atual.

- Catalogar rotas públicas e autenticadas.
- Catalogar queries, mutations, uploads e integrações externas.
- Registrar roles: `admin`, `editor`, `atleta`, `treinador` e `gestor_clube`.
- Identificar componentes compartilhados e dependências TanStack.
- Criar baseline de Lighthouse, Web Vitals e tamanho dos bundles.
- Registrar os fluxos críticos de negócio.

Fluxos mínimos:

- Login e recuperação de senha.
- Consulta de notícias e eventos.
- Consulta de transparência e atletas.
- Envio de contato e filiação.
- CRUD administrativo.
- Upload de documentos e imagens.
- Auditoria e permissões.
- Exportação CSV/XLSX.

## Fase 1 — Spike técnico

**Duração sugerida:** 3 a 5 dias.

Criar uma aplicação Next.js isolada, sem alterar o runtime atual, com:

- Next.js App Router.
- TypeScript strict.
- Supabase Auth e sessão no servidor.
- Uma página pública de notícias.
- Um layout com Header e Footer.
- Uma tela CRUD administrativa simples.
- Formulário com React Hook Form e Zod.
- Metadata, sitemap e robots.
- Build e deploy de teste.

Critérios para continuar:

- SSR funcionando no ambiente escolhido.
- Sessão Supabase consistente entre servidor e navegador.
- RLS funcionando sem credenciais privilegiadas no cliente.
- Build previsível.
- Manutenção mais simples que a solução atual.
- Sem regressão mensurável nos fluxos testados.

Se esses critérios não forem atendidos, a migração deve ser reavaliada antes da Fase 2.

## Fase 2 — Fundação compartilhada

- Definir estrutura `apps/fcda-next` e, se necessário, `packages/`.
- Extrair tipos, schemas Zod e regras independentes de framework.
- Gerar tipos Supabase a partir do schema oficial.
- Padronizar tratamento de erros, loading, empty states e logs.
- Definir convenções de Server Component e Client Component.
- Configurar ESLint, Prettier, typecheck, testes e CI.

Estrutura sugerida:

```text
apps/
├── fcda-current/       # aplicação TanStack durante a transição
└── fcda-next/          # aplicação alvo
packages/
├── domain/             # tipos, validações e regras
├── supabase/           # cliente, tipos e acesso a dados
└── config/             # configurações compartilhadas
```

## Fase 3 — Migração das páginas públicas

Migrar nesta ordem:

1. Layout, tema e componentes base.
2. Home e modalidades.
3. Notícias e detalhe da notícia.
4. Eventos e detalhe do evento.
5. Clubes, cursos e contato.
6. Transparência, documentos e atletas.
7. Rankings e recordes.

Cada rota deve incluir:

- URL equivalente ou redirect documentado.
- Metadata e Open Graph.
- Estados de carregamento e erro.
- Responsividade.
- Teste de navegação e dados.
- Verificação de acessibilidade básica.

## Fase 4 — Autenticação e painel

Migrar o painel somente depois da base pública estabilizada.

- Login, logout e recuperação de senha.
- Proteção de rotas e autorização por role.
- Usuários e permissões.
- Notícias, eventos e modalidades.
- Documentos, PDFs e transparência.
- Clubes, cursos e parceiros.
- Rankings e recordes.
- Filiações, mensagens e notificações.
- Auditoria administrativa.
- Preferências de tema.

A autorização efetiva continua no Supabase por RLS e policies. Guards do Next.js são uma camada de experiência, não substituto da segurança do banco.

## Fase 5 — SEO, PWA e observabilidade

- Migrar Metadata API e JSON-LD.
- Gerar sitemap com páginas dinâmicas publicadas.
- Preservar `robots.txt` e URLs públicas.
- Validar manifest, service worker e instalação PWA.
- Preservar Sentry/error capture ou substituir por solução equivalente.
- Monitorar erros de SSR, autenticação e queries.
- Comparar Web Vitals com o baseline da Fase 0.

## Fase 6 — Convivência e corte

Durante a migração, manter as duas aplicações implantáveis.

Opções de roteamento:

- Subdomínio temporário para a aplicação Next.js.
- Ambiente de preview por branch.
- Roteamento por caminho no Cloudflare Worker.
- Corte total somente após aprovação de QA.

Plano de corte:

1. Congelar mudanças estruturais na aplicação antiga.
2. Executar smoke tests e testes E2E.
3. Publicar a aplicação Next.js.
4. Monitorar erros e métricas.
5. Manter rollback para a última versão TanStack estável.
6. Remover o runtime antigo somente após o período de estabilização.

## Estratégia de branches

```text
main
└── migration/nextjs-2027
    ├── spike/foundation
    ├── migration/shared-domain
    ├── migration/public-pages
    ├── migration/auth
    ├── migration/admin
    └── migration/cutover
```

## Checklist de aceite

### Produto

- [ ] Todas as rotas públicas disponíveis.
- [ ] Todas as rotas administrativas disponíveis.
- [ ] URLs antigas preservadas ou redirecionadas.
- [ ] Fluxos de contato, filiação e newsletter funcionando.
- [ ] Exportações CSV e XLSX funcionando.

### Segurança

- [ ] RLS validada no Supabase.
- [ ] Roles e guards testados.
- [ ] Service role key ausente do bundle cliente.
- [ ] Uploads protegidos por policies.
- [ ] Secrets fora do Git.

### Qualidade

- [ ] Typecheck passando.
- [ ] Lint e formatação passando.
- [ ] Testes unitários e E2E críticos passando.
- [ ] SSR validado.
- [ ] Lighthouse e Web Vitals comparados.
- [ ] Rollback testado.

## Riscos e mitigação

| Risco                                | Mitigação                                           |
| ------------------------------------ | --------------------------------------------------- |
| Incompatibilidade Next.js/Cloudflare | Spike com deploy real antes da migração             |
| Regressão de autenticação            | Testes de sessão e RLS em cada etapa                |
| Perda de SEO                         | Manter URLs, metadata, sitemap e redirects          |
| Duplicação de regras                 | Biblioteca compartilhada de domínio                 |
| Migração longa                       | Cortes por domínio e deploy incremental             |
| Bundle maior                         | Server Components, análise de bundle e lazy loading |
| Divergência visual                   | Comparação por screenshots e checklist de UI        |

## Decisão de go/no-go

A migração só deve avançar para produção quando:

- o spike confirmar vantagem operacional real;
- o deploy escolhido estiver validado;
- os fluxos críticos tiverem testes automatizados;
- a aplicação nova alcançar paridade funcional;
- houver rollback documentado e executável;
- a equipe aprovar o custo de manutenção das duas aplicações durante a transição.

## Responsáveis e registros

Antes do início da Fase 0, preencher:

- Responsável técnico: `a definir`
- Responsável pelo Supabase: `a definir`
- Responsável por QA: `a definir`
- Ambiente de homologação: `a definir`
- Data de início: `a definir`
- Janela de corte: `a definir`
- ADR da decisão: `a definir`
