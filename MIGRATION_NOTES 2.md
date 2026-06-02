# Migração: Remoção do TanStack Start

## ✅ Mudanças Realizadas

### 1. Dependencies (package.json)
- ❌ Removido: `@tanstack/react-start` (framework full-stack)
- ❌ Removido: `@cloudflare/vite-plugin` (integração Cloudflare)
- ❌ Removido: `@lovable.dev/vite-tanstack-config`
- ✅ Mantido: `@tanstack/react-router` (router standalone)
- ✅ Mantido: `@tanstack/react-query` (state management)

### 2. Arquivos Deletados
- ❌ `src/start.ts` - Entrada do TanStack Start
- ❌ `src/server.ts` - Server-side rendering wrapper

### 3. Arquivos Atualizados
- ✅ `vite.config.ts` - Novo config padrão Vite + React + TanStack Router
- ✅ `index.html` - Atualizado entry point para `/src/main.tsx`
- ✅ `wrangler.jsonc` - Removida config de servidor TanStack Start
- ✅ `src/main.tsx` - Novo arquivo de entrada com QueryClient + RouterProvider

### 4. Conversão de Server Functions
- `src/lib/admin.functions.ts` foi completamente convertida de `createServerFn` para funções async normais
- Agora usa Supabase diretamente do cliente
- Todos os schemas Zod foram mantidos para validação

## ⚠️ Próximos Passos Necessários

### 1. Atualizar Routes que usam `useServerFn`
Os seguintes arquivos ainda importam `useServerFn` do `@tanstack/react-start`:
- `src/routes/contato.tsx`
- `src/routes/filie-se.tsx`
- `src/routes/_authenticated/admin/banner.tsx`
- `src/routes/_authenticated/admin/diretores.tsx`
- `src/routes/_authenticated/admin/categorias-modalidades.tsx`
- `src/routes/_authenticated/admin/filiacoes.tsx`
- `src/routes/_authenticated/admin/eventos.tsx`
- `src/routes/_authenticated/admin/usuarios.tsx`
- `src/routes/_authenticated/admin/transparencia.tsx`
- `src/routes/_authenticated/admin/noticias.tsx`
- `src/routes/_authenticated/admin/eventos-pdfs.tsx`
- `src/routes/_authenticated/admin/modalidades.tsx`
- `src/routes/_authenticated/admin/mensagens.tsx`

**O que fazer:**
1. Remover import de `useServerFn`
2. Substituir `useServerFn(functionName)` por chamadas diretas às funções em `admin.functions.ts`
3. Passar `supabase` e `userId` como parâmetros (obter via `useAuth()`)

### 2. Exemplo de Migração

**Antes (TanStack Start):**
```tsx
import { useServerFn } from "@tanstack/react-start";
import { saveNoticia } from "@/lib/admin.functions";

export default function Component() {
  const saveNoticia$ = useServerFn(saveNoticia);
  
  async function handleSave(data) {
    const result = await saveNoticia$(data);
  }
}
```

**Depois (Cliente Supabase):**
```tsx
import { saveNoticia } from "@/lib/admin.functions";
import { useAuth } from "@/lib/use-auth";

export default function Component() {
  const { supabase, user } = useAuth();
  
  async function handleSave(data) {
    const result = await saveNoticia(supabase, user!.id, data);
  }
}
```

### 3. Rodar npm install
```bash
npm install
```

### 4. Verificar Erros
```bash
npm run lint
```

## 📝 Notas Importantes

- **Segurança:** As funções agora usam Supabase diretamente do cliente
  - Configure **Row Level Security (RLS)** no Supabase para proteger dados
  - O `assertEditor()` ainda valida roles, mas a proteção real deve vir do RLS
  
- **CORS:** Se Supabase está em outro domínio, verifique configuração de CORS

- **Middleware:** O arquivo `auth-middleware.ts` já não é usado, mas pode ser removido ou mantido como referência

## 🔗 Recursos Úteis

- [TanStack Router Docs](https://tanstack.com/router)
- [Supabase Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)
- [Vite Config](https://vitejs.dev/config/)
