import { createFileRoute } from "@tanstack/react-router";
import {
  Activity,
  ArrowUpRight,
  BookOpenCheck,
  ClipboardCheck,
  HeartPulse,
  ShieldCheck,
  Stethoscope,
  TestTube2,
} from "lucide-react";
import { SiteLayout } from "@/components/layout/SiteLayout";

const officialLinks = [
  {
    icon: BookOpenCheck,
    title: "Lista de Substâncias e Métodos Proibidos",
    description:
      "Consulte a lista vigente da AMA/WADA publicada pela ABCD. As regras podem variar conforme a substância, o período e a modalidade.",
    href: "https://www.gov.br/abcd/pt-br/composicao/atletas/substancias-e-metodos-proibidos",
    label: "Consultar a lista",
  },
  {
    icon: Stethoscope,
    title: "Medicamentos e Check Jogo Limpo",
    description:
      "Pesquise medicamentos registrados no Brasil. Confirme o resultado com a lista oficial e com um profissional de saúde; a consulta não substitui orientação médica.",
    href: "https://app.powerbi.com/view?r=eyJrIjoiNWMzNjhhNDctOTNjZC00ZWMyLWEzMzMtYTAwZjc4ZDc5ZWFhIiwidCI6ImI2N2FmMjNmLWMzZjMtNGQzNS04MGM3LWI3MDg1ZjVlZGQ4MSJ9",
    label: "Abrir Check Jogo Limpo",
  },
  {
    icon: HeartPulse,
    title: "Autorização de Uso Terapêutico (AUT)",
    description:
      "Se um tratamento necessário envolver substância ou método proibido, verifique com antecedência junto à ABCD se é preciso solicitar uma AUT.",
    href: "https://www.gov.br/abcd/pt-br/composicao/atletas/aut-1/aut",
    label: "Entender a AUT",
  },
  {
    icon: ClipboardCheck,
    title: "Direitos e deveres do atleta",
    description:
      "Saiba como se preparar para um controle, quais documentos apresentar e quais apoios ou adaptações podem ser solicitados.",
    href: "https://www.gov.br/abcd/pt-br/composicao/atletas/direitos-e-deveres-do-atleta",
    label: "Ler orientações da ABCD",
  },
  {
    icon: ShieldCheck,
    title: "Responsabilidade estrita",
    description:
      "O atleta deve conhecer as regras e cuidar do que ingere ou utiliza. Mantenha registros de medicamentos e suplementos e confira cada produto.",
    href: "https://www.gov.br/abcd/pt-br/composicao/atletas/responsabilidade-estrita",
    label: "Conhecer a regra",
  },
  {
    icon: Activity,
    title: "Educação antidopagem",
    description:
      "A ABCD reúne materiais educativos, cursos e informações para atletas e pessoas que apoiam sua preparação esportiva.",
    href: "https://www.gov.br/abcd/pt-br/composicao/atletas",
    label: "Acessar materiais",
  },
];

export const Route = createFileRoute("/antidopagem")({
  head: () => ({
    meta: [
      { title: "Antidopagem — FCDA" },
      {
        name: "description",
        content:
          "Orientações gerais de antidopagem para atletas, treinadores e clubes das modalidades aquáticas no Ceará, com links oficiais da ABCD.",
      },
    ],
  }),
  component: Antidopagem,
});

function ExternalLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-2 font-bold text-primary transition-colors hover:text-deep focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary"
    >
      {children}
      <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
      <span className="sr-only">(abre em nova aba)</span>
    </a>
  );
}

function Antidopagem() {
  return (
    <SiteLayout>
      <section className="relative overflow-hidden bg-hero py-20 text-primary-foreground md:py-28">
        <div className="pointer-events-none absolute -right-20 -top-24 h-80 w-80 rounded-full border-[40px] border-primary-foreground/5" />
        <div className="relative mx-auto max-w-7xl px-6">
          <p className="text-xs font-bold uppercase tracking-[0.25em] text-gold">
            Esporte limpo • Informação para todas as modalidades
          </p>
          <h1 className="mt-5 max-w-4xl text-4xl font-bold leading-tight md:text-6xl">
            Antidopagem nas modalidades aquáticas
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-relaxed text-primary-foreground/80">
            Um guia inicial para atletas, treinadores, equipes médicas e clubes da FCDA. Conheça
            suas responsabilidades e acesse as orientações oficiais da Autoridade Brasileira de
            Controle de Dopagem (ABCD).
          </p>
          <a
            href="#orientacoes"
            className="mt-8 inline-flex items-center gap-2 rounded-full bg-gold-gradient px-6 py-3 font-bold text-deep transition-transform hover:-translate-y-0.5"
          >
            Ver orientações <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
          </a>
        </div>
      </section>

      <section id="orientacoes" className="scroll-mt-24 py-16 md:py-20">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mb-10 max-w-3xl">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary">
              Informação e prevenção
            </p>
            <h2 className="mt-3 text-3xl font-bold text-deep md:text-4xl">
              O que todo atleta deve saber
            </h2>
            <p className="mt-4 leading-relaxed text-muted-foreground">
              As orientações abaixo são gerais e se aplicam às modalidades aquáticas. Regras
              específicas podem depender da competição, da entidade organizadora e do nível do
              atleta; consulte sempre a ABCD e, quando aplicável, a federação internacional.
            </p>
          </div>

          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {officialLinks.map(({ icon: Icon, title, description, href, label }) => (
              <article
                key={title}
                className="flex h-full flex-col rounded-2xl border border-border/70 bg-card p-6 shadow-card transition-shadow hover:shadow-elegant"
              >
                <div className="grid h-12 w-12 place-items-center rounded-2xl bg-primary/10 text-primary">
                  <Icon className="h-6 w-6" aria-hidden="true" />
                </div>
                <h3 className="mt-5 text-xl font-bold text-deep">{title}</h3>
                <p className="mt-3 flex-1 text-sm leading-relaxed text-muted-foreground">
                  {description}
                </p>
                <div className="mt-5 border-t border-border/70 pt-4">
                  <ExternalLink href={href}>{label}</ExternalLink>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-secondary/45 py-16 md:py-20">
        <div className="mx-auto grid max-w-7xl gap-10 px-6 lg:grid-cols-[0.8fr_1.2fr] lg:items-start">
          <div>
            <div className="grid h-14 w-14 place-items-center rounded-2xl bg-deep text-deep-foreground">
              <TestTube2 className="h-7 w-7" aria-hidden="true" />
            </div>
            <p className="mt-6 text-xs font-bold uppercase tracking-[0.2em] text-primary">
              Se você for notificado para coleta
            </p>
            <h2 className="mt-3 text-3xl font-bold text-deep">Coopere e conheça seus direitos</h2>
            <p className="mt-4 leading-relaxed text-muted-foreground">
              O controle pode ocorrer em diferentes momentos. Siga as instruções do oficial de
              controle, permaneça acompanhado conforme indicado e tire dúvidas durante o processo.
              Consulte a ABCD para conhecer o procedimento completo.
            </p>
            <div className="mt-6">
              <ExternalLink href="https://www.gov.br/abcd/pt-br/coordenacoes/coordenacao-de-operacoes/de-dopagem">
                Como funciona o controle de dopagem
              </ExternalLink>
            </div>
          </div>

          <div className="rounded-3xl border border-border/70 bg-card p-6 shadow-card md:p-8">
            <h3 className="text-lg font-bold text-deep">Boas práticas no dia a dia</h3>
            <ul className="mt-5 space-y-4">
              {[
                "Converse com o médico e informe que você está sujeito às regras antidopagem antes de iniciar um tratamento.",
                "Confira medicamentos na ferramenta da ABCD e na lista vigente; substâncias podem ter restrições diferentes dentro e fora de competição.",
                "Tenha cuidado com suplementos: a composição e a contaminação podem representar risco. Nenhum suplemento é isento de risco antidopagem.",
                "Guarde prescrições, embalagens e registros de medicamentos e suplementos utilizados.",
                "Em caso de necessidade terapêutica, verifique com antecedência se é necessária AUT; não interrompa tratamento sem orientação médica.",
              ].map((item) => (
                <li key={item} className="flex gap-3 text-sm leading-relaxed text-muted-foreground">
                  <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-primary/10 text-primary">
                    <ClipboardCheck className="h-3.5 w-3.5" aria-hidden="true" />
                  </span>
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section className="py-14">
        <div className="mx-auto max-w-7xl px-6">
          <aside className="rounded-2xl border border-gold/40 bg-gold/10 p-6 md:flex md:items-start md:gap-4 md:p-8">
            <ShieldCheck className="mb-3 h-6 w-6 shrink-0 text-deep md:mb-0" aria-hidden="true" />
            <div>
              <h2 className="font-bold text-deep">Conteúdo educativo</h2>
              <p className="mt-2 text-sm leading-relaxed text-foreground/80">
                Esta página resume informações gerais e não substitui as regras oficiais, uma
                avaliação médica ou orientação da ABCD. Lista proibida, procedimentos e requisitos
                podem ser atualizados. A FCDA não concede AUT nem substitui as autoridades
                antidopagem; consulte as fontes oficiais antes de tomar decisões.
              </p>
            </div>
          </aside>
        </div>
      </section>
    </SiteLayout>
  );
}
