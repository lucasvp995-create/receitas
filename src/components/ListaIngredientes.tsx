"use client";

import { useState } from "react";
import { eSubtitulo } from "@/lib/livro";

// Toque num ingrediente para riscá-lo enquanto cozinha.
export function ListaIngredientes({ ingredientes }: { ingredientes: string[] }) {
  const [riscados, setRiscados] = useState<Set<number>>(new Set());

  function alternar(indice: number) {
    setRiscados((atual) => {
      const novo = new Set(atual);
      if (novo.has(indice)) novo.delete(indice);
      else novo.add(indice);
      return novo;
    });
  }

  return (
    <ul className="space-y-1">
      {ingredientes.map((linha, indice) =>
        eSubtitulo(linha) ? (
          <li key={indice} className="pt-3 font-titulo text-base font-semibold first:pt-0">
            {linha.replace(/:\s*$/, "")}
          </li>
        ) : (
          <li key={indice}>
            <button
              type="button"
              onClick={() => alternar(indice)}
              aria-pressed={riscados.has(indice)}
              className="flex w-full items-start gap-2.5 rounded-md py-1 text-left"
            >
              <span
                className={`mt-1 flex h-4 w-4 shrink-0 items-center justify-center rounded border ${
                  riscados.has(indice) ? "border-tinta-suave bg-tinta-suave text-papel" : "border-tinta-suave/60"
                }`}
                aria-hidden
              >
                {riscados.has(indice) && (
                  <svg viewBox="0 0 12 12" className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="m2.5 6 2.5 2.5 4.5-5" />
                  </svg>
                )}
              </span>
              <span className={riscados.has(indice) ? "text-tinta-suave line-through" : ""}>{linha}</span>
            </button>
          </li>
        ),
      )}
    </ul>
  );
}
