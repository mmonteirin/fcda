import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { User, Dumbbell, Building2, ArrowRight, Check, X } from "lucide-react";
import { SiteLayout } from "@/components/layout/SiteLayout";
import { publicRegister } from "@/lib/admin.functions";

export const Route = createFileRoute("/cadastro")({
  head: () => ({
    meta: [
      { title: "Cadastro — FCDA" },
      {
        name: "description",
        content: "Cadastre-se como atleta, treinador ou gestor de clube na Federação Cearense de Desportos Aquáticos.",
      },
    ],
  }),
  component: Cadastro,
});

type UserType = "atleta" | "treinador" | "gestor";

function Cadastro() {
  const [userType, setUserType] = useState<UserType | null>(null);
  const [step, setStep] = useState<"select" | "form" | "success">("select");

  const handleSelectType = (type: UserType) => {
    setUserType(type);
    setStep("form");
  };

  const handleBack = () => {
    setStep("select");
    setUserType(null);
  };

  const handleSuccess = () => {
    setStep("success");
  };

  return (
    <SiteLayout>
      <section className="py-24 bg-hero text-primary-foreground">
        <div className="mx-auto max-w-5xl px-6">
          <div className="text-xs uppercase tracking-[0.25em] text-gold font-bold">Bem-vindo</div>
          <h1 className="mt-4 text-5xl md:text-6xl font-bold">Crie sua conta</h1>
          <p className="mt-6 text-lg text-primary-foreground/80 max-w-2xl">
            Faça parte da comunidade de desportos aquáticos do Ceará. Escolha seu perfil e complete seu
            cadastro.
          </p>
        </div>
      </section>

      <section className="py-16">
        <div className="mx-auto max-w-4xl px-6">
          {step === "select" && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-deep text-center">Selecione seu perfil</h2>
              <div className="grid md:grid-cols-3 gap-6 mt-8">
                <button
                  onClick={() => handleSelectType("atleta")}
                  className="group relative rounded-2xl bg-card border-2 border-border p-8 text-left hover:border-primary hover:shadow-elegant transition-all"
                >
                  <div className="h-14 w-14 rounded-xl bg-blue-500/10 grid place-items-center text-blue-600 mb-4 group-hover:bg-blue-500 group-hover:text-white transition-colors">
                    <User className="h-7 w-7" />
                  </div>
                  <h3 className="text-xl font-bold text-deep mb-2">Atleta</h3>
                  <p className="text-sm text-muted-foreground">
                    Para atletas que participam de competições oficiais da FCDA.
                  </p>
                  <ArrowRight className="absolute top-6 right-6 h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
                </button>

                <button
                  onClick={() => handleSelectType("treinador")}
                  className="group relative rounded-2xl bg-card border-2 border-border p-8 text-left hover:border-primary hover:shadow-elegant transition-all"
                >
                  <div className="h-14 w-14 rounded-xl bg-orange-500/10 grid place-items-center text-orange-600 mb-4 group-hover:bg-orange-500 group-hover:text-white transition-colors">
                    <Dumbbell className="h-7 w-7" />
                  </div>
                  <h3 className="text-xl font-bold text-deep mb-2">Treinador</h3>
                  <p className="text-sm text-muted-foreground">
                    Para profissionais que treinam atletas em clubes afiliados.
                  </p>
                  <ArrowRight className="absolute top-6 right-6 h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
                </button>

                <button
                  onClick={() => handleSelectType("gestor")}
                  className="group relative rounded-2xl bg-card border-2 border-border p-8 text-left hover:border-primary hover:shadow-elegant transition-all"
                >
                  <div className="h-14 w-14 rounded-xl bg-purple-500/10 grid place-items-center text-purple-600 mb-4 group-hover:bg-purple-500 group-hover:text-white transition-colors">
                    <Building2 className="h-7 w-7" />
                  </div>
                  <h3 className="text-xl font-bold text-deep mb-2">Gestor de Clube</h3>
                  <p className="text-sm text-muted-foreground">
                    Para responsáveis pela gestão de clubes afiliados à FCDA.
                  </p>
                  <ArrowRight className="absolute top-6 right-6 h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
                </button>
              </div>
            </div>
          )}

          {step === "form" && userType && (
            <div className="space-y-6">
              <button
                onClick={handleBack}
                className="text-sm text-muted-foreground hover:text-primary transition-colors flex items-center gap-2"
              >
                <ArrowRight className="h-4 w-4 rotate-180" /> Voltar
              </button>

              <h2 className="text-2xl font-bold text-deep">
                Cadastro de {userType === "atleta" ? "Atleta" : userType === "treinador" ? "Treinador" : "Gestor de Clube"}
              </h2>

              <RegistrationForm userType={userType} onSuccess={handleSuccess} />
            </div>
          )}

          {step === "success" && (
            <div className="text-center py-12">
              <div className="h-20 w-20 rounded-full bg-emerald-500/10 grid place-items-center text-emerald-600 mx-auto mb-6">
                <Check className="h-10 w-10" />
              </div>
              <h2 className="text-3xl font-bold text-deep mb-4">Cadastro realizado com sucesso!</h2>
              <p className="text-muted-foreground mb-8 max-w-md mx-auto">
                Sua conta foi criada e você receberá um e-mail de confirmação. Após confirmar, você
                poderá acessar sua conta e completar seu perfil.
              </p>
              <a
                href="/login"
                className="inline-flex items-center gap-2 rounded-xl bg-deep text-deep-foreground font-bold px-6 py-3 hover:bg-primary transition-colors"
              >
                Ir para login <ArrowRight className="h-4 w-4" />
              </a>
            </div>
          )}
        </div>
      </section>
    </SiteLayout>
  );
}

function RegistrationForm({ userType, onSuccess }: { userType: UserType; onSuccess: () => void }) {
  const register = useServerFn(publicRegister);
  const [formData, setFormData] = useState({
    nome: "",
    email: "",
    senha: "",
    confirmarSenha: "",
    telefone: "",
    cpf: "",
    ...(userType === "atleta" && {
      dataNascimento: "",
      clube: "",
      categoria: "",
    }),
    ...(userType === "treinador" && {
      clube: "",
      especialidade: "",
      credencial: "",
    }),
    ...(userType === "gestor" && {
      clube: "",
      cargo: "",
    }),
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: "" });
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.nome) newErrors.nome = "Nome é obrigatório";
    if (!formData.email) newErrors.email = "E-mail é obrigatório";
    if (!formData.senha) newErrors.senha = "Senha é obrigatória";
    if (formData.senha.length < 6) newErrors.senha = "Senha deve ter no mínimo 6 caracteres";
    if (formData.senha !== formData.confirmarSenha) newErrors.confirmarSenha = "Senhas não conferem";
    if (!formData.cpf) newErrors.cpf = "CPF é obrigatório";

    if (userType === "atleta") {
      if (!formData.dataNascimento) newErrors.dataNascimento = "Data de nascimento é obrigatória";
    }

    if (userType === "treinador" || userType === "gestor") {
      if (!formData.clube) newErrors.clube = "Clube é obrigatório";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      const userTypeMap = {
        atleta: "atleta",
        treinador: "treinador",
        gestor: "gestor_clube",
      } as const;

      await register({
        data: {
          email: formData.email,
          password: formData.senha,
          nome: formData.nome,
          userType: userTypeMap[userType],
          cpf: formData.cpf,
          telefone: formData.telefone,
          data_nascimento: userType === "atleta" ? formData.dataNascimento : undefined,
          clube_id: (userType === "treinador" || userType === "gestor") ? formData.clube : undefined,
          categoria: userType === "atleta" ? formData.categoria : undefined,
          especialidade: userType === "treinador" ? formData.especialidade : undefined,
          credencial: userType === "treinador" ? formData.credencial : undefined,
          cargo: userType === "gestor" ? formData.cargo : undefined,
        },
      });
      onSuccess();
    } catch (error) {
      setErrors({ submit: error instanceof Error ? error.message : "Erro ao realizar cadastro. Tente novamente." });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-semibold text-deep mb-2">Nome completo</label>
          <input
            type="text"
            name="nome"
            value={formData.nome}
            onChange={handleChange}
            className={`w-full rounded-xl border px-4 py-3 text-sm ${errors.nome ? "border-destructive" : "border-border"} focus:border-primary focus:outline-none`}
            placeholder="Digite seu nome completo"
          />
          {errors.nome && <p className="text-sm text-destructive mt-1">{errors.nome}</p>}
        </div>

        <div>
          <label className="block text-sm font-semibold text-deep mb-2">E-mail</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className={`w-full rounded-xl border px-4 py-3 text-sm ${errors.email ? "border-destructive" : "border-border"} focus:border-primary focus:outline-none`}
            placeholder="seu@email.com"
          />
          {errors.email && <p className="text-sm text-destructive mt-1">{errors.email}</p>}
        </div>

        <div>
          <label className="block text-sm font-semibold text-deep mb-2">Senha</label>
          <input
            type="password"
            name="senha"
            value={formData.senha}
            onChange={handleChange}
            className={`w-full rounded-xl border px-4 py-3 text-sm ${errors.senha ? "border-destructive" : "border-border"} focus:border-primary focus:outline-none`}
            placeholder="Mínimo 6 caracteres"
          />
          {errors.senha && <p className="text-sm text-destructive mt-1">{errors.senha}</p>}
        </div>

        <div>
          <label className="block text-sm font-semibold text-deep mb-2">Confirmar senha</label>
          <input
            type="password"
            name="confirmarSenha"
            value={formData.confirmarSenha}
            onChange={handleChange}
            className={`w-full rounded-xl border px-4 py-3 text-sm ${errors.confirmarSenha ? "border-destructive" : "border-border"} focus:border-primary focus:outline-none`}
            placeholder="Confirme sua senha"
          />
          {errors.confirmarSenha && <p className="text-sm text-destructive mt-1">{errors.confirmarSenha}</p>}
        </div>

        <div>
          <label className="block text-sm font-semibold text-deep mb-2">CPF</label>
          <input
            type="text"
            name="cpf"
            value={formData.cpf}
            onChange={handleChange}
            className={`w-full rounded-xl border px-4 py-3 text-sm ${errors.cpf ? "border-destructive" : "border-border"} focus:border-primary focus:outline-none`}
            placeholder="000.000.000-00"
          />
          {errors.cpf && <p className="text-sm text-destructive mt-1">{errors.cpf}</p>}
        </div>

        <div>
          <label className="block text-sm font-semibold text-deep mb-2">Telefone</label>
          <input
            type="text"
            name="telefone"
            value={formData.telefone}
            onChange={handleChange}
            className="w-full rounded-xl border border-border px-4 py-3 text-sm focus:border-primary focus:outline-none"
            placeholder="(00) 00000-0000"
          />
        </div>

        {userType === "atleta" && (
          <>
            <div>
              <label className="block text-sm font-semibold text-deep mb-2">Data de nascimento</label>
              <input
                type="date"
                name="dataNascimento"
                value={formData.dataNascimento}
                onChange={handleChange}
                className={`w-full rounded-xl border px-4 py-3 text-sm ${errors.dataNascimento ? "border-destructive" : "border-border"} focus:border-primary focus:outline-none`}
              />
              {errors.dataNascimento && <p className="text-sm text-destructive mt-1">{errors.dataNascimento}</p>}
            </div>

            <div>
              <label className="block text-sm font-semibold text-deep mb-2">Categoria</label>
              <select
                name="categoria"
                value={formData.categoria}
                onChange={handleChange}
                className="w-full rounded-xl border border-border px-4 py-3 text-sm focus:border-primary focus:outline-none"
              >
                <option value="">Selecione</option>
                <option value="infantil">Infantil</option>
                <option value="juvenil">Juvenil</option>
                <option value="junior">Junior</option>
                <option value="adulto">Adulto</option>
                <option value="master">Master</option>
              </select>
            </div>
          </>
        )}

        {(userType === "treinador" || userType === "gestor") && (
          <div>
            <label className="block text-sm font-semibold text-deep mb-2">Clube</label>
            <select
              name="clube"
              value={formData.clube}
              onChange={handleChange}
              className={`w-full rounded-xl border px-4 py-3 text-sm ${errors.clube ? "border-destructive" : "border-border"} focus:border-primary focus:outline-none`}
            >
              <option value="">Selecione seu clube</option>
              <option value="clube1">Clube Exemplo 1</option>
              <option value="clube2">Clube Exemplo 2</option>
            </select>
            {errors.clube && <p className="text-sm text-destructive mt-1">{errors.clube}</p>}
          </div>
        )}

        {userType === "treinador" && (
          <>
            <div>
              <label className="block text-sm font-semibold text-deep mb-2">Especialidade</label>
              <input
                type="text"
                name="especialidade"
                value={formData.especialidade}
                onChange={handleChange}
                className="w-full rounded-xl border border-border px-4 py-3 text-sm focus:border-primary focus:outline-none"
                placeholder="Ex: Natação, Polo Aquático"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-deep mb-2">Credencial</label>
              <input
                type="text"
                name="credencial"
                value={formData.credencial}
                onChange={handleChange}
                className="w-full rounded-xl border border-border px-4 py-3 text-sm focus:border-primary focus:outline-none"
                placeholder="Número da credencial"
              />
            </div>
          </>
        )}

        {userType === "gestor" && (
          <div>
            <label className="block text-sm font-semibold text-deep mb-2">Cargo</label>
            <input
              type="text"
              name="cargo"
              value={formData.cargo}
              onChange={handleChange}
              className="w-full rounded-xl border border-border px-4 py-3 text-sm focus:border-primary focus:outline-none"
              placeholder="Ex: Presidente, Diretor Técnico"
            />
          </div>
        )}
      </div>

      {errors.submit && (
        <div className="rounded-xl bg-destructive/10 border border-destructive/20 p-4 text-sm text-destructive">
          {errors.submit}
        </div>
      )}

      <div className="flex items-start gap-3">
        <input
          type="checkbox"
          id="terms"
          required
          className="mt-1 h-4 w-4 rounded border-border text-primary focus:ring-primary"
        />
        <label htmlFor="terms" className="text-sm text-muted-foreground">
          Concordo com os{" "}
          <a href="/termos" className="text-primary hover:underline">
            termos de uso
          </a>{" "}
          e{" "}
          <a href="/privacidade" className="text-primary hover:underline">
            política de privacidade
          </a>{" "}
          da FCDA.
        </label>
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full rounded-xl bg-deep text-deep-foreground font-bold px-6 py-4 hover:bg-primary transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {isSubmitting ? "Processando..." : "Criar conta"}
      </button>
    </form>
  );
}
