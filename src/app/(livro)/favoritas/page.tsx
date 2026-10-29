import type { Metadata } from "next";
import Link from "next/link";
import { GradeReceitas } from "@/components/CartaoReceita";
import { receitasFavoritas } from "@/lib/dados";

export const metadata: Metadata = { title: "Quero fazer" };

export default async function FavoritasPage() {
  const receitas = await receitasFavoritas();

  return (
    <div>
      <h1 className="caixa text-2xl">Quero fazer</h1>
      <p className="mt-1 mb-6 text-tinta-suave">Sua lista pessoal. Só você vê.</p>
      {receitas.length > 0 ? (
        <GradeReceitas receitas={receitas} />
      ) : (
        <div className="bg-papel-claro rounded-md border border-dashed border-borda p-8 text-center text-tinta-suave">
          <p>Sua lista está vazia.</p>
          <p className="mt-1 text-sm">Abra uma receita e toque em “Quero fazer” para guardá-la aqui.</p>
          <Link href="/" className="mt-4 inline-block underline hover:text-tinta">Folhear o livro</Link>
        </div>
      )}
    </div>
  );
}
