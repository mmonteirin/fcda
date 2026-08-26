import { mkdir, writeFile } from "node:fs/promises";

const siteUrl = (process.env.SITE_URL || "https://fcda.org.br").replace(/\/$/, "");
const supabaseUrl = process.env.VITE_SUPABASE_URL || "https://ucesipxemhrugmqwxtei.supabase.co";
const supabaseKey = process.env.VITE_SUPABASE_PUBLISHABLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;
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
];

async function fetchSlugs(table: string, column: string) {
  if (!supabaseKey) return [] as string[];
  const response = await fetch(
    `${supabaseUrl}/rest/v1/${table}?select=${column}&publicado=eq.true`,
    { headers: { apikey: supabaseKey, Authorization: `Bearer ${supabaseKey}` } },
  );
  if (!response.ok) return [] as string[];
  const rows = (await response.json()) as Array<Record<string, string | null>>;
  return rows.map((row) => row[column]).filter((value): value is string => Boolean(value));
}

const [noticiaSlugs, eventoIds] = await Promise.all([
  fetchSlugs("noticias", "slug"),
  fetchSlugs("eventos", "id"),
]);
const paths = [
  ...staticPaths,
  ...noticiaSlugs.map((slug) => `/noticias/${encodeURIComponent(slug)}`),
  ...eventoIds.map((id) => `/eventos/${encodeURIComponent(id)}`),
];
const urls = paths
  .map((path) => `  <url><loc>${siteUrl}${path}</loc></url>`)
  .join("\n");
const sitemap = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`;

await mkdir("public", { recursive: true });
await writeFile("public/sitemap.xml", sitemap, "utf8");
console.log(`Sitemap gerado com ${paths.length} URLs.`);