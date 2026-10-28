import type { Metadata } from "next";
import { FormularioReceita } from "@/components/FormularioReceita";
import { getMembro } from "@/lib/dados";
import { eSecao } from "@/lib/livro";

export const metadata: Metadata = { title: "Nova receita" };

export default async function NovaReceitaPage({ searchParams }: PageProps<"/nova">) {
  const membro = await getMembro();
  const { secao } = await searchParams;

  return (
    <div className="folha mx-auto max-w-2xl rounded-2xl border border-borda px-5 py-7 shadow-sm sm:px-10">
      <h1 className="mb-6 font-titulo text-3xl font-semibold">Nova receita</h1>
      <FormularioReceita membroId={membro.id} secaoInicial={typeof secao === "string" && eSecao(secao) ? secao : undefined} />
    </div>
  );
}
