import { createFileRoute } from "@tanstack/react-router";

import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { asDynamicSupabase } from "@/lib/supabase-helpers";
import {
  fetchSwimSystemCompetition,
  findSwimSystemMeetId,
  verifySwimSystemWebhook,
  type SwimSystemEvent,
} from "@/lib/swimsystem";

const MAX_WEBHOOK_BYTES = 1_000_000;
const SUPPORTED_EVENTS = new Set<SwimSystemEvent>([
  "heat.racestatus_changed",
  "event.racestatus_changed",
  "meet.startlist_updated",
  "meet.schedule_updated",
  "entry.changed",
]);

export const Route = createFileRoute("/api/webhooks/swimsystem")({
  server: {
    handlers: {
      GET: async () =>
        Response.json({ service: "swimsystem-webhook", ready: true }),
      POST: async ({ request }) => {
        const declaredLength = Number(request.headers.get("content-length") ?? 0);
        if (declaredLength > MAX_WEBHOOK_BYTES) {
          return Response.json({ error: "Payload muito grande." }, { status: 413 });
        }

        const rawBody = await request.arrayBuffer();
        if (rawBody.byteLength > MAX_WEBHOOK_BYTES) {
          return Response.json({ error: "Payload muito grande." }, { status: 413 });
        }

        const valid = await verifySwimSystemWebhook(
          rawBody,
          request.headers.get("X-SwimSystem-Signature"),
        );
        if (!valid) {
          return Response.json({ error: "Assinatura inválida." }, { status: 401 });
        }

        const event = request.headers.get("X-SwimSystem-Event");
        const deliveryId = request.headers.get("X-SwimSystem-Delivery");
        if (!event || !deliveryId) {
          return Response.json({ error: "Headers de evento ausentes." }, { status: 400 });
        }

        if (!SUPPORTED_EVENTS.has(event as SwimSystemEvent)) {
          return Response.json({ error: "Evento não suportado." }, { status: 422 });
        }

        let payload: unknown;
        try {
          payload = JSON.parse(new TextDecoder().decode(rawBody));
        } catch {
          return Response.json({ error: "JSON inválido." }, { status: 400 });
        }

        const meetId = findSwimSystemMeetId(payload);
        if (!meetId) {
          return Response.json({ error: "meet_id não encontrado no evento." }, { status: 400 });
        }

        try {
          const snapshot = await fetchSwimSystemCompetition(meetId);
          const db = asDynamicSupabase(supabaseAdmin);
          const { error } = await db.from("swimsystem_competition_cache").upsert(
            {
              meet_id: meetId,
              snapshot,
              last_event: event,
              last_delivery_id: deliveryId,
              synced_at: new Date().toISOString(),
            },
            { onConflict: "meet_id" },
          );
          if (error) throw error;
        } catch (error) {
          console.error("Falha ao sincronizar competição SwimSystem", {
            meetId,
            event,
            message: error instanceof Error ? error.message : "Erro desconhecido",
          });
          return Response.json({ error: "Falha ao sincronizar a competição." }, { status: 503 });
        }

        return Response.json({ received: true, event, deliveryId, meetId }, { status: 200 });
      },
    },
  },
});
