import { createFileRoute } from "@tanstack/react-router";
import { SiteLayout } from "@/components/site/SiteLayout";
import { FileText, Users, Award, AlertCircle, Mail, Phone } from "lucide-react";
import { useRef, useState } from "react";
import { sendFiliacao } from "@/lib/admin.functions";
import { useAuth } from "@/lib/use-auth";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/filie-se")({
  head: () => ({
    meta: [
      { title: "Filia-se — FCDA" },
      {
        name: "description",
        content: "Processo de filiação e vinculação à Federação Cearense de Desportos Aquáticos.",
      },
    ],
  }),
  component: FilieSe,
});

function FilieSe() {
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const formRef = useRef<HTMLFormElement>(null);
  const sendFiliacaoFn = useServerFn(sendFiliacao);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("sending");
    const fd = new FormData(e.currentTarget);
    try {
      await sendFiliacaoFn({
        data: {
          tipo: fd.get("tipo") as "filiacao" | "vinculacao",
          razaoSocial: fd.get("razaoSocial") as string,
          cnpj: fd.get("cnpj") as string,
          inscricaoEstadual: (fd.get("inscricaoEstadual") as string) || null,
          endereco: fd.get("endereco") as string,
          cep: fd.get("cep") as string,
          bairro: fd.get("bairro") as string,
          cidade: fd.get("cidade") as string,
          uf: fd.get("uf") as string,
          fone: (fd.get("fone") as string) || null,
          fax: (fd.get("fax") as string) || null,
          alvara: (fd.get("alvara") as string) || null,
          certidao: (fd.get("certidao") as string) || null,
          dataFundacao: (fd.get("dataFundacao") as string) || null,
          dataPublicacao: (fd.get("dataPublicacao") as string) || null,
        },
      });
      setStatus("sent");
      formRef.current?.reset();
    } catch {
      setStatus("error");
    }
  }

  return (
    <SiteLayout>
      <section className="py-24 bg-hero text-primary-foreground">
        <div className="mx-auto max-w-5xl px-6">
          <div className="text-xs uppercase tracking-[0.25em] text-gold font-bold">FCDA</div>
          <h1 className="mt-4 text-4xl md:text-5xl font-bold">Filia-se</h1>
          <p className="mt-4 text-lg text-primary-foreground/80">
            Processo de ingresso na Federação Cearense de Desportos Aquáticos
          </p>
        </div>
      </section>

      <section className="py-16 bg-background">
        <div className="mx-auto max-w-5xl px-6">
          <div className="prose prose-lg max-w-none">
            <p className="text-muted-foreground">
              O processo de ingresso na Federação Cearense de Desportos Aquáticos (FCDA) para
              entidades e atletas ocorre por meio de duas modalidades principais: a Filiação e a
              Vinculação. Cada uma possui objetivos, direitos e limitações específicos, visando
              desde o fomento inicial até a participação plena nas decisões da federação.
            </p>

            <div className="mt-12 grid md:grid-cols-2 gap-8">
              <div className="rounded-2xl bg-card border border-border p-6 shadow-card">
                <div className="flex items-center gap-3 mb-4">
                  <div className="h-12 w-12 rounded-xl bg-emerald-gradient grid place-items-center text-primary-foreground">
                    <Award className="h-6 w-6" />
                  </div>
                  <h2 className="text-xl font-bold text-deep">1. Filiação à FCDA (Federados)</h2>
                </div>
                <p className="text-sm text-muted-foreground mb-4">
                  A filiação representa o nível mais completo de integração à federação. Além dos
                  direitos competitivos, ela garante direitos políticos aos envolvidos, permitindo
                  que decidam os rumos da entidade.
                </p>
                <div className="space-y-3">
                  <div>
                    <h3 className="font-semibold text-deep text-sm">Direitos Esportivos:</h3>
                    <p className="text-sm text-muted-foreground">
                      Os filiados podem competir em eventos estaduais da FCDA, regionais e nacionais
                      organizados pela Confederação Brasileira de Desportos Aquáticos (CBDA). Também
                      possuem o direito de serem convocados para as Seleções Cearenses e de figurar
                      no Ranking Cearense da modalidade.
                    </p>
                  </div>
                  <div>
                    <h3 className="font-semibold text-deep text-sm">Direitos Políticos:</h3>
                    <p className="text-sm text-muted-foreground">
                      Entidades e atletas filiados podem votar e ser votados para cargos eletivos na
                      FCDA, além de participar com direito a voto em reuniões do Conselho Técnico.
                    </p>
                  </div>
                  <div>
                    <h3 className="font-semibold text-deep text-sm">Restrições:</h3>
                    <p className="text-sm text-muted-foreground">
                      Diferente dos vinculados, o atleta filiado não pode participar de competições
                      destinadas a não federados.
                    </p>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl bg-card border border-border p-6 shadow-card">
                <div className="flex items-center gap-3 mb-4">
                  <div className="h-12 w-12 rounded-xl bg-emerald-gradient grid place-items-center text-primary-foreground">
                    <Users className="h-6 w-6" />
                  </div>
                  <h2 className="text-xl font-bold text-deep">
                    2. Vinculação à FCDA (Projeto Entidade Vinculada)
                  </h2>
                </div>
                <p className="text-sm text-muted-foreground mb-4">
                  A vinculação é um plano de fomento destinado a entidades (associações, escolas,
                  academias, ONGs) que desejam iniciar nos esportes aquáticos competitivos, mas
                  ainda não possuem estrutura técnica ou financeira para a filiação plena. É
                  considerada uma categoria intermediária entre o aluno e o atleta formal federado.
                </p>
                <div className="space-y-3">
                  <div>
                    <h3 className="font-semibold text-deep text-sm">
                      Direitos Esportivos Parciais:
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Permite a inscrição e participação em eventos de nível Estadual organizados
                      pela FCDA, com igualdade de premiação individual e por equipes.
                    </p>
                  </div>
                  <div>
                    <h3 className="font-semibold text-deep text-sm">Flexibilidade:</h3>
                    <p className="text-sm text-muted-foreground">
                      O nadador vinculado tem a vantagem de poder participar tanto de eventos para
                      federados quanto de competições para não federados.
                    </p>
                  </div>
                  <div>
                    <h3 className="font-semibold text-deep text-sm">Limitações:</h3>
                    <p className="text-sm text-muted-foreground">
                      Entidades e atletas vinculados não possuem direitos políticos (não votam).
                      Além disso, não podem participar de eventos da CBDA, não são convocados para
                      seleções estaduais e não participam do ranking de "Melhores do Ano", salvo
                      exceção para as Maratonas Aquáticas.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-12 rounded-2xl bg-primary/5 border border-primary/20 p-6">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-primary mt-0.5" />
                <div>
                  <h3 className="font-bold text-deep mb-2">Transição e Regras Importantes</h3>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li>
                      <strong>Mudança de Status:</strong> Um atleta que iniciou a temporada como
                      vinculado pode tornar-se federado (filiado) a qualquer momento. Para isso,
                      deve pagar a diferença de valor entre as taxas e permanecer na mesma entidade
                      à qual estava vinculado.
                    </li>
                    <li>
                      <strong>Lei de Transferências:</strong> Tanto atletas federados quanto
                      vinculados estão sujeitos à Lei de Transferências, o que significa que não
                      podem mudar de entidade durante a temporada em curso.
                    </li>
                    <li>
                      <strong>Exigência para Eventos Nacionais:</strong> Caso a entidade ou o atleta
                      deseje participar de qualquer evento da CBDA, é obrigatório realizar o
                      processo de filiação.
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="mt-8 rounded-2xl bg-card border border-border p-6">
              <h3 className="font-bold text-deep mb-4">Contato</h3>
              <div className="space-y-3 text-sm">
                <div className="flex items-center gap-3">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <span className="font-semibold text-deep">Secretaria:</span>{" "}
                    <a
                      href="mailto:secretaria@fcda.org.br"
                      className="text-primary hover:underline"
                    >
                      secretaria@fcda.org.br
                    </a>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <span className="font-semibold text-deep">Suporte Técnico:</span>{" "}
                    <a href="mailto:ti@fcda.org.br" className="text-primary hover:underline">
                      ti@fcda.org.br
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-16">
            <div className="flex items-center gap-3 mb-8">
              <div className="h-12 w-12 rounded-xl bg-emerald-gradient grid place-items-center text-primary-foreground">
                <FileText className="h-6 w-6" />
              </div>
              <h2 className="text-2xl font-bold text-deep">
                FICHA DE FILIAÇÃO/VINCULAÇÃO PARA CLUBE
              </h2>
            </div>

            {status === "sent" ? (
              <div className="rounded-2xl bg-emerald-50 border border-emerald-200 p-6 text-center">
                <p className="text-emerald-800 font-semibold">
                  Solicitação enviada com sucesso! Entraremos em contato em breve.
                </p>
              </div>
            ) : (
              <form ref={formRef} onSubmit={handleSubmit} className="space-y-8">
                <div className="rounded-2xl bg-card border border-border p-6 shadow-card">
                  <h3 className="text-lg font-bold text-deep mb-6">1. Dados da Entidade</h3>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-semibold text-deep mb-2">
                        Tipo de Processo *
                      </label>
                      <select
                        name="tipo"
                        required
                        className="w-full rounded-lg border border-border bg-background px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                      >
                        <option value="">Selecione...</option>
                        <option value="filiacao">Filiação</option>
                        <option value="vinculacao">Vinculação</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-deep mb-2">
                        Razão Social *
                      </label>
                      <input
                        type="text"
                        name="razaoSocial"
                        required
                        className="w-full rounded-lg border border-border bg-background px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-deep mb-2">CNPJ *</label>
                      <input
                        type="text"
                        name="cnpj"
                        required
                        className="w-full rounded-lg border border-border bg-background px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-deep mb-2">
                        Inscrição Estadual
                      </label>
                      <input
                        type="text"
                        name="inscricaoEstadual"
                        className="w-full rounded-lg border border-border bg-background px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-semibold text-deep mb-2">
                        Endereço *
                      </label>
                      <input
                        type="text"
                        name="endereco"
                        required
                        className="w-full rounded-lg border border-border bg-background px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-deep mb-2">CEP *</label>
                      <input
                        type="text"
                        name="cep"
                        required
                        className="w-full rounded-lg border border-border bg-background px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-deep mb-2">Bairro *</label>
                      <input
                        type="text"
                        name="bairro"
                        required
                        className="w-full rounded-lg border border-border bg-background px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-deep mb-2">Cidade *</label>
                      <input
                        type="text"
                        name="cidade"
                        required
                        className="w-full rounded-lg border border-border bg-background px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-deep mb-2">UF *</label>
                      <input
                        type="text"
                        name="uf"
                        required
                        maxLength={2}
                        className="w-full rounded-lg border border-border bg-background px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-deep mb-2">Fone</label>
                      <input
                        type="tel"
                        name="fone"
                        className="w-full rounded-lg border border-border bg-background px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-deep mb-2">Fax</label>
                      <input
                        type="tel"
                        name="fax"
                        className="w-full rounded-lg border border-border bg-background px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-deep mb-2">
                        Alvará da Prefeitura
                      </label>
                      <input
                        type="text"
                        name="alvara"
                        className="w-full rounded-lg border border-border bg-background px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-deep mb-2">
                        Certidão do Cartório (nº do registro)
                      </label>
                      <input
                        type="text"
                        name="certidao"
                        className="w-full rounded-lg border border-border bg-background px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-deep mb-2">
                        Data da Fundação
                      </label>
                      <input
                        type="date"
                        name="dataFundacao"
                        className="w-full rounded-lg border border-border bg-background px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-deep mb-2">
                        Data da Publicação no D.O.
                      </label>
                      <input
                        type="date"
                        name="dataPublicacao"
                        className="w-full rounded-lg border border-border bg-background px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                    </div>
                  </div>
                </div>

                <div className="rounded-2xl bg-card border border-border p-6 shadow-card">
                  <h3 className="text-lg font-bold text-deep mb-6">2. Documentação</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Anexar ao documento de ficha de inscrição fotocópia dos seguintes documentos:
                  </p>
                  <ul className="space-y-2 text-sm text-muted-foreground list-disc list-inside">
                    <li>CNPJ</li>
                    <li>
                      Requerimento de filiação, em papel timbrado, firmado pelo Presidente da
                      Associação, com nomes e profissões dos integrantes da Diretoria.
                    </li>
                  </ul>
                </div>

                {status === "error" && (
                  <div className="rounded-2xl bg-destructive/10 border border-destructive/20 p-4">
                    <p className="text-destructive text-sm">
                      Erro ao enviar solicitação. Tente novamente.
                    </p>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={status === "sending"}
                  className="inline-flex items-center gap-2 rounded-lg bg-deep text-deep-foreground font-bold text-sm px-6 py-3 hover:bg-primary disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {status === "sending" ? "Enviando..." : "Enviar Solicitação"}
                </button>
              </form>
            )}
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}
