"use server";

import Anthropic from "@anthropic-ai/sdk";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getMembro } from "@/lib/dados";
import { createClient } from "@/lib/supabase/server";
import { eIlustracao } from "@/components/Ilustracoes";
import { ErroImportacao, lerReceita, type Entrada } from "@/lib/importar";
import { DIFICULDADES, eSecao, type Rascunho } from "@/lib/livro";

export type DadosReceita = {
  titulo: string;
  secao: string;
  pais: string;
  categoria: string;
  descricao: string;
  tempo_minutos: string;
  porcoes: string;
  dificuldade: string;
  ingredientes: string;
  passos: string;
  dicas: string;
  fonte_url: string;
  foto_capa: string | null;
  origem?: string;
};

export type ResultadoSalvar = { erro: string } | undefined;

function linhas(texto: string) {
  return texto
    .split("\n")
    .map((linha) => linha.trim())
    .filter(Boolean);
}

// "1. Cozinhe a massa" e "Passo 2 - ..." viram só o texto: a numeração é do livro.
function semNumeracao(passo: string) {
  return passo.replace(/^(passo\s*)?\d+\s*[.)\-–:]\s*/i, "");
}

function inteiro(texto: string) {
  const numero = Number.parseInt(texto, 10);
  return Number.isFinite(numero) && numero > 0 ? numero : null;
}

type Validacao = { erro: string } | { receita: Record<string, unknown> };

function validar(dados: DadosReceita): Validacao {
  const titulo = dados.titulo.trim();
  if (!titulo) return { erro: "Dê um nome para a receita." };
  if (!eSecao(dados.secao)) return { erro: "Escolha Salgado, Doce ou Bebidas." };

  const ingredientes = linhas(dados.ingredientes);
  const passos = linhas(dados.passos).map(semNumeracao).filter(Boolean);
  if (ingredientes.length === 0) return { erro: "Coloque pelo menos um ingrediente." };
  if (passos.length === 0) return { erro: "Escreva o modo de preparo." };

  const fonte = dados.fonte_url.trim();
  if (fonte && !/^https?:\/\//i.test(fonte)) {
    return { erro: "O link da fonte precisa começar com http:// ou https://" };
  }

  return {
    receita: {
      titulo,
      secao: dados.secao,
      pais: dados.pais.trim() || "Brasil",
      categoria: dados.categoria.trim() || null,
      descricao: dados.descricao.trim() || null,
      tempo_minutos: inteiro(dados.tempo_minutos),
      porcoes: inteiro(dados.porcoes),
      dificuldade: dados.dificuldade in DIFICULDADES ? dados.dificuldade : null,
      ingredientes,
      passos,
      dicas: dados.dicas.trim() || null,
      fonte_url: fonte || null,
      foto_capa: dados.foto_capa,
    },
  };
}

export async function criarReceita(dados: DadosReceita): Promise<ResultadoSalvar> {
  const membro = await getMembro();
  const validado = validar(dados);
  if ("erro" in validado) return { erro: validado.erro };

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("receitas")
    .insert({
      ...validado.receita,
      autor_id: membro.id,
      origem: dados.origem === "importada" ? "importada" : "familia",
    })
    .select("id")
    .single();
  if (error || !data) return { erro: "Não consegui salvar. Tente de novo." };

  revalidatePath("/", "layout");
  redirect(`/receita/${data.id}`);
}

export async function editarReceita(id: string, dados: DadosReceita): Promise<ResultadoSalvar> {
  await getMembro();
  const validado = validar(dados);
  if ("erro" in validado) return { erro: validado.erro };

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("receitas")
    .update(validado.receita)
    .eq("id", id)
    .select("id");
  if (error || !data?.length) return { erro: "Não consegui salvar. Só quem adicionou a receita pode editá-la." };

  revalidatePath("/", "layout");
  redirect(`/receita/${id}`);
}

export type ResultadoImportar = { erro: string } | { rascunho: Rascunho };

export async function importarReceita(entrada: Entrada): Promise<ResultadoImportar> {
  await getMembro();
  try {
    return { rascunho: await lerReceita(entrada) };
  } catch (erro) {
    if (erro instanceof ErroImportacao) return { erro: erro.message };
    console.error("importar receita", erro);
    if (erro instanceof Anthropic.AuthenticationError) {
      return { erro: "A leitura por IA ainda não está configurada (falta a chave ANTHROPIC_API_KEY)." };
    }
    if (erro instanceof Anthropic.RateLimitError || erro instanceof Anthropic.InternalServerError) {
      return { erro: "A IA está ocupada agora. Tente de novo em um minuto." };
    }
    return { erro: "Algo deu errado ao ler a receita. Tente de novo." };
  }
}

export async function apagarReceita(id: string) {
  await getMembro();
  const supabase = await createClient();
  await supabase.from("receitas").delete().eq("id", id);
  revalidatePath("/", "layout");
  redirect("/");
}

// A família no livro -----------------------------------------------------------

export type Alvo = { receita_id: string } | { versao_id: string };

export async function alternarAmassava(receitaId: string, alvo: Alvo, ligar: boolean) {
  const membro = await getMembro();
  const supabase = await createClient();
  if (ligar) {
    await supabase.from("amassavas").insert({ ...alvo, autor_id: membro.id });
  } else {
    const [coluna, id] = Object.entries(alvo)[0];
    await supabase.from("amassavas").delete().eq(coluna, id).eq("autor_id", membro.id);
  }
  revalidatePath(`/receita/${receitaId}`);
}

export async function postarVersao(receitaId: string, fotoUrl: string, recado: string): Promise<ResultadoSalvar> {
  const membro = await getMembro();
  const supabase = await createClient();
  const { error } = await supabase.from("versoes").insert({
    receita_id: receitaId,
    autor_id: membro.id,
    foto_url: fotoUrl,
    recado: recado.trim().slice(0, 1000) || null,
  });
  if (error) return { erro: "Não consegui postar. Tente de novo." };
  revalidatePath("/", "layout");
}

export async function apagarVersao(receitaId: string, versaoId: string, fotoUrl: string) {
  const membro = await getMembro();
  const supabase = await createClient();
  const { data } = await supabase.from("versoes").delete().eq("id", versaoId).eq("autor_id", membro.id).select("id");
  const caminho = fotoUrl.split("/storage/v1/object/public/fotos/")[1];
  if (data?.length && caminho) await supabase.storage.from("fotos").remove([caminho]);
  revalidatePath("/", "layout");
  revalidatePath(`/receita/${receitaId}`);
}

export async function comentar(receitaId: string, texto: string): Promise<ResultadoSalvar> {
  const membro = await getMembro();
  const limpo = texto.trim();
  if (!limpo) return { erro: "Escreva alguma coisa." };
  const supabase = await createClient();
  const { error } = await supabase
    .from("comentarios")
    .insert({ receita_id: receitaId, autor_id: membro.id, texto: limpo.slice(0, 2000) });
  if (error) return { erro: "Não consegui enviar. Tente de novo." };
  revalidatePath(`/receita/${receitaId}`);
}

export async function apagarComentario(receitaId: string, comentarioId: string) {
  const membro = await getMembro();
  const supabase = await createClient();
  await supabase.from("comentarios").delete().eq("id", comentarioId).eq("autor_id", membro.id);
  revalidatePath(`/receita/${receitaId}`);
}

export async function alternarFavorito(receitaId: string, ligar: boolean) {
  const membro = await getMembro();
  const supabase = await createClient();
  if (ligar) await supabase.from("favoritos").insert({ receita_id: receitaId, perfil_id: membro.id });
  else await supabase.from("favoritos").delete().eq("receita_id", receitaId).eq("perfil_id", membro.id);
  revalidatePath(`/receita/${receitaId}`);
  revalidatePath("/favoritas");
}

export async function salvarPerfil(nome: string, avatar: string | null): Promise<ResultadoSalvar> {
  const membro = await getMembro();
  const limpo = nome.trim().slice(0, 60);
  if (!limpo) return { erro: "Escreva seu nome." };

  const ilustracao = avatar?.match(/^ilustracao:([a-z]+)$/)?.[1];
  const valido =
    avatar === null ||
    (ilustracao && eIlustracao(ilustracao)) ||
    /^https:\/\/lh3\.googleusercontent\.com\//.test(avatar) ||
    avatar.includes(`/storage/v1/object/public/fotos/${membro.id}/`);
  if (!valido) return { erro: "Escolha outro avatar." };

  const supabase = await createClient();
  const { error } = await supabase.from("perfis").update({ nome: limpo, avatar_url: avatar }).eq("id", membro.id);
  if (error) return { erro: "Não consegui salvar. Tente de novo." };
  revalidatePath("/", "layout");
}

export async function sair() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}
