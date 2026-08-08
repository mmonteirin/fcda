import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { AdminToolbar } from "@/components/admin/ui";

type Recorde = {
  id: string;
  prova: string;
  tempo: string;
  atleta: string;
  clube: string;
  data: string;
  categoria: string;
  piscina: string;
};

const provas = [
  "50m Livre",
  "100m Livre",
  "200m Livre",
  "400m Livre",
  "800m Livre",
  "1500m Livre",
  "50m Costas",
  "100m Costas",
  "200m Costas",
  "50m Peito",
  "100m Peito",
  "200m Peito",
  "50m Borboleta",
  "100m Borboleta",
  "200m Borboleta",
  "100m Medley",
  "200m Medley",
  "400m Medley",
  "Revezamento 4x50m Livre",
  "Revezamento 4x100m Livre",
  "Revezamento 4x200m Livre",
  "Revezamento 4x50m Medley",
  "Revezamento 4x100m Medley",
];
const vazio = {
  piscina: "olimpica",
  sexo: "masculino",
  prova: provas[0],
  atleta_nome: "",
  foto_url: "",
  marca: "",
  ano_estabelecimento: new Date().getFullYear(),
  publicado: true,
};
export const Route = createFileRoute("/_authenticated/admin/recordes")({
  component: AdminRecordes,
});
function AdminRecordes() {
  const [itens, setItens] = useState<Record<string, unknown>[]>([]);
  const [form, setForm] = useState<Record<string, unknown>>(vazio);
  const [open, setOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const load = () => {
    (
      supabase as unknown as {
        from: (table: string) => {
          select: (columns: string) => {
            order: (column: string) => {
              then: <T>(resolve: (value: T) => unknown) => Promise<T>;
            };
          };
        };
      }
    )
      .from("recordes")
      .select("*")
      .order("prova")
      .then(({ data }: { data: unknown }) => setItens((data as Record<string, unknown>[]) ?? []));
  };
  useEffect(load, []);
  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    const db = supabase as unknown as {
      from: (table: string) => {
        insert: (data: Record<string, unknown>) => {
          then: <T>(resolve: (value: T) => unknown) => Promise<T>;
        };
        update: (data: Record<string, unknown>) => {
          eq: (
            column: string,
            value: unknown,
          ) => {
            then: <T>(resolve: (value: T) => unknown) => Promise<T>;
          };
        };
      };
    };
    const { error } = (form.id as string)
      ? await db
          .from("recordes")
          .update(form)
          .eq("id", form.id as string)
      : await db.from("recordes").insert(form);
    if (!error) {
      setOpen(false);
      setForm(vazio);
      load();
    }
  };
  const uploadFoto = async (file: File) => {
    if (!file.type.startsWith("image/")) return;
    setUploading(true);
    const extension = file.name.split(".").pop() || "jpg";
    const path = `recordes/${crypto.randomUUID()}.${extension}`;
    const { error } = await supabase.storage
      .from("site-images")
      .upload(path, file, { upsert: false });
    if (!error) {
      const { data } = supabase.storage.from("site-images").getPublicUrl(path);
      setForm({ ...form, foto_url: data.publicUrl });
    }
    setUploading(false);
  };
  return (
    <div className="space-y-6">
      <AdminToolbar 
        title="Recordes" 
        breadcrumbs={[
          { label: "Dashboard", to: "/admin" },
          { label: "Recordes", to: "/admin/recordes" }
        ]}
        onNew={() => {
          setForm(vazio);
          setOpen(true);
        }}
      />
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {itens.map((i) => (
          <button
            key={i.id}
            onClick={() => {
              setForm(i);
              setOpen(true);
            }}
            className="rounded-xl border border-border bg-card p-4 text-left"
          >
            <b>{i.prova}</b>
            <span className="mt-1 block text-sm text-muted-foreground">
              {i.atleta_nome} · {i.marca}
            </span>
          </button>
        ))}
      </div>
      {open && (
        <div className="fixed inset-0 z-50 overflow-auto bg-deep/40 p-6">
          <form onSubmit={save} className="mx-auto max-w-xl space-y-3 rounded-2xl bg-card p-6">
            <h2 className="text-xl font-bold text-deep">Recorde</h2>
            {[
              ["atleta_nome", "Atleta"],
              ["marca", "Marca"],
            ].map(([k, l]) => (
              <label key={k} className="block text-sm font-semibold">
                {l}
                <input
                  required={k !== "foto_url"}
                  value={form[k] ?? ""}
                  onChange={(e) => setForm({ ...form, [k]: e.target.value })}
                  className="mt-1 w-full rounded border p-2"
                />
              </label>
            ))}
            <label className="block text-sm font-semibold">
              Foto 3×4 do atleta
              <input
                type="file"
                accept="image/*"
                onChange={(e) => e.target.files?.[0] && uploadFoto(e.target.files[0])}
                className="mt-1 block w-full text-sm"
              />
              {uploading && (
                <span className="mt-1 block text-xs text-muted-foreground">Enviando foto...</span>
              )}
              {form.foto_url && (
                <img
                  src={form.foto_url}
                  alt="Prévia"
                  className="mt-3 h-32 w-24 rounded-lg object-cover"
                />
              )}
            </label>
            <div className="grid grid-cols-2 gap-3">
              <select
                value={form.piscina}
                onChange={(e) => setForm({ ...form, piscina: e.target.value })}
                className="rounded border p-2"
              >
                <option value="olimpica">Olímpica</option>
                <option value="semiolimpica">Semiolímpica</option>
              </select>
              <select
                value={form.sexo}
                onChange={(e) => setForm({ ...form, sexo: e.target.value })}
                className="rounded border p-2"
              >
                <option value="masculino">Masculino</option>
                <option value="feminino">Feminino</option>
                <option value="misto">Misto</option>
              </select>
            </div>
            <select
              value={form.prova}
              onChange={(e) => setForm({ ...form, prova: e.target.value })}
              className="w-full rounded border p-2"
            >
              {provas.map((p) => (
                <option key={p}>{p}</option>
              ))}
            </select>
            <input
              type="number"
              value={form.ano_estabelecimento}
              onChange={(e) => setForm({ ...form, ano_estabelecimento: Number(e.target.value) })}
              className="w-full rounded border p-2"
            />
            <label className="block text-sm">
              <input
                type="checkbox"
                checked={form.publicado}
                onChange={(e) => setForm({ ...form, publicado: e.target.checked })}
              />{" "}
              Publicado
            </label>
            <div className="flex justify-end gap-2">
              <button type="button" onClick={() => setOpen(false)}>
                Cancelar
              </button>
              <button className="rounded bg-deep px-4 py-2 font-bold text-white">Salvar</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
