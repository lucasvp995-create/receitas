"use client";

import Image from "next/image";
import { useState, useTransition } from "react";
import { FormularioReceita } from "@/components/FormularioReceita";
import { importarReceita } from "@/lib/acoes";
import { emBase64, reduzirFoto } from "@/lib/fotos";
import type { Entrada } from "@/lib/importar";
import type { Rascunho } from "@/lib/livro";

const MODOS = {
  link: "Link",
  fotos: "Foto",
  texto: "Texto",
} as const;
type Modo = keyof typeof MODOS;

const MAXIMO_FOTOS = 4;

export function Importador({ membroId }: { membroId: string }) {
  const [modo, setModo] = useState<Modo>("link");
  const [link, setLink] = useState("");
  const [texto, setTexto] = useState("");
  const [fotos, setFotos] = useState<{ arquivo: File; previa: string }[]>([]);
  const [erro, setErro] = useState<string | null>(null);
  const [rascunho, setRascunho] = useState<Rascunho | null>(null);
  const [lendo, iniciar] = useTransition();

  function escolherFotos(evento: React.ChangeEvent<HTMLInputElement>) {
    const novas = [...(evento.target.files ?? [])].map((arquivo) => ({
      arquivo,
      previa: URL.createObjectURL(arquivo),
    }));
    setFotos((atuais) => [...atuais, ...novas].slice(0, MAXIMO_FOTOS));
    evento.target.value = "";
  }

  function ler(evento: React.FormEvent) {
    evento.preventDefault();
    setErro(null);
    iniciar(async () => {
      let entrada: Entrada;
      if (modo === "fotos") {
        try {
          const imagens = await Promise.all(fotos.map(async ({ arquivo }) => emBase64(await reduzirFoto(arquivo))));
          entrada = { tipo: "fotos", imagens };
        } catch {
          setErro("Não consegui abrir uma das fotos. Tente tirar de novo.");
          return;
        }
      } else {
        entrada = modo === "link" ? { tipo: "link", url: link } : { tipo: "texto", texto };
      }
      const resultado = await importarReceita(entrada);
      if ("erro" in resultado) setErro(resultado.erro);
      else setRascunho(resultado.rascunho);
    });
  }

  if (rascunho) {
    return (
      <>
        <h1 className="caixa text-2xl text-salgado">Confira a receita</h1>
        <p className="mt-2 mb-6 rounded-lg border-l-4 border-dourado bg-dourado/10 px-4 py-3 text-sm leading-relaxed">
          A IA transcreveu a receita em português. Dê uma revisada nas quantidades e no capítulo antes de guardar, e
          acrescente uma foto se quiser.
        </p>
        <FormularioReceita membroId={membroId} rascunho={rascunho} aoCancelar={() => setRascunho(null)} />
      </>
    );
  }

  const pronto =
    modo === "link" ? link.trim().length > 8 : modo === "fotos" ? fotos.length > 0 : texto.trim().length > 20;

  return (
    <form onSubmit={ler}>
      <h1 className="caixa text-2xl text-salgado">Importar receita</h1>
      <p className="mt-2 text-tinta-suave">
        Traga uma receita de um site, de um vídeo ou de uma foto. A IA escreve em português, no jeito do livro, e você
        revisa antes de guardar.
      </p>

      <div role="tablist" className="mt-6 grid grid-cols-3 gap-1 rounded-full border border-borda bg-papel p-1">
        {(Object.keys(MODOS) as Modo[]).map((opcao) => (
          <button
            key={opcao}
            type="button"
            role="tab"
            aria-selected={modo === opcao}
            onClick={() => { setModo(opcao); setErro(null); }}
            className={`caixa rounded-full py-2 text-xs transition ${
              modo === opcao ? "bg-capa text-papel" : "text-tinta-suave hover:text-tinta"
            }`}
          >
            {MODOS[opcao]}
          </button>
        ))}
      </div>

      <div className="mt-6">
        {modo === "link" && (
          <>
            <label htmlFor="link" className="mb-1.5 block text-sm font-semibold">Link da receita ou do vídeo</label>
            <input
              id="link"
              type="url"
              inputMode="url"
              value={link}
              onChange={(evento) => setLink(evento.target.value)}
              placeholder="https://www.youtube.com/watch?v=…"
              className="campo"
              autoFocus
            />
            <p className="mt-2 text-sm text-tinta-suave">
              Blogs e sites de receita, em qualquer idioma, e vídeos do YouTube. Instagram e TikTok ainda não: copie a
              legenda do post e use a aba Texto.
            </p>
          </>
        )}

        {modo === "fotos" && (
          <>
            <span className="mb-1.5 block text-sm font-semibold">Fotos da receita</span>
            {fotos.length > 0 && (
              <ul className="mb-3 flex flex-wrap gap-3">
                {fotos.map((foto, indice) => (
                  <li key={foto.previa} className="relative h-28 w-24 overflow-hidden rounded-md border border-borda">
                    <Image src={foto.previa} alt={`Foto ${indice + 1}`} fill sizes="96px" className="object-cover" unoptimized />
                    <button
                      type="button"
                      onClick={() => setFotos((atuais) => atuais.filter((_, posicao) => posicao !== indice))}
                      className="absolute top-1 right-1 grid size-6 place-items-center rounded-full bg-tinta/80 text-sm text-papel"
                      aria-label={`Tirar a foto ${indice + 1}`}
                    >
                      ×
                    </button>
                  </li>
                ))}
              </ul>
            )}
            {fotos.length < MAXIMO_FOTOS && (
              <label className="flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-borda bg-papel-claro px-4 py-8 text-center text-tinta-suave hover:border-tinta-suave">
                <span className="font-semibold text-tinta">{fotos.length ? "Adicionar outra página" : "Escolher ou tirar uma foto"}</span>
                <span className="text-sm">Página de livro, caderno de receitas, recorte de revista</span>
                <input type="file" accept="image/*" multiple onChange={escolherFotos} className="sr-only" />
              </label>
            )}
            <p className="mt-2 text-sm text-tinta-suave">
              Se a receita continua na outra página, mande até {MAXIMO_FOTOS} fotos em ordem. Letra à mão também vale.
            </p>
          </>
        )}

        {modo === "texto" && (
          <>
            <label htmlFor="texto" className="mb-1.5 block text-sm font-semibold">Texto da receita</label>
            <textarea
              id="texto"
              rows={10}
              value={texto}
              onChange={(evento) => setTexto(evento.target.value)}
              placeholder="Cole aqui a legenda do Instagram, a mensagem do WhatsApp ou a receita copiada de qualquer lugar."
              className="campo leading-relaxed"
              autoFocus
            />
          </>
        )}
      </div>

      {erro && <p role="alert" className="mt-5 rounded-lg bg-salgado/10 px-4 py-3 text-salgado">{erro}</p>}

      <div className="mt-6 flex flex-wrap items-center gap-3 border-t border-borda pt-5">
        <button
          disabled={!pronto || lendo}
          className="rounded-full bg-capa px-6 py-3 font-semibold text-papel hover:bg-capa-escura disabled:opacity-50"
        >
          {lendo ? "Lendo a receita…" : "Ler receita"}
        </button>
        {lendo && (
          <span className="text-sm text-tinta-suave" aria-live="polite">
            Leva uns 20 a 40 segundos. Pode deixar a tela aberta.
          </span>
        )}
      </div>
    </form>
  );
}
