import * as XLSX from "xlsx";
import { createClient } from "@supabase/supabase-js";

const url = process.env.VITE_SUPABASE_URL || "https://ucesipxemhrugmqwxtei.supabase.co";
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
const base = "/Users/marcosmonteirodacruz/Downloads";
const files = [
  { file: `${base}/Confederados - Natação.xlsx`, vinculo: "confederado" as const },
  { file: `${base}/Vinculados - Natação.xlsx`, vinculo: "vinculado" as const },
];

if (!key) {
  console.error("Defina SUPABASE_SERVICE_ROLE_KEY antes de importar os atletas.");
  process.exit(1);
}
const supabase = createClient(url, key);
type Athlete = { registro: string; nome: string; clube: string; data_nascimento: string | null; vinculo: "confederado" | "vinculado"; status: string };

function date(value: unknown) {
  if (value instanceof Date && !Number.isNaN(value.getTime())) return value.toISOString().slice(0, 10);
  if (typeof value === "number") {
    const parsed = XLSX.SSF.parse_date_code(value);
    return parsed ? `${parsed.y}-${String(parsed.m).padStart(2, "0")}-${String(parsed.d).padStart(2, "0")}` : null;
  }
  return null;
}
function read(file: string, vinculo: Athlete["vinculo"]): Athlete[] {
  const sheet = XLSX.readFile(file).Sheets["Planilha1"] ?? XLSX.readFile(file).Sheets[XLSX.readFile(file).SheetNames[0]];
  const rows = XLSX.utils.sheet_to_json<unknown[]>(sheet, { header: 1, raw: true }).slice(2);
  return rows.map((row) => ({ registro: String(row[0] ?? "").trim(), nome: String(row[2] ?? "").replace(/\n.*/s, "").trim(), clube: String(row[3] ?? "").trim(), data_nascimento: date(row[4]), vinculo, status: String(row[6] ?? "ATIVO").trim() || "ATIVO" })).filter((item) => item.registro && item.nome && item.clube);
}
async function main() {
  const athletes = files.flatMap(({ file, vinculo }) => read(file, vinculo));
  const { error } = await supabase.from("atletas_transparencia").upsert(athletes, { onConflict: "registro" });
  if (error) throw error;
  console.log(`${athletes.length} atletas importados/atualizados com sucesso.`);
}
main().catch((error) => { console.error(error.message ?? error); process.exit(1); });
