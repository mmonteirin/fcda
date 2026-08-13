import { queryOptions } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { asDynamicSupabase } from "./supabase-helpers";

export type Modalidade = {
  id: string;
  slug: string;
  nome: string;
  descricao: string;
  img_url: string | null;
  ordem: number;
  categoria_id: string | null;
};

export type CategoriaModalidade = {
  id: string;
  nome: string;
  slug: string;
  descricao: string | null;
  ordem: number;
};
export type Noticia = {
  id: string;
  slug: string;
  categoria: string;
  data: string;
  titulo: string;
  resumo: string;
  conteudo: string | null;
  imagem_url: string | null;
  publicado: boolean;
};
export type Evento = {
  id: string;
  data_texto: string;
  data_inicio: string | null;
  data_fim?: string | null;
  nome: string;
  local: string;
  modalidade: string;
  ano: number | null;
  descricao?: string | null;
  status?: string | null;
  link_inscricao?: string | null;
  imagem_url?: string | null;
  created_at: string;
  updated_at: string;
};
export type Diretor = {
  id: string;
  nome: string;
  cargo: string;
  ordem: number;
};

export type TransparenciaDocumento = {
  id: string;
  tipo: "boletim" | "edital" | "prestacao_contas" | "regulamento" | "ata" | "relatorio";
  titulo: string;
  descricao: string | null;
  arquivo_url: string;
  arquivo_nome: string;
  data_publicacao: string;
  publicado: boolean;
};

export type UserWithRoles = {
  id: string;
  email: string;
  nome: string | null;
  roles: string[];
};

export const modalidadesQuery = queryOptions({
  queryKey: ["modalidades"],
  queryFn: async (): Promise<Modalidade[]> => {
    const sb = asDynamicSupabase(supabase);
    const { data, error } = await sb
      .from("modalidades")
      .select("*")
      .order("ordem", { ascending: true });
    if (error) throw error;
    return data ?? [];
  },
});

export const categoriasModalidadesQuery = queryOptions({
  queryKey: ["categorias-modalidades"],
  queryFn: async (): Promise<CategoriaModalidade[]> => {
    const sb = asDynamicSupabase(supabase);
    const { data, error } = await sb
      .from("categorias_modalidades")
      .select("*")
      .order("ordem", { ascending: true });
    if (error) throw error;
    return data ?? [];
  },
});

export const noticiasQuery = (onlyPublished = true) =>
  queryOptions({
    queryKey: ["noticias", onlyPublished],
    queryFn: async (): Promise<Noticia[]> => {
      let q = supabase.from("noticias").select("*").order("data", { ascending: false });
      if (onlyPublished) q = q.eq("publicado", true);
      const { data, error } = await q;
      if (error) throw error;
      return data ?? [];
    },
  });

const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export const noticiaByIdentifierQuery = (identifier: string) =>
  queryOptions({
    queryKey: ["noticia", identifier],
    queryFn: async (): Promise<Noticia | null> => {
      const query = supabase.from("noticias").select("*");
      const { data, error } = await (
        uuidPattern.test(identifier) ? query.eq("id", identifier) : query.eq("slug", identifier)
      ).single();
      if (error) {
        if (error.code === "PGRST116") return null; // Not found
        throw error;
      }
      return data;
    },
  });

export const eventosQuery = (ano?: number) =>
  queryOptions({
    queryKey: ["eventos", ano],
    queryFn: async (): Promise<Evento[]> => {
      let query = supabase
        .from("eventos")
        .select("*")
        .order("data_inicio", { ascending: true, nullsFirst: false });
      if (ano) {
        query = query.eq("ano", ano);
      }
      const { data, error } = await query;
      if (error) throw error;
      return data ?? [];
    },
  });

export const eventoByIdQuery = (id: string) =>
  queryOptions({
    queryKey: ["evento", id],
    queryFn: async (): Promise<Evento | null> => {
      const { data, error } = await supabase
        .from("eventos")
        .select("*")
        .eq("id", id)
        .single();
      if (error) {
        if (error.code === "PGRST116") return null; // Not found
        throw error;
      }
      return data;
    },
  });

export const diretoresQuery = queryOptions({
  queryKey: ["diretores"],
  queryFn: async (): Promise<Diretor[]> => {
    const { data, error } = await supabase
      .from("diretores")
      .select("*")
      .order("ordem", { ascending: true });
    if (error) throw error;
    return data ?? [];
  },
});

export const transparenciaQuery = (onlyPublished = true) =>
  queryOptions({
    queryKey: ["transparencia", onlyPublished],
    queryFn: async (): Promise<TransparenciaDocumento[]> => {
      const sb = asDynamicSupabase(supabase);
      let q = sb
        .from("transparencia_documentos")
        .select("*")
        .order("data_publicacao", { ascending: false });
      if (onlyPublished) q = q.eq("publicado", true);
      const { data, error } = await q;
      if (error) throw error;
      return data ?? [];
    },
  });

export const usersQuery = queryOptions({
  queryKey: ["users"],
  queryFn: async (): Promise<UserWithRoles[]> => {
    const { data: profiles, error: profilesError } = await supabase
      .from("profiles")
      .select("*")
      .order("created_at", { ascending: false });
    if (profilesError) throw profilesError;

    const { data: roles, error: rolesError } = await supabase
      .from("user_roles")
      .select("user_id, role");
    if (rolesError) throw rolesError;

    const rolesByUserId = (roles ?? []).reduce(
      (acc, r) => {
        if (!acc[r.user_id]) acc[r.user_id] = [];
        acc[r.user_id].push(r.role);
        return acc;
      },
      {} as Record<string, string[]>,
    );

    return (profiles ?? []).map((p) => ({
      id: p.id,
      email: p.email,
      nome: p.nome,
      roles: rolesByUserId[p.id] ?? [],
    }));
  },
});

export type BannerConfig = {
  id: string;
  texto: string;
  link: string | null;
  ativo: boolean;
};

export const bannerQuery = queryOptions({
  queryKey: ["banner"],
  queryFn: async (): Promise<BannerConfig> => {
    const sb = asDynamicSupabase(supabase);
    const { data, error } = await sb.from("banner_config").select("*").eq("id", "default").single();
    if (error && error.code !== "PGRST116") throw error;
    return data ?? { id: "default", texto: "", link: null, ativo: false };
  },
});

export type EventoPdf = {
  id: string;
  evento_id: string;
  tipo:
    | "resultados"
    | "pontuacao"
    | "eficiencia"
    | "recordes"
    | "quadro_de_medalhas"
    | "indice_tecnico"
    | "programa_de_provas"
    | "inscritos_por_clube"
    | "relacao_de_inscritos"
    | "balizamentos"
    | "resultados_gerais"
    | "regulamentos"
    | "relacao_de_cortes"
    | "mapa_de_inscricao"
    | "indices"
    | "lista_de_hoteis"
    | "outros"
    | "sumula"
    | "tabela_de_jogos"
    | "mapa_da_prova"
    | "termo_de_responsabilidade"
    | "ranking"
    | "inscricoes";
  url: string;
  nome_arquivo: string;
  data_upload: string;
};

export type Mensagem = {
  id: string;
  nome: string;
  email: string;
  telefone: string | null;
  assunto: string;
  mensagem: string;
  lido: boolean;
  created_at: string;
};

export const eventosPdfsQuery = queryOptions({
  queryKey: ["eventos-pdfs"],
  queryFn: async (): Promise<EventoPdf[]> => {
    const sb = asDynamicSupabase(supabase);
    const { data, error } = await sb
      .from("eventos_pdfs")
      .select("*")
      .order("data_upload", { ascending: false });
    if (error) throw error;
    return data ?? [];
  },
});

export const mensagensQuery = queryOptions({
  queryKey: ["mensagens"],
  queryFn: async (): Promise<Mensagem[]> => {
    const sb = asDynamicSupabase(supabase);
    const { data, error } = await sb
      .from("mensagens")
      .select("id, nome, email, telefone, assunto, mensagem, lido, created_at")
      .order("created_at", { ascending: false });
    if (error) throw error;
    return data ?? [];
  },
});

export type SolicitacaoFiliacao = {
  id: string;
  tipo: "filiacao" | "vinculacao";
  razao_social: string;
  cnpj: string;
  inscricao_estadual: string | null;
  endereco: string;
  cep: string;
  bairro: string;
  cidade: string;
  uf: string;
  fone: string | null;
  fax: string | null;
  alvara: string | null;
  certidao: string | null;
  data_fundacao: string | null;
  data_publicacao: string | null;
  status: "pendente" | "aprovado" | "rejeitado";
  observacoes: string | null;
  doc_cnpj_url: string | null;
  doc_requerimento_url: string | null;
  aceite_termo: boolean;
  aceite_em: string | null;
  created_at: string;
  updated_at: string;
};

export type Parceiro = {
  id: string;
  nome: string;
  logo_url: string | null;
  site_url: string | null;
  categoria: "apoio_institucional" | "patrocinio" | "parceria";
  ordem: number;
  ativo: boolean;
  created_at: string;
  updated_at: string;
};

export const filiacaoQuery = queryOptions({
  queryKey: ["solicitacoes_filiacao"],
  queryFn: async (): Promise<SolicitacaoFiliacao[]> => {
    const sb = asDynamicSupabase(supabase);
    const { data, error } = await sb
      .from("solicitacoes_filiacao")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) throw error;
    return data ?? [];
  },
});

export const parceirosQuery = (onlyActive = true) =>
  queryOptions({
    queryKey: ["parceiros", onlyActive],
    queryFn: async (): Promise<Parceiro[]> => {
      const sb = asDynamicSupabase(supabase);
      let query = sb.from("parceiros").select("*").order("ordem", { ascending: true });
      if (onlyActive) query = query.eq("ativo", true);
      const { data, error } = await query;
      if (error) throw error;
      return data ?? [];
    },
  });

export type Clube = {
  id: string;
  nome: string;
  sigla: string | null;
  logo_url: string | null;
  cidade: string | null;
  estado: string | null;
  fundacao: string | null;
  email: string | null;
  telefone: string | null;
  site_url: string | null;
  endereco: string | null;
  ativo: boolean;
  ordem: number;
  created_at: string;
  updated_at: string;
};

export type Curso = {
  id: string;
  titulo: string;
  resumo: string;
  descricao: string | null;
  data_inicio: string | null;
  data_fim: string | null;
  local: string | null;
  carga_horaria: string | null;
  imagem_url: string | null;
  link_inscricao: string | null;
  publicado: boolean;
  created_at: string;
  updated_at: string;
};

export const clubesQuery = (onlyActive = true) =>
  queryOptions({
    queryKey: ["clubes", onlyActive],
    queryFn: async (): Promise<Clube[]> => {
      const sb = asDynamicSupabase(supabase);
      let query = sb.from("clubes").select("*").order("ordem", { ascending: true });
      if (onlyActive) query = query.eq("ativo", true);
      const { data, error } = await query;
      if (error) throw error;
      return data ?? [];
    },
  });

export const cursosQuery = (onlyPublished = true) =>
  queryOptions({
    queryKey: ["cursos", onlyPublished],
    queryFn: async (): Promise<Curso[]> => {
      const sb = asDynamicSupabase(supabase);
      let query = sb.from("cursos").select("*").order("created_at", { ascending: false });
      if (onlyPublished) query = query.eq("publicado", true);
      const { data, error } = await query;
      if (error) throw error;
      return data ?? [];
    },
  });

// ============ PERFIS DE USUÁRIO ============
export type AtletaProfile = {
  id: string;
  data_nascimento: string;
  cpf: string | null;
  telefone: string | null;
  clube_id: string | null;
  categoria: string | null;
  ativo: boolean;
  created_at: string;
  updated_at: string;
};

export type TreinadorProfile = {
  id: string;
  cpf: string | null;
  telefone: string | null;
  clube_id: string | null;
  credencial: string | null;
  especialidade: string | null;
  ativo: boolean;
  created_at: string;
  updated_at: string;
};

export type GestorProfile = {
  id: string;
  cpf: string | null;
  telefone: string | null;
  clube_id: string | null;
  cargo: string | null;
  ativo: boolean;
  created_at: string;
  updated_at: string;
};

export type UserProfile = {
  id: string;
  email: string;
  nome: string | null;
  roles: string[];
};

export const userProfileQuery = (userId: string) =>
  queryOptions({
    queryKey: ["userProfile", userId],
    queryFn: async (): Promise<UserProfile> => {
      const sb = asDynamicSupabase(supabase);
      
      // Buscar profile básico
      const { data: profile, error: profileError } = await sb
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .single();
      
      if (profileError) throw profileError;
      
      // Buscar roles do usuário
      const { data: roles, error: rolesError } = await sb
        .from("user_roles")
        .select("role")
        .eq("user_id", userId);
      
      if (rolesError) throw rolesError;
      
      return {
        id: profile.id,
        email: profile.email,
        nome: profile.nome,
        roles: roles?.map((r: { role: string }) => r.role) || [],
      };
    },
  });

export const atletaProfileQuery = (userId: string) =>
  queryOptions({
    queryKey: ["atletaProfile", userId],
    queryFn: async (): Promise<AtletaProfile | null> => {
      const sb = asDynamicSupabase(supabase);
      const { data, error } = await sb
        .from("atletas")
        .select("*")
        .eq("id", userId)
        .single();
      
      if (error) {
        if (error.code === "PGRST116") return null; // Not found
        throw error;
      }
      return data;
    },
  });

export const treinadorProfileQuery = (userId: string) =>
  queryOptions({
    queryKey: ["treinadorProfile", userId],
    queryFn: async (): Promise<TreinadorProfile | null> => {
      const sb = asDynamicSupabase(supabase);
      const { data, error } = await sb
        .from("treinadores")
        .select("*")
        .eq("id", userId)
        .single();
      
      if (error) {
        if (error.code === "PGRST116") return null; // Not found
        throw error;
      }
      return data;
    },
  });

export const gestorProfileQuery = (userId: string) =>
  queryOptions({
    queryKey: ["gestorProfile", userId],
    queryFn: async (): Promise<GestorProfile | null> => {
      const sb = asDynamicSupabase(supabase);
      const { data, error } = await sb
        .from("gestores_clube")
        .select("*")
        .eq("id", userId)
        .single();
      
      if (error) {
        if (error.code === "PGRST116") return null; // Not found
        throw error;
      }
      return data;
    },
  });

// Map slug de modalidade para imagem local fallback
import imgNatacao from "@/assets/mod-natacao.jpg";
import imgPolo from "@/assets/mod-polo.jpg";
import imgSaltos from "@/assets/mod-saltos.jpg";
import imgArtistico from "@/assets/mod-artistico.jpg";
import imgAguas from "@/assets/mod-aguas.jpg";

const localBySlug: Record<string, string> = {
  natacao: imgNatacao,
  "polo-aquatico": imgPolo,
  "saltos-ornamentais": imgSaltos,
  "nado-artistico": imgArtistico,
  "aguas-abertas": imgAguas,
};

export function modalidadeImg(m: Pick<Modalidade, "slug" | "img_url">): string {
  if (m.img_url && /^https?:\/\//.test(m.img_url)) return m.img_url;
  return localBySlug[m.slug] ?? imgNatacao;
}
