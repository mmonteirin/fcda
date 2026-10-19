import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { asDynamicSupabase } from "@/lib/supabase-helpers";
import { fetchSwimSystemCompetition } from "@/lib/swimsystem";

/** Fill the public cache the first time a linked competition is opened. */
export const ensureSwimSystemCompetitionCache = createServerFn({ method: "POST" })
  .inputValidator((value: unknown) => z.object({ meetId: z.string().uuid() }).parse(value))
  .handler(async ({ data }) => {
    const db = asDynamicSupabase(supabaseAdmin);
    const { data: linkedEvent, error: eventError } = await db
      .from("eventos")
      .select("id")
      .eq("swimsystem_meet_id", data.meetId)
      .maybeSingle();
    if (eventError) throw new Error(eventError.message);
    if (!linkedEvent)
      throw new Error("Esta competição não está vinculada a um evento público da FCDA.");

    const { data: existing, error: cacheError } = await db
      .from("swimsystem_competition_cache")
      .select("meet_id,snapshot,synced_at")
      .eq("meet_id", data.meetId)
      .maybeSingle();
    if (cacheError) throw new Error(cacheError.message);
    if (existing) return existing;

    const snapshot = await fetchSwimSystemCompetition(data.meetId);
    const { data: saved, error: saveError } = await db
      .from("swimsystem_competition_cache")
      .upsert(
        {
          meet_id: data.meetId,
          snapshot,
          last_event: "initial_sync",
          last_delivery_id: `initial-${crypto.randomUUID()}`,
          synced_at: new Date().toISOString(),
        },
        { onConflict: "meet_id" },
      )
      .select("meet_id,snapshot,synced_at")
      .single();
    if (saveError) throw new Error(saveError.message);
    return saved;
  });
