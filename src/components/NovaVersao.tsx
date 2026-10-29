"use client";

import Image from "next/image";
import { useState, useTransition } from "react";
import { postarVersao } from "@/lib/acoes";
import { reduzirFoto } from "@/lib/fotos";
import { createClient } from "@/lib/supabase/client";

// "Fiz essa receita!": a foto de como ficou na sua cozinha, com um recado.
export function NovaVersao({ receitaId, membroId }: { receitaId: string; membroId: string }) {
  const [aberto, setAberto] = useState(false);
  const [foto, setFoto] = useState<{ arquivo: File; previa: string } | null>(null);
  const [recado, setRecado] = useState("");
  const [erro, setErro] = useState<string | null>(null);
  const [postando, iniciar] = useTransition();

  function fechar() {
    setAberto(false);
    setFoto(null);
    setRecado("");
    setErro(null);
  }

  function postar(evento: React.FormEvent) {
    evento.preventDefault();
    if (!foto) return;
    setErro(null);
    iniciar(async () => {
      try {
        const supabase = createClient();
        const caminho = `${membroId}/${crypto.randomUUID()}.jpg`;
        const { error } = await supabase.storage
          .from("fotos")
          .upload(caminho, await reduzirFoto(foto.arquivo), { contentType: "image/jpeg" });
        if (error) throw error;
        const url = supabase.storage.from("fotos").getPublicUrl(caminho).data.publicUrl;
        const resultado = await postarVersao(receitaId, url, recado);
        if (resultado?.erro) setErro(resultado.erro);
        else fechar();
      } catch {
        setErro("Não consegui enviar a foto. Tente outra.");
      }
    });
  }

  if (!aberto) {
    return (
      <button
        type="button"
        onClick={() => setAberto(true)}
        className="rounded-full bg-capa px-5 py-2.5 font-semibold text-papel hover:bg-capa-escura"
      >
        Fiz essa receita!
      </button>
    );
  }

  return (
    <form onSubmit={postar} className="w-full rounded-lg border border-borda bg-papel-claro p-4 sm:p-5">
      <p className="caixa mb-3 text-xs">Mostra como ficou</p>
      <div className="flex flex-col gap-4 sm:flex-row">
        {foto ? (
          <div className="relative aspect-square w-full shrink-0 overflow-hidden rounded-md border border-borda sm:w-44">
            <Image src={foto.previa} alt="Sua foto" fill sizes="176px" className="object-cover" unoptimized />
            <button
              type="button"
              onClick={() => setFoto(null)}
              className="absolute top-2 right-2 grid size-7 place-items-center rounded-full bg-tinta/80 text-papel"
              aria-label="Trocar foto"
            >
              ×
            </button>
          </div>
        ) : (
          <label className="flex aspect-square w-full shrink-0 cursor-pointer flex-col items-center justify-center rounded-md border-2 border-dashed border-borda px-3 text-center text-sm text-tinta-suave hover:border-tinta-suave sm:w-44">
            <span className="font-semibold text-tinta">Escolher ou tirar foto</span>
            <input
              type="file"
              accept="image/*"
              className="sr-only"
              onChange={(evento) => {
                const arquivo = evento.target.files?.[0];
                if (arquivo) setFoto({ arquivo, previa: URL.createObjectURL(arquivo) });
              }}
            />
          </label>
        )}
        <div className="flex flex-1 flex-col gap-3">
          <label htmlFor="recado" className="sr-only">Recado</label>
          <textarea
            id="recado"
            rows={4}
            maxLength={1000}
            value={recado}
            onChange={(evento) => setRecado(evento.target.value)}
            placeholder="Como ficou? Mudou alguma coisa? (opcional)"
            className="campo flex-1 leading-relaxed"
          />
          {erro && <p role="alert" className="text-sm text-salgado">{erro}</p>}
          <div className="flex items-center gap-2">
            <button
              disabled={!foto || postando}
              className="rounded-full bg-capa px-5 py-2.5 font-semibold text-papel hover:bg-capa-escura disabled:opacity-50"
            >
              {postando ? "Postando…" : "Postar"}
            </button>
            <button type="button" onClick={fechar} className="rounded-full px-4 py-2.5 text-tinta-suave hover:bg-papel-escuro">
              Cancelar
            </button>
          </div>
        </div>
      </div>
    </form>
  );
}
