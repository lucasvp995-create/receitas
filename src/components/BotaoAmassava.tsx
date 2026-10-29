"use client";

import { useOptimistic, useTransition } from "react";
import { alternarAmassava, type Alvo } from "@/lib/acoes";
import { quemAmassou } from "@/lib/livro";

// O "curtir" da família. Mostra quem amassou: "Você e Ana amassavam".
// `nomes` são os outros; quem está lendo entra como "Você".
export function BotaoAmassava({
  receitaId,
  alvo,
  nomes,
  eu,
  pequeno = false,
}: {
  receitaId: string;
  alvo: Alvo;
  nomes: string[];
  eu: boolean;
  pequeno?: boolean;
}) {
  const [euAgora, mudar] = useOptimistic(eu);
  const todos = euAgora ? ["Você", ...nomes] : nomes;
  const [, iniciar] = useTransition();

  function alternar() {
    const ligar = !euAgora;
    iniciar(async () => {
      mudar(ligar);
      await alternarAmassava(receitaId, alvo, ligar);
    });
  }

  const tamanho = pequeno ? "px-3 py-1 text-[0.7rem]" : "px-4 py-1.5 text-xs";
  return (
    <div className={`flex flex-wrap items-center gap-x-2.5 gap-y-1 ${pequeno ? "" : "justify-center"}`}>
      <button
        type="button"
        onClick={alternar}
        aria-pressed={euAgora}
        className={`caixa rounded-full border-2 transition ${tamanho} ${
          euAgora
            ? "amassou border-dourado bg-dourado text-capa"
            : "border-dourado/70 text-tinta hover:bg-dourado/15"
        }`}
      >
        Amassava!
      </button>
      {todos.length > 0 && (
        <span className={`text-tinta-suave ${pequeno ? "text-xs" : "text-sm"}`}>{quemAmassou(todos)}</span>
      )}
    </div>
  );
}
