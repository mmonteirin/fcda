import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { SiteLayout } from "@/components/site/SiteLayout";
import {
  modalidadesQuery,
  categoriasModalidadesQuery,
  modalidadeImg,
  type CategoriaModalidade,
} from "@/lib/site-queries";

export const Route = createFileRoute("/modalidades")({
  head: () => ({
    meta: [
      { title: "Modalidades — FCDA" },
      {
        name: "description",
        content:
          "Natação, polo aquático, saltos ornamentais, nado artístico e maratona aquática no Ceará.",
      },
    ],
  }),
  loader: ({ context }) =>
    Promise.all([
      context.queryClient.ensureQueryData(modalidadesQuery),
      context.queryClient.ensureQueryData(categoriasModalidadesQuery),
    ]),
  errorComponent: ({ error }) => <div className="p-12 text-destructive">Erro: {error.message}</div>,
  component: Modalidades,
});

function Modalidades() {
  const modalidades = useSuspenseQuery(modalidadesQuery).data;
  const categorias = useSuspenseQuery(categoriasModalidadesQuery).data;

  // Group modalidades by categoria
  const modalidadesByCategoria = categorias.reduce(
    (acc, cat) => {
      acc[cat.id] = modalidades.filter((m) => m.categoria_id === cat.id);
      return acc;
    },
    {} as Record<string, typeof modalidades>,
  );
  const modalidadesSemCategoria = modalidades.filter((m) => !m.categoria_id);

  return (
    <SiteLayout>
      <section className="py-24 bg-hero text-primary-foreground">
        <div className="mx-auto max-w-5xl px-6">
          <div className="text-xs uppercase tracking-[0.25em] text-gold font-bold">
            Modalidades oficiais
          </div>
          <h1 className="mt-4 text-5xl md:text-6xl font-bold">
            Cinco esportes.
            <br />
            Uma água só.
          </h1>
          <p className="mt-6 text-lg text-primary-foreground/80 max-w-2xl">
            Da explosão da natação ao silêncio coreografado do nado artístico — conheça as
            modalidades reconhecidas e administradas pela FCDA.
          </p>
        </div>
      </section>

      <section className="py-24">
        <div className="mx-auto max-w-7xl px-6">
          {categorias.map((cat) => {
            const catModalidades = modalidadesByCategoria[cat.id] || [];
            if (catModalidades.length === 0) return null;
            return (
              <div key={cat.id} className="mb-24">
                <div className="mb-8">
                  <h2 className="text-3xl font-bold text-deep">{cat.nome}</h2>
                  {cat.descricao && <p className="mt-2 text-muted-foreground">{cat.descricao}</p>}
                </div>
                <div className="space-y-24">
                  {catModalidades.map((m, i) => (
                    <article
                      key={m.id}
                      className={`grid md:grid-cols-2 gap-12 items-center ${i % 2 === 1 ? "md:[&>:first-child]:order-2" : ""}`}
                    >
                      <div className="relative overflow-hidden rounded-2xl shadow-elegant">
                        <img
                          src={modalidadeImg(m)}
                          alt={m.nome}
                          loading="lazy"
                          className="w-full aspect-[4/3] object-cover"
                        />
                      </div>
                      <div>
                        <div className="text-7xl font-bold text-gold/30 leading-none">0{i + 1}</div>
                        <h2 className="mt-2 text-4xl md:text-5xl font-bold text-deep">{m.nome}</h2>
                        <p className="mt-5 text-lg text-muted-foreground leading-relaxed">
                          {m.descricao}
                        </p>
                        <div className="mt-6">
                          <span className="text-xs font-bold uppercase tracking-wider px-3 py-1.5 rounded-full bg-secondary text-deep border border-border">
                            {cat.nome}
                          </span>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              </div>
            );
          })}
          {modalidadesSemCategoria.length > 0 && (
            <div className="mb-24">
              <div className="mb-8">
                <h2 className="text-3xl font-bold text-deep">Outras modalidades</h2>
              </div>
              <div className="space-y-24">
                {modalidadesSemCategoria.map((m, i) => (
                  <article
                    key={m.id}
                    className={`grid md:grid-cols-2 gap-12 items-center ${i % 2 === 1 ? "md:[&>:first-child]:order-2" : ""}`}
                  >
                    <div className="relative overflow-hidden rounded-2xl shadow-elegant">
                      <img
                        src={modalidadeImg(m)}
                        alt={m.nome}
                        loading="lazy"
                        className="w-full aspect-[4/3] object-cover"
                      />
                    </div>
                    <div>
                      <div className="text-7xl font-bold text-gold/30 leading-none">0{i + 1}</div>
                      <h2 className="mt-2 text-4xl md:text-5xl font-bold text-deep">{m.nome}</h2>
                      <p className="mt-5 text-lg text-muted-foreground leading-relaxed">
                        {m.descricao}
                      </p>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>
    </SiteLayout>
  );
}
