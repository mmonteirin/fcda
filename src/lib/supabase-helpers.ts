import { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";

/**
 * Type helper para permitir queries dinâmicas no Supabase
 * mantendo alguma segurança de tipos
 */
export type SupabaseClientDynamic = Omit<SupabaseClient<Database>, "from" | "rpc" | "channel"> & {
  from: <T extends string>(
    table: T,
  ) => {
    select: (columns?: string) => {
      order: (
        column: string,
        options?: { ascending: boolean },
      ) => {
        eq: (
          column: string,
          value: unknown,
        ) => {
          single: () => Promise<{ data: unknown; error: { message: string } | null }>;
          then: <T>(resolve: (value: T) => unknown) => Promise<unknown>;
        };
      };
    };
  };
  rpc: (
    fnName: string,
    params?: Record<string, unknown>,
  ) => {
    then: <T>(resolve: (value: T) => unknown) => Promise<unknown>;
  };
  channel: (name: string) => unknown;
};

/**
 * Helper para fazer type cast seguro do Supabase client
 */
export function asDynamicSupabase(client: SupabaseClient): SupabaseClientDynamic {
  return client as unknown as SupabaseClientDynamic;
}
