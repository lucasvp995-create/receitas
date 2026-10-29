import "server-only";

import Anthropic from "@anthropic-ai/sdk";
import { betaZodOutputFormat } from "@anthropic-ai/sdk/helpers/beta/zod";
import { z } from "zod";
import { CATEGORIAS, PAISES, type Rascunho } from "@/lib/livro";

// Lê uma receita de um site, de um vídeo do YouTube, de fotos ou de um texto colado
// e devolve um rascunho já no formato do livro, em português do Brasil.

const LIMITE_TEXTO = 150_000;
const NAVEGADOR = {
  "User-Agent":
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0 Safari/537.36",
  "Accept-Language": "pt-BR,pt;q=0.9,en;q=0.8",
};

export class ErroImportacao extends Error {}

const ReceitaLida = z.object({
  encontrou_receita: z.boolean(),
  titulo: z.string(),
  secao: z.enum(["salgado", "doce", "bebidas"]),
  pais: z.string(),
  categoria: z.string().nullable(),
  descricao: z.string(),
  tempo_minutos: z.number().int().nullable(),
  porcoes: z.number().int().nullable(),
  dificuldade: z.enum(["facil", "media", "dificil"]).nullable(),
  ingredientes: z.array(z.string()),
  passos: z.array(z.string()),
  dicas: z.string().nullable(),
});

const INSTRUCOES = `Você organiza o livro de receitas de uma família brasileira. Recebe o conteúdo de um site, de um vídeo, de fotos de um livro ou caderno, ou um texto colado, e transcreve a receita para o formato do livro.

Regras:
- Escreva tudo em português do Brasil, natural e caseiro. Traduza receitas em outros idiomas, inclusive o nome quando houver um nome comum em português (mantenha nomes clássicos como "Carbonara" ou "Pad thai").
- Medidas: converta onças, libras, °F, polegadas e "sticks" de manteiga para g, ml, °C e cm. "Cup" vira "xícara" e "tablespoon"/"teaspoon" viram "colher (sopa)"/"colher (chá)".
- Ingredientes: um por item, com a quantidade no começo ("200 g de farinha de trigo", "2 ovos", "Sal a gosto"). Se a receita tem partes (massa, recheio, molho), crie um item de subtítulo terminado em dois-pontos, como "Para o molho:", antes dos ingredientes daquela parte.
- Passos: um por item, sem numeração, em frases curtas no imperativo. Inclua temperaturas e tempos que a fonte der.
- Não invente ingredientes nem quantidades que a fonte não dá. Se a fonte não informa o rendimento, estime as porções pelas quantidades; se não informa o tempo total, estime somando os tempos dos passos.
- secao: "salgado", "doce" ou "bebidas" (drinks, sucos, cafés, licores).
- pais: o país de origem do prato, em português. Prefira um destes nomes: ${PAISES.join(", ")}.
- categoria: de preferência uma destas: ${CATEGORIAS.join(", ")}.
- descricao: uma frase curta e acolhedora sobre o prato (até 25 palavras), sem exageros.
- dicas: segredos, substituições e sugestões que a fonte der, em texto corrido; null se não houver.
- Ignore propagandas, comentários de leitores e histórias que não sejam da receita.
- Se o conteúdo não tiver uma receita, responda encontrou_receita = false e deixe os outros campos vazios.`;

function textoDoHtml(html: string) {
  return html
    .replace(/<(script|style|noscript|svg|nav|footer|header|form|iframe)\b[\s\S]*?<\/\1>/gi, " ")
    .replace(/<br\s*\/?>|<\/(p|li|h[1-6]|div|tr)>/gi, "\n")
    .replace(/<[^>]+>/g, " ")
    .replace(/&#x([0-9a-f]+);/gi, (_, hex) => String.fromCodePoint(Number.parseInt(hex, 16)))
    .replace(/&#(\d+);/g, (_, decimal) => String.fromCodePoint(Number(decimal)))
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/[ \t]+/g, " ")
    .replace(/\s*\n\s*/g, "\n")
    .trim();
}

// Muitos blogs de receita publicam a receita estruturada (schema.org/Recipe) em JSON-LD.
function receitaEstruturada(html: string) {
  const blocos = [...html.matchAll(/<script[^>]+application\/ld\+json[^>]*>([\s\S]*?)<\/script>/gi)];
  return blocos.map((bloco) => bloco[1].trim()).filter((json) => /"Recipe"/.test(json));
}

function verificarLink(texto: string) {
  let url: URL;
  try {
    url = new URL(texto.trim());
  } catch {
    throw new ErroImportacao("Esse link não parece válido. Copie o endereço completo, começando com https://");
  }
  const privado = /^(localhost|127\.|10\.|192\.168\.|172\.(1[6-9]|2\d|3[01])\.|169\.254\.|\[?::1\]?$|0\.)/;
  if (!/^https?:$/.test(url.protocol) || privado.test(url.hostname)) {
    throw new ErroImportacao("Só consigo abrir links de sites públicos (https://…).");
  }
  return url;
}

async function baixar(url: string) {
  const resposta = await fetch(url, {
    headers: NAVEGADOR,
    redirect: "follow",
    signal: AbortSignal.timeout(20_000),
  }).catch(() => null);
  if (!resposta?.ok) {
    throw new ErroImportacao("Não consegui abrir esse link. O site pode estar bloqueando leitores; tente uma foto ou cole o texto da receita.");
  }
  return resposta.text();
}

export function eYoutube(url: URL) {
  return /(^|\.)youtube\.com$|(^|\.)youtu\.be$/.test(url.hostname);
}

function jsonDepoisDe(html: string, marcador: string) {
  const inicio = html.indexOf(marcador);
  if (inicio < 0) return null;
  const abre = html.indexOf("{", inicio);
  let profundidade = 0;
  let emTexto = false;
  for (let i = abre; i < html.length; i++) {
    const c = html[i];
    if (emTexto) {
      if (c === "\\") i++;
      else if (c === '"') emTexto = false;
    } else if (c === '"') emTexto = true;
    else if (c === "{") profundidade++;
    else if (c === "}" && --profundidade === 0) {
      try {
        return JSON.parse(html.slice(abre, i + 1));
      } catch {
        return null;
      }
    }
  }
  return null;
}

type Legenda = { baseUrl: string; languageCode: string; kind?: string };
type Video = { titulo: string; canal: string; descricao: string; legendas: string; idioma?: string };

function idDoVideo(url: URL) {
  if (url.hostname.endsWith("youtu.be")) return url.pathname.slice(1, 12);
  return url.searchParams.get("v") ?? url.pathname.match(/\/(?:shorts|embed|live)\/([\w-]{11})/)?.[1] ?? null;
}

// A API oficial do YouTube devolve a descrição completa e funciona de qualquer servidor.
async function videoPelaApi(id: string): Promise<Video | null> {
  const chave = process.env.YOUTUBE_API_KEY;
  if (!chave) return null;
  const resposta = await fetch(
    `https://www.googleapis.com/youtube/v3/videos?part=snippet&id=${id}&key=${chave}`,
    { signal: AbortSignal.timeout(10_000) },
  ).catch(() => null);
  const trecho = resposta?.ok ? (await resposta.json()).items?.[0]?.snippet : null;
  return trecho ? { titulo: trecho.title, canal: trecho.channelTitle, descricao: trecho.description, legendas: "" } : null;
}

// A página do vídeo traz também as legendas, mas o YouTube às vezes pede login a servidores.
async function videoPelaPagina(id: string): Promise<Video | null> {
  const resposta = await fetch(`https://www.youtube.com/watch?v=${id}`, {
    headers: NAVEGADOR,
    signal: AbortSignal.timeout(15_000),
  }).catch(() => null);
  if (!resposta?.ok) return null;
  const player = jsonDepoisDe(await resposta.text(), "ytInitialPlayerResponse");
  const detalhes = player?.videoDetails;
  if (!detalhes) return null;

  const faixas: Legenda[] = player.captions?.playerCaptionsTracklistRenderer?.captionTracks ?? [];
  const faixa =
    faixas.find((f) => f.kind !== "asr" && f.languageCode.startsWith("pt")) ??
    faixas.find((f) => f.kind !== "asr") ??
    faixas[0];
  let legendas = "";
  if (faixa) {
    const resposta = await fetch(`${faixa.baseUrl}&fmt=json3`, {
      headers: NAVEGADOR,
      signal: AbortSignal.timeout(15_000),
    }).catch(() => null);
    const dados = resposta?.ok ? await resposta.json().catch(() => null) : null;
    legendas = (dados?.events ?? [])
      .flatMap((evento: { segs?: { utf8: string }[] }) => evento.segs ?? [])
      .map((seg: { utf8: string }) => seg.utf8)
      .join("")
      .replace(/\s+/g, " ")
      .trim();
  }
  return {
    titulo: detalhes.title,
    canal: detalhes.author,
    descricao: detalhes.shortDescription ?? "",
    legendas,
    idioma: faixa?.languageCode,
  };
}

// Do vídeo usamos o título, a descrição (onde muita gente escreve a receita) e as legendas.
async function lerYoutube(url: URL) {
  const id = idDoVideo(url);
  if (!id) throw new ErroImportacao("Não reconheci esse link do YouTube. Copie o link pelo botão Compartilhar do vídeo.");
  const [api, pagina] = await Promise.all([videoPelaApi(id), videoPelaPagina(id)]);
  const video = pagina ?? api;
  if (!video) {
    throw new ErroImportacao(
      "O YouTube não deixou ler esse vídeo agora. Abra a descrição do vídeo, copie a receita e cole na aba Texto.",
    );
  }
  const descricao = api?.descricao && api.descricao.length > video.descricao.length ? api.descricao : video.descricao;
  return [
    `Vídeo do YouTube: ${video.titulo}`,
    `Canal: ${video.canal}`,
    `Descrição do vídeo:\n${descricao}`,
    video.legendas ? `Legendas do vídeo (${video.idioma}):\n${video.legendas}` : "As legendas do vídeo não estão disponíveis.",
  ].join("\n\n");
}

async function lerSite(url: URL) {
  const html = await baixar(url.toString());
  const titulo = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1]?.trim() ?? "";
  const estruturada = receitaEstruturada(html);
  return [
    `Página: ${titulo}`,
    estruturada.length ? `Receita estruturada da página (JSON-LD):\n${estruturada.join("\n")}` : "",
    `Texto da página:\n${textoDoHtml(html)}`,
  ]
    .filter(Boolean)
    .join("\n\n");
}

// Instagram e TikTok: a legenda do post e a imagem de capa (muita gente põe a receita
// escrita na capa). A receita só falada no vídeo ainda fica de fora.
export function eRedeSocial(url: URL) {
  return /(^|\.)(instagram\.com|tiktok\.com)$/.test(url.hostname);
}

type Post = { texto: string; imagem: string | null };

function meta(html: string, nome: string) {
  const valor =
    html.match(new RegExp(`<meta[^>]+(?:property|name)=["']${nome}["'][^>]+content=["']([^"']*)["']`, "i"))?.[1] ??
    html.match(new RegExp(`<meta[^>]+content=["']([^"']*)["'][^>]+(?:property|name)=["']${nome}["']`, "i"))?.[1];
  return valor ? textoDoHtml(valor) : null;
}

async function lerTiktok(url: URL): Promise<Post | null> {
  const resposta = await fetch(`https://www.tiktok.com/oembed?url=${encodeURIComponent(url.toString())}`, {
    signal: AbortSignal.timeout(10_000),
  }).catch(() => null);
  const dados = resposta?.ok ? await resposta.json().catch(() => null) : null;
  if (!dados?.title) return null;
  return { texto: `Post do TikTok de ${dados.author_name ?? "?"}:\n${dados.title}`, imagem: dados.thumbnail_url ?? null };
}

async function lerInstagram(url: URL): Promise<Post | null> {
  // O Instagram mostra a legenda nas etiquetas de pré-visualização de links.
  const resposta = await fetch(url.toString(), {
    headers: { "User-Agent": "facebookexternalhit/1.1 (+http://www.facebook.com/externalhit_uatext.php)" },
    redirect: "follow",
    signal: AbortSignal.timeout(15_000),
  }).catch(() => null);
  if (!resposta?.ok) return null;
  const html = await resposta.text();
  const legenda = meta(html, "og:description") ?? meta(html, "description");
  if (!legenda) return null;
  return {
    texto: `Post do Instagram: ${meta(html, "og:title") ?? ""}\nLegenda:\n${legenda}`,
    imagem: meta(html, "og:image"),
  };
}

async function imagemEmBase64(endereco: string | null) {
  if (!endereco) return null;
  const resposta = await fetch(endereco, { signal: AbortSignal.timeout(10_000) }).catch(() => null);
  const tipo = resposta?.headers.get("content-type") ?? "";
  if (!resposta?.ok || !/^image\/(jpeg|png|webp|gif)/.test(tipo)) return null;
  const dados = Buffer.from(await resposta.arrayBuffer());
  if (dados.length > 4_000_000) return null;
  return { media_type: tipo.split(";")[0] as "image/jpeg" | "image/png" | "image/webp" | "image/gif", data: dados.toString("base64") };
}

async function lerRedeSocial(url: URL): Promise<Anthropic.Beta.BetaContentBlockParam[]> {
  const post = url.hostname.endsWith("tiktok.com") ? await lerTiktok(url) : await lerInstagram(url);
  if (!post) {
    throw new ErroImportacao(
      "Não consegui abrir esse post (ele pode ser privado). Copie a legenda e use a aba Texto, ou mande um print na aba Foto.",
    );
  }
  const imagem = await imagemEmBase64(post.imagem);
  return [
    ...(imagem ? [{ type: "image" as const, source: { type: "base64" as const, ...imagem } }] : []),
    {
      type: "text",
      text: `Fonte: ${url}\n\n${post.texto}${imagem ? "\n\nA imagem é a capa do post; ela pode ter a receita escrita." : ""}`,
    },
  ];
}

export type Entrada =
  | { tipo: "link"; url: string }
  | { tipo: "fotos"; imagens: string[] }
  | { tipo: "texto"; texto: string };

export async function lerReceita(entrada: Entrada): Promise<Rascunho> {
  let conteudo: Anthropic.Beta.BetaContentBlockParam[];
  let fonte: string | null = null;

  if (entrada.tipo === "link") {
    const url = verificarLink(entrada.url);
    fonte = url.toString();
    if (eRedeSocial(url)) {
      conteudo = await lerRedeSocial(url);
    } else {
      const texto = eYoutube(url) ? await lerYoutube(url) : await lerSite(url);
      if (texto.length > LIMITE_TEXTO) {
        throw new ErroImportacao("Essa página é grande demais para ler. Tente uma foto ou cole só o trecho da receita.");
      }
      conteudo = [{ type: "text", text: `Fonte: ${fonte}\n\n${texto}` }];
    }
  } else if (entrada.tipo === "fotos") {
    if (entrada.imagens.length === 0) throw new ErroImportacao("Escolha pelo menos uma foto.");
    conteudo = [
      ...entrada.imagens.map((dados) => ({
        type: "image" as const,
        source: { type: "base64" as const, media_type: "image/jpeg" as const, data: dados },
      })),
      {
        type: "text",
        text:
          entrada.imagens.length > 1
            ? "As fotos são páginas da mesma receita, em ordem. Transcreva a receita."
            : "Transcreva a receita da foto.",
      },
    ];
  } else {
    const texto = entrada.texto.trim();
    if (texto.length < 20) throw new ErroImportacao("Cole o texto da receita, com ingredientes e modo de preparo.");
    if (texto.length > LIMITE_TEXTO) throw new ErroImportacao("Esse texto é grande demais. Cole só a receita.");
    conteudo = [{ type: "text", text: texto }];
  }

  const client = new Anthropic();
  const resposta = await client.beta.messages.parse({
    model: "claude-opus-5-5",
    max_tokens: 16000,
    betas: ["server-side-fallback-2026-07-01"],
    fallbacks: "default",
    output_config: { effort: "medium", format: betaZodOutputFormat(ReceitaLida) },
    system: INSTRUCOES,
    messages: [{ role: "user", content: conteudo }],
  });

  const lida = resposta.parsed_output;
  if (resposta.stop_reason === "refusal" || !lida) {
    throw new ErroImportacao("Não consegui transcrever essa receita. Tente de outro jeito.");
  }
  if (!lida.encontrou_receita || lida.ingredientes.length === 0) {
    throw new ErroImportacao(
      entrada.tipo === "link"
        ? "Não encontrei a receita nesse link. Se ela só aparece falada no vídeo, ainda não consigo ouvir: cole o texto ou mande um print."
        : "Não encontrei uma receita aqui. Confira se os ingredientes e o modo de preparo aparecem.",
    );
  }

  return {
    titulo: lida.titulo,
    secao: lida.secao,
    pais: lida.pais || "Brasil",
    categoria: lida.categoria,
    descricao: lida.descricao || null,
    tempo_minutos: lida.tempo_minutos && lida.tempo_minutos > 0 ? lida.tempo_minutos : null,
    porcoes: lida.porcoes && lida.porcoes > 0 ? lida.porcoes : null,
    dificuldade: lida.dificuldade,
    ingredientes: lida.ingredientes,
    passos: lida.passos,
    dicas: lida.dicas,
    foto_capa: null,
    fonte_url: fonte,
    origem: "importada",
  };
}
