import Image from "next/image";
import { Avatar } from "@/components/Avatar";
import { BotaoAmassava } from "@/components/BotaoAmassava";
import { ApagarComentario, ApagarVersao, NovoComentario } from "@/components/Conversa";
import { NovaVersao } from "@/components/NovaVersao";
import type { Membro } from "@/lib/dados";
import { primeiroNome, quando, type Comentario, type Pessoa, type Versao } from "@/lib/livro";

// Nomes de quem amassou, com "Você" no lugar do próprio nome.
export function nomesDe(amassavas: { autor_id: string; autor: Pessoa | null }[], membroId: string) {
  const outros = amassavas.filter((a) => a.autor_id !== membroId).map((a) => primeiroNome(a.autor));
  return { eu: outros.length < amassavas.length, outros };
}

function CartaoVersao({ versao, receitaId, membroId }: { versao: Versao; receitaId: string; membroId: string }) {
  const { eu, outros } = nomesDe(versao.amassavas, membroId);
  return (
    <figure className="overflow-hidden rounded-md border border-borda bg-papel-claro">
      <div className="relative aspect-square">
        <Image src={versao.foto_url} alt={`Versão de ${primeiroNome(versao.autor)}`} fill sizes="(min-width: 640px) 300px, 100vw" className="object-cover" />
      </div>
      <figcaption className="space-y-3 p-3">
        <div className="flex items-center gap-2 text-sm">
          <Avatar pessoa={versao.autor} tamanho={26} />
          <span className="font-semibold">{primeiroNome(versao.autor)}</span>
          <span className="text-tinta-suave">· {quando(versao.criado_em)}</span>
          {versao.autor_id === membroId && (
            <span className="ml-auto"><ApagarVersao receitaId={receitaId} id={versao.id} fotoUrl={versao.foto_url} /></span>
          )}
        </div>
        {versao.recado && <p className="font-serif leading-relaxed whitespace-pre-line">{versao.recado}</p>}
        <BotaoAmassava receitaId={receitaId} alvo={{ versao_id: versao.id }} nomes={outros} eu={eu} pequeno />
      </figcaption>
    </figure>
  );
}

export function NaCozinhaDaFamilia({
  receitaId,
  membro,
  versoes,
}: {
  receitaId: string;
  membro: Membro;
  versoes: Versao[];
}) {
  return (
    <section aria-labelledby="na-cozinha" className="mx-auto mt-10 max-w-4xl">
      <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 id="na-cozinha" className="caixa text-lg">Na cozinha da família</h2>
          <p className="text-sm text-tinta-suave">
            {versoes.length === 0
              ? "Ninguém postou ainda. Fez essa receita? Mostra como ficou!"
              : `${versoes.length} ${versoes.length === 1 ? "pessoa fez" : "vezes feita"} em casa`}
          </p>
        </div>
      </div>
      <div className="mb-5 flex">
        <NovaVersao receitaId={receitaId} membroId={membro.id} />
      </div>
      {versoes.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {versoes.map((versao) => (
            <CartaoVersao key={versao.id} versao={versao} receitaId={receitaId} membroId={membro.id} />
          ))}
        </div>
      )}
    </section>
  );
}

export function ConversaDaReceita({
  receitaId,
  membroId,
  comentarios,
}: {
  receitaId: string;
  membroId: string;
  comentarios: Comentario[];
}) {
  return (
    <section aria-labelledby="conversa" className="mx-auto mt-12 max-w-2xl">
      <h2 id="conversa" className="caixa mb-4 text-lg">
        Conversa {comentarios.length > 0 && <span className="text-tinta-suave">({comentarios.length})</span>}
      </h2>
      {comentarios.length > 0 && (
        <ul className="mb-5 space-y-4">
          {comentarios.map((comentario) => (
            <li key={comentario.id} className="flex gap-3">
              <Avatar pessoa={comentario.autor} tamanho={32} />
              <div className="min-w-0 flex-1 rounded-lg rounded-tl-none bg-papel-escuro/60 px-3.5 py-2.5">
                <p className="text-sm">
                  <span className="font-semibold">{primeiroNome(comentario.autor)}</span>
                  <span className="text-tinta-suave"> · {quando(comentario.criado_em)}</span>
                </p>
                <p className="mt-0.5 leading-relaxed break-words whitespace-pre-line">{comentario.texto}</p>
                {comentario.autor_id === membroId && (
                  <div className="mt-1 text-right"><ApagarComentario receitaId={receitaId} id={comentario.id} /></div>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
      <NovoComentario receitaId={receitaId} />
    </section>
  );
}
