type ExportValue = string | number | boolean | null | undefined;
type ExportRow = Record<string, ExportValue>;

function download(content: string, filename: string, type: string) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

function escapeCsv(value: ExportValue) {
  const text = String(value ?? "").replaceAll('"', '""');
  return `"${text}"`;
}

export function exportCsv(filename: string, rows: ExportRow[]) {
  if (!rows.length) return;
  const columns = Object.keys(rows[0]);
  const csv = [
    columns.map(escapeCsv).join(";"),
    ...rows.map((row) => columns.map((key) => escapeCsv(row[key])).join(";")),
  ].join("\n");
  download(`\uFEFF${csv}`, filename, "text/csv;charset=utf-8");
}

export function printReport(title: string, rows: ExportRow[]) {
  if (!rows.length) return;
  const columns = Object.keys(rows[0]);
  const html = `<html><head><title>${title}</title><style>body{font-family:Arial,sans-serif;padding:24px;color:#073c2f}h1{font-size:22px}table{width:100%;border-collapse:collapse;font-size:12px}th,td{border:1px solid #d8ddd7;padding:8px;text-align:left}th{background:#eaf3ee}</style></head><body><h1>${title}</h1><p>Gerado em ${new Date().toLocaleString("pt-BR")}</p><table><thead><tr>${columns.map((column) => `<th>${column}</th>`).join("")}</tr></thead><tbody>${rows.map((row) => `<tr>${columns.map((column) => `<td>${String(row[column] ?? "")}</td>`).join("")}</tr>`).join("")}</tbody></table></body></html>`;
  const report = window.open("", "_blank", "noopener,noreferrer");
  if (!report) return;
  report.document.write(html);
  report.document.close();
  report.focus();
  report.print();
}
