import { createFileRoute } from "@tanstack/react-router";
import { SiteLayout } from "@/components/site/SiteLayout";
import { MapPin, Phone, Mail, Clock, Send } from "lucide-react";
import { useRef, useState } from "react";
import { sendMensagem } from "@/lib/admin.functions";
import { supabase } from "@/integrations/supabase/client";

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
      formRef.current?.reset();
    } catch {
      setStatus("error");
    }
  }

  return (
    <SiteLayout>
      <section className="py-24 bg-hero text-primary-foreground">
        <div className="mx-auto max-w-5xl px-6">
          <div className="text-xs uppercase tracking-[0.25em] text-gold font-bold">
            Fale conosco
          </div>
          <h1 className="mt-4 text-5xl md:text-6xl font-bold">Contato</h1>
          <p className="mt-6 text-lg text-primary-foreground/80 max-w-2xl">
            Dúvidas sobre filiação, competições ou inscrições? Estamos à disposição.
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
                icon: Mail,
                label: "E-mail",
                value: "fcdaquaticos@fcda.org.br",
              },
              {
                icon: Clock,
                label: "Atendimento Presencial",
                value: "Terças e Quintas-feiras\n07h às 11h",
              },
              {
                icon: MapPin,
                label: "Site Oficial",
                value: "www.fcda.org.br",
              },
            ].map((c) => (
              <div
                key={c.label}
                className="rounded-2xl bg-card border border-border p-6 flex gap-4 shadow-card"
              >
                <div className="h-12 w-12 rounded-xl bg-emerald-gradient grid place-items-center text-primary-foreground shrink-0">
                  <c.icon className="h-5 w-5" />
                </div>
                <div>
                  <div className="text-xs uppercase tracking-wider text-muted-foreground font-bold">
                    {c.label}
                  </div>
                  <div className="mt-1 text-deep font-semibold whitespace-pre-line">{c.value}</div>
                </div>
              </div>
            ))}
          </div>

          <form
            ref={formRef}
            onSubmit={handleSubmit}
            className="rounded-2xl bg-card border border-border p-8 shadow-elegant"
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
                  className="mt-2 w-full rounded-lg border border-border bg-background px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            </div>

            {status === "error" && (
              <p className="mt-4 text-sm text-destructive">Erro ao enviar. Tente novamente.</p>
            )}

            <button
              type="submit"
              disabled={status === "sending" || status === "sent"}
              className="mt-8 inline-flex items-center gap-2 rounded-full bg-deep px-7 py-3.5 text-sm font-bold text-deep-foreground hover:bg-primary transition disabled:opacity-60"
            >
              {status === "sent" ? (
                "Mensagem enviada ✓"
              ) : status === "sending" ? (
                "Enviando..."
              ) : (
                <>
                  <Send className="h-4 w-4" /> Enviar mensagem
                </>
              )}
            </button>
          </form>
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
