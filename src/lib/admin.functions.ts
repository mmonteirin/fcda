import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

type SupabaseClient = ReturnType<typeof createClient<Database>>;

async function assertEditor(supabase: SupabaseClient, userId: string) {
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
  nome: z.string().min(1).max(200),
  local: z.string().min(1).max(200),
  modalidade: z.string().min(1).max(60),
  ano: z.number().int().min(2000).max(2100).optional().nullable(),
});

export const saveEvento = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => eventoSchema.parse(d))
  .handler(async ({ data, context }) => {
    await assertEditor(context.supabase, context.userId);
    const { id, ...rest } = data;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const sb = context.supabase as any;
    if (id) {
      const { error } = await sb.from("eventos").update(rest).eq("id", id);
      if (error) throw new Error(error.message);
    } else {
      const { error } = await sb.from("eventos").insert(rest);
      if (error) throw new Error(error.message);
    }
    return { ok: true };
  });

export const deleteEvento = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    await assertEditor(context.supabase, context.userId);
    const { error } = await context.supabase.from("eventos").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

// ============ CATEGORIAS DE MODALIDADES ============
const categoriaModalidadeSchema = z.object({
  id: z.string().uuid().optional(),
  nome: z.string().min(1).max(100),
  slug: z.string().min(1).max(100),
  descricao: z.string().optional().nullable(),
  ordem: z.number().int().min(0).max(999),
});

export const saveCategoriaModalidade = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => categoriaModalidadeSchema.parse(d))
  .handler(async ({ data, context }) => {
    await assertEditor(context.supabase, context.userId);
    const { id, ...rest } = data;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const sb = context.supabase as any;
    if (id) {
      const { error } = await sb.from("categorias_modalidades").update(rest).eq("id", id);
      if (error) throw new Error(error.message);
    } else {
      const { error } = await sb.from("categorias_modalidades").insert(rest);
      if (error) throw new Error(error.message);
    }
    return { ok: true };
  });

export const deleteCategoriaModalidade = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    await assertEditor(context.supabase, context.userId);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (context.supabase as any)
      .from("categorias_modalidades")
      .delete()
      .eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

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

export const saveModalidade = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => modalidadeSchema.parse(d))
  .handler(async ({ data, context }) => {
    await assertEditor(context.supabase, context.userId);
    const { id, ...rest } = data;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const sb = context.supabase as any;
    if (id) {
      const { error } = await sb.from("modalidades").update(rest).eq("id", id);
      if (error) throw new Error(error.message);
    } else {
      const { error } = await sb.from("modalidades").insert(rest);
      if (error) throw new Error(error.message);
    }
    return { ok: true };
  });

export const deleteModalidade = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    await assertEditor(context.supabase, context.userId);
    const { error } = await context.supabase.from("modalidades").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

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
      .from("imagens")
      .upload(filePath, file);

    if (uploadError) throw new Error(uploadError.message);

    const { data: publicUrlData } = context.supabase.storage.from("imagens").getPublicUrl(filePath);

    // Save to eventos_pdfs table
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error: dbError } = await (context.supabase as any).from("eventos_pdfs").insert({
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
  folder: z.enum(["noticias", "modalidades"]),
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
      .from("imagens")
      .upload(filePath, file);

    if (uploadError) throw new Error(uploadError.message);

    const { data: publicUrlData } = context.supabase.storage.from("imagens").getPublicUrl(filePath);

    return { url: publicUrlData.publicUrl };
  });

// ============ BANNER ============
const bannerSchema = z.object({
  texto: z.string().min(1).max(500),
  link: z.string().url().optional().nullable(),
  ativo: z.boolean(),
});

export const getBanner = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (context.supabase as any)
      .from("banner_config")
      .select("*")
      .eq("id", "default")
      .single();
    if (error && error.code !== "PGRST116") throw error; // PGRST116 = not found
    return data ?? { id: "default", texto: "", link: null, ativo: false };
  });

export const saveBanner = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => bannerSchema.parse(d))
  .handler(async ({ data, context }) => {
    await assertEditor(context.supabase, context.userId);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (context.supabase as any)
      .from("banner_config")
      .upsert({ id: "default", ...data });
    if (error) throw new Error(error.message);
    return { ok: true };
  });

// ============ USUÁRIOS ============
const userRoleSchema = z.object({
  user_id: z.string().uuid(),
  role: z.enum(["admin", "editor"]),
});

const createUserSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  nome: z.string().min(1).max(120),
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

export const sendMensagem = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => mensagemSchema.parse(d))
  .handler(async ({ data }) => {
    const supabase = createClient<Database>(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_PUBLISHABLE_KEY!,
    );
    const { error } = await supabase.from("mensagens").insert(data);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const markMensagemAsRead = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ data }) => {
    const supabase = createClient<Database>(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_PUBLISHABLE_KEY!,
    );
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase as any)
      .from("mensagens")
      .update({ lido: true })
      .eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const deleteMensagem = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ data }) => {
    const supabase = createClient<Database>(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_PUBLISHABLE_KEY!,
    );
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase as any).from("mensagens").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });
