# Ranking FCDA - Temporada 2026

## 📋 Visão Geral

Sistema de ranking público da FCDA para a Temporada 2026, integrado com Google Apps Script e design consistente com o site da FCDA.

## 🚀 Como Executar

### Desenvolvimento (com Proxy)

Para executar o projeto com o proxy local (necessário para evitar CORS):

```bash
npm run dev:all
```

Isso iniciará:
- **Proxy Server**: `http://localhost:3001` (servidor Express para evitar CORS)
- **Dev Server**: `http://localhost:8080` (aplicação React)

### Apenas Servidor de Desenvolvimento

```bash
npm run dev
```

⚠️ **Nota**: Sem o proxy, a API pode não funcionar devido a restrições de CORS do Google Apps Script.

### Apenas Proxy

```bash
npm run dev:proxy
```

## 🏗️ Arquitetura

### Componentes Principais

1. **`src/lib/ranking-api.ts`**: Serviço de API que se comunica com o Google Apps Script
2. **`src/routes/ranking-temporada-2026.tsx`**: Página do ranking com indicadores, Top 15, ranking por clubes e classificação por categoria
3. **`proxy-server.js`**: Servidor Express para evitar problemas de CORS
4. **`src/components/layout/Header/Header.tsx`**: Menu de navegação atualizado

### Fluxo de Dados

```
Site FCDA → Proxy Server (localhost:3001) → Google Apps Script API → Google Sheets
```

## 🔧 Configuração da API

### URL do Google Apps Script

A URL da API está configurada em `src/lib/ranking-api.ts`:

```typescript
const GOOGLE_APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbwwsqo9VNgfcitwTkYNB9SZzWKpsjw0J8JekP1gDvRCUzgli49JtqJA1XYPU0R2N_KvNA/exec';
```

### Configuração do Google Apps Script

Para que a API funcione corretamente, a implantação do Google Apps Script deve ser configurada como:

1. **Tipo**: App da Web
2. **Executar como**: Eu (sua conta)
3. **Quem pode acessar**: **Qualquer pessoa** 📍 *CRUCIAL*

## 📊 Funcionalidades

### Indicadores Gerais
- Total de atletas
- Total de clubes/entidades
- Total de categorias representadas

### Top 15 Atletas
- Tabela com os 15 melhores atletas por pontuação total
- Destaque visual para pódio (🥇🥈🥉)
- Informações: atleta, entidade, classe, sexo, total de pontos

### Ranking por Clubes
- Classificação dos clubes por soma de pontos
- Número de atletas por clube
- Pontuação total

### Classificação por Categoria
- Organização por classes/idades (Infantil 1, Infantil 2, Juvenil 1, etc.)
- Separação por sexo dentro de cada categoria
- Sistema de filtros por categoria e sexo
- Destaque para top 3 de cada grupo

## 🎨 Design

- **Cores**: Paleta verde esmeralda e dourado da FCDA
- **Tipografia**: Fonte Sansation (consistente com o site)
- **Layout**: Responsivo para mobile e desktop
- **Componentes**: Cards com sombras elegantes, tabelas com hover effects

## 🔒 CORS e Proxy

### Problema
O Google Apps Script não permite configurar cabeçalhos CORS customizados, o que causa erros quando acessado diretamente do navegador.

### Solução
Implementamos um servidor proxy local usando Express que:
1. Recebe requisições do cliente
2. Faz requisições para o Google Apps Script no servidor (sem CORS)
3. Retorna os dados com headers CORS apropriados
4. Funciona como intermediário seguro

### Ambientes

- **Desenvolvimento**: Usa proxy local (`http://localhost:3001/api/ranking`)
- **Produção**: Pode usar URL direta ou proxy de produção

## 📝 Estrutura de Dados

### Exemplo de Resposta da API

```json
{
  "temporada": "2026",
  "federacao": "FCDA",
  "atualizadoEm": "2026-08-25T00:24:58.499Z",
  "indicadores": {
    "totalAtletas": 170,
    "totalClubes": 10,
    "totalClasses": 7
  },
  "top15": [...],
  "clubes": [...],
  "sexo": [...],
  "trofeus": [...],
  "classes": [...],
  "parcialPorClasse": [...]
}
```

## 🧪 Testes

### Testar API via Proxy

```bash
curl "http://localhost:3001/api/ranking?recurso=indicadores"
```

### Testar API Direta

```bash
curl "https://script.google.com/macros/s/AKfycbwwsqo9VNgfcitwTkYNB9SZzWKpsjw0J8JekP1gDvRCUzgli49JtqJA1XYPU0R2N_KvNA/exec?recurso=indicadores"
```

## 🚀 Deploy

### Desenvolvimento
1. Execute `npm run dev:all`
2. Acesse `http://localhost:8080/ranking-temporada-2026`

### Produção
1. Configure proxy de produção se necessário
2. Atualize `API_URL` em `src/lib/ranking-api.ts`
3. Execute `npm run build`
4. Deploy com `npm run deploy`

## 📞 Suporte

Para problemas com a API do Google Apps Script:
- Verifique se a implantação está configurada como "App da Web"
- Confirme que "Quem pode acessar" está como "Qualquer pessoa"
- Verifique se o script está publicado corretamente

## 🔄 Atualizações

O ranking é atualizado automaticamente quando:
1. Você executa "Gerar/Atualizar Dashboard" no Google Apps Script
2. O cache da API é invalidado
3. O site reflete os novos dados no próximo acesso

Cache atual: 5 minutos (configurado no Google Apps Script)