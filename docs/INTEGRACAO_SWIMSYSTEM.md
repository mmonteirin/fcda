# Integração SwimSystem

## Endpoint de webhook

Configure no painel do SwimSystem a URL pública:

```text
https://fcda.org.br/api/webhooks/swimsystem
```

O receptor valida `X-SwimSystem-Signature` como HMAC-SHA256 do corpo bruto, exige os headers `X-SwimSystem-Event` e `X-SwimSystem-Delivery`, aceita apenas JSON e limita o corpo a 1 MB. Para cada evento, consulta a competição, etapas, provas, resultados, pontuação e medalhas na API e atualiza o cache no Supabase. Erros de API ou banco retornam `503` para que o SwimSystem tente entregar novamente.

Antes de usar a integração, aplique a migration `supabase/migrations/20261018000000_swimsystem_competition_cache.sql`. Ela cria o cache público apenas para competições vinculadas e adiciona o ID SwimSystem às competições.

Configure no SwimSystem o segredo de assinatura gerado para o webhook no ambiente Cloudflare:

```sh
npx wrangler secret put SWIMSYSTEM_WEBHOOK_SECRET
```

Para desenvolvimento local, adicione `SWIMSYSTEM_WEBHOOK_SECRET` a `.dev.vars` (arquivo ignorado pelo Git). Não use o token da API como segredo do webhook.

Selecione os cinco eventos disponíveis na tela de cadastro:

- `heat.racestatus_changed` — status da série
- `meet.startlist_updated` — balizamento atualizado
- `meet.schedule_updated` — cronograma atualizado
- `entry.changed` — inscrição criada ou alterada
- `event.racestatus_changed` — status da prova

O receptor persiste dados oficiais em cache e remove licenças e outros identificadores pessoais dos resultados antes de gravar. O site publica os horários e os resultados na página da competição vinculada. As notificações agregadas servem como sinal para consultar novamente os endpoints.

## Vincular uma competição

No painel do site, edite a competição e preencha **ID da competição no SwimSystem** com o UUID exibido no SwimSystem. Depois que a migration estiver aplicada e um webhook dessa competição for entregue, a página pública do evento passa a mostrar etapas, horários e resultados oficiais. As competições não vinculadas continuam com o conteúdo atual do site.

## API de leitura

Configure a chave de API apenas como segredo de servidor no Cloudflare:

```sh
npx wrangler secret put SWIMSYSTEM_API_KEY
```

Em desenvolvimento local, use `.dev.vars`. O módulo `src/lib/swimsystem.ts` oferece `swimSystemGet<T>(path)` para chamadas GET à API oficial (`https://swimsystem.app/api/v1`), enviando `Authorization: Bearer` e o header obrigatório `User-Agent: FCDA-Website/1.0`.

Endpoints documentados para competição de natação incluem:

- `/swimming/meets/{meetId}`
- `/swimming/meets/{meetId}/sessions`
- `/swimming/meets/{meetId}/events`
- `/swimming/meets/{meetId}/results`
- `/swimming/events/{eventId}/results`
- `/swimming/meets/{meetId}/scoring`
- `/swimming/meets/{meetId}/medals`
- `/swimming/meets/{meetId}/clubs`
- `/swimming/meets/{meetId}/athletes`

A referência da versão 0.8.0 informa que a API atualmente oferece leitura, atualização de IDs externos com permissão específica e notificações por webhook; não oferece criação ou gerenciamento de registros internos.

## Credenciais

As credenciais não foram adicionadas ao código nem a este documento. Mantenha a chave da API e o segredo do webhook somente nos secrets do Cloudflare e no `.dev.vars` local.
