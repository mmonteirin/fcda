import { type ReactNode } from "react";
import { Pencil, Trash2, Plus, X } from "lucide-react";
import { inputClass } from "./utils";

export function AdminToolbar({ title, onNew }: { title: string; onNew?: () => void }) {
  return (
    <div className="flex items-center justify-between mb-6">
      <h1 className="text-3xl font-bold text-deep">{title}</h1>
      {onNew && (
        <button
          onClick={onNew}
          className="inline-flex items-center gap-2 rounded-lg bg-deep text-deep-foreground font-bold text-sm px-4 py-2 hover:bg-primary"
        >
          <Plus className="h-4 w-4" /> Novo
        </button>
      )}
    </div>
  );
}

export function AdminTable({ children }: { children: ReactNode }) {
  return (
    <div className="rounded-2xl bg-card border border-border overflow-hidden shadow-card">
      <table className="w-full text-sm">{children}</table>
    </div>
  );
}

export function RowActions({ onEdit, onDelete }: { onEdit: () => void; onDelete: () => void }) {
  return (
    <div className="flex items-center justify-end gap-1">
      <button onClick={onEdit} className="p-2 rounded-md hover:bg-secondary" title="Editar">
        <Pencil className="h-4 w-4 text-deep" />
      </button>
      <button
        onClick={() => {
          if (confirm("Tem certeza que deseja excluir este item?")) onDelete();
        }}
        className="p-2 rounded-md hover:bg-destructive/10"
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
    <div className="fixed inset-0 z-50 grid place-items-center bg-deep/40 p-4" onClick={onClose}>
      <div
        className="w-full max-w-2xl rounded-2xl bg-card border border-border shadow-elegant max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-border px-6 py-4 sticky top-0 bg-card">
          <h2 className="text-lg font-bold text-deep">{title}</h2>
          <button onClick={onClose} className="p-2 rounded-md hover:bg-secondary">
            <X className="h-4 w-4" />
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
