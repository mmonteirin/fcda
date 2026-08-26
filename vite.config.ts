import { defineConfig } from "vite";
import { loadEnv } from "vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import tsConfigPaths from "vite-tsconfig-paths";
import { cloudflare } from "@cloudflare/vite-plugin";
import type { Plugin } from "vite";

// ── Env vars ────────────────────────────────────────────────────────────────
// TanStack Start uses Rolldown for the client environment build.
// Rolldown does NOT pick up Vite's top-level `define` substitutions, so we inject VITE_* vars explicitly via rolldownOptions.define.
//
// loadEnv reads .env / .env.local / .env.production from the project root.
// We use "" as prefix to capture every variable, then filter to VITE_* below.
const _mode = process.env.NODE_ENV === "development" ? "development" : "production";
const _env = loadEnv(_mode, process.cwd(), "");

const clientRolldownDefine: Record<string, string> = {
  "import.meta.env.MODE": JSON.stringify(_mode),
  "import.meta.env.DEV": _mode === "development" ? "true" : "false",
  "import.meta.env.PROD": _mode !== "development" ? "true" : "false",
  "import.meta.env.SSR": "false",
};
for (const [key, value] of Object.entries(_env)) {
  if (key.startsWith("VITE_")) {
    clientRolldownDefine[`import.meta.env.${key}`] = JSON.stringify(value);
  }
}

// Redirect TanStack Start's bundled server entry to src/server.ts (our SSR error wrapper).
// @cloudflare/vite-plugin builds from this — wrangler.jsonc main alone is insufficient.
export default defineConfig({
  plugins: [
    tanstackStart({
      server: { entry: "server" },
    }),
    react(),
    tailwindcss(),
    tsConfigPaths(),
    cloudflare(),
    vendorChunkPlugin(),
  ],
  environments: {
    client: {
      build: {
        rolldownOptions: {
          define: clientRolldownDefine,
        },
      },
    },
  },
});

/**
 * Splits stable node_modules into named vendor chunks so browsers can cache them
 * independently from application code.
 *
 * Applied via the Rollup `outputOptions` hook so it chains correctly with
 * any manualChunks already set by TanStack Start / Cloudflare plugins.
 *
 * Note: @tanstack/* packages share a circular module graph with the router
 * entry point, so Rollup/Rolldown cannot hoist them into a separate chunk —
 * they stay in the main index bundle (~187 kB / 59 kB gzip), which is
 * already well below Vite's 500 kB warning threshold.
 */
function vendorChunkPlugin(): Plugin {
  return {
    name: "vendor-chunks",
    enforce: "post",

    outputOptions(opts) {
      const upstream = opts.manualChunks;

      opts.manualChunks = function (id, api) {
        // Defer to any upstream manualChunks first.
        const upstreamResult =
          typeof upstream === "function" ? upstream.call(this, id, api) : upstream?.[id];
        if (upstreamResult != null) return upstreamResult;

        return vendorChunks(id);
      };

      return opts;
    },
  };
}

function vendorChunks(id: string): string | undefined {
  if (!id.includes("node_modules")) return undefined;

  // React runtime — rarely changes; maximise cache lifetime.
  if (id.includes("/react-dom/") || id.includes("/react/") || id.includes("/scheduler/")) {
    return "vendor-react";
  }

  // Full Supabase SDK (auth-js, postgrest-js, storage-js, realtime-js, phoenix…).
  if (id.includes("@supabase/")) {
    return "vendor-supabase";
  }

  // Zod schema validation.
  if (id.includes("/zod/")) {
    return "vendor-zod";
  }

  // Radix UI primitives + Lucide icons (many small files → one chunk for better caching).
  if (id.includes("@radix-ui/") || id.includes("lucide-react")) {
    return "vendor-ui";
  }

  // Recharts + D3 helpers.
  if (id.includes("/recharts/") || id.includes("/d3-") || id.includes("/victory-vendor/")) {
    return "vendor-charts";
  }
}
