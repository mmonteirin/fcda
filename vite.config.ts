// @lovable.dev/vite-tanstack-config already includes the following — do NOT add them manually
// or the app will break with duplicate plugins:
//   - tanstackStart, viteReact, tailwindcss, tsConfigPaths, cloudflare (build-only),
//     componentTagger (dev-only), VITE_* env injection, @ path alias, React/TanStack dedupe,
//     error logger plugins, and sandbox detection (port/host/strictPort).
// You can pass additional config via defineConfig({ vite: { ... } }) if needed.
import { defineConfig } from "@lovable.dev/vite-tanstack-config";
import type { Plugin } from "vite";

// Redirect TanStack Start's bundled server entry to src/server.ts (our SSR error wrapper).
// @cloudflare/vite-plugin builds from this — wrangler.jsonc main alone is insufficient.
export default defineConfig({
  tanstackStart: {
    server: { entry: "server" },
  },
  vite: {
    plugins: [vendorChunkPlugin()],
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
