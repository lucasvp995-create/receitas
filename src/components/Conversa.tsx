"use client";

import { useState, useTransition } from "react";
import { apagarComentario, apagarVersao, comentar } from "@/lib/acoes";

// Campo de comentário no pé da receita.
export function NovoComentario({ receitaId }: { receitaId: string }) {
  const [texto, setTexto] = useState("");
  const [erro, setErro] = useState<string | null>(null);
  const [enviando, iniciar] = useTransition();

  return (
    <form
      onSubmit={(evento) => {
        evento.preventDefault();
        iniciar(async () => {
          const resultado = await comentar(receitaId, texto);
          if (resultado?.erro) setErro(resultado.erro);
          else {
            setTexto("");
            setErro(null);
          }
        });
      }}
      className="flex flex-col gap-2"
    >
      <label htmlFor="comentario" className="sr-only">Comentário</label>
      <textarea
        id="comentario"
        rows={2}
        maxLength={2000}
        value={texto}
        onChange={(evento) => setTexto(evento.target.value)}
        placeholder="Escreva um comentário…"
        className="campo leading-relaxed"
      />
      {erro && <p role="alert" className="text-sm text-salgado">{erro}</p>}
      <button
        disabled={!texto.trim() || enviando}
        className="self-end rounded-full bg-capa px-5 py-2 text-sm font-semibold text-papel hover:bg-capa-escura disabled:opacity-50"
      >
        {enviando ? "Enviando…" : "Comentar"}
      </button>
    </form>
  );
}

export function ApagarComentario({ receitaId, id }: { receitaId: string; id: string }) {
  const [, iniciar] = useTransition();
  return (
    <button
      type="button"
      onClick={() => {
        if (confirm("Apagar seu comentário?")) iniciar(() => apagarComentario(receitaId, id));
      }}
      className="text-xs text-tinta-suave underline hover:text-salgado"
    >
      Apagar
    </button>
  );
}

export function ApagarVersao({ receitaId, id, fotoUrl }: { receitaId: string; id: string; fotoUrl: string }) {
  const [, iniciar] = useTransition();
  return (
    <button
      type="button"
      onClick={() => {
        if (confirm("Apagar sua foto desta receita?")) iniciar(() => apagarVersao(receitaId, id, fotoUrl));
      }}
      className="text-xs text-tinta-suave underline hover:text-salgado"
    >
      Apagar
    </button>
  );
}
