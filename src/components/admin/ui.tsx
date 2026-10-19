import { type ReactNode } from "react";
import { Pencil, Trash2, Plus, X, ChevronRight, Home } from "lucide-react";
import { inputClass } from "./utils";
import { Link } from "@tanstack/react-router";

const PAGE_DESCRIPTIONS: Record<string, string> = {
  Dashboard: "Acompanhe os indicadores e acesse as principais áreas de gestão.",
  Notícias: "Gerencie as publicações e atualizações do portal da FCDA.",
  Competições: "Organize o calendário oficial e as informações das provas.",
  Clubes: "Mantenha atualizados os dados das entidades filiadas.",
  Cursos: "Gerencie cursos, capacitações, datas e inscrições.",
  Mensagens: "Leia e organize as mensagens recebidas pelo site.",
  Inscrições: "Analise solicitações de filiação e vinculação de clubes.",
  Recordes: "Atualize as marcas oficiais homologadas pela Federação.",
  Rankings: "Consolide e publique as classificações das temporadas.",
  Usuários: "Gerencie contas, funções e permissões de acesso.",
  Transparência: "Publique documentos e informações institucionais.",
};
const CREATE_LABELS: Record<string, string> = {
  Notícias: "Nova notícia",
  Competições: "Novo evento",
  Clubes: "Novo clube",
  Cursos: "Novo curso",
  Usuários: "Novo usuário",
  Rankings: "Novo ranking",
  Recordes: "Novo recorde",
  Parceiros: "Novo parceiro",
  Diretoria: "Novo membro",
  Categorias: "Nova categoria",
  Modalidades: "Nova modalidade",
  Transparência: "Novo documento",
};

export function AdminToolbar({
  title,
  onNew,
  breadcrumbs,
  description,
}: {
  title: string;
  onNew?: () => void;
  breadcrumbs?: Array<{ label: string; to?: string }>;
  description?: string;
}) {
  return (
    <header className="mb-7">
      {breadcrumbs && breadcrumbs.length > 0 && (
        <nav aria-label="Trilha de navegação" className="mb-4 flex flex-wrap items-center gap-1.5 text-xs font-medium text-muted-foreground">
          <Link to="/admin" className="inline-flex items-center gap-1.5 rounded-md px-1.5 py-1 transition hover:bg-secondary hover:text-primary">
            <Home aria-hidden="true" className="h-3.5 w-3.5" /> Painel
          </Link>
          {breadcrumbs.filter((crumb) => crumb.label !== "Dashboard").map((crumb, index) => (
            <span key={`${crumb.label}-${index}`} className="inline-flex items-center gap-1.5">
              <ChevronRight aria-hidden="true" className="h-3.5 w-3.5 opacity-50" />
              {crumb.to && crumb.label !== title ? (
                <Link to={crumb.to} className="rounded-md px-1.5 py-1 transition hover:bg-secondary hover:text-primary">{crumb.label}</Link>
              ) : <span aria-current="page" className="px-1.5 py-1 text-foreground">{crumb.label}</span>}
            </span>
          ))}
        </nav>
      )}
      <div className="flex flex-col gap-5 rounded-2xl border border-border/80 bg-card p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between sm:p-6">
        <div className="min-w-0">
          <div className="mb-2 flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.18em] text-primary">
            <span className="h-1.5 w-1.5 rounded-full bg-primary" /> Administração FCDA
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-deep dark:text-white sm:text-3xl">{title}</h1>
          <p className="mt-1.5 max-w-2xl text-sm leading-6 text-muted-foreground">{description ?? PAGE_DESCRIPTIONS[title] ?? `Gerencie ${title.toLocaleLowerCase()} do portal da FCDA.`}</p>
        </div>
        {onNew && <button type="button" onClick={onNew} className="inline-flex min-h-11 shrink-0 items-center justify-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-bold text-primary-foreground shadow-sm transition hover:-translate-y-0.5 hover:bg-deep hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 motion-reduce:transition-none"><Plus aria-hidden="true" className="h-4 w-4" /> {CREATE_LABELS[title] ?? "Novo cadastro"}</button>}
      </div>
    </header>
  );
}

export function AdminTable({ children }: { children: ReactNode }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-border/80 bg-card shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[640px] text-sm">{children}</table>
      </div>
    </div>
  );
}

export function RowActions({ onEdit, onDelete, confirmMessage = "Tem certeza que deseja excluir este item?" }: { onEdit: () => void; onDelete: () => void; confirmMessage?: string }) {
  return (
    <div className="flex items-center justify-end gap-1">
      <button type="button" onClick={onEdit} className="rounded-lg p-2 text-muted-foreground transition hover:bg-primary/10 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary" title="Editar" aria-label="Editar item">
        <Pencil aria-hidden="true" className="h-4 w-4" />
      </button>
      <button type="button" onClick={() => { if (window.confirm(confirmMessage)) onDelete(); }} className="rounded-lg p-2 text-muted-foreground transition hover:bg-destructive/10 hover:text-destructive focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-destructive" title="Excluir" aria-label="Excluir item">
        <Trash2 aria-hidden="true" className="h-4 w-4" />
      </button>
    </div>
  );
}

export function Modal({ open, onClose, title, children }: { open: boolean; onClose: () => void; title: string; children: ReactNode }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 grid place-items-center overflow-y-auto bg-slate-950/55 p-4 backdrop-blur-sm" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }} onKeyDown={(event) => { if (event.key === "Escape") onClose(); }}>
      <section role="dialog" aria-modal="true" aria-labelledby="admin-dialog-title" className="my-auto max-h-[min(90vh,900px)] w-full max-w-2xl overflow-y-auto rounded-2xl border border-border bg-card shadow-2xl">
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-border bg-card/95 px-5 py-4 backdrop-blur sm:px-6">
          <div><p className="text-[10px] font-bold uppercase tracking-[0.16em] text-primary">FCDA · Administração</p><h2 id="admin-dialog-title" className="mt-1 text-lg font-bold text-deep dark:text-white sm:text-xl">{title}</h2></div>
          <button type="button" onClick={onClose} className="rounded-lg p-2 text-muted-foreground transition hover:bg-secondary hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary" aria-label="Fechar janela"><X aria-hidden="true" className="h-5 w-5" /></button>
        </div>
        <div className="p-5 sm:p-6">{children}</div>
      </section>
    </div>
  );
}

export function Field({ label, children }: { label: string; children: ReactNode }) {
  return <label className="block"><span className="text-xs font-bold uppercase tracking-[0.1em] text-muted-foreground">{label}</span><div className="mt-2">{children}</div></label>;
}

export { inputClass };
