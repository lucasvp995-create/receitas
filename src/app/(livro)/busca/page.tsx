import type { Metadata } from "next";
import { GradeReceitas } from "@/components/CartaoReceita";
import { buscarReceitas } from "@/lib/dados";

export const metadata: Metadata = { title: "Buscar" };

export default async function BuscaPage({ searchParams }: PageProps<"/busca">) {
  const { q } = await searchParams;
  const termo = typeof q === "string" ? q.trim() : "";
  const resultados = termo ? await buscarReceitas(termo) : [];

  return (
    <div>
      <h1 className="font-titulo text-4xl font-semibold">Buscar</h1>
      <form action="/busca" className="mt-4 flex gap-2">
        <input
          name="q"
          defaultValue={termo}
          autoFocus
          type="search"
          placeholder="Nome, ingrediente ou país…"
          className="campo"
        />
        <button className="shrink-0 rounded-lg bg-capa px-4 font-semibold text-papel hover:bg-capa-escura">Buscar</button>
      </form>

      {termo && (
        <div className="mt-6">
          <p className="mb-3 text-sm text-tinta-suave">
            {resultados.length === 0
              ? `Nada encontrado para “${termo}”.`
              : `${resultados.length} ${resultados.length === 1 ? "receita" : "receitas"} para “${termo}”`}
          </p>
          <GradeReceitas receitas={resultados} />
        </div>
      )}
    </div>
  );
}
