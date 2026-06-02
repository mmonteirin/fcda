import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { SiteLayout } from "@/components/site/SiteLayout";
import { Target, Eye, Heart, Award } from "lucide-react";
import hero from "@/assets/mod-natacao.jpg";
import { diretoresQuery } from "@/lib/site-queries";

export const Route = createFileRoute("/sobre")({
  head: () => ({
    meta: [
      { title: "A Federação — FCDA" },
      {
        name: "description",
        content:
          "Conheça a história, missão e diretoria da Federação Cearense de Desportos Aquáticos.",
      },
    ],
  }),
  loader: ({ context }) => context.queryClient.ensureQueryData(diretoresQuery),
  errorComponent: ({ error }) => <div className="p-12 text-destructive">Erro: {error.message}</div>,
  component: Sobre,
});

function Sobre() {
  const diretores = useSuspenseQuery(diretoresQuery).data;

  return (
    <SiteLayout>
      <section className="relative py-32 bg-hero text-primary-foreground overflow-hidden">
        <img src={hero} alt="" className="absolute inset-0 h-full w-full object-cover opacity-25" />
        <div className="relative mx-auto max-w-5xl px-6 text-center">
          <div className="text-xs uppercase tracking-[0.25em] text-gold font-bold">
            Institucional
          </div>
          <h1 className="mt-4 text-5xl md:text-6xl font-bold">A Federação</h1>
          <p className="mt-6 text-lg text-primary-foreground/80 max-w-2xl mx-auto">
            Há mais de seis décadas dedicada ao desenvolvimento dos desportos aquáticos no Ceará.
          </p>
        </div>
      </section>

      <section className="py-24">
        <div className="mx-auto max-w-5xl px-6 grid md:grid-cols-2 gap-16 items-center">
          <div>
            <div className="text-xs uppercase tracking-[0.2em] text-primary font-bold">
              Nossa história
            </div>
            <h2 className="mt-3 text-4xl font-bold text-deep">
              Fundada em 1958,
              <br />
              escrita em ouro.
            </h2>
          </div>
          <div className="space-y-5 text-muted-foreground leading-relaxed">
            <p>
              A Federação Cearense de Desportos Aquáticos (FCDA) é a entidade oficial responsável
              pela administração, organização e desenvolvimento das modalidades aquáticas no estado
              do Ceará.
            </p>
            <p>
              Filiada à Confederação Brasileira de Desportos Aquáticos (CBDA), congrega clubes,
              atletas e técnicos de todo o estado, organizando competições oficiais e promovendo a
              formação esportiva nas categorias de base ao alto rendimento.
            </p>
            <p>
              Ao longo de mais de 60 anos, formou gerações de atletas que representaram o Ceará em
              competições nacionais e internacionais, consolidando a posição do estado entre as
              principais forças do esporte aquático do Norte e Nordeste do Brasil.
            </p>
          </div>
        </div>
      </section>

      <section className="py-24 bg-secondary/50">
        <div className="mx-auto max-w-7xl px-6 grid md:grid-cols-3 gap-6">
          {[
            {
              icon: Target,
              title: "Missão",
              desc: "Ser responsável em gerenciar, promover e fomentar a prática dos desportos aquáticos desde a iniciação até o alto rendimento, incluindo a natação estudantil, universitária e de cunho social no Estado do Ceará.",
            },
            {
              icon: Eye,
              title: "Visão",
              desc: "Ser referência e líder nos Esportes Aquáticos no Ceará, tornando-se uma federação reconhecida nacionalmente por eficiência e organização.",
            },
            {
              icon: Heart,
              title: "Valores",
              desc: "Dar suporte institucional à prática desportiva de forma responsável e ética. Gerir o desporto aquático com transparência e publicidade.",
            },
          ].map((v) => (
            <div
              key={v.title}
              className="rounded-2xl bg-card p-8 shadow-card border border-border/60"
            >
              <div className="h-12 w-12 rounded-xl bg-gold-gradient grid place-items-center text-deep">
                <v.icon className="h-5 w-5" />
              </div>
              <h3 className="mt-6 text-2xl font-bold text-deep">{v.title}</h3>
              <p className="mt-3 text-muted-foreground leading-relaxed">{v.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="py-24">
        <div className="mx-auto max-w-5xl px-6">
          <div className="text-xs uppercase tracking-[0.2em] text-primary font-bold">Diretoria</div>
          <h2 className="mt-3 text-4xl font-bold text-deep">Quem conduz a federação</h2>
          {diretores.length === 0 ? (
            <p className="mt-8 text-muted-foreground">Diretoria a ser publicada.</p>
          ) : (
            <div className="mt-12 grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {diretores.map((d) => (
                <div key={d.id} className="rounded-xl border border-border bg-card p-5">
                  <Award className="h-5 w-5 text-gold" />
                  <div className="mt-4 text-xs uppercase tracking-wider text-muted-foreground">
                    {d.cargo}
                  </div>
                  <div className="mt-1 font-bold text-deep">{d.nome}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </SiteLayout>
  );
}
