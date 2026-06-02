import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";

export const inputClass =
  "w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40";

export function useFormState<T extends object>(initial: T) {
  const [data, setData] = useState<T>(initial);
  const set = <K extends keyof T>(k: K, v: T[K]) => setData((d) => ({ ...d, [k]: v }));
  return { data, setData, set };
}

export function useInvalidate(keys: string[]) {
  const qc = useQueryClient();
  return () => keys.forEach((k) => qc.invalidateQueries({ queryKey: [k] }));
}
