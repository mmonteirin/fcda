import { type ReactNode } from "react";
import { Pencil, Trash2, Plus, X, ChevronRight, Home } from "lucide-react";
import { inputClass } from "./utils";
import { Link } from "@tanstack/react-router";

export function AdminToolbar({ title, onNew, breadcrumbs }: { title: string; onNew?: () => void; breadcrumbs?: Array<{ label: string; to?: string }> }) {
  return (
    <div className="mb-8">
      {breadcrumbs && breadcrumbs.length > 0 && (
        <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
          <Link to="/admin" className="hover:text-primary transition-colors flex items-center gap-1">
            <Home className="h-4 w-4" />
            Dashboard
          </Link>
          {breadcrumbs.map((crumb, index) => (
            <div key={index} className="flex items-center gap-2">
              <ChevronRight className="h-4 w-4" />
              {crumb.to ? (
                <Link to={crumb.to} className="hover:text-primary transition-colors">
                  {crumb.label}
                </Link>
              ) : (
                <span className="text-deep font-medium">{crumb.label}</span>
              )}
            </div>
          ))}
        </nav>
      )}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-deep dark:text-white">{title}</h1>
        </div>
        {onNew && (
          <button
            onClick={onNew}
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-primary to-primary/90 text-white font-bold text-sm px-5 py-2.5 hover:shadow-lg hover:shadow-primary/25 transition-all hover:-translate-y-0.5"
          >
            <Plus className="h-4 w-4" /> Novo
          </button>
        )}
      </div>
    </div>
  );
}

export function AdminTable({ children }: { children: ReactNode }) {
  return (
    <div className="rounded-2xl bg-white dark:bg-slate-900 border border-border overflow-hidden shadow-sm">
      <table className="w-full text-sm">{children}</table>
    </div>
  );
}

export function RowActions({ onEdit, onDelete }: { onEdit: () => void; onDelete: () => void }) {
  return (
    <div className="flex items-center justify-end gap-1">
      <button onClick={onEdit} className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors" title="Editar">
        <Pencil className="h-4 w-4 text-deep dark:text-white" />
      </button>
      <button
        onClick={() => {
          if (confirm("Tem certeza que deseja excluir este item?")) onDelete();
        }}
        className="p-2 rounded-lg hover:bg-destructive/10 transition-colors"
        title="Excluir"
      >
        <Trash2 className="h-4 w-4 text-destructive" />
      </button>
    </div>
  );
}

export function Modal({
  open,
  onClose,
  title,
  children,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
}) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-deep/50 backdrop-blur-sm p-4" onClick={onClose}>
      <div
        className="w-full max-w-2xl rounded-2xl bg-white dark:bg-slate-900 border border-border shadow-2xl max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-border px-6 py-4 sticky top-0 bg-white dark:bg-slate-900">
          <h2 className="text-xl font-bold text-deep dark:text-white">{title}</h2>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}

export function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="block">
      <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        {label}
      </span>
      <div className="mt-1">{children}</div>
    </label>
  );
}
