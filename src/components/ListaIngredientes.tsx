"use client";

import { useState } from "react";
import { eSubtitulo } from "@/lib/livro";

const COR = { salgado: "text-salgado", doce: "text-doce", bebidas: "text-bebidas" };

// Ingredientes em colunas separadas por fios duplos. Toque num item para riscá-lo enquanto cozinha.
export function ListaIngredientes({
  ingredientes,
  secao,
}: {
  ingredientes: string[];
  secao: keyof typeof COR;
}) {
  const [riscados, setRiscados] = useState<Set<number>>(new Set());
  const colunas = ingredientes.length > 10 ? "sm:columns-3" : ingredientes.length > 4 ? "sm:columns-2" : "";

  function alternar(indice: number) {
    setRiscados((atual) => {
      const novo = new Set(atual);
      if (novo.has(indice)) novo.delete(indice);
      else novo.add(indice);
      return novo;
    });
  }

  return (
    <ul
      className={`gap-12 ${colunas}`}
      style={{ columnRule: `3px double var(--color-${secao})` }}
    >
      {ingredientes.map((linha, indice) =>
        eSubtitulo(linha) ? (
          <li key={indice} className={`caixa break-after-avoid pt-3 pb-1 text-xs first:pt-0 ${COR[secao]}`}>
            {linha.replace(/:\s*$/, "")}
          </li>
        ) : (
          <li key={indice} className="break-inside-avoid">
            <button
              type="button"
              onClick={() => alternar(indice)}
              aria-pressed={riscados.has(indice)}
              className={`w-full py-1 text-left leading-snug font-semibold transition ${
                riscados.has(indice) ? "text-tinta-suave/60 line-through" : ""
              }`}
            >
              {linha}
            </button>
          </li>
        ),
      )}
    </ul>
  );
}
