import type { Metadata } from "next";
import Link from "next/link";
import { FormularioReceita } from "@/components/FormularioReceita";
import { getMembro } from "@/lib/dados";
import { eSecao } from "@/lib/livro";

export const metadata: Metadata = { title: "Nova receita" };

export default async function NovaReceitaPage({ searchParams }: PageProps<"/nova">) {
  const membro = await getMembro();
  const { secao } = await searchParams;

  return (
    <div className="bg-papel-claro mx-auto max-w-2xl rounded-2xl border border-borda px-5 py-7 shadow-sm sm:px-10">
      <h1 className="caixa text-2xl text-salgado">Nova receita</h1>
      <Link
        href="/importar"
        className="mt-4 mb-7 flex items-center justify-between gap-3 rounded-lg border border-dourado bg-dourado/10 px-4 py-3 hover:bg-dourado/20"
      >
        <span>
          <span className="block font-semibold">Achou a receita em outro lugar?</span>
          <span className="text-sm text-tinta-suave">Importe de um site, vídeo do YouTube ou foto, e a IA escreve para você.</span>
        </span>
        <span className="caixa shrink-0 text-xs">Importar →</span>
      </Link>
      <FormularioReceita membroId={membro.id} secaoInicial={typeof secao === "string" && eSecao(secao) ? secao : undefined} />
    </div>
  );
}
