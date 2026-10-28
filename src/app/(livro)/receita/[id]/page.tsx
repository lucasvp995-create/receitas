import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { BotaoApagar } from "@/components/BotaoApagar";
import { ListaIngredientes } from "@/components/ListaIngredientes";
import { getMembro, getReceita } from "@/lib/dados";
import { bandeira, DIFICULDADES, formatarTempo, ORIGENS, SECOES } from "@/lib/livro";

const COR = { salgado: "text-salgado", doce: "text-doce", bebidas: "text-bebidas" };

export async function generateMetadata({ params }: PageProps<"/receita/[id]">): Promise<Metadata> {
  const { id } = await params;
  const receita = await getReceita(id);
  return { title: receita?.titulo ?? "Receita" };
}

export default async function ReceitaPage({ params }: PageProps<"/receita/[id]">) {
  const { id } = await params;
  const [membro, receita] = await Promise.all([getMembro(), getReceita(id)]);
  if (!receita) notFound();

  const tempo = formatarTempo(receita.tempo_minutos);
  const detalhes = [
    tempo && { rotulo: "Tempo", valor: tempo },
    receita.porcoes && { rotulo: "Rende", valor: `${receita.porcoes} ${receita.porcoes === 1 ? "porção" : "porções"}` },
    receita.dificuldade && { rotulo: "Dificuldade", valor: DIFICULDADES[receita.dificuldade] },
  ].filter(Boolean) as { rotulo: string; valor: string }[];
  const dataAdicionada = new Date(receita.criado_em).toLocaleDateString("pt-BR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <article className="folha mx-auto max-w-3xl overflow-hidden rounded-2xl border border-borda shadow-[0_10px_30px_-15px_rgb(54_32_15/0.35)]">
      {receita.foto_capa && (
        <div className="relative aspect-[16/10] sm:aspect-[16/9]">
          <Image src={receita.foto_capa} alt={receita.titulo} fill priority sizes="(min-width: 768px) 768px, 100vw" className="object-cover" />
        </div>
      )}

      <div className="px-5 py-7 sm:px-10 sm:py-10">
        <p className={`text-sm font-semibold tracking-wide uppercase ${COR[receita.secao]}`}>
          <Link href={`/secao/${receita.secao}`} className="hover:underline">{SECOES[receita.secao].nome}</Link>
          {" · "}
          <Link href={`/secao/${receita.secao}?pais=${encodeURIComponent(receita.pais)}`} className="hover:underline">
            {bandeira(receita.pais)} {receita.pais}
          </Link>
          {receita.categoria && ` · ${receita.categoria}`}
        </p>
        <h1 className="mt-2 font-titulo text-4xl font-semibold leading-tight sm:text-5xl">{receita.titulo}</h1>
        {receita.descricao && <p className="mt-3 text-lg text-tinta-suave">{receita.descricao}</p>}

        {detalhes.length > 0 && (
          <dl className="mt-6 flex flex-wrap gap-x-8 gap-y-3 border-y border-borda py-4">
            {detalhes.map(({ rotulo, valor }) => (
              <div key={rotulo}>
                <dt className="text-xs tracking-wide text-tinta-suave uppercase">{rotulo}</dt>
                <dd className="font-titulo text-lg font-semibold">{valor}</dd>
              </div>
            ))}
          </dl>
        )}

        <div className="mt-8 grid gap-10 md:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]">
          <section>
            <h2 className="mb-3 font-titulo text-2xl font-semibold">Ingredientes</h2>
            <ListaIngredientes ingredientes={receita.ingredientes} />
          </section>

          <section>
            <h2 className="mb-3 font-titulo text-2xl font-semibold">Modo de preparo</h2>
            <ol className="space-y-5">
              {receita.passos.map((passo, indice) => (
                <li key={indice} className="flex gap-4">
                  <span className={`w-7 shrink-0 text-center font-titulo text-3xl leading-none font-semibold ${COR[receita.secao]}`}>{indice + 1}</span>
                  <p className="pt-1 leading-relaxed">{passo}</p>
                </li>
              ))}
            </ol>
          </section>
        </div>

        {receita.dicas && (
          <aside className="mt-10 rounded-xl border-l-4 border-dourado bg-dourado/10 p-4">
            <h2 className="font-titulo text-lg font-semibold">Dicas</h2>
            <p className="mt-1 whitespace-pre-line leading-relaxed">{receita.dicas}</p>
          </aside>
        )}

        <footer className="mt-10 flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-borda pt-5 text-sm text-tinta-suave">
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
        </footer>
      </div>
    </article>
  );
}
