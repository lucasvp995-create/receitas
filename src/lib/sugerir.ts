import "server-only";

import Anthropic from "@anthropic-ai/sdk";
import { betaZodOutputFormat } from "@anthropic-ai/sdk/helpers/beta/zod";
import { z } from "zod";
import { CATEGORIAS, PAISES, type Rascunho, type Secao } from "@/lib/livro";

// Sugere receitas novas para o livro, a partir de um pedido e do gosto da família.

const ReceitaSugerida = z.object({
  por_que: z.string(),
  titulo: z.string(),
  secao: z.enum(["salgado", "doce", "bebidas"]),
  pais: z.string(),
  categoria: z.string().nullable(),
  descricao: z.string(),
  tempo_minutos: z.number().int(),
  porcoes: z.number().int(),
  dificuldade: z.enum(["facil", "media", "dificil"]),
  ingredientes: z.array(z.string()),
  passos: z.array(z.string()),
  dicas: z.string().nullable(),
});

const Sugestoes = z.object({ sugestoes: z.array(ReceitaSugerida) });

const INSTRUCOES = `Você ajuda uma família brasileira a escolher receitas novas para o seu livro de receitas. Sugira exatamente 3 receitas diferentes entre si, completas e testáveis em uma cozinha de casa no Brasil.

Regras:
- Tudo em português do Brasil, natural e caseiro.
- Atenda ao pedido da família. Sem pedido, varie: um prato do dia a dia, algo para um almoço especial e uma surpresa de outro país.
- Não repita receitas que já estão no livro. Use as receitas mais "amassadas" (curtidas) como pista do gosto da família.
- Prefira ingredientes fáceis de achar em supermercado brasileiro; se usar algo menos comum, diga nas dicas como substituir.
- Medidas em g, ml, °C, xícara e colher (sopa/chá). Ingredientes um por item, com a quantidade no começo. Para receitas com partes (massa, recheio), use um item de subtítulo terminado em dois-pontos, como "Para o recheio:".
- Passos sem numeração, em frases curtas no imperativo, com tempos e temperaturas.
- secao: "salgado", "doce" ou "bebidas". pais: o país de origem do prato, de preferência um destes: ${PAISES.join(", ")}.
- categoria: de preferência uma destas: ${CATEGORIAS.join(", ")}.
- descricao: uma frase curta e acolhedora (até 25 palavras).
- por_que: uma frase dizendo por que essa receita combina com o pedido ou com a família.`;

export type Sugestao = Rascunho & { por_que: string };

export async function sugerirReceitas({
  pedido,
  secao,
  noLivro,
  favoritas,
}: {
  pedido: string;
  secao: Secao | null;
  noLivro: string[];
  favoritas: string[];
}): Promise<Sugestao[]> {
  const contexto = [
    pedido.trim() ? `Pedido da família: ${pedido.trim()}` : "A família não fez um pedido específico.",
    secao ? `Capítulo: só receitas da seção "${secao}".` : "",
    favoritas.length ? `Receitas mais amassadas pela família: ${favoritas.join("; ")}.` : "",
    noLivro.length ? `Receitas que já estão no livro (não repita): ${noLivro.join("; ")}.` : "O livro ainda está vazio.",
  ]
    .filter(Boolean)
    .join("\n\n");

  const client = new Anthropic();
  const resposta = await client.beta.messages.parse({
    model: "claude-opus-5-5",
    max_tokens: 16000,
    betas: ["server-side-fallback-2026-07-01"],
    fallbacks: "default",
    output_config: { effort: "medium", format: betaZodOutputFormat(Sugestoes) },
    system: INSTRUCOES,
    messages: [{ role: "user", content: contexto }],
  });

  const lidas = resposta.parsed_output?.sugestoes;
  if (resposta.stop_reason === "refusal" || !lidas?.length) {
    throw new Error("sem sugestões");
  }
  return lidas.slice(0, 3).map((sugestao) => ({
    por_que: sugestao.por_que,
    titulo: sugestao.titulo,
    secao: sugestao.secao,
    pais: sugestao.pais || "Brasil",
    categoria: sugestao.categoria,
    descricao: sugestao.descricao || null,
    tempo_minutos: sugestao.tempo_minutos > 0 ? sugestao.tempo_minutos : null,
    porcoes: sugestao.porcoes > 0 ? sugestao.porcoes : null,
    dificuldade: sugestao.dificuldade,
    ingredientes: sugestao.ingredientes,
    passos: sugestao.passos,
    dicas: sugestao.dicas,
    foto_capa: null,
    fonte_url: null,
    origem: "sugerida",
  }));
}
