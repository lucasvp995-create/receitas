import type { Metadata } from "next";
import { Sugestoes } from "@/components/Sugestoes";
import { getMembro } from "@/lib/dados";

export const metadata: Metadata = { title: "Sugestões" };

// Pensar em três receitas completas leva perto de um minuto.
export const maxDuration = 120;

export default async function SugestoesPage() {
  const membro = await getMembro();
  return <Sugestoes membroId={membro.id} />;
}
