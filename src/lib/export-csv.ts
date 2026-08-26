/**
 * Export array of objects to CSV with UTF-8 BOM for full Microsoft Excel / Google Sheets compatibility.
 */
export function exportToCSV<T extends object>(
  filename: string,
  headers: { key: keyof T | string; label: string }[],
  data: T[],
) {
  if (!data || data.length === 0) return;

  const headerRow = headers.map((h) => `"${h.label.replace(/"/g, '""')}"`).join(";");

  const rows = data.map((item) => {
    return headers
      .map((h) => {
        const val = (item as Record<string, unknown>)[String(h.key)];
        if (val === null || val === undefined) return '""';
        const strVal = String(val).replace(/"/g, '""');
        return `"${strVal}"`;
      })
      .join(";");
  });

  // \uFEFF is UTF-8 Byte Order Mark for Excel
  const csvContent = "\uFEFF" + [headerRow, ...rows].join("\r\n");
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", `${filename}_${new Date().toISOString().slice(0, 10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
