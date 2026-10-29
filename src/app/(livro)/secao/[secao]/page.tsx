import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { GradeReceitas } from "@/components/CartaoReceita";
import { receitasDaSecao } from "@/lib/dados";
import { bandeira, eSecao, SECOES } from "@/lib/livro";

const COR_TITULO = { salgado: "text-salgado", doce: "text-doce", bebidas: "text-bebidas" };

export async function generateMetadata({ params }: PageProps<"/secao/[secao]">): Promise<Metadata> {
  const { secao } = await params;
  return { title: eSecao(secao) ? SECOES[secao].nome : "Capítulo" };
}

export default async function SecaoPage({ params, searchParams }: PageProps<"/secao/[secao]">) {
  const { secao } = await params;
  if (!eSecao(secao)) notFound();
  const { pais } = await searchParams;
  const paisEscolhido = typeof pais === "string" ? pais : null;

  const receitas = await receitasDaSecao(secao);
  const paises = Object.entries(
    receitas.reduce<Record<string, number>>((acc, r) => ({ ...acc, [r.pais]: (acc[r.pais] ?? 0) + 1 }), {}),
  ).sort(([a], [b]) => a.localeCompare(b, "pt-BR"));
  const visiveis = paisEscolhido ? receitas.filter((r) => r.pais === paisEscolhido) : receitas;

  const chip = (ativo: boolean) =>
    `shrink-0 rounded-full border px-3 py-1.5 text-sm transition ${
      ativo ? "border-capa bg-capa text-papel" : "border-borda bg-papel-claro hover:border-tinta-suave"
    }`;

  return (
    <div>
      <p className="caixa text-xs text-tinta-suave">
        <Link href="/" className="hover:underline">Índice</Link> / Capítulo
      </p>
      <h1 className={`caixa mt-1 text-4xl sm:text-5xl ${COR_TITULO[secao]}`}>{SECOES[secao].nome}</h1>
      <p className="mt-1 font-serif text-lg text-tinta-suave italic">{SECOES[secao].frase}</p>

      {paises.length > 0 && (
        <nav aria-label="Países" className="-mx-4 mt-6 flex gap-2 overflow-x-auto px-4 pb-2">
          <Link href={`/secao/${secao}`} className={chip(!paisEscolhido)}>
            Todos ({receitas.length})
          </Link>
          {paises.map(([nome, quantidade]) => (
            <Link
              key={nome}
              href={`/secao/${secao}?pais=${encodeURIComponent(nome)}`}
              className={chip(nome === paisEscolhido)}
            >
              {bandeira(nome)} {nome} ({quantidade})
            </Link>
          ))}
        </nav>
      )}

      <div className="mt-6">
        {visiveis.length > 0 ? (
          <GradeReceitas receitas={visiveis} />
        ) : (
          <div className="bg-papel-claro rounded-md border border-dashed border-borda p-8 text-center">
            <p className="text-tinta-suave">Nenhuma receita aqui ainda.</p>
            <Link
              href={`/nova?secao=${secao}`}
              className="mt-4 inline-block rounded-full bg-capa px-5 py-2.5 font-semibold text-papel hover:bg-capa-escura"
            >
              Adicionar uma receita {secao === "bebidas" ? "de bebida" : secao === "doce" ? "doce" : "salgada"}
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
