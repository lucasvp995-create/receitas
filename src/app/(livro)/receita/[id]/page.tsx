import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { BotaoAmassava } from "@/components/BotaoAmassava";
import { BotaoApagar } from "@/components/BotaoApagar";
import { BotaoFavorito } from "@/components/BotaoFavorito";
import { ConversaDaReceita, NaCozinhaDaFamilia, nomesDe } from "@/components/Familia";
import { ListaIngredientes } from "@/components/ListaIngredientes";
import { getFamiliaDaReceita, getMembro, getReceita } from "@/lib/dados";
import { bandeira, DIFICULDADES, formatarTempo, ORIGENS, SECOES } from "@/lib/livro";

const COR = { salgado: "text-salgado", doce: "text-doce", bebidas: "text-bebidas" };

export async function generateMetadata({ params }: PageProps<"/receita/[id]">): Promise<Metadata> {
  const { id } = await params;
  const receita = await getReceita(id);
  return { title: receita?.titulo ?? "Receita" };
}

// As primeiras palavras da introdução abrem em caixa alta colorida, como nos livros.
function Introducao({ texto, cor }: { texto: string; cor: string }) {
  const palavras = texto.split(" ");
  const abertura = palavras.slice(0, Math.min(3, palavras.length - 1)).join(" ");
  const resto = palavras.slice(abertura ? abertura.split(" ").length : 0).join(" ");
  return (
    <p className="mx-auto max-w-2xl font-serif text-lg leading-relaxed">
      {abertura && <span className={`caixa text-[0.85rem] ${cor}`}>{abertura} </span>}
      {resto}
    </p>
  );
}

export default async function ReceitaPage({ params }: PageProps<"/receita/[id]">) {
  const { id } = await params;
  const [membro, receita, familia] = await Promise.all([getMembro(), getReceita(id), getFamiliaDaReceita(id)]);
  if (!receita) notFound();
  const amassaram = nomesDe(familia.amassavas, membro.id);

  const cor = COR[receita.secao];
  const tempo = formatarTempo(receita.tempo_minutos);
  const detalhes = [
    tempo,
    receita.porcoes && `Rende ${receita.porcoes} ${receita.porcoes === 1 ? "porção" : "porções"}`,
    receita.dificuldade && DIFICULDADES[receita.dificuldade],
  ].filter(Boolean);
  const dataAdicionada = new Date(receita.criado_em).toLocaleDateString("pt-BR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <>
    <article className="mx-auto max-w-4xl overflow-hidden rounded-md border border-borda bg-papel-claro shadow-[0_10px_30px_-18px_rgb(43_45_62/0.35)]">
      {receita.foto_capa && (
        <div className="relative aspect-[16/10] sm:aspect-[16/8]">
          <Image src={receita.foto_capa} alt={receita.titulo} fill priority sizes="(min-width: 896px) 896px, 100vw" className="object-cover" />
        </div>
      )}

      <div className="px-5 py-8 sm:px-12 sm:py-12">
        {receita.descricao && <Introducao texto={receita.descricao} cor={cor} />}

        <h1 className={`caixa mt-8 text-center text-3xl leading-tight tracking-[0.12em] first:mt-0 sm:text-5xl ${cor}`}>
          {receita.titulo}
        </h1>
        <p className="caixa mt-4 text-center text-xs text-tinta-suave">
          {detalhes.join("  ·  ")}
        </p>
        <div className="mt-5 flex flex-col items-center gap-3">
          <BotaoAmassava receitaId={receita.id} alvo={{ receita_id: receita.id }} nomes={amassaram.outros} eu={amassaram.eu} />
          <BotaoFavorito receitaId={receita.id} favorito={familia.favorito} />
        </div>

        <section className="mt-10" aria-label="Ingredientes">
          <ListaIngredientes ingredientes={receita.ingredientes} secao={receita.secao} porcoes={receita.porcoes} />
        </section>

        <section className="mt-10 border-t border-borda pt-8" aria-label="Modo de preparo">
          <ol className="gap-12 sm:columns-2">
            {receita.passos.map((passo, indice) => (
              <li key={indice} className="mb-5 flex break-inside-avoid gap-3">
                <span className={`caixa w-5 shrink-0 text-right text-lg leading-6 tracking-normal ${cor}`}>{indice + 1}</span>
                <p className="leading-6">{passo}</p>
              </li>
            ))}
          </ol>
        </section>

        {receita.dicas && (
          <aside className="mt-6 border-l-4 border-dourado bg-dourado/10 px-4 py-3">
            <h2 className="caixa text-xs">Dicas</h2>
            <p className="mt-1 font-serif leading-relaxed whitespace-pre-line">{receita.dicas}</p>
          </aside>
        )}

        <footer className="mt-12 border-t border-borda pt-5 text-sm text-tinta-suave">
          <p className="caixa text-right text-xs">
            <Link href={`/secao/${receita.secao}`} className="hover:underline">{SECOES[receita.secao].nome}</Link>
            {"  ·  "}
            <Link href={`/secao/${receita.secao}?pais=${encodeURIComponent(receita.pais)}`} className="hover:underline">
              {bandeira(receita.pais)} {receita.pais}
            </Link>
            {receita.categoria && `  ·  ${receita.categoria}`}
          </p>
          <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2">
            <span>
              {ORIGENS[receita.origem]}
              {receita.autor && ` · adicionada por ${receita.autor.nome}`} em {dataAdicionada}
            </span>
            {receita.fonte_url && (
              <a href={receita.fonte_url} target="_blank" rel="noreferrer" className="underline hover:text-tinta">
                Ver a fonte original
              </a>
            )}
            {receita.autor_id === membro.id && (
              <span className="ml-auto flex items-center gap-1">
                <Link href={`/receita/${receita.id}/editar`} className="rounded-full px-3 py-1.5 text-tinta hover:bg-papel-escuro">
                  Editar
                </Link>
                <BotaoApagar id={receita.id} titulo={receita.titulo} />
              </span>
            )}
          </div>
        </footer>
      </div>
    </article>

    <NaCozinhaDaFamilia receitaId={receita.id} membro={membro} versoes={familia.versoes} />
    <ConversaDaReceita receitaId={receita.id} membroId={membro.id} comentarios={familia.comentarios} />
    </>
  );
}
