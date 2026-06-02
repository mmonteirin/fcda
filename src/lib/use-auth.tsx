import { useContext } from "react";
import { Ctx, type AuthCtx } from "./auth-context";

export function useAuth(): AuthCtx {
  const v = useContext(Ctx);
  if (!v) throw new Error("useAuth fora de AuthProvider");
  return v;
}
