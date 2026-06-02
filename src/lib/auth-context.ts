import { createContext } from "react";
import type { Session, User } from "@supabase/supabase-js";

export type AuthCtx = {
  loading: boolean;
  session: Session | null;
  user: User | null;
  roles: string[];
  isEditor: boolean;
  isAdmin: boolean;
  signOut: () => Promise<void>;
  refreshRoles: () => Promise<void>;
};

export const Ctx = createContext<AuthCtx | null>(null);
