"use client";

import { apagarReceita } from "@/lib/acoes";

export function BotaoApagar({ id, titulo }: { id: string; titulo: string }) {
  return (
    <form
      action={apagarReceita.bind(null, id)}
      onSubmit={(evento) => {
        if (!confirm(`Apagar “${titulo}” do livro? Não dá para desfazer.`)) evento.preventDefault();
      }}
    >
      <button className="rounded-full px-3 py-1.5 text-sm text-salgado hover:bg-salgado/10">Apagar</button>
    </form>
  );
}
