import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";

export const inputClass =
  "w-full rounded-xl border border-border bg-background px-3.5 py-3 text-sm text-foreground shadow-sm outline-none transition placeholder:text-muted-foreground/70 hover:border-primary/40 focus:border-primary focus:ring-4 focus:ring-primary/10 disabled:cursor-not-allowed disabled:opacity-60 motion-reduce:transition-none";

export function useFormState<T extends object>(initial: T) {
  const [data, setData] = useState<T>(initial);
  const set = <K extends keyof T>(k: K, v: T[K]) => setData((d) => ({ ...d, [k]: v }));
  return { data, setData, set };
}

export function useInvalidate(keys: string[]) {
  const qc = useQueryClient();
  return () => keys.forEach((k) => qc.invalidateQueries({ queryKey: [k] }));
}
