import { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";

/**
 * Type helper para permitir queries dinâmicas no Supabase
 * mantendo alguma segurança de tipos
 */
/* eslint-disable @typescript-eslint/no-explicit-any */
export type SupabaseClientDynamic = Omit<SupabaseClient<Database>, "from" | "rpc" | "channel"> & {
  from: <T extends string>(table: T) => any;
  rpc: (fnName: string, params?: Record<string, unknown>) => any;
  channel: (name: string) => any;
};
/* eslint-enable @typescript-eslint/no-explicit-any */

/**
 * Helper para fazer type cast seguro do Supabase client
 */
export function asDynamicSupabase(client: SupabaseClient): SupabaseClientDynamic {
  return client as unknown as SupabaseClientDynamic;
}
