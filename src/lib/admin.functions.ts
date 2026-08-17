import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { z } from "zod";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";
import { useAuth } from "@/lib/use-auth";
import { supabase as supabaseClient } from "@/integrations/supabase/client";
import { asDynamicSupabase } from "./supabase-helpers";

type SupabaseClient = ReturnType<typeof createClient<Database>>;

// Get the Supabase client and user ID from context
export function useAdminContext() {
  const { user } = useAuth();
  if (!user) throw new Error("Usuário não autenticado");
  return { supabase: supabaseClient, userId: user.id };
}

export async function assertEditor(supabase: SupabaseClient, userId: string) {
  const { data, error } = await supabase.from("user_roles").select("role").eq("user_id", userId);
  if (error) throw new Error(error.message);
  const roles = (data ?? []).map((r: { role: string }) => r.role);
  if (!roles.includes("admin") && !roles.includes("editor")) {
    throw new Error("Acesso negado: requer papel admin ou editor.");
  }
  return roles;
}

export const getMyRoles = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    const { data, error } = await supabase.from("user_roles").select("role").eq("user_id", userId);
    if (error) throw new Error(error.message);
    return { roles: (data ?? []).map((r: { role: string }) => r.role), userId };
  });

// ============ NOTICIAS ============
const noticiaSchema = z.object({
  id: z.string().uuid().optional(),
  slug: z
    .string()
    .min(1)
    .max(120)
    .regex(/^[a-z0-9-]+$/),
  categoria: z.string().min(1).max(60),
  data: z.string().min(1),
  titulo: z.string().min(1).max(200),
  resumo: z.string().min(1).max(500),
  conteudo: z.string().optional().nullable(),
  imagem_url: z.string().optional().nullable(),
  publicado: z.boolean(),
});

export const saveNoticia = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => noticiaSchema.parse(d))
  .handler(async ({ data, context }) => {
    await assertEditor(context.supabase, context.userId);
    const { id, ...rest } = data;
    if (id) {
      const { error } = await context.supabase.from("noticias").update(rest).eq("id", id);
      if (error) throw new Error(error.message);
    } else {
      const { error } = await context.supabase.from("noticias").insert(rest);
      if (error) throw new Error(error.message);
    }
    return { ok: true };
  });

export const deleteNoticia = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    await assertEditor(context.supabase, context.userId);
    const { error } = await context.supabase.from("noticias").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

// ============ EVENTOS ============
const eventoSchema = z.object({
  id: z.string().uuid().optional(),
  data_texto: z.string().min(1).max(40),
  data_inicio: z.string().optional().nullable(),
  data_fim: z.string().optional().nullable(),
  nome: z.string().min(1).max(200),
  local: z.string().min(1).max(200),
  modalidade: z.string().min(1).max(60),
  ano: z.number().int().min(2000).max(2100).optional().nullable(),
  descricao: z.string().max(5000).optional().nullable(),
  status: z
    .enum([
      "planejado",
      "confirmado",
      "inscricoes_abertas",
      "inscricoes_fechadas",
      "em_andamento",
      "finalizado",
      "cancelado",
    ])
    .optional()
    .nullable(),
  link_inscricao: z.string().url().optional().nullable(),
  imagem_url: z.string().url().optional().nullable(),
});

export async function saveEvento(supabase: SupabaseClient, userId: string, data: unknown) {
  const validated = eventoSchema.parse(data);
  await assertEditor(supabase, userId);
  const { id, ...rest } = validated;
  const sb = asDynamicSupabase(supabase);
  if (id) {
    const { error } = await sb.from("eventos").update(rest).eq("id", id);
    if (error) throw new Error(error.message);
  } else {
    const { error } = await sb.from("eventos").insert(rest);
    if (error) throw new Error(error.message);
  }
  return { ok: true };
}

export async function deleteEvento(supabase: SupabaseClient, userId: string, id: string) {
  await assertEditor(supabase, userId);
  const { error } = await supabase.from("eventos").delete().eq("id", id);
  if (error) throw new Error(error.message);
  return { ok: true };
}

export async function uploadEventoCapa(supabase: SupabaseClient, file: File) {
  if (!file.type.startsWith("image/")) throw new Error("Selecione um arquivo de imagem válido.");
  if (file.size > 5 * 1024 * 1024) throw new Error("A imagem de capa deve ter no máximo 5 MB.");

  const extension = file.name.split(".").pop()?.toLowerCase() || "jpg";
  const path = `eventos/${crypto.randomUUID()}.${extension}`;
  const { error } = await supabase.storage
    .from("site-images")
    .upload(path, file, { upsert: false });
  if (error) throw new Error(error.message);
  return supabase.storage.from("site-images").getPublicUrl(path).data.publicUrl;
}

// ============ CATEGORIAS DE MODALIDADES ============
const categoriaModalidadeSchema = z.object({
  id: z.string().uuid().optional(),
  nome: z.string().min(1).max(100),
  slug: z.string().min(1).max(100),
  descricao: z.string().optional().nullable(),
  ordem: z.number().int().min(0).max(999),
});

export async function saveCategoriaModalidade(
  supabase: SupabaseClient,
  userId: string,
  data: unknown,
) {
  const validated = categoriaModalidadeSchema.parse(data);
  await assertEditor(supabase, userId);
  const { id, ...rest } = validated;
  const sb = asDynamicSupabase(supabase);
  if (id) {
    const { error } = await sb.from("categorias_modalidades").update(rest).eq("id", id);
    if (error) throw new Error(error.message);
  } else {
    const { error } = await sb.from("categorias_modalidades").insert(rest);
    if (error) throw new Error(error.message);
  }
  return { ok: true };
}

export async function deleteCategoriaModalidade(
  supabase: SupabaseClient,
  userId: string,
  id: string,
) {
  await assertEditor(supabase, userId);
  const sb = asDynamicSupabase(supabase);
  const { error } = await sb.from("categorias_modalidades").delete().eq("id", id);
  if (error) throw new Error(error.message);
  return { ok: true };
}

// ============ MODALIDADES ============
const modalidadeSchema = z.object({
  id: z.string().uuid().optional(),
  slug: z
    .string()
    .min(1)
    .max(80)
    .regex(/^[a-z0-9-]+$/),
  nome: z.string().min(1).max(100),
  descricao: z.string().min(1).max(800),
  img_url: z.string().optional().nullable(),
  ordem: z.number().int().min(0).max(999),
  categoria_id: z.string().uuid().optional().nullable(),
});

export async function saveModalidade(supabase: SupabaseClient, userId: string, data: unknown) {
  const validated = modalidadeSchema.parse(data);
  await assertEditor(supabase, userId);
  const { id, ...rest } = validated;
  const sb = asDynamicSupabase(supabase);
  if (id) {
    const { error } = await sb.from("modalidades").update(rest).eq("id", id);
    if (error) throw new Error(error.message);
  } else {
    const { error } = await sb.from("modalidades").insert(rest);
    if (error) throw new Error(error.message);
  }
  return { ok: true };
}

export async function deleteModalidade(supabase: SupabaseClient, userId: string, id: string) {
  await assertEditor(supabase, userId);
  const { error } = await supabase.from("modalidades").delete().eq("id", id);
  if (error) throw new Error(error.message);
  return { ok: true };
}

// ============ DIRETORES ============
const diretorSchema = z.object({
  id: z.string().uuid().optional(),
  nome: z.string().min(1).max(120),
  cargo: z.string().min(1).max(120),
  ordem: z.number().int().min(0).max(999),
});

export const saveDiretor = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => diretorSchema.parse(d))
  .handler(async ({ data, context }) => {
    await assertEditor(context.supabase, context.userId);
    const { id, ...rest } = data;
    if (id) {
      const { error } = await context.supabase.from("diretores").update(rest).eq("id", id);
      if (error) throw new Error(error.message);
    } else {
      const { error } = await context.supabase.from("diretores").insert(rest);
      if (error) throw new Error(error.message);
    }
    return { ok: true };
  });

export const deleteDiretor = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    await assertEditor(context.supabase, context.userId);
    const { error } = await context.supabase.from("diretores").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

// ============ UPLOAD DE PDFS ============
const uploadPdfSchema = z.object({
  fileName: z.string(),
  fileType: z.string(),
  fileData: z.string(), // base64 encoded
  eventoId: z.string().uuid(),
  tipo: z.enum([
    "resultados",
    "pontuacao",
    "eficiencia",
    "recordes",
    "quadro_de_medalhas",
    "indice_tecnico",
    "programa_de_provas",
    "inscritos_por_clube",
    "relacao_de_inscritos",
    "balizamentos",
    "resultados_gerais",
    "regulamentos",
    "relacao_de_cortes",
    "mapa_de_inscricao",
    "indices",
    "lista_de_hoteis",
    "outros",
    "sumula",
    "tabela_de_jogos",
    "mapa_da_prova",
    "termo_de_responsabilidade",
    "ranking",
    "inscricoes",
  ]),
});

export const uploadPdf = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => uploadPdfSchema.parse(d))
  .handler(async ({ data, context }) => {
    await assertEditor(context.supabase, context.userId);

    const fileExt = data.fileName.split(".").pop();
    const fileName = `${Date.now()}.${fileExt}`;
    const filePath = `eventos/${fileName}`;

    // Convert base64 back to File
    const base64Data = data.fileData.split(",")[1];
    const binaryString = Buffer.from(base64Data, "base64");
    const file = new File([binaryString], data.fileName, { type: data.fileType });

    const { data: uploadData, error: uploadError } = await context.supabase.storage
      .from("site-images")
      .upload(filePath, file);

    if (uploadError) throw new Error(uploadError.message);

    const { data: publicUrlData } = context.supabase.storage
      .from("site-images")
      .getPublicUrl(filePath);

    // Save to eventos_pdfs table
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const sb = context.supabase as any;
    const { error: dbError } = await sb.from("eventos_pdfs").insert({
      evento_id: data.eventoId,
      tipo: data.tipo,
      url: publicUrlData.publicUrl,
      nome_arquivo: data.fileName,
      uploaded_by: context.userId,
    });

    if (dbError) throw new Error(dbError.message);

    return { url: publicUrlData.publicUrl };
  });

// ============ UPLOAD DE IMAGENS ============
const uploadImageSchema = z.object({
  fileName: z.string(),
  fileType: z.string(),
  fileData: z.string(), // base64 encoded
  folder: z.enum(["noticias", "modalidades", "cursos"]),
});

export const uploadImage = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => uploadImageSchema.parse(d))
  .handler(async ({ data, context }) => {
    await assertEditor(context.supabase, context.userId);

    const fileExt = data.fileName.split(".").pop();
    const fileName = `${Date.now()}.${fileExt}`;
    const filePath = `${data.folder}/${fileName}`;

    // Convert base64 back to File
    const base64Data = data.fileData.split(",")[1];
    const binaryString = Buffer.from(base64Data, "base64");
    const file = new File([binaryString], data.fileName, { type: data.fileType });

    const { data: uploadData, error: uploadError } = await context.supabase.storage
      .from("site-images")
      .upload(filePath, file);

    if (uploadError) throw new Error(uploadError.message);

    const { data: publicUrlData } = context.supabase.storage
      .from("site-images")
      .getPublicUrl(filePath);

    return { url: publicUrlData.publicUrl };
  });

// ============ PAINEL DA TRANSPARÊNCIA ============
const transparenciaSchema = z.object({
  id: z.string().uuid().optional(),
  tipo: z.enum(["boletim", "edital", "prestacao_contas", "regulamento", "ata", "relatorio"]),
  titulo: z.string().min(1).max(200),
  descricao: z.string().optional().nullable(),
  arquivo_url: z.string().min(1),
  arquivo_nome: z.string().min(1),
  data_publicacao: z.string().min(1),
  publicado: z.boolean(),
});

const uploadTransparenciaPdfSchema = z.object({
  fileName: z.string(),
  fileType: z.string(),
  fileData: z.string(), // base64 encoded
});

export const uploadTransparenciaPdf = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => uploadTransparenciaPdfSchema.parse(d))
  .handler(async ({ data, context }) => {
    await assertEditor(context.supabase, context.userId);

    const fileExt = data.fileName.split(".").pop();
    const fileName = `${Date.now()}.${fileExt}`;
    const filePath = `transparencia/${fileName}`;

    // Convert base64 back to File
    const base64Data = data.fileData.split(",")[1];
    const binaryString = Buffer.from(base64Data, "base64");
    const file = new File([binaryString], data.fileName, { type: data.fileType });

    const { data: uploadData, error: uploadError } = await context.supabase.storage
      .from("site-images")
      .upload(filePath, file);

    if (uploadError) throw new Error(uploadError.message);

    const { data: publicUrlData } = context.supabase.storage
      .from("site-images")
      .getPublicUrl(filePath);

    return { url: publicUrlData.publicUrl };
  });

export async function saveTransparencia(supabase: SupabaseClient, userId: string, data: unknown) {
  const validated = transparenciaSchema.parse(data);
  await assertEditor(supabase, userId);
  const { id, ...rest } = validated;
  const sb = asDynamicSupabase(supabase);
  if (id) {
    const { error } = await sb.from("transparencia_documentos").update(rest).eq("id", id);
    if (error) throw new Error(error.message);
  } else {
    const { error } = await sb.from("transparencia_documentos").insert(rest);
    if (error) throw new Error(error.message);
  }
  return { ok: true };
}

export async function deleteTransparencia(supabase: SupabaseClient, userId: string, id: string) {
  await assertEditor(supabase, userId);
  const sb = asDynamicSupabase(supabase);
  const { error } = await sb.from("transparencia_documentos").delete().eq("id", id);
  if (error) throw new Error(error.message);
  return { ok: true };
}

// ============ BANNER ============
const bannerSchema = z.object({
  texto: z.string().min(1).max(500),
  link: z.string().url().optional().nullable(),
  ativo: z.boolean(),
});

export async function getBanner(supabase: SupabaseClient) {
  const sb = asDynamicSupabase(supabase);
  const { data, error } = await sb.from("banner_config").select("*").eq("id", "default").single();
  if (error && error.code !== "PGRST116") throw error; // PGRST116 = not found
  return data ?? { id: "default", texto: "", link: null, ativo: false };
}

export async function saveBanner(supabase: SupabaseClient, userId: string, data: unknown) {
  const validated = bannerSchema.parse(data);
  await assertEditor(supabase, userId);
  const sb = asDynamicSupabase(supabase);
  const { error } = await sb.from("banner_config").upsert({ id: "default", ...validated });
  if (error) throw new Error(error.message);
  return { ok: true };
}

// ============ USUÁRIOS ============
const userRoleSchema = z.object({
  user_id: z.string().uuid(),
  role: z.enum(["admin", "editor", "atleta", "treinador", "gestor_clube"]),
});

const createUserSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  nome: z.string().min(1).max(120),
});

// ============ CADASTRO PÚBLICO ============
const publicRegisterSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  nome: z.string().min(1).max(120),
  userType: z.enum(["atleta", "treinador", "gestor_clube"]),
  cpf: z.string().optional(),
  telefone: z.string().optional(),
  data_nascimento: z.string().optional(),
  clube_id: z.string().uuid().optional(),
  categoria: z.string().optional(),
  especialidade: z.string().optional(),
  credencial: z.string().optional(),
  cargo: z.string().optional(),
});

// ============ ATUALIZAÇÃO DE PERFIL ============
const updateProfileSchema = z.object({
  nome: z.string().min(1).max(120).optional(),
  telefone: z.string().optional(),
});

const updateAtletaProfileSchema = z.object({
  data_nascimento: z.string().optional(),
  cpf: z.string().optional(),
  telefone: z.string().optional(),
  clube_id: z.string().uuid().optional(),
  categoria: z.string().optional(),
});

const updateTreinadorProfileSchema = z.object({
  cpf: z.string().optional(),
  telefone: z.string().optional(),
  clube_id: z.string().uuid().optional(),
  especialidade: z.string().optional(),
  credencial: z.string().optional(),
});

const updateGestorProfileSchema = z.object({
  cpf: z.string().optional(),
  telefone: z.string().optional(),
  clube_id: z.string().uuid().optional(),
  cargo: z.string().optional(),
});

export const updateProfile = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => updateProfileSchema.parse(d))
  .handler(async ({ data, context }) => {
    const sb = asDynamicSupabase(context.supabase);

    // Atualizar profile básico
    if (data.nome) {
      const { error: profileError } = await sb
        .from("profiles")
        .update({ nome: data.nome })
        .eq("id", context.userId);

      if (profileError) throw new Error(profileError.message);
    }

    return { ok: true };
  });

export const updateAtletaProfile = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => updateAtletaProfileSchema.parse(d))
  .handler(async ({ data, context }) => {
    const sb = asDynamicSupabase(context.supabase);

    const { error } = await sb.from("atletas").update(data).eq("id", context.userId);

    if (error) throw new Error(error.message);

    return { ok: true };
  });

export const updateTreinadorProfile = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => updateTreinadorProfileSchema.parse(d))
  .handler(async ({ data, context }) => {
    const sb = asDynamicSupabase(context.supabase);

    const { error } = await sb.from("treinadores").update(data).eq("id", context.userId);

    if (error) throw new Error(error.message);

    return { ok: true };
  });

export const updateGestorProfile = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => updateGestorProfileSchema.parse(d))
  .handler(async ({ data, context }) => {
    const sb = asDynamicSupabase(context.supabase);

    const { error } = await sb.from("gestores_clube").update(data).eq("id", context.userId);

    if (error) throw new Error(error.message);

    return { ok: true };
  });

export const publicRegister = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => publicRegisterSchema.parse(d))
  .handler(async ({ data }) => {
    const supabase = createClient<Database>(
      process.env.VITE_SUPABASE_URL!,
      process.env.VITE_SUPABASE_ANON_KEY!,
    );

    // Create user in Supabase Auth
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: {
        data: {
          nome: data.nome,
          userType: data.userType,
        },
      },
    });

    if (signUpError) {
      throw new Error(`Erro ao criar usuário: ${signUpError.message}`);
    }

    if (!signUpData.user) {
      throw new Error("Erro ao criar usuário: usuário não criado");
    }

    // Create profile record
    const { error: profileError } = await supabase
      .from("profiles")
      .insert({ id: signUpData.user.id, email: data.email, nome: data.nome });

    if (profileError) throw new Error(profileError.message);

    // Assign role based on user type
    const { error: roleError } = await supabase.from("user_roles").insert({
      user_id: signUpData.user.id,
      role: data.userType,
    });

    if (roleError) throw new Error(roleError.message);

    // Create specific profile based on user type
    const sb = asDynamicSupabase(supabase);

    if (data.userType === "atleta") {
      const { error: atletaError } = await sb.from("atletas").insert({
        id: signUpData.user.id,
        data_nascimento: data.data_nascimento || null,
        cpf: data.cpf || null,
        telefone: data.telefone || null,
        clube_id: data.clube_id || null,
        categoria: data.categoria || null,
      });
      if (atletaError) throw new Error(atletaError.message);
    } else if (data.userType === "treinador") {
      const { error: treinadorError } = await sb.from("treinadores").insert({
        id: signUpData.user.id,
        cpf: data.cpf || null,
        telefone: data.telefone || null,
        clube_id: data.clube_id || null,
        especialidade: data.especialidade || null,
        credencial: data.credencial || null,
      });
      if (treinadorError) throw new Error(treinadorError.message);
    } else if (data.userType === "gestor_clube") {
      const { error: gestorError } = await sb.from("gestores_clube").insert({
        id: signUpData.user.id,
        cpf: data.cpf || null,
        telefone: data.telefone || null,
        clube_id: data.clube_id || null,
        cargo: data.cargo || null,
      });
      if (gestorError) throw new Error(gestorError.message);
    }

    return { ok: true, userId: signUpData.user.id };
  });

export const createUser = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => createUserSchema.parse(d))
  .handler(async ({ data, context }) => {
    await assertEditor(context.supabase, context.userId);

    // Use regular signUp (requires auto-confirm to be enabled in Supabase)
    const { data: signUpData, error: signUpError } = await context.supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: {
        data: { nome: data.nome },
      },
    });

    if (signUpError) {
      throw new Error(
        `Erro ao criar usuário: ${signUpError.message}. Verifique se o auto-confirm está ativado no Supabase.`,
      );
    }

    // Create profile record
    if (signUpData.user) {
      const { error: profileError } = await context.supabase
        .from("profiles")
        .insert({ id: signUpData.user.id, email: data.email, nome: data.nome });
      if (profileError) throw new Error(profileError.message);
    }

    return { ok: true };
  });

export const addUserRole = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => userRoleSchema.parse(d))
  .handler(async ({ data, context }) => {
    await assertEditor(context.supabase, context.userId);
    const { error } = await context.supabase
      .from("user_roles")
      .insert({ user_id: data.user_id, role: data.role });
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const removeUserRole = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => userRoleSchema.parse(d))
  .handler(async ({ data, context }) => {
    await assertEditor(context.supabase, context.userId);
    const { error } = await context.supabase
      .from("user_roles")
      .delete()
      .eq("user_id", data.user_id)
      .eq("role", data.role);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

// ============ MENSAGENS ============
const mensagemSchema = z.object({
  nome: z.string().min(1).max(120),
  email: z.string().email(),
  telefone: z.string().optional().nullable(),
  assunto: z.string().min(1).max(200),
  mensagem: z.string().min(1).max(2000),
});

export async function sendMensagem(supabase: SupabaseClient, data: unknown) {
  const validated = mensagemSchema.parse(data);
  const { error } = await supabase.from("mensagens").insert(validated);
  if (error) throw new Error(error.message);
  return { ok: true };
}

export async function markMensagemAsRead(supabase: SupabaseClient, id: string) {
  const sb = asDynamicSupabase(supabase);
  const { error } = await sb.from("mensagens").update({ lido: true }).eq("id", id);
  if (error) throw new Error(error.message);
  return { ok: true };
}

export async function deleteMensagem(supabase: SupabaseClient, id: string) {
  const sb = asDynamicSupabase(supabase);
  const { error } = await sb.from("mensagens").delete().eq("id", id);
  if (error) throw new Error(error.message);
  return { ok: true };
}

// ============ SOLICITAÇÕES DE FILIAÇÃO ============
const filiacaoSchema = z.object({
  tipo: z.enum(["filiacao", "vinculacao"]),
  razaoSocial: z.string().min(1).max(200),
  cnpj: z.string().min(1).max(20),
  inscricaoEstadual: z.string().optional().nullable(),
  endereco: z.string().min(1).max(200),
  cep: z.string().min(1).max(10),
  bairro: z.string().min(1).max(100),
  cidade: z.string().min(1).max(100),
  uf: z.string().min(2).max(2),
  fone: z.string().optional().nullable(),
  fax: z.string().optional().nullable(),
  alvara: z.string().optional().nullable(),
  certidao: z.string().optional().nullable(),
  dataFundacao: z.string().optional().nullable(),
  dataPublicacao: z.string().optional().nullable(),
  docCnpjUrl: z.string().url().optional().nullable(),
  docRequerimentoUrl: z.string().url().optional().nullable(),
  aceiteTermo: z.boolean(),
});

export async function sendFiliacao(supabase: SupabaseClient, data: unknown) {
  const validated = filiacaoSchema.parse(data);
  const sb = asDynamicSupabase(supabase);
  const { error } = await sb.from("solicitacoes_filiacao").insert({
    tipo: validated.tipo,
    razao_social: validated.razaoSocial,
    cnpj: validated.cnpj,
    inscricao_estadual: validated.inscricaoEstadual,
    endereco: validated.endereco,
    cep: validated.cep,
    bairro: validated.bairro,
    cidade: validated.cidade,
    uf: validated.uf,
    fone: validated.fone,
    fax: validated.fax,
    alvara: validated.alvara,
    certidao: validated.certidao,
    data_fundacao: validated.dataFundacao,
    data_publicacao: validated.dataPublicacao,
    doc_cnpj_url: validated.docCnpjUrl ?? null,
    doc_requerimento_url: validated.docRequerimentoUrl ?? null,
    aceite_termo: validated.aceiteTermo,
    aceite_em: validated.aceiteTermo ? new Date().toISOString() : null,
    status: "pendente",
  });
  if (error) throw new Error(error.message);
  return { ok: true };
}

export async function aprovarFiliacao(supabase: SupabaseClient, userId: string, id: string) {
  await assertEditor(supabase, userId);
  const sb = asDynamicSupabase(supabase);
  const { error } = await sb
    .from("solicitacoes_filiacao")
    .update({ status: "aprovado" })
    .eq("id", id);
  if (error) throw new Error(error.message);
  return { ok: true };
}

export async function rejeitarFiliacao(supabase: SupabaseClient, userId: string, id: string) {
  await assertEditor(supabase, userId);
  const sb = asDynamicSupabase(supabase);
  const { error } = await sb
    .from("solicitacoes_filiacao")
    .update({ status: "rejeitado" })
    .eq("id", id);
  if (error) throw new Error(error.message);
  return { ok: true };
}

// Parceiros CRUD
const parceiroSchema = z.object({
  id: z.string().optional(),
  nome: z.string().min(1).max(200),
  logo_url: z.string().url().nullable().optional(),
  site_url: z.string().url().nullable().optional(),
  categoria: z.enum(["apoio_institucional", "patrocinio", "parceria"]),
  ordem: z.number().int().min(0).default(0),
  ativo: z.boolean().default(true),
});

export async function saveParceiro(supabase: SupabaseClient, userId: string, data: unknown) {
  const validated = parceiroSchema.parse(data);
  await assertEditor(supabase, userId);
  const { id, ...rest } = validated;
  const sb = asDynamicSupabase(supabase);
  if (id) {
    const { error } = await sb.from("parceiros").update(rest).eq("id", id);
    if (error) throw new Error(error.message);
  } else {
    const { error } = await sb.from("parceiros").insert(rest);
    if (error) throw new Error(error.message);
  }
  return { ok: true };
}

export async function deleteParceiro(supabase: SupabaseClient, userId: string, id: string) {
  await assertEditor(supabase, userId);
  const sb = asDynamicSupabase(supabase);
  const { error } = await sb.from("parceiros").delete().eq("id", id);
  if (error) throw new Error(error.message);
  return { ok: true };
}

// Clubes CRUD
const clubeSchema = z.object({
  id: z.string().optional(),
  nome: z.string().min(1).max(200),
  sigla: z.string().max(20).nullable().optional(),
  logo_url: z.string().url().nullable().optional(),
  cidade: z.string().max(100).nullable().optional(),
  estado: z.string().max(2).nullable().optional(),
  fundacao: z.string().nullable().optional(),
  email: z.string().email().nullable().optional(),
  telefone: z.string().max(20).nullable().optional(),
  site_url: z.string().url().nullable().optional(),
  endereco: z.string().max(200).nullable().optional(),
  ordem: z.number().int().min(0).default(0),
  ativo: z.boolean().default(true),
});

export async function saveClube(supabase: SupabaseClient, userId: string, data: unknown) {
  const validated = clubeSchema.parse(data);
  await assertEditor(supabase, userId);
  const { id, ...rest } = validated;
  const sb = asDynamicSupabase(supabase);
  if (id) {
    const { error } = await sb.from("clubes").update(rest).eq("id", id);
    if (error) throw new Error(error.message);
  } else {
    const { error } = await sb.from("clubes").insert(rest);
    if (error) throw new Error(error.message);
  }
  return { ok: true };
}

export async function deleteClube(supabase: SupabaseClient, userId: string, id: string) {
  await assertEditor(supabase, userId);
  const sb = asDynamicSupabase(supabase);
  const { error } = await sb.from("clubes").delete().eq("id", id);
  if (error) throw new Error(error.message);
  return { ok: true };
}

// Upload de imagens para parceiros
export async function uploadParceiroLogo(supabase: SupabaseClient, file: File) {
  if (!file.type.startsWith("image/")) {
    throw new Error("O arquivo deve ser uma imagem");
  }

  const extension = file.name.split(".").pop() || "jpg";
  const path = `parceiros/${crypto.randomUUID()}.${extension}`;

  const { error } = await supabase.storage.from("site-images").upload(path, file, {
    upsert: false,
  });

  if (error) throw new Error(error.message);

  const { data } = supabase.storage.from("site-images").getPublicUrl(path);
  return data.publicUrl;
}

// Upload de imagens para clubes
export async function uploadClubeLogo(supabase: SupabaseClient, file: File) {
  if (!file.type.startsWith("image/")) {
    throw new Error("O arquivo deve ser uma imagem");
  }

  const extension = file.name.split(".").pop() || "jpg";
  const path = `clubes/${crypto.randomUUID()}.${extension}`;

  const { error } = await supabase.storage.from("site-images").upload(path, file, {
    upsert: false,
  });

  if (error) throw new Error(error.message);

  const { data } = supabase.storage.from("site-images").getPublicUrl(path);
  return data.publicUrl;
}

// ============ CURSOS ============
const cursoSchema = z.object({
  id: z.string().uuid().optional(),
  titulo: z.string().min(1).max(200),
  resumo: z.string().min(1).max(500),
  descricao: z.string().optional().nullable(),
  data_inicio: z.string().optional().nullable(),
  data_fim: z.string().optional().nullable(),
  local: z.string().max(200).optional().nullable(),
  carga_horaria: z.string().max(100).optional().nullable(),
  imagem_url: z.string().url().nullable().optional(),
  link_inscricao: z.string().url().nullable().optional(),
  publicado: z.boolean(),
});

export async function saveCurso(supabase: SupabaseClient, userId: string, data: unknown) {
  const validated = cursoSchema.parse(data);
  await assertEditor(supabase, userId);
  const { id, ...rest } = validated;
  const sb = asDynamicSupabase(supabase);
  if (id) {
    const { error } = await sb.from("cursos").update(rest).eq("id", id);
    if (error) throw new Error(error.message);
  } else {
    const { error } = await sb.from("cursos").insert(rest);
    if (error) throw new Error(error.message);
  }
  return { ok: true };
}

export async function deleteCurso(supabase: SupabaseClient, userId: string, id: string) {
  await assertEditor(supabase, userId);
  const sb = asDynamicSupabase(supabase);
  const { error } = await sb.from("cursos").delete().eq("id", id);
  if (error) throw new Error(error.message);
  return { ok: true };
}
