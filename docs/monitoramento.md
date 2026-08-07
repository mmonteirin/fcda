# Monitoramento de Erros com Sentry

Este projeto utiliza Sentry para monitoramento de erros em produção.

## Configuração

### 1. Criar projeto no Sentry

1. Acesse [sentry.io](https://sentry.io) e crie uma conta
2. Crie um novo projeto selecionando "React" como plataforma
3. Copie o DSN fornecido

### 2. Configurar variáveis de ambiente

Adicione ao seu arquivo `.env`:

```env
# Para monitoramento no cliente
VITE_SENTRY_DSN=https://seu-dsn@sentry.io/project-id

# Para upload de source maps (opcional, recomendado em produção)
SENTRY_AUTH_TOKEN=sntrys_seu-token
SENTRY_ORG=seu-org
SENTRY_PROJECT=seu-project
```

### 3. Integração

O Sentry já está configurado no projeto através de:

- `src/lib/sentry.ts` - Inicialização do Sentry no cliente
- `vite.config.ts` - Plugin para upload de source maps
- `src/routes/__root.tsx` - Import automático do Sentry

## Uso

### Capturar exceções manualmente

```typescript
import { captureException, captureMessage } from "@/lib/sentry";

try {
  // código que pode falhar
} catch (error) {
  captureException(error as Error);
}

// Ou capturar mensagens
captureMessage("Algo importante aconteceu", "warning");
```

### Configurações atuais

- **Amostragem de traces**: 10% das transações
- **Amostragem de replay**: 10% das sessões normais, 100% com erro
- **Filtros**: Cookies são removidos automaticamente
- **Ambiente**: Detectado automaticamente (development/production)

## Benefícios

- Rastreamento de erros em tempo real
- Session replay para entender o contexto do erro
- Performance monitoring
- Alertas customizáveis
- Integração com GitHub para vincular erros a commits

## Desativar em desenvolvimento

O Sentry só é inicializado em produção quando `VITE_SENTRY_DSN` está configurado. Em desenvolvimento, não afeta o desempenho.
