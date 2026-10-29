import type { Metadata } from "next";
import { Importador } from "@/components/Importador";
import { getMembro } from "@/lib/dados";

export const metadata: Metadata = { title: "Importar receita" };

// Ler um vídeo ou várias fotos pode levar quase um minuto.
export const maxDuration = 120;

export default async function ImportarPage() {
  const membro = await getMembro();

  return (
    <div className="bg-papel-claro mx-auto max-w-2xl rounded-2xl border border-borda px-5 py-7 shadow-sm sm:px-10">
      <Importador membroId={membro.id} />
    </div>
  );
}
