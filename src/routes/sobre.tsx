import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { SiteLayout } from "@/components/layout/SiteLayout";
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
        <div className="mx-auto max-w-5xl px-6">
          <div className="text-center mb-16">
            <div className="text-xs uppercase tracking-[0.2em] text-primary font-bold">
              Nossa história
            </div>
            <h2 className="mt-3 text-4xl md:text-5xl font-bold text-deep">
              Mais de seis décadas fazendo história nas águas do Ceará
            </h2>
          </div>
          <div className="prose prose-lg max-w-none space-y-6 text-muted-foreground leading-relaxed">
            <p>
              A história da Federação Cearense de Desportos Aquáticos começa em <strong>6 de junho de 1958</strong>.
            </p>
            <p>
              Naquele momento, os esportes aquáticos ainda estavam construindo seu espaço no cenário esportivo cearense. A criação de uma entidade responsável por organizar, regulamentar e desenvolver essas modalidades representou um passo importante para que a natação e os demais esportes praticados na água pudessem crescer de maneira estruturada no Estado.
            </p>
            <p>
              Nascia a <strong>Federação Cearense de Desportos Aquáticos — FCDA</strong>.
            </p>
            <p>
              Ao longo de sua história, a Federação passou a exercer um papel que vai muito além da realização de competições. Tornou-se parte da construção do próprio esporte aquático cearense: organizando campeonatos, formando árbitros, estabelecendo calendários, acompanhando atletas e clubes e criando oportunidades para que diferentes gerações pudessem entrar em contato com o esporte.
            </p>
            <p>
              A <strong>natação</strong> sempre ocupou um lugar de destaque nessa trajetória. Com o passar dos anos, os campeonatos estaduais foram se tornando espaços importantes para a descoberta e o desenvolvimento de novos talentos.
            </p>
            <p>
              A história também ultrapassou os limites da capital. Um exemplo dessa expansão aconteceu no interior do Estado. Em 2016, o IFCE de Juazeiro do Norte recebeu uma edição do Campeonato Cearense de Natação, competição que contava pontos para os rankings da FCDA e da então Confederação Brasileira de Desportos Aquáticos.
            </p>
            <p>
              Em 2019, novamente Juazeiro do Norte recebeu o Campeonato Cearense de Piscina Curta Absoluto — Troféu Ricardo Barroso Lima. A competição, que anteriormente era realizada em Fortaleza, foi levada para o interior justamente para ampliar a participação dos atletas de outras regiões do Ceará.
            </p>
            <p>
              Mas a história da FCDA nunca esteve limitada às piscinas. As <strong>águas abertas</strong> possuem uma relação especialmente forte com o Ceará. O litoral e as características naturais do Estado transformaram o mar em um verdadeiro campo de treinamento e competição para gerações de nadadores.
            </p>
            <p>
              A própria FCDA registra que as disputas de águas abertas no Ceará possuem uma trajetória que remonta a décadas, tendo celebrado 65 anos dessa história em 2021. A modalidade ganhou calendários próprios, campeonatos estaduais, festivais e competições nacionais realizadas no Estado.
            </p>
            <p>
              Essa tradição também colocou o Ceará no mapa nacional das águas abertas. Fortaleza passou a receber importantes competições brasileiras, reunindo atletas de diferentes estados e transformando o litoral cearense em cenário de grandes disputas da modalidade.
            </p>
            <p>
              Ao mesmo tempo, a FCDA ampliou sua atuação para outras modalidades. Hoje, a Federação representa <strong>natação, águas abertas, paranatação, polo aquático, saltos ornamentais e nado artístico</strong>, além de incentivar o desenvolvimento do paradesporto através da paranatação.
            </p>
            <p>
              Essa expansão mostra uma mudança importante na própria compreensão do que são os esportes aquáticos. Não se trata apenas de descobrir quem nada mais rápido. Trata-se de criar oportunidades.
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Para a criança que está entrando na piscina pela primeira vez.</li>
              <li>Para o adolescente que começa a sonhar com grandes competições.</li>
              <li>Para o atleta que busca representar o Ceará em campeonatos nacionais.</li>
              <li>Para aquele que encontra nas águas abertas um novo desafio.</li>
              <li>E também para o atleta com deficiência que encontra na paranatação um espaço de competição, inclusão, autonomia e pertencimento.</li>
            </ul>
            <p>
              A atuação da FCDA também passou a envolver a formação de profissionais. Cursos e ações de capacitação fazem parte desse processo. Em 2019, por exemplo, durante o Campeonato Cearense de Piscina Curta realizado em Juazeiro do Norte, a Federação promoveu um curso de Noções de Arbitragem, reunindo 30 participantes.
            </p>
            <p>
              Com o passar das décadas, a Federação foi construindo uma identidade própria. Uma identidade formada por clubes, técnicos, árbitros, dirigentes, professores, pais, voluntários e, principalmente, atletas.
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Cada competição deixou uma história.</li>
              <li>Cada recorde marcou uma geração.</li>
              <li>Cada campeonato revelou novos nomes.</li>
              <li>Cada profissional que passou pela Federação deixou um pouco de sua contribuição.</li>
              <li>E cada atleta que vestiu a camisa de um clube cearense ajudou a construir aquilo que hoje conhecemos como esporte aquático do Ceará.</li>
            </ul>
            <p>
              Em 2026, a FCDA chegou aos <strong>68 anos de fundação</strong>. A comemoração aconteceu em um momento simbólico para a Federação. Nos dias 30 e 31 de maio, o Náutico Atlético Cearense recebeu a <strong>1ª Supercopa Cearense de Desportos Aquáticos — Troféu FCDA 68 Anos</strong>, reunindo cinco modalidades e celebrando a trajetória da entidade desde 1958.
            </p>
            <p>
              Mais do que uma competição comemorativa, a Supercopa representa a continuidade de uma história. Uma história que começou em 1958 e continua sendo escrita por novas gerações.
            </p>
            <p>
              Hoje, a FCDA mantém campeonatos estaduais, festivais, competições de base, eventos de águas abertas e ações voltadas à formação e ao desenvolvimento dos atletas. O calendário de 2026 reúne dezenas de competições e atividades espalhadas por diferentes categorias e modalidades.
            </p>
            <p>
              São 68 anos de mudanças. De piscinas diferentes. De clubes que surgiram e outros que deixaram de existir. De dirigentes que passaram. De professores que ensinaram. De árbitros que acompanharam milhares de provas. De famílias que passaram seus finais de semana nas arquibancadas. E, principalmente, de atletas que aprenderam que, na água, cada segundo importa.
            </p>
            <p>
              A história da FCDA, portanto, não é apenas a história de uma Federação. É parte da história do esporte cearense. É a história de pessoas que acreditaram que o Ceará poderia produzir grandes nadadores, grandes atletas e grandes profissionais. É a história de quem ajudou a transformar a água em espaço de educação, competição, inclusão, saúde e oportunidade.
            </p>
            <p>
              E enquanto houver alguém entrando em uma piscina, mergulhando no mar ou descobrindo pela primeira vez a sensação de vencer seus próprios limites, essa história continuará sendo escrita.
            </p>
            <p className="text-deep font-semibold text-lg">
              FCDA. Desde 1958, fazendo história nas águas do Ceará.
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
