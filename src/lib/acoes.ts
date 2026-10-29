"use server";

import Anthropic from "@anthropic-ai/sdk";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getMembro } from "@/lib/dados";
import { createClient } from "@/lib/supabase/server";
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

export async function sair() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}
