# Sistema de Parceiros

Documentação do sistema de gerenciamento de Apoio Institucional, Patrocínio e Parcerias da FCDA.

## 📋 Visão Geral

O sistema permite cadastrar e gerenciar três categorias de parceiros:
- **Apoio Institucional**: Governos, secretarias e entidades oficiais
- **Patrocínio**: Empresas e marcas que patrocinam eventos
- **Parcerias**: Organizações com acordos de colaboração

## 🗄️ Banco de Dados

### Tabela `parceiros`

```sql
CREATE TABLE parceiros (
  id UUID PRIMARY KEY,
  nome TEXT NOT NULL,
  logo_url TEXT,
  site_url TEXT,
  categoria TEXT CHECK (categoria IN ('apoio_institucional', 'patrocinio', 'parceria')),
  ordem INTEGER DEFAULT 0,
  ativo BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE
);
```

### Migração

Execute a migração no dashboard do Supabase:
- Arquivo: `supabase/migrations/20260807000000_create_parceiros.sql`

## 🎨 Frontend

### Página Inicial

A seção de parceiros é exibida automaticamente na página inicial (`/`), organizada por categoria:
- Ícones diferentes para cada categoria
- Grid responsivo com logos
- Links para sites dos parceiros
- Efeito grayscale que muda no hover

### Painel Administrativo

Acesso em `/admin/parceiros` (apenas para admins/editores):

**Funcionalidades:**
- Listar todos os parceiros (ativos e inativos)
- Adicionar novo parceiro
- Editar parceiro existente
- Excluir parceiro
- Alterar ordem de exibição
- Ativar/desativar parceiro

**Campos:**
- Nome (obrigatório)
- Categoria (obrigatório)
- URL do Logo (opcional)
- URL do Site (opcional)
- Ordem (número)
- Status (ativo/inativo)

## 🔧 Configuração

### Types TypeScript

Os tipos foram adicionados a:
- `src/integrations/supabase/types.ts` - Tipo da tabela no Supabase
- `src/lib/site-queries.ts` - Type `Parceiro` e query `parceirosQuery`

### Queries

```typescript
// Buscar apenas parceiros ativos (página inicial)
const parceiros = useSuspenseQuery(parceirosQuery(true)).data;

// Buscar todos os parceiros (painel admin)
const parceiros = useSuspenseQuery(parceirosQuery(false)).data;
```

### Functions do Admin

```typescript
// Salvar parceiro (criar ou editar)
await saveParceiro(supabase, userId, data);

// Excluir parceiro
await deleteParceiro(supabase, userId, id);
```

## 🚀 Como Usar

### 1. Executar a Migração

No dashboard do Supabase:
1. Vá para SQL Editor
2. Execute o conteúdo do arquivo `20260807000000_create_parceiros.sql`
3. Verifique se a tabela `parceiros` foi criada com os dados de exemplo

### 2. Adicionar Parceiros

1. Acesse o painel admin: `/admin`
2. Clique em "Parceiros" no menu lateral
3. Clique em "Novo Parceiro"
4. Preencha os dados:
   - Nome: Nome do parceiro
   - Categoria: Selecione o tipo
   - URL do Logo: Link para a imagem do logo
   - URL do Site: Link para o site oficial
   - Ordem: Número para ordenação (menor = aparece primeiro)
   - Status: Marque como ativo para exibir no site
5. Clique em "Salvar"

### 3. Verificar no Site

Acesse a página inicial (`/`) e role até a seção "Nossos Parceiros". Os parceiros ativos serão exibidos organizados por categoria.

## 📱 Design

### Exibição na Página Inicial

- Seção separada com fundo claro
- Organização por categoria com ícones
- Cards com logos dos parceiros
- Efeito grayscale → colorido no hover
- Links clicáveis para sites dos parceiros
- Layout responsivo (2-4 colunas dependendo do tamanho da tela)

### Categorias e Ícones

- **Apoio Institucional**: Ícone Building2
- **Patrocínio**: Ícone Medal
- **Parceria**: Ícone Handshake

## 🔒 Segurança

- RLS habilitado na tabela `parceiros`
- Apenas usuários com role `admin` ou `editor` podem gerenciar
- Público pode ver apenas parceiros ativos
- Validação de dados com Zod schemas

## 📝 Dados de Exemplo

A migração inclui 3 parceiros de exemplo:
1. Governo do Estado do Ceará (Apoio Institucional)
2. Secretaria de Esporte do Ceará (Apoio Institucional)
3. CBDA (Apoio Institucional)

Estes podem ser editados ou removidos conforme necessário.

## 🛠️ Manutenção

### Adicionar nova categoria

1. Altere o CHECK constraint na tabela
2. Atualize o TypeScript type
3. Adicione a nova opção no componente admin
4. Adicione o ícone correspondente

### Alterar ordem de exibição

Edite o campo `ordem` de cada parceiro. Menores números aparecem primeiro.

### Desativar parceiro temporariamente

Altere o status para "Inativo" em vez de excluir. O parceiro não será exibido mas permanece no sistema.
