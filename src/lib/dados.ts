import "server-only";
import { cache } from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import {
  semAcento,
  type Comentario,
  type Pessoa,
  type Receita,
  type ResumoReceita,
  type Secao,
  type Versao,
  type VersaoRecente,
} from "@/lib/livro";

const CAMPOS_RESUMO = "id, titulo, secao, pais, categoria, tempo_minutos, foto_capa";

export type Membro = { id: string; nome: string; avatar_url: string | null };

// Quem está lendo o livro. Sem login vai para /login; sem convite, para /sem-acesso.
export const getMembro = cache(async (): Promise<Membro> => {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  const id = data?.claims?.sub;
  if (!id) redirect("/login");

  const { data: perfil } = await supabase
    .from("perfis")
    .select("id, nome, avatar_url")
    .eq("id", id)
    .maybeSingle();
  if (!perfil) redirect("/sem-acesso");
  return perfil;
});

export async function contarPorSecao() {
  const supabase = await createClient();
  const { data } = await supabase.from("receitas").select("secao");
  const contagem: Record<Secao, number> = { salgado: 0, doce: 0, bebidas: 0 };
  for (const { secao } of data ?? []) contagem[secao as Secao]++;
  return contagem;
}

export async function receitasRecentes(limite = 6) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("receitas")
    .select(CAMPOS_RESUMO)
    .order("criado_em", { ascending: false })
    .limit(limite);
  return (data ?? []) as ResumoReceita[];
}

export async function receitasDaSecao(secao: Secao) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("receitas")
    .select(CAMPOS_RESUMO)
    .eq("secao", secao)
    .order("titulo");
  return (data ?? []) as ResumoReceita[];
}

export async function buscarReceitas(termo: string) {
  const palavras = semAcento(termo).split(/\s+/).filter(Boolean).slice(0, 5);
  if (palavras.length === 0) return [];
  const supabase = await createClient();
  let consulta = supabase.from("receitas").select(CAMPOS_RESUMO);
  for (const palavra of palavras) {
    consulta = consulta.ilike("texto_busca", `%${palavra.replace(/[%_\\]/g, "")}%`);
  }
  const { data } = await consulta.order("titulo").limit(60);
  return (data ?? []) as ResumoReceita[];
}

export async function getReceita(id: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("receitas")
    .select("*, autor:perfis(nome, avatar_url)")
    .eq("id", id)
    .maybeSingle();
  return data as Receita | null;
}

const PESSOA = "autor:perfis(nome, avatar_url)";

// Tudo o que a família fez em volta de uma receita: versões, amassavas, comentários.
export async function getFamiliaDaReceita(receitaId: string) {
  const supabase = await createClient();
  const [versoes, amassavas, comentarios, favorito] = await Promise.all([
    supabase
      .from("versoes")
      .select(`id, foto_url, recado, criado_em, autor_id, ${PESSOA}, amassavas(autor_id, ${PESSOA})`)
      .eq("receita_id", receitaId)
      .order("criado_em", { ascending: false }),
    supabase.from("amassavas").select(`autor_id, ${PESSOA}`).eq("receita_id", receitaId).order("criado_em"),
    supabase
      .from("comentarios")
      .select(`id, texto, criado_em, autor_id, ${PESSOA}`)
      .eq("receita_id", receitaId)
      .order("criado_em"),
    supabase.from("favoritos").select("receita_id").eq("receita_id", receitaId).maybeSingle(),
  ]);
  return {
    versoes: (versoes.data ?? []) as unknown as Versao[],
    amassavas: (amassavas.data ?? []) as unknown as { autor_id: string; autor: Pessoa | null }[],
    comentarios: (comentarios.data ?? []) as unknown as Comentario[],
    favorito: Boolean(favorito.data),
  };
}

export async function versoesRecentes(limite = 8) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("versoes")
    .select(`id, foto_url, criado_em, ${PESSOA}, receita:receitas(id, titulo, secao)`)
    .order("criado_em", { ascending: false })
    .limit(limite);
  return (data ?? []) as unknown as VersaoRecente[];
}

export async function receitasFavoritas() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("favoritos")
    .select(`receita:receitas(${CAMPOS_RESUMO})`)
    .order("criado_em", { ascending: false });
  return ((data ?? []) as unknown as { receita: ResumoReceita | null }[])
    .map((linha) => linha.receita)
    .filter((receita): receita is ResumoReceita => Boolean(receita));
}

// A foto da conta Google, para poder voltar a ela no perfil.
export async function fotoDoGoogle() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  const metadados = (data?.claims?.user_metadata ?? {}) as { avatar_url?: string; picture?: string };
  return metadados.avatar_url ?? metadados.picture ?? null;
}
