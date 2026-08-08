import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { useServerFn } from "@tanstack/react-start";
import { supabase } from "@/integrations/supabase/client";
import {
  userProfileQuery,
  atletaProfileQuery,
  treinadorProfileQuery,
  gestorProfileQuery,
  type UserProfile,
  type AtletaProfile,
  type TreinadorProfile,
  type GestorProfile,
} from "@/lib/site-queries";
import {
  updateProfile,
  updateAtletaProfile,
  updateTreinadorProfile,
  updateGestorProfile,
} from "@/lib/admin.functions";
import {
  User,
  Dumbbell,
  Building2,
  Mail,
  Phone,
  Calendar,
  MapPin,
  Edit,
  Save,
  X,
  Shield,
  Award,
  Trophy,
  Users,
} from "lucide-react";

export const Route = createFileRoute("/_authenticated/perfil")({
  component: Perfil,
});

function Perfil() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
      setLoading(false);
    });
  }, []);
  
  if (loading) return <div>Carregando...</div>;
  if (!user) return <div>Usuário não autenticado</div>;
  
  const userProfile = useSuspenseQuery(userProfileQuery(user.id)).data;
  const atletaProfile = useSuspenseQuery(atletaProfileQuery(user.id)).data;
  const treinadorProfile = useSuspenseQuery(treinadorProfileQuery(user.id)).data;
  const gestorProfile = useSuspenseQuery(gestorProfileQuery(user.id)).data;
  
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState<"dashboard" | "edit">("dashboard");

  const userRole = userProfile.roles[0] || "user";
  const isAtleta = userProfile.roles.includes("atleta");
  const isTreinador = userProfile.roles.includes("treinador");
  const isGestor = userProfile.roles.includes("gestor_clube");

  const RoleIcon = isAtleta ? User : isTreinador ? Dumbbell : isGestor ? Building2 : User;
  const roleLabel = isAtleta ? "Atleta" : isTreinador ? "Treinador" : isGestor ? "Gestor de Clube" : "Usuário";
  const roleColor = isAtleta ? "bg-blue-500" : isTreinador ? "bg-orange-500" : isGestor ? "bg-purple-500" : "bg-gray-500";

  return (
    <div className="min-h-screen bg-background">
      {/* Header do Perfil */}
      <div className="bg-gradient-to-r from-deep to-primary text-primary-foreground py-16">
        <div className="mx-auto max-w-6xl px-6">
          <div className="flex items-center gap-6">
            <div className={`h-24 w-24 rounded-full ${roleColor} grid place-items-center text-white`}>
              <RoleIcon className="h-12 w-12" />
            </div>
            <div className="flex-1">
              <h1 className="text-4xl font-bold">{userProfile.nome || "Usuário"}</h1>
              <p className="mt-2 text-primary-foreground/80">{userProfile.email}</p>
              <div className="mt-3 flex items-center gap-3">
                <span className="inline-flex items-center gap-1.5 text-sm font-semibold uppercase rounded-full px-3 py-1 bg-white/20">
                  <Shield className="h-4 w-4" /> {roleLabel}
                </span>
                {userProfile.roles.map((role) => (
                  <span key={role} className="text-xs text-primary-foreground/60 capitalize">
                    {role}
                  </span>
                ))}
              </div>
            </div>
            <button
              onClick={() => setIsEditing(!isEditing)}
              className="inline-flex items-center gap-2 rounded-xl bg-white/20 px-4 py-2 text-sm font-semibold hover:bg-white/30 transition-colors"
            >
              {isEditing ? <X className="h-4 w-4" /> : <Edit className="h-4 w-4" />}
              {isEditing ? "Cancelar" : "Editar perfil"}
            </button>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-6 py-8">
        {/* Tabs de Navegação */}
        <div className="flex gap-2 mb-8 border-b border-border">
          <button
            onClick={() => setActiveTab("dashboard")}
            className={`px-4 py-3 text-sm font-semibold border-b-2 transition-colors ${
              activeTab === "dashboard"
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-deep"
            }`}
          >
            Dashboard
          </button>
          <button
            onClick={() => setActiveTab("edit")}
            className={`px-4 py-3 text-sm font-semibold border-b-2 transition-colors ${
              activeTab === "edit"
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-deep"
            }`}
          >
            Dados Pessoais
          </button>
        </div>

        {activeTab === "dashboard" && (
          <DashboardContent
            userProfile={userProfile}
            atletaProfile={atletaProfile}
            treinadorProfile={treinadorProfile}
            gestorProfile={gestorProfile}
            isAtleta={isAtleta}
            isTreinador={isTreinador}
            isGestor={isGestor}
          />
        )}

        {activeTab === "edit" && (
          <EditProfileForm
            userProfile={userProfile}
            atletaProfile={atletaProfile}
            treinadorProfile={treinadorProfile}
            gestorProfile={gestorProfile}
            isAtleta={isAtleta}
            isTreinador={isTreinador}
            isGestor={isGestor}
            onSave={() => {
              setIsEditing(false);
              setActiveTab("dashboard");
            }}
          />
        )}
      </div>
    </div>
  );
}

function DashboardContent({
  userProfile,
  atletaProfile,
  treinadorProfile,
  gestorProfile,
  isAtleta,
  isTreinador,
  isGestor,
}: {
  userProfile: UserProfile;
  atletaProfile: AtletaProfile | null;
  treinadorProfile: TreinadorProfile | null;
  gestorProfile: GestorProfile | null;
  isAtleta: boolean;
  isTreinador: boolean;
  isGestor: boolean;
}) {
  return (
    <div className="space-y-6">
      {/* Cards de Informações */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        <InfoCard
          icon={Mail}
          label="E-mail"
          value={userProfile.email}
        />
        {atletaProfile && (
          <>
            <InfoCard
              icon={Calendar}
              label="Data de Nascimento"
              value={new Date(atletaProfile.data_nascimento).toLocaleDateString("pt-BR")}
            />
            <InfoCard
              icon={Award}
              label="Categoria"
              value={atletaProfile.categoria || "Não definida"}
            />
          </>
        )}
        {treinadorProfile && (
          <>
            <InfoCard
              icon={Dumbbell}
              label="Especialidade"
              value={treinadorProfile.especialidade || "Não definida"}
            />
            <InfoCard
              icon={Shield}
              label="Credencial"
              value={treinadorProfile.credencial || "Não definida"}
            />
          </>
        )}
        {gestorProfile && (
          <InfoCard
            icon={Building2}
            label="Cargo"
            value={gestorProfile.cargo || "Não definido"}
          />
        )}
        {(atletaProfile?.telefone || treinadorProfile?.telefone || gestorProfile?.telefone) && (
          <InfoCard
            icon={Phone}
            label="Telefone"
            value={atletaProfile?.telefone || treinadorProfile?.telefone || gestorProfile?.telefone || ""}
          />
        )}
      </div>

      {/* Dashboard Específico por Role */}
      {isAtleta && <AtletaDashboard atletaProfile={atletaProfile} />}
      {isTreinador && <TreinadorDashboard treinadorProfile={treinadorProfile} />}
      {isGestor && <GestorDashboard gestorProfile={gestorProfile} />}
    </div>
  );
}

function InfoCard({ icon: Icon, label, value }: { icon: any; label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-card border border-border p-6">
      <div className="flex items-center gap-3 mb-3">
        <Icon className="h-5 w-5 text-primary" />
        <span className="text-sm font-semibold text-muted-foreground">{label}</span>
      </div>
      <p className="text-lg font-medium text-deep">{value}</p>
    </div>
  );
}

function AtletaDashboard({ atletaProfile }: { atletaProfile: AtletaProfile | null }) {
  return (
    <div className="rounded-2xl bg-card border border-border p-6">
      <h2 className="text-xl font-bold text-deep mb-6 flex items-center gap-2">
        <Trophy className="h-5 w-5 text-gold" /> Dashboard do Atleta
      </h2>
      <div className="grid md:grid-cols-3 gap-6">
        <StatCard label="Competições" value="0" icon={Trophy} />
        <StatCard label="Recordes" value="0" icon={Award} />
        <StatCard label="Ranking" value="--" icon={Users} />
      </div>
      <div className="mt-6 p-4 bg-secondary/30 rounded-xl">
        <p className="text-sm text-muted-foreground">
          Seu histórico de competições e recordes aparecerá aqui assim que você participar de eventos oficiais.
        </p>
      </div>
    </div>
  );
}

function TreinadorDashboard({ treinadorProfile }: { treinadorProfile: TreinadorProfile | null }) {
  return (
    <div className="rounded-2xl bg-card border border-border p-6">
      <h2 className="text-xl font-bold text-deep mb-6 flex items-center gap-2">
        <Dumbbell className="h-5 w-5 text-orange-500" /> Dashboard do Treinador
      </h2>
      <div className="grid md:grid-cols-3 gap-6">
        <StatCard label="Atletas" value="0" icon={Users} />
        <StatCard label="Cursos" value="0" icon={Award} />
        <StatCard label="Eventos" value="0" icon={Calendar} />
      </div>
      <div className="mt-6 p-4 bg-secondary/30 rounded-xl">
        <p className="text-sm text-muted-foreground">
          Gerencie seus atletas e acompanhe o progresso da sua equipe.
        </p>
      </div>
    </div>
  );
}

function GestorDashboard({ gestorProfile }: { gestorProfile: GestorProfile | null }) {
  return (
    <div className="rounded-2xl bg-card border border-border p-6">
      <h2 className="text-xl font-bold text-deep mb-6 flex items-center gap-2">
        <Building2 className="h-5 w-5 text-purple-500" /> Dashboard do Gestor
      </h2>
      <div className="grid md:grid-cols-3 gap-6">
        <StatCard label="Atletas" value="0" icon={Users} />
        <StatCard label="Treinadores" value="0" icon={Dumbbell} />
        <StatCard label="Eventos" value="0" icon={Calendar} />
      </div>
      <div className="mt-6 p-4 bg-secondary/30 rounded-xl">
        <p className="text-sm text-muted-foreground">
          Gerencie as informações do seu clube e acompanhe as inscrições em competições.
        </p>
      </div>
    </div>
  );
}

function StatCard({ label, value, icon: Icon }: { label: string; value: string | number; icon: any }) {
  return (
    <div className="rounded-xl bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20 p-4">
      <Icon className="h-5 w-5 text-primary mb-2" />
      <div className="text-2xl font-bold text-deep">{value}</div>
      <div className="text-sm text-muted-foreground">{label}</div>
    </div>
  );
}

function EditProfileForm({
  userProfile,
  atletaProfile,
  treinadorProfile,
  gestorProfile,
  isAtleta,
  isTreinador,
  isGestor,
  onSave,
}: {
  userProfile: UserProfile;
  atletaProfile: AtletaProfile | null;
  treinadorProfile: TreinadorProfile | null;
  gestorProfile: GestorProfile | null;
  isAtleta: boolean;
  isTreinador: boolean;
  isGestor: boolean;
  onSave: () => void;
}) {
  const updateProfileFn = useServerFn(updateProfile);
  const updateAtletaFn = useServerFn(updateAtletaProfile);
  const updateTreinadorFn = useServerFn(updateTreinadorProfile);
  const updateGestorFn = useServerFn(updateGestorProfile);
  
  const [formData, setFormData] = useState({
    nome: userProfile.nome || "",
    telefone: atletaProfile?.telefone || treinadorProfile?.telefone || gestorProfile?.telefone || "",
    ...(isAtleta && atletaProfile && {
      data_nascimento: atletaProfile.data_nascimento,
      categoria: atletaProfile.categoria || "",
    }),
    ...(isTreinador && treinadorProfile && {
      especialidade: treinadorProfile.especialidade || "",
      credencial: treinadorProfile.credencial || "",
    }),
    ...(isGestor && gestorProfile && {
      cargo: gestorProfile.cargo || "",
    }),
  });

  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setError(null);

    try {
      // Atualizar profile básico
      await updateProfileFn({ data: { nome: formData.nome } });

      // Atualizar profile específico
      if (isAtleta) {
        await updateAtletaFn({
          data: {
            telefone: formData.telefone,
            data_nascimento: formData.data_nascimento,
            categoria: formData.categoria,
          },
        });
      } else if (isTreinador) {
        await updateTreinadorFn({
          data: {
            telefone: formData.telefone,
            especialidade: formData.especialidade,
            credencial: formData.credencial,
          },
        });
      } else if (isGestor) {
        await updateGestorFn({
          data: {
            telefone: formData.telefone,
            cargo: formData.cargo,
          },
        });
      }

      onSave();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao salvar perfil");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="rounded-2xl bg-card border border-border p-6">
        <h3 className="text-lg font-bold text-deep mb-6">Informações Básicas</h3>
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-semibold text-deep mb-2">Nome completo</label>
            <input
              type="text"
              name="nome"
              value={formData.nome}
              onChange={handleChange}
              className="w-full rounded-xl border border-border px-4 py-3 text-sm focus:border-primary focus:outline-none"
            />
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
        </div>
      </div>

      {isAtleta && (
        <div className="rounded-2xl bg-card border border-border p-6">
          <h3 className="text-lg font-bold text-deep mb-6">Dados de Atleta</h3>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-deep mb-2">Data de Nascimento</label>
              <input
                type="date"
                name="data_nascimento"
                value={formData.data_nascimento}
                onChange={handleChange}
                className="w-full rounded-xl border border-border px-4 py-3 text-sm focus:border-primary focus:outline-none"
              />
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
          </div>
        </div>
      )}

      {isTreinador && (
        <div className="rounded-2xl bg-card border border-border p-6">
          <h3 className="text-lg font-bold text-deep mb-6">Dados de Treinador</h3>
          <div className="grid md:grid-cols-2 gap-6">
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
          </div>
        </div>
      )}

      {isGestor && (
        <div className="rounded-2xl bg-card border border-border p-6">
          <h3 className="text-lg font-bold text-deep mb-6">Dados de Gestor</h3>
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
        </div>
      )}

      {error && (
        <div className="rounded-xl bg-destructive/10 border border-destructive/20 p-4 text-sm text-destructive">
          {error}
        </div>
      )}

      <div className="flex justify-end gap-3">
        <button
          type="button"
          onClick={() => onSave()}
          className="rounded-xl border border-border px-6 py-3 text-sm font-semibold hover:bg-secondary/50 transition-colors"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={isSaving}
          className="inline-flex items-center gap-2 rounded-xl bg-deep text-deep-foreground px-6 py-3 text-sm font-semibold hover:bg-primary transition-colors disabled:opacity-60"
        >
          <Save className="h-4 w-4" /> {isSaving ? "Salvando..." : "Salvar alterações"}
        </button>
      </div>
    </form>
  );
}
