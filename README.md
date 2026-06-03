# FCDA — Federação Cearense de Desportos Aquáticos

Site oficial da Federação Cearense de Desportos Aquáticos (FCDA), desenvolvido com tecnologias modernas para gerenciamento de conteúdo e eventos de natação e outros esportes aquáticos.

## 🚀 Tecnologias Utilizadas

- **Frontend**: React 19, TypeScript
- **Framework**: TanStack Start (SSR)
- **Routing**: TanStack Router
- **State Management**: TanStack Query
- **UI Components**: Radix UI, shadcn/ui
- **Styling**: TailwindCSS 4
- **Backend**: Supabase (Database, Auth, Storage)
- **Validação**: Zod
- **Deploy**: Cloudflare Workers

## 📋 Pré-requisitos

- Node.js 18+ ou Bun
- Conta no Supabase
- Variáveis de ambiente configuradas

## 🔧 Configuração

1. **Clone o repositório**

   ```bash
   git clone <repositório>
   cd Fcda
   ```

2. **Instale as dependências**

   ```bash
   bun install
   # ou
   npm install
   ```

3. **Configure as variáveis de ambiente**

   Crie um arquivo `.env` na raiz do projeto com as seguintes variáveis:

   ```env
   SUPABASE_URL="https://seu-projeto.supabase.co"
   SUPABASE_PUBLISHABLE_KEY="sua-chave-publica"
   SUPABASE_SERVICE_ROLE_KEY="sua-chave-service-role"
   VITE_SUPABASE_PROJECT_ID="seu-project-id"
   VITE_SUPABASE_PUBLISHABLE_KEY="sua-chave-publica"
   VITE_SUPABASE_URL="https://seu-projeto.supabase.co"
   ```

4. **Execute as migrações do Supabase**

   No dashboard do Supabase, execute as migrações na ordem:
   - `20260601125652_f533286c-1cf5-45cc-a61e-fc6708fa7e0f.sql`
   - `20260601125716_bc87c69b-f9e0-418f-8079-7fc0dbdc7120.sql`
   - `20260602010300_create_mensagens.sql`
   - `20260602020000_add_eventos_pdfs.sql`
   - `20260602030000_update_pdf_tipo.sql`
   - `20260602040000_add_lido_column.sql`

## 🏃 Executando o Projeto

**Modo de desenvolvimento:**

```bash
bun run dev
# ou
npm run dev
```

**Build para produção:**

```bash
bun run build
# ou
npm run build
```

**Preview do build:**

```bash
bun run preview
# ou
npm run preview
```

## 📁 Estrutura do Projeto

```
Fcda/
├── src/
│   ├── components/
│   │   ├── admin/          # Componentes do painel administrativo
│   │   ├── site/           # Componentes do site público
│   │   └── ui/             # Componentes UI reutilizáveis
│   ├── hooks/              # Hooks customizados
│   ├── integrations/
│   │   └── supabase/       # Integração com Supabase
│   ├── lib/                # Funções utilitárias e queries
│   ├── routes/             # Rotas do TanStack Router
│   │   ├── _authenticated/ # Rotas autenticadas
│   │   │   └── admin/      # Painel administrativo
│   │   └── ...             # Rotas públicas
│   ├── router.tsx          # Configuração do router
│   ├── server.ts           # Configuração do servidor
│   └── start.ts            # Ponto de entrada
├── supabase/
│   ├── migrations/         # Migrações do banco de dados
│   └── config.toml         # Configuração do Supabase
├── .env                    # Variáveis de ambiente
├── index.html              # HTML de entrada
├── package.json            # Dependências do projeto
├── tsconfig.json           # Configuração do TypeScript
└── vite.config.ts          # Configuração do Vite
```

## 🎨 Funcionalidades

### Site Público

- **Home**: Apresentação da federação
- **Sobre**: Informações sobre a FCDA
- **Notícias**: Notícias e comunicados
- **Eventos**: Calendário de eventos e competições
- **Modalidades**: Informações sobre as modalidades aquáticas
- **Diretoria**: Lista de diretores
- **Contato**: Formulário de contato

### Painel Administrativo

- **Notícias**: Criar, editar e excluir notícias
- **Eventos**: Gerenciar eventos e competições
- **Modalidades**: Gerenciar modalidades e categorias
- **Diretores**: Gerenciar diretoria
- **Usuários**: Gerenciar usuários e permissões
- **PDFs**: Upload de PDFs para eventos (23 tipos diferentes)
- **Mensagens**: Visualizar mensagens enviadas pelo formulário de contato
- **Banner**: Configurar banner da home

### Tipos de PDF Suportados

- Resultados
- Pontuação
- Eficiência
- Recordes
- Quadro de medalhas
- Índice Técnico
- Programa de Provas
- Inscritos por clube
- Relação de Inscritos
- Balizamentos
- Resultados Gerais
- Regulamentos
- Relação de Cortes
- Mapa de Inscrição
- Índices
- Lista de Hotéis
- Outros
- Súmula
- Tabela de Jogos
- Mapa da Prova
- Termo de Responsabilidade
- Ranking
- Inscrições

## 🗄️ Banco de Dados

O projeto utiliza Supabase como backend, com as seguintes tabelas principais:

- `profiles`: Perfis de usuários
- `user_roles`: Funções de usuário (admin, editor)
- `modalidades`: Modalidades aquáticas
- `categorias_modalidades`: Categorias de modalidades
- `noticias`: Notícias e comunicados
- `eventos`: Eventos e competições
- `eventos_pdfs`: PDFs associados a eventos
- `diretores`: Diretores da federação
- `mensagens`: Mensagens do formulário de contato
- `banner_config`: Configuração do banner

## 🔐 Segurança

- Autenticação via Supabase Auth
- Row Level Security (RLS) habilitado em todas as tabelas
- Políticas de acesso baseadas em roles (admin, editor)
- Middleware de autenticação para rotas protegidas

## 📞 Contato

**Sede Administrativa**

```
Federação Cearense de Desportos Aquáticos (FCDA)
Av. da Abolição, 2727 – Meireles
Fortaleza – CE, CEP 60165-081
```

**E-mail**: fcdaquaticos@fcda.org.br

**Atendimento Presencial**: Terças e Quintas-feiras, 07h às 11h

**Site**: www.fcda.org.br

## 📄 Licença

Este projeto é propriedade da Federação Cearense de Desportos Aquáticos (FCDA).

## 🤝 Contribuindo

Para contribuir com o projeto, entre em contato com a equipe de desenvolvimento da FCDA.
