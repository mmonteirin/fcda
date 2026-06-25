# FCDA — Federação Cearense de Desportos Aquáticos

Site institucional oficial da FCDA, com painel administrativo completo para gestão de conteúdo, eventos e documentos.

🌐 **[fcda.org.br](https://www.fcda.org.br)**

---

## Stack

| Camada | Tecnologias |
|---|---|
| Frontend | React 19, TypeScript |
| Framework | TanStack Start (SSR) |
| Routing | TanStack Router |
| Data fetching | TanStack Query |
| UI | Radix UI, shadcn/ui, TailwindCSS 4 |
| Backend | Supabase (Database, Auth, Storage) |
| Validação | Zod |
| Deploy | Cloudflare Workers |

---

## Por que essas escolhas

**TanStack Start sobre Next.js:** O TanStack Start oferece SSR com controle mais granular sobre o data fetching por rota, sem a camada de abstração do App Router. Como o site tem páginas públicas com SSR pesado (notícias, eventos) e um painel admin puramente client-side, essa separação ficou mais limpa.

**Cloudflare Workers:** Deploy na edge garante latência baixa para usuários em todo o Brasil, sem custo de servidor fixo. O bundle do TanStack Start compila bem para o runtime do Workers.

**Supabase:** RLS nativo eliminou a necessidade de uma API intermediária para as operações do painel admin. As políticas de acesso por role (admin/editor) ficam declaradas no banco, não espalhadas no código.

---

## Funcionalidades

### Site público
- Home com banner configurável via painel
- Notícias e comunicados
- Calendário de eventos e competições
- Modalidades aquáticas (Natação, Águas Abertas, Paranatação, Polo Aquático, Saltos Ornamentais, Nado Artístico)
- Página de diretoria
- Formulário de contato

### Painel administrativo
- Autenticação com controle de acesso por roles (admin, editor)
- CRUD completo de notícias, eventos, modalidades, categorias e diretoria
- Upload de PDFs por evento (23 tipos: resultados, balizamentos, regulamentos, rankings, etc.)
- Gestão de usuários e permissões
- Configuração de banner da home
- Caixa de mensagens do formulário de contato

---

## Banco de dados

```
profiles            → dados dos usuários
user_roles          → papéis de acesso (admin, editor)
modalidades         → modalidades aquáticas
categorias_modalidades
noticias            → notícias e comunicados
eventos             → competições e eventos
eventos_pdfs        → documentos vinculados a eventos
diretores           → membros da diretoria
mensagens           → contatos recebidos pelo formulário
banner_config       → configuração do banner da home
```

**Segurança:** Row Level Security (RLS) habilitado em todas as tabelas. Políticas baseadas em roles via Supabase Auth.

---

## Como rodar localmente

### Pré-requisitos
- Node.js 18+ ou Bun
- Conta no Supabase

### Setup

```bash
git clone https://github.com/mmonteirin/fcda
cd fcda
bun install
```

Crie `.env` na raiz:

```env
SUPABASE_URL="https://seu-projeto.supabase.co"
SUPABASE_PUBLISHABLE_KEY="sua-chave-publica"
SUPABASE_SERVICE_ROLE_KEY="sua-chave-service-role"
VITE_SUPABASE_PROJECT_ID="seu-project-id"
VITE_SUPABASE_PUBLISHABLE_KEY="sua-chave-publica"
VITE_SUPABASE_URL="https://seu-projeto.supabase.co"
```

Execute as migrações no dashboard do Supabase (pasta `supabase/migrations/`, em ordem cronológica).

```bash
bun run dev      # desenvolvimento
bun run build    # build de produção
bun run preview  # preview do build
```

---

## Estrutura do projeto

```
src/
├── components/
│   ├── admin/     # Componentes do painel administrativo
│   ├── site/      # Componentes do site público
│   └── ui/        # Componentes reutilizáveis (shadcn/ui)
├── hooks/         # Hooks customizados
├── integrations/
│   └── supabase/  # Client, types e queries
├── lib/           # Funções utilitárias
├── routes/
│   ├── _authenticated/
│   │   └── admin/ # Rotas protegidas do painel
│   └── ...        # Rotas públicas
├── router.tsx
├── server.ts
└── start.ts
supabase/
├── migrations/
└── config.toml
```

---

## Contato

**Federação Cearense de Desportos Aquáticos**  
Av. da Abolição, 2727 – Meireles, Fortaleza – CE  
secretaria@fcda.org.br · [fcda.org.br](https://www.fcda.org.br)

---

*Desenvolvido por [Marcos Monteiro](https://github.com/mmonteirin)*
