import { createFileRoute } from "@tanstack/react-router";
import { SiteLayout } from "@/components/site/SiteLayout";
import { FileText, Users, Award, AlertCircle, Mail, Upload, CheckCircle, X } from "lucide-react";
import { useRef, useState } from "react";
import { sendFiliacao } from "@/lib/admin.functions";
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

const TERMO_FILIACAO = `Declaro, na qualidade de representante legal da entidade requerente, que li, compreendi e concordo integralmente com as normas, regulamentos, resoluções e disposições estatutárias da Federação Cearense de Desportos Aquáticos – FCDA referentes ao processo de Filiação.

Declaro estar ciente de que a condição de entidade filiada confere direitos esportivos e políticos, incluindo a participação em competições estaduais, regionais e nacionais, bem como a participação nos processos eleitorais e órgãos deliberativos da FCDA, observadas as disposições estatutárias e regulamentares vigentes.

Comprometo-me a manter os dados cadastrais da entidade atualizados e a cumprir todas as obrigações estabelecidas pela FCDA e pela Confederação Brasileira de Desportos Aquáticos – CBDA.

Ao prosseguir com esta solicitação, confirmo a veracidade das informações prestadas e aceito integralmente as condições aplicáveis à filiação da entidade.`;

const TERMO_VINCULACAO = `Declaro, na qualidade de representante legal da entidade requerente, que li, compreendi e concordo integralmente com as normas, regulamentos, resoluções e disposições estatutárias da Federação Cearense de Desportos Aquáticos – FCDA referentes ao processo de Vinculação.

Declaro estar ciente de que a condição de entidade vinculada destina-se ao fomento e desenvolvimento esportivo, permitindo a participação em eventos estaduais promovidos pela FCDA, sem concessão de direitos políticos perante a Federação.

Reconheço que a vinculação não habilita a participação em competições organizadas pela Confederação Brasileira de Desportos Aquáticos – CBDA e não confere os direitos reservados às entidades filiadas.

Ao prosseguir com esta solicitação, confirmo a veracidade das informações prestadas e aceito integralmente as condições aplicáveis à vinculação da entidade.`;

type UploadState = {
  url: string | null;
  name: string | null;
  uploading: boolean;
  error: string | null;
};

const emptyUpload: UploadState = { url: null, name: null, uploading: false, error: null };

async function uploadDoc(file: File, folder: string): Promise<string> {
  const ext = file.name.split(".").pop();
  const path = `filiacoes/${folder}-${Date.now()}.${ext}`;
  const { error } = await supabase.storage.from("site-images").upload(path, file, {
    contentType: file.type,
    upsert: false,
  });
  if (error) throw new Error(error.message);
  const { data } = supabase.storage.from("site-images").getPublicUrl(path);
  return data.publicUrl;
}

function DocUpload({
  label,
  hint,
  state,
  onChange,
}: {
  label: string;
  hint: string;
  state: UploadState;
  onChange: (s: UploadState) => void;
}) {
  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    onChange({ url: null, name: file.name, uploading: true, error: null });
    try {
      const folder = label.toLowerCase().replace(/\s+/g, "-");
      const url = await uploadDoc(file, folder);
      onChange({ url, name: file.name, uploading: false, error: null });
    } catch (err) {
      onChange({
        url: null,
        name: null,
        uploading: false,
        error: err instanceof Error ? err.message : "Erro no upload",
      });
    }
    // reset input so same file can be re-selected after error
    e.target.value = "";
  }

  return (
    <div>
      <label className="block text-sm font-semibold text-deep mb-2">{label}</label>
      <p className="text-xs text-muted-foreground mb-3">{hint}</p>

      {state.url ? (
        <div className="flex items-center gap-3 rounded-lg bg-primary/5 border border-primary/30 px-4 py-3">
          <CheckCircle className="h-4 w-4 text-primary shrink-0" />
          <span className="text-sm text-deep truncate flex-1">{state.name}</span>
          <button
            type="button"
            onClick={() => onChange(emptyUpload)}
            className="text-muted-foreground hover:text-destructive transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ) : (
        <label className="flex items-center justify-center gap-3 rounded-lg border-2 border-dashed border-border hover:border-primary transition-colors cursor-pointer px-6 py-4">
          {state.uploading ? (
            <span className="text-sm text-muted-foreground">Enviando...</span>
          ) : (
            <>
              <Upload className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-semibold text-deep">
                Clique para enviar (PDF, JPG, PNG)
              </span>
            </>
          )}
          <input
            type="file"
            accept=".pdf,.jpg,.jpeg,.png"
            onChange={handleFile}
            disabled={state.uploading}
            className="hidden"
          />
        </label>
      )}

      {state.error && <p className="mt-2 text-xs text-destructive">{state.error}</p>}
    </div>
  );
}

const inputCls =
  "w-full rounded-lg border border-border bg-background px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary";

function FilieSe() {
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [tipo, setTipo] = useState<"filiacao" | "vinculacao" | "">("");
  const [aceiteTermo, setAceiteTermo] = useState(false);
  const [docCnpj, setDocCnpj] = useState<UploadState>(emptyUpload);
  const [docRequerimento, setDocRequerimento] = useState<UploadState>(emptyUpload);
  const formRef = useRef<HTMLFormElement>(null);

  const termoTexto =
    tipo === "filiacao" ? TERMO_FILIACAO : tipo === "vinculacao" ? TERMO_VINCULACAO : null;
  const termoTitulo =
    tipo === "filiacao"
      ? "TERMO DE CIÊNCIA E ACEITE – FILIAÇÃO"
      : "TERMO DE CIÊNCIA E ACEITE – VINCULAÇÃO";

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!aceiteTermo) {
      alert("Você deve aceitar o Termo de Ciência e Aceite para prosseguir.");
      return;
    }
    setStatus("sending");
    const fd = new FormData(e.currentTarget);
    try {
      await sendFiliacao(supabase, {
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
        docCnpjUrl: docCnpj.url,
        docRequerimentoUrl: docRequerimento.url,
        aceiteTermo: true,
      });
      setStatus("sent");
      formRef.current?.reset();
      setTipo("");
      setAceiteTermo(false);
      setDocCnpj(emptyUpload);
      setDocRequerimento(emptyUpload);
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
                      As entidades filiadas têm direito a voto nas assembleias gerais da FCDA e
                      podem eleger e ser eleitas para os cargos diretivos da federação.
                    </p>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl bg-card border border-border p-6 shadow-card">
                <div className="flex items-center gap-3 mb-4">
                  <div className="h-12 w-12 rounded-xl bg-emerald-gradient grid place-items-center text-primary-foreground">
                    <Users className="h-6 w-6" />
                  </div>
                  <h2 className="text-xl font-bold text-deep">2. Vinculação à FCDA</h2>
                </div>
                <p className="text-sm text-muted-foreground mb-4">
                  A vinculação é voltada para entidades que desejam iniciar seu envolvimento com os
                  desportos aquáticos de forma mais gradual, sem comprometimento político imediato.
                </p>
                <div className="space-y-3">
                  <div>
                    <h3 className="font-semibold text-deep text-sm">Direitos Esportivos:</h3>
                    <p className="text-sm text-muted-foreground">
                      As entidades vinculadas podem participar de eventos estaduais promovidos pela
                      FCDA, mas não têm acesso às competições organizadas pela CBDA em nível
                      regional ou nacional.
                    </p>
                  </div>
                  <div>
                    <h3 className="font-semibold text-deep text-sm">Limitações:</h3>
                    <p className="text-sm text-muted-foreground">
                      Não conferem direitos políticos perante a FCDA, como participação em votações
                      ou elegibilidade para cargos diretivos.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-10 rounded-2xl bg-amber-50 border border-amber-200 p-6">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-amber-600 mt-0.5 shrink-0" />
                <div>
                  <h3 className="font-semibold text-amber-900 mb-2">
                    Importante: Condições para Filiação
                  </h3>
                  <p className="text-sm text-amber-800">
                    Para se filiar à FCDA, a entidade deve ser uma pessoa jurídica devidamente
                    constituída (associação ou clube), possuir CNPJ ativo, ter sede no estado do
                    Ceará e desenvolver atividades relacionadas aos desportos aquáticos. Entidades
                    com pendências financeiras junto à FCDA ou à CBDA não podem solicitar a
                    filiação.
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-10 rounded-2xl bg-card border border-border p-6 shadow-card">
              <h3 className="font-semibold text-deep mb-4">Contato e Suporte</h3>
              <div className="grid sm:grid-cols-2 gap-4 text-sm">
                <div className="flex items-center gap-3">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <span className="font-semibold text-deep">Secretaria: </span>
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
                    <span className="font-semibold text-deep">Suporte Técnico: </span>
                    <a href="mailto:ti@fcda.org.br" className="text-primary hover:underline">
                      ti@fcda.org.br
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ── FORMULÁRIO ── */}
          <div className="mt-16">
            <div className="flex items-center gap-3 mb-8">
              <div className="h-12 w-12 rounded-xl bg-emerald-gradient grid place-items-center text-primary-foreground">
                <FileText className="h-6 w-6" />
              </div>
              <h2 className="text-2xl font-bold text-deep">
                FICHA DE FILIAÇÃO / VINCULAÇÃO PARA CLUBE
              </h2>
            </div>

            {status === "sent" ? (
              <div className="rounded-2xl bg-emerald-50 border border-emerald-200 p-8 text-center">
                <CheckCircle className="h-12 w-12 text-emerald-600 mx-auto mb-4" />
                <p className="text-emerald-800 font-semibold text-lg">
                  Solicitação enviada com sucesso!
                </p>
                <p className="text-emerald-700 mt-2 text-sm">
                  Entraremos em contato em breve para dar continuidade ao processo.
                </p>
              </div>
            ) : (
              <form ref={formRef} onSubmit={handleSubmit} className="space-y-8">
                {/* 1. Dados da Entidade */}
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
                        value={tipo}
                        onChange={(e) => {
                          setTipo(e.target.value as "filiacao" | "vinculacao" | "");
                          setAceiteTermo(false);
                        }}
                        className={inputCls}
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
                      <input type="text" name="razaoSocial" required className={inputCls} />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-deep mb-2">CNPJ *</label>
                      <input type="text" name="cnpj" required className={inputCls} />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-deep mb-2">
                        Inscrição Estadual
                      </label>
                      <input type="text" name="inscricaoEstadual" className={inputCls} />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-semibold text-deep mb-2">
                        Endereço *
                      </label>
                      <input type="text" name="endereco" required className={inputCls} />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-deep mb-2">CEP *</label>
                      <input type="text" name="cep" required className={inputCls} />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-deep mb-2">Bairro *</label>
                      <input type="text" name="bairro" required className={inputCls} />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-deep mb-2">Cidade *</label>
                      <input type="text" name="cidade" required className={inputCls} />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-deep mb-2">UF *</label>
                      <input type="text" name="uf" required maxLength={2} className={inputCls} />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-deep mb-2">Fone</label>
                      <input type="tel" name="fone" className={inputCls} />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-deep mb-2">Fax</label>
                      <input type="tel" name="fax" className={inputCls} />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-deep mb-2">
                        Alvará da Prefeitura
                      </label>
                      <input type="text" name="alvara" className={inputCls} />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-deep mb-2">
                        Certidão do Cartório (nº do registro)
                      </label>
                      <input type="text" name="certidao" className={inputCls} />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-deep mb-2">
                        Data da Fundação
                      </label>
                      <input type="date" name="dataFundacao" className={inputCls} />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-deep mb-2">
                        Data da Publicação no D.O.
                      </label>
                      <input type="date" name="dataPublicacao" className={inputCls} />
                    </div>
                  </div>
                </div>

                {/* 2. Documentação */}
                <div className="rounded-2xl bg-card border border-border p-6 shadow-card">
                  <h3 className="text-lg font-bold text-deep mb-2">2. Documentação</h3>
                  <p className="text-sm text-muted-foreground mb-6">
                    Anexe os documentos obrigatórios. Formatos aceitos: PDF, JPG ou PNG.
                  </p>
                  <div className="grid md:grid-cols-2 gap-6">
                    <DocUpload
                      label="Documento do CNPJ *"
                      hint="Comprovante de CNPJ ativo emitido pela Receita Federal."
                      state={docCnpj}
                      onChange={setDocCnpj}
                    />
                    <DocUpload
                      label="Requerimento de Filiação *"
                      hint="Em papel timbrado, assinado pelo Presidente, com nome e profissão dos diretores."
                      state={docRequerimento}
                      onChange={setDocRequerimento}
                    />
                  </div>
                </div>

                {/* 3. Termo de Aceite — aparece só após selecionar o tipo */}
                {termoTexto && (
                  <div className="rounded-2xl bg-card border border-border p-6 shadow-card">
                    <h3 className="text-lg font-bold text-deep mb-4">{termoTitulo}</h3>

                    <div className="rounded-lg bg-secondary/50 border border-border p-4 max-h-64 overflow-y-auto mb-6">
                      {termoTexto.split("\n\n").map((p, i) => (
                        <p
                          key={i}
                          className="text-sm text-foreground leading-relaxed mb-3 last:mb-0"
                        >
                          {p}
                        </p>
                      ))}
                    </div>

                    <label className="flex items-start gap-3 cursor-pointer group">
                      <input
                        type="checkbox"
                        checked={aceiteTermo}
                        onChange={(e) => setAceiteTermo(e.target.checked)}
                        className="mt-0.5 h-4 w-4 rounded border-border accent-primary"
                      />
                      <span className="text-sm font-semibold text-deep group-hover:text-primary transition-colors">
                        Li, compreendi e aceito integralmente os termos acima, confirmando a
                        veracidade de todas as informações prestadas.
                      </span>
                    </label>
                  </div>
                )}

                {status === "error" && (
                  <div className="rounded-2xl bg-destructive/10 border border-destructive/20 p-4">
                    <p className="text-destructive text-sm">
                      Erro ao enviar solicitação. Tente novamente.
                    </p>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={status === "sending" || !aceiteTermo || !tipo}
                  className="inline-flex items-center gap-2 rounded-lg bg-deep text-deep-foreground font-bold text-sm px-6 py-3 hover:bg-primary disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {status === "sending" ? "Enviando..." : "Enviar Solicitação"}
                </button>

                {!tipo && (
                  <p className="text-xs text-muted-foreground">
                    Selecione o tipo de processo para continuar.
                  </p>
                )}
                {tipo && !aceiteTermo && (
                  <p className="text-xs text-muted-foreground">
                    Aceite o termo acima para habilitar o envio.
                  </p>
                )}
              </form>
            )}
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}
