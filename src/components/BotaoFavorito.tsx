"use client";

import { useOptimistic, useTransition } from "react";
import { alternarFavorito } from "@/lib/acoes";

// "Quero fazer": guarda a receita na lista pessoal.
export function BotaoFavorito({ receitaId, favorito }: { receitaId: string; favorito: boolean }) {
  const [marcado, marcar] = useOptimistic(favorito);
  const [, iniciar] = useTransition();

  return (
    <button
      type="button"
      aria-pressed={marcado}
      onClick={() =>
        iniciar(async () => {
          marcar(!marcado);
          await alternarFavorito(receitaId, !marcado);
        })
      }
      className={`caixa flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs transition ${
        marcado ? "bg-capa text-papel" : "text-tinta-suave hover:bg-papel-escuro hover:text-tinta"
      }`}
    >
      <svg viewBox="0 0 24 24" className="h-4 w-4" fill={marcado ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" aria-hidden>
        <path d="M6 3h12v18l-6-4-6 4z" strokeLinejoin="round" />
      </svg>
      {marcado ? "Na sua lista" : "Quero fazer"}
    </button>
  );
}
