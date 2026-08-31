import * as React from "react";
import { cn } from "@/lib/utils";
import { ChevronUp, ChevronDown, ChevronsUpDown } from "lucide-react";

export interface Column<T> {
  key: keyof T;
  header: string;
  sortable?: boolean;
  className?: string;
}

export interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  onSort?: (key: keyof T, direction: 'asc' | 'desc') => void;
  sortKey?: keyof T;
  sortDirection?: 'asc' | 'desc';
  rowClassName?: (row: T, index: number) => string;
  emptyMessage?: string;
}

function DataTable<T>({
  data,
  columns,
  onSort,
  sortKey,
  sortDirection,
  rowClassName,
  emptyMessage = "Nenhum dado disponível",
}: DataTableProps<T>) {
  const handleSort = (key: keyof T) => {
    if (!onSort) return;
    
    const newDirection = sortKey === key && sortDirection === 'asc' ? 'desc' : 'asc';
    onSort(key, newDirection);
  };

  const getSortIcon = (key: keyof T) => {
    if (sortKey !== key) {
      return <ChevronsUpDown className="h-4 w-4 opacity-50" />;
    }
    return sortDirection === 'asc' 
      ? <ChevronUp className="h-4 w-4 animate-fade-in" />
      : <ChevronDown className="h-4 w-4 animate-fade-in" />;
  };

  return (
    <div className="w-full overflow-x-auto rounded-2xl border border-border bg-card shadow-card">
      <table className="w-full">
        <thead className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm border-b border-border">
          <tr>
            {columns.map((column) => (
              <th
                key={String(column.key)}
                className={cn(
                  "px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-deep/70",
                  column.sortable && "cursor-pointer hover:text-deep hover:bg-secondary/30 transition-colors group",
                  column.className
                )}
                onClick={() => column.sortable && handleSort(column.key)}
              >
                <div className="flex items-center gap-2">
                  {column.header}
                  {column.sortable && (
                    <span className="inline-flex transition-transform group-hover:scale-110">
                      {getSortIcon(column.key)}
                    </span>
                  )}
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-border/50">
          {data.length === 0 ? (
            <tr>
              <td
                colSpan={columns.length}
                className="px-4 py-12 text-center text-muted-foreground"
              >
                {emptyMessage}
              </td>
            </tr>
          ) : (
            data.map((row, index) => (
              <tr
                key={index}
                className={cn(
                  "hover:bg-secondary/30 transition-colors cursor-default animate-fade-in",
                  rowClassName?.(row, index)
                )}
                style={{ animationDelay: `${index * 30}ms` }}
              >
                {columns.map((column) => (
                  <td
                    key={String(column.key)}
                    className={cn("px-4 py-3 text-sm text-foreground/90", column.className)}
                  >
                    {String(row[column.key] ?? '')}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

DataTable.displayName = "DataTable";

export { DataTable };
