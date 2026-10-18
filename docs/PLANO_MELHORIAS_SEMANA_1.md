# 🏊 Plano de Melhorias — Site FCDA (Semana 1)

> Semana de referência: **20 a 26 de outubro de 2026**
> Branch de trabalho: `feat/melhorias-semana-1`

---

## 📊 Visão Geral da Semana

| Dia | Foco | Prioridade |
|-----|------|------------|
| Dia 1 | SEO & Metadados | 🔴 Alta |
| Dia 2 | Acessibilidade (a11y) | 🔴 Alta |
| Dia 3 | Recordes & Rankings | 🔴 Alta |
| Dia 4 | Modalidades & Cursos | 🟠 Média |
| Dia 5 | UX, Animações & Micro-interações | 🟠 Média |
| Dia 6 | Performance & Imagens | 🔴 Alta |
| Dia 7 | Testes, Validações & Deploy | 🔴 Alta |

---

## Dia 1 — SEO & Metadados

A maioria das rotas ainda não tem `og:image`, `og:type` ou `twitter:card`.
Isso prejudica o compartilhamento em redes sociais e o índice do Google.

### Tarefas

| # | Tarefa | Arquivo(s) | Impacto |
|---|--------|------------|---------|
| 1.1 | Adicionar `og:image`, `og:type`, `twitter:card` em todas as rotas públicas | `src/routes/*.tsx` | 🔴 Alto |
| 1.2 | Adicionar `og:image` dinâmico nas páginas de evento e notícia (usar `imagem_url` do item) | `src/routes/eventos.$id.tsx`, `noticias.$id.tsx` | 🔴 Alto |
| 1.3 | Completar `sitemap.xml` para incluir `/modalidades`, `/clubes`, `/rankings`, `/recordes`, `/sobre`, `/contato` | `scripts/generate-sitemap.ts` | 🟠 Médio |
| 1.4 | Adicionar `<link rel="canonical">` em cada rota | `src/routes/__root.tsx` ou por rota | 🟠 Médio |
| 1.5 | Configurar `robots.txt` para bloquear rotas admin (`/admin/*`, `/_authenticated/*`) | `public/robots.txt` | 🟡 Baixo |

---

## Dia 2 — Acessibilidade (a11y)

O site não possui `aria-label` nas imagens de modalidade/notícia, `role` nos cards interativos
nem `skip navigation` link. Isso impacta leitores de tela e score Lighthouse.

### Tarefas

| # | Tarefa | Arquivo(s) | Impacto |
|---|--------|------------|---------|
| 2.1 | Adicionar `alt` descritivo em todas as imagens de modalidade, notícia e evento | `src/routes/index.tsx`, `modalidades.tsx`, `noticias.index.tsx`, `eventos.index.tsx` | 🔴 Alto |
| 2.2 | Adicionar "Pular para o conteúdo" (`skip to content`) no layout | `src/components/layout/SiteLayout.tsx` | 🟠 Médio |
| 2.3 | Garantir contraste mínimo 4.5:1 nos textos de botões gold sobre fundo escuro | `src/styles.css`, componentes | 🟠 Médio |
| 2.4 | Tornar os filtros de Recordes e Rankings acessíveis via teclado (tab order, aria-selected) | `src/routes/recordes.tsx`, `rankings.tsx` | 🟠 Médio |
| 2.5 | Adicionar `aria-live` no formulário de Contato para anunciar sucesso/erro ao leitor de tela | `src/routes/contato.tsx` | 🟡 Baixo |

---

## Dia 3 — Página de Recordes & Rankings

A página de Recordes usa `useEffect` + fetch manual sem cache.
A de Rankings também. Ambas deveriam usar `useSuspenseQuery` + TanStack Query
para consistência, SSR e cache automático.

### Tarefas

| # | Tarefa | Arquivo(s) | Impacto |
|---|--------|------------|---------|
| 3.1 | Migrar `recordes.tsx` de `useEffect/useState` para `useSuspenseQuery` com loader SSR | `src/routes/recordes.tsx`, `src/lib/api/site-queries.ts` | 🔴 Alto |
| 3.2 | Migrar `rankings.tsx` da mesma forma | `src/routes/rankings.tsx`, `src/lib/api/site-queries.ts` | 🔴 Alto |
| 3.3 | Adicionar filtros por **modalidade** na página de Recordes (hoje só tem piscina + sexo) | `src/routes/recordes.tsx` | 🟠 Médio |
| 3.4 | Criar página de **detalhe de ranking** (`/rankings/$id`) com pódio visual top-3 e tabela completa | `src/routes/rankings.$id.tsx` (novo) | 🟠 Médio |
| 3.5 | Melhorar UX visual da tabela de recordes com destaque para recordes estabelecidos no ano atual | `src/routes/recordes.tsx` | 🟡 Baixo |

---

## Dia 4 — Páginas de Modalidades & Cursos

A página de Modalidades não possui animação de entrada e a leitura de conteúdo
é extensa sem âncoras. A de Cursos mostra lista básica sem preview de data
e localização em destaque.

### Tarefas

| # | Tarefa | Arquivo(s) | Impacto |
|---|--------|------------|---------|
| 4.1 | Adicionar âncoras de navegação lateral (`Natação`, `Polo`, `Saltos`...) na página de Modalidades | `src/routes/modalidades.tsx` | 🟠 Médio |
| 4.2 | Adicionar contagem de atletas federados por modalidade (dados do Supabase ou estáticos) | `src/routes/modalidades.tsx` | 🟠 Médio |
| 4.3 | Redesenhar card de Curso com badge de status (`Inscrições abertas` / `Em breve` / `Encerrado`) baseado na data | `src/routes/cursos.tsx` | 🟠 Médio |
| 4.4 | Adicionar filtro por modalidade na lista de Cursos | `src/routes/cursos.tsx` | 🟡 Baixo |
| 4.5 | Criar página de **detalhe de curso** (`/cursos/$id`) com descrição completa, requisitos e botão de inscrição | `src/routes/cursos.$id.tsx` (novo) | 🟠 Médio |

---

## Dia 5 — UX, Animações & Micro-interações

Micro-interações bem aplicadas aumentam o tempo de sessão e a percepção de
qualidade do site. Foco em transições de página e estados de carregamento.

### Tarefas

| # | Tarefa | Arquivo(s) | Impacto |
|---|--------|------------|---------|
| 5.1 | Adicionar **transição de entrada suave** (`fade-in` + `slide-up`) nos cards de notícias e eventos | `src/routes/noticias.index.tsx`, `eventos.index.tsx` | 🟠 Médio |
| 5.2 | Adicionar **scroll progress bar** no topo das páginas de notícia e evento | `src/routes/noticias.$id.tsx`, `eventos.$id.tsx` | 🟡 Baixo |
| 5.3 | Melhorar o estado vazio das listas (quando não há eventos/notícias): ilustração + CTA | `src/routes/eventos.index.tsx`, `noticias.index.tsx` | 🟠 Médio |
| 5.4 | Adicionar **botão "Voltar ao topo"** flutuante nas páginas longas | `src/components/ui/back-to-top.tsx` (novo) | 🟡 Baixo |
| 5.5 | Unificar SkeletonCards de notícias e eventos para refletir fielmente o layout real dos cards | `src/components/skeleton/` | 🟡 Baixo |

---

## Dia 6 — Performance & Imagens

As imagens de modalidade (`.jpg`) têm mais de 1 MB cada no bundle.
Isso aumenta o LCP (Largest Contentful Paint) e pode prejudicar o
score PageSpeed, especialmente em mobile 3G.

### Tarefas

| # | Tarefa | Arquivo(s) | Impacto |
|---|--------|------------|---------|
| 6.1 | **Converter imagens** de modalidade e hero para `.webp` (redução estimada ~60–70%) | `src/assets/images/*.jpg` | 🔴 Alto |
| 6.2 | Adicionar `loading="lazy"` e `decoding="async"` em todas as imagens abaixo do fold | Rotas e componentes | 🔴 Alto |
| 6.3 | Adicionar `fetchpriority="high"` na imagem hero (acima do fold) | `src/routes/index.tsx`, `HeroBanner.tsx` | 🟠 Médio |
| 6.4 | Migrar fontes Sansation de `.ttf` para `.woff2` (redução ~30% no tamanho das fontes) | `src/assets/fonts/`, `src/styles.css` | 🟠 Médio |
| 6.5 | Auditar e remover componentes UI importados mas não usados no bundle | `src/components/ui/index.ts` | 🟡 Baixo |

---

## Dia 7 — Testes, Validações & Deploy

### Tarefas

| # | Tarefa | Ferramenta | Impacto |
|---|--------|------------|---------|
| 7.1 | Rodar `npm run typecheck` e corrigir todos os erros | `tsc` | 🔴 Alto |
| 7.2 | Rodar `npm run build` e verificar que nenhum chunk ultrapassa 500 kB | `vite build` | 🔴 Alto |
| 7.3 | Testar manualmente as rotas públicas: `/`, `/eventos`, `/noticias`, `/rankings`, `/recordes`, `/sobre`, `/contato` | Browser | 🔴 Alto |
| 7.4 | Testar formulários: Contato e Filiação (envio real, toast de sucesso/erro) | Browser | 🔴 Alto |
| 7.5 | Rodar Lighthouse no Chrome para `/` e `/eventos` — meta: **Performance ≥ 85, Acessibilidade ≥ 90** | Lighthouse | 🟠 Médio |
| 7.6 | Merge da branch `feat/melhorias-semana-1` na `main` e `npm run deploy` | `wrangler deploy` | 🔴 Alto |

---

## 📈 Impacto Estimado ao Final da Semana

| Métrica | Antes (estimativa) | Depois (meta) |
|---------|-------------------|---------------|
| Lighthouse Performance (mobile) | ~55–65 | **≥ 85** |
| Lighthouse Acessibilidade | ~70–75 | **≥ 90** |
| LCP (Largest Contentful Paint) | ~3.5–5s | **< 2s** |
| Tamanho das imagens (total) | ~4 MB | **< 1.5 MB** |
| Compartilhamento social (og:image) | ❌ Não configurado | ✅ Todas as rotas |

---

## 🗂️ Backlog (fora da semana — para iterações futuras)

- **Busca global funcional** — `GlobalSearchModal` existe mas não está integrado a endpoint de busca real
- **Página 404 customizada** com branding da FCDA
- **Newsletter com confirmação por e-mail** — hoje o footer salva no Supabase mas sem sequência de e-mail
- **Mapa de clubes interativo** por cidade do Ceará
- **Dark mode** opcional
- **PWA offline-first** — `sw.js` existe mas está vazio
- **Página de detalhe de ranking** (`/rankings/$id`) com pódio visual
- **Página de detalhe de curso** (`/cursos/$id`) com inscrição online
