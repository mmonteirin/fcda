import { mkdir, writeFile } from "node:fs/promises";
import { readFile } from "node:fs/promises";

const siteUrl = (process.env.SITE_URL || "https://fcda.org.br").replace(/\/$/, "");
const [dotenvConfig, cloudflareVars] = await Promise.all([
  readFile(".env", "utf8").catch(() => ""),
  readFile(".dev.vars", "utf8").catch(() => ""),
]);
const readConfigValue = (...names: string[]) => {
  for (const name of names) {
    const value = [
      process.env[name],
      ...[dotenvConfig, cloudflareVars].map((file) =>
        file
          .split(/\r?\n/)
          .find((line) => line.startsWith(`${name}=`))
          ?.slice(name.length + 1),
      ),
    ].find(Boolean);
    if (value) return value.trim().replace(/^['"]|['"]$/g, "");
  }
  return undefined;
};
const supabaseUrl =
  readConfigValue("VITE_SUPABASE_URL", "SUPABASE_URL") ||
  "https://ucesipxemhrugmqwxtei.supabase.co";
const supabaseKey = readConfigValue(
  "VITE_SUPABASE_PUBLISHABLE_KEY",
  "SUPABASE_PUBLISHABLE_KEY",
  "VITE_SUPABASE_ANON_KEY",
  "SUPABASE_ANON_KEY",
);
const staticPaths = [
  "/",
  "/sobre",
  "/modalidades",
  "/eventos",
  "/clubes",
  "/noticias",
  "/cursos",
  "/transparencia",
  "/transparencia/atletas",
  "/rankings",
  "/ranking-temporada-2026",
  "/recordes",
  "/inscricoes",
  "/filie-se",
  "/contato",
  "/antidopagem",
];

async function fetchValues(table: string, column: string, publishedOnly = true) {
  if (!supabaseKey) return [] as string[];
  const publishedFilter = publishedOnly ? "&publicado=eq.true" : "";
  try {
    const response = await fetch(
      `${supabaseUrl}/rest/v1/${table}?select=${column}${publishedFilter}`,
      { headers: { apikey: supabaseKey, Authorization: `Bearer ${supabaseKey}` } },
    );
    if (!response.ok) return [] as string[];
    const rows = (await response.json()) as Array<Record<string, string | null>>;
    return rows.map((row) => row[column]).filter((value): value is string => Boolean(value));
  } catch {
    return [] as string[];
  }
}

const [noticiaSlugs, eventoIds, rankingIds, cursoIds] = await Promise.all([
  fetchValues("noticias", "slug"),
  fetchValues("eventos", "id", false),
  fetchValues("rankings", "id"),
  fetchValues("cursos", "id"),
]);
const paths = [
  ...staticPaths,
  ...noticiaSlugs.map((slug) => `/noticias/${encodeURIComponent(slug)}`),
  ...eventoIds.map((id) => `/eventos/${encodeURIComponent(id)}`),
  ...rankingIds.map((id) => `/rankings/${encodeURIComponent(id)}`),
  ...cursoIds.map((id) => `/cursos/${encodeURIComponent(id)}`),
];
const urls = paths.map((path) => `  <url><loc>${siteUrl}${path}</loc></url>`).join("\n");
const sitemap = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`;

await mkdir("public", { recursive: true });
await writeFile("public/sitemap.xml", sitemap, "utf8");
console.log(`Sitemap gerado com ${paths.length} URLs.`);
