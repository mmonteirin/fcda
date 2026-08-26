import { createFileRoute } from "@tanstack/react-router";
import { SiteLayout } from "@/components/layout/SiteLayout";
import { MapPin, Phone, Mail, Clock, Send, CheckCircle, RotateCcw } from "lucide-react";
import { useRef, useState } from "react";
import { sendMensagem } from "@/lib/admin.functions";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const Route = createFileRoute("/contato")({
  head: () => ({
    meta: [
      { title: "Contato — FCDA" },
      {
        name: "description",
        content: "Entre em contato com a Federação Cearense de Desportos Aquáticos.",
      },
    ],
  }),
  component: Contato,
});

function Contato() {
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const formRef = useRef<HTMLFormElement>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("sending");
    const fd = new FormData(e.currentTarget);
    try {
      await sendMensagem(supabase, {
        nome: fd.get("nome") as string,
        email: fd.get("email") as string,
        telefone: (fd.get("tel") as string) || null,
        assunto: fd.get("assunto") as string,
        mensagem: fd.get("mensagem") as string,
      });
      setStatus("sent");
      toast.success("Mensagem enviada com sucesso! Responderemos em breve.");
      formRef.current?.reset();
    } catch {
      setStatus("error");
      toast.error("Erro ao enviar mensagem. Tente novamente.");
    }
  }

  const handleReset = () => {
    setStatus("idle");
    formRef.current?.reset();
  };

  return (
    <SiteLayout>
      <section className="py-24 bg-hero text-primary-foreground">
        <div className="mx-auto max-w-5xl px-6">
          <div className="text-xs uppercase tracking-[0.25em] text-gold font-bold">
            Fale conosco
          </div>
          <h1 className="mt-4 text-5xl md:text-6xl font-bold">Contato</h1>
          <p className="mt-6 text-lg text-primary-foreground/80 max-w-2xl">
            Dúvidas sobre filiação, competições, cursos ou informações gerais? Estamos à disposição.
          </p>
        </div>
      </section>

      <section className="py-24">
        <div className="mx-auto max-w-7xl px-6 grid lg:grid-cols-[1fr_1.4fr] gap-12">
          <div className="space-y-6">
            {[
              {
                icon: MapPin,
                label: "Sede Administrativa",
                value:
                  "Federação Cearense de Desportos Aquáticos (FCDA)\nAv. da Abolição, 2727 – Meireles\nFortaleza – CE, CEP 60165-081",
              },
              {
                icon: Phone,
                label: "Telefone & WhatsApp",
                value: "(85) 98187-7327",
                href: "tel:+5585981877327",
              },
              {
                icon: Mail,
                label: "E-mail Oficial",
                value: "secretaria@fcda.org.br\nfcdaquaticos@fcda.org.br",
                href: "mailto:secretaria@fcda.org.br",
              },
              {
                icon: Clock,
                label: "Atendimento Presencial",
                value: "Terças e Quintas-feiras\n07h às 11h",
              },
            ].map((c) => (
              <div
                key={c.label}
                className="rounded-2xl bg-card border border-border p-6 flex gap-4 shadow-card hover:shadow-elegant transition-shadow"
              >
                <div className="h-12 w-12 rounded-xl bg-emerald-gradient grid place-items-center text-primary-foreground shrink-0">
                  <c.icon className="h-5 w-5" />
                </div>
                <div>
                  <div className="text-xs uppercase tracking-wider text-muted-foreground font-bold">
                    {c.label}
                  </div>
                  {c.href ? (
                    <a
                      href={c.href}
                      className="mt-1 text-deep font-semibold whitespace-pre-line hover:text-primary transition-colors block"
                    >
                      {c.value}
                    </a>
                  ) : (
                    <div className="mt-1 text-deep font-semibold whitespace-pre-line">{c.value}</div>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="rounded-2xl bg-card border border-border p-8 shadow-elegant">
            {status === "sent" ? (
              <div className="text-center py-12">
                <div className="h-16 w-16 rounded-full bg-emerald-500/10 grid place-items-center text-emerald-600 mx-auto mb-6">
                  <CheckCircle className="h-8 w-8" />
                </div>
                <h2 className="text-2xl font-bold text-deep mb-2">Mensagem enviada com sucesso!</h2>
                <p className="text-muted-foreground mb-8 max-w-md mx-auto">
                  Agradecemos seu contato. Nossa equipe retornará seu e-mail o mais breve possível.
                </p>
                <button
                  type="button"
                  onClick={handleReset}
                  className="inline-flex items-center gap-2 rounded-full bg-deep px-6 py-3 text-sm font-bold text-deep-foreground hover:bg-primary transition"
                >
                  <RotateCcw className="h-4 w-4" /> Enviar outra mensagem
                </button>
              </div>
            ) : (
              <form
                ref={formRef}
                onSubmit={handleSubmit}
              >
                <h2 className="text-2xl font-bold text-deep">Envie uma mensagem</h2>
                <p className="text-sm text-muted-foreground mt-1">Retornamos em até 2 dias úteis.</p>

                <div className="mt-8 grid sm:grid-cols-2 gap-5">
                  <Field label="Nome" name="nome" />
                  <Field label="E-mail" name="email" type="email" />
                  <Field label="Telefone" name="tel" required={false} className="sm:col-span-2" />
                  <Field label="Assunto" name="assunto" className="sm:col-span-2" />
                  <div className="sm:col-span-2">
                    <label className="text-xs uppercase tracking-wider font-bold text-deep">
                      Mensagem
                    </label>
                    <textarea
                      name="mensagem"
                      rows={5}
                      required
                      placeholder="Como podemos te ajudar?"
                      className="mt-2 w-full rounded-lg border border-border bg-background px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                </div>

                {status === "error" && (
                  <p className="mt-4 text-sm text-destructive">Erro ao enviar. Tente novamente.</p>
                )}

                <button
                  type="submit"
                  disabled={status === "sending"}
                  className="mt-8 inline-flex items-center gap-2 rounded-full bg-deep px-7 py-3.5 text-sm font-bold text-deep-foreground hover:bg-primary transition disabled:opacity-60"
                >
                  {status === "sending" ? (
                    "Enviando..."
                  ) : (
                    <>
                      <Send className="h-4 w-4" /> Enviar mensagem
                    </>
                  )}
                </button>
              </form>
            )}
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}

function Field({
  label,
  name,
  type = "text",
  required = true,
  className = "",
}: {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
  className?: string;
}) {
  return (
    <div className={className}>
      <label className="text-xs uppercase tracking-wider font-bold text-deep">{label}</label>
      <input
        name={name}
        type={type}
        required={required}
        className="mt-2 w-full rounded-lg border border-border bg-background px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
      />
    </div>
  );
}
