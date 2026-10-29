import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { FormularioReceita } from "@/components/FormularioReceita";
import { getMembro, getReceita } from "@/lib/dados";

export const metadata: Metadata = { title: "Editar receita" };

export default async function EditarReceitaPage({ params }: PageProps<"/receita/[id]/editar">) {
  const { id } = await params;
  const [membro, receita] = await Promise.all([getMembro(), getReceita(id)]);
  if (!receita) notFound();
  if (receita.autor_id !== membro.id) redirect(`/receita/${id}`);

  return (
    <div className="bg-papel-claro mx-auto max-w-2xl rounded-2xl border border-borda px-5 py-7 shadow-sm sm:px-10">
      <h1 className="caixa mb-6 text-2xl text-salgado">Editar receita</h1>
      <FormularioReceita membroId={membro.id} receita={receita} />
    </div>
  );
}
