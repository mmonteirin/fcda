import * as XLSX from "xlsx";

export function exportToXLSX<T extends object>(
  filename: string,
  headers: { key: keyof T | string; label: string }[],
  data: T[],
) {
  if (!data.length) return;

  const rows = data.map((item) =>
    Object.fromEntries(
      headers.map((header) => [header.label, (item as Record<string, unknown>)[String(header.key)] ?? ""]),
    ),
  );
  const worksheet = XLSX.utils.json_to_sheet(rows);
  worksheet["!cols"] = headers.map(({ label }) => ({ wch: Math.max(label.length + 2, 18) }));
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "FCDA");
  XLSX.writeFile(workbook, `${filename}_${new Date().toISOString().slice(0, 10)}.xlsx`);
}