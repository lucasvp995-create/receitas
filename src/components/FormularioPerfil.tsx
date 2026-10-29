"use client";

import Image from "next/image";
import { useState, useTransition } from "react";
import { Avatar } from "@/components/Avatar";
import { Ilustracao, ILUSTRACOES, type NomeIlustracao } from "@/components/Ilustracoes";
import { salvarPerfil } from "@/lib/acoes";
import type { Membro } from "@/lib/dados";
import { reduzirFoto } from "@/lib/fotos";
import { createClient } from "@/lib/supabase/client";

const TAMANHO = 64;

export function FormularioPerfil({ membro, fotoGoogle }: { membro: Membro; fotoGoogle: string | null }) {
  const [nome, setNome] = useState(membro.nome);
  const [avatar, setAvatar] = useState<string | null>(membro.avatar_url);
  const [enviada, setEnviada] = useState<string | null>(
    membro.avatar_url?.includes("/storage/v1/object/public/fotos/") ? membro.avatar_url : null,
  );
  const [mensagem, setMensagem] = useState<{ tipo: "erro" | "ok"; texto: string } | null>(null);
  const [salvando, iniciar] = useTransition();
  const [enviando, iniciarEnvio] = useTransition();

  function enviarFoto(evento: React.ChangeEvent<HTMLInputElement>) {
    const arquivo = evento.target.files?.[0];
    if (!arquivo) return;
    iniciarEnvio(async () => {
      try {
        const supabase = createClient();
        const caminho = `${membro.id}/avatar-${crypto.randomUUID()}.jpg`;
        const { error } = await supabase.storage
          .from("fotos")
          .upload(caminho, await reduzirFoto(arquivo, 400, true), { contentType: "image/jpeg" });
        if (error) throw error;
        const url = supabase.storage.from("fotos").getPublicUrl(caminho).data.publicUrl;
        setEnviada(url);
        setAvatar(url);
      } catch {
        setMensagem({ tipo: "erro", texto: "Não consegui enviar a foto. Tente outra." });
      }
    });
  }

  const opcao = (ativo: boolean) =>
    `relative rounded-full p-1 transition ${ativo ? "ring-[3px] ring-capa" : "ring-1 ring-borda hover:ring-tinta-suave"}`;

  return (
    <form
      onSubmit={(evento) => {
        evento.preventDefault();
        setMensagem(null);
        iniciar(async () => {
          const resultado = await salvarPerfil(nome, avatar);
          setMensagem(resultado?.erro ? { tipo: "erro", texto: resultado.erro } : { tipo: "ok", texto: "Perfil salvo!" });
        });
      }}
      className="space-y-7"
    >
      <div className="flex items-center gap-4">
        <Avatar pessoa={{ nome: nome || "?", avatar_url: avatar }} tamanho={88} />
        <div className="flex-1">
          <label htmlFor="nome" className="mb-1.5 block text-sm font-semibold">Seu nome</label>
          <input id="nome" value={nome} maxLength={60} onChange={(evento) => setNome(evento.target.value)} className="campo" />
          <p className="mt-1 text-sm text-tinta-suave">O primeiro nome aparece nas fotos e nos comentários.</p>
        </div>
      </div>

      <fieldset>
        <legend className="mb-3 block text-sm font-semibold">Avatar</legend>
        <div className="flex flex-wrap gap-3">
          {fotoGoogle && (
            <button type="button" onClick={() => setAvatar(fotoGoogle)} className={opcao(avatar === fotoGoogle)} aria-label="Foto do Google" aria-pressed={avatar === fotoGoogle}>
              <Image src={fotoGoogle} alt="" width={TAMANHO} height={TAMANHO} className="rounded-full" />
            </button>
          )}
          {enviada && (
            <button type="button" onClick={() => setAvatar(enviada)} className={opcao(avatar === enviada)} aria-label="Sua foto" aria-pressed={avatar === enviada}>
              <Image src={enviada} alt="" width={TAMANHO} height={TAMANHO} className="rounded-full object-cover" style={{ width: TAMANHO, height: TAMANHO }} />
            </button>
          )}
          <label className={`${opcao(false)} cursor-pointer`} aria-label="Enviar uma foto">
            <span className="flex flex-col items-center justify-center rounded-full border-2 border-dashed border-borda text-center text-[0.65rem] leading-tight text-tinta-suave" style={{ width: TAMANHO, height: TAMANHO }}>
              {enviando ? "Enviando…" : <>+<br />Sua foto</>}
            </span>
            <input type="file" accept="image/*" onChange={enviarFoto} className="sr-only" />
          </label>
        </div>
        <p className="mt-5 mb-3 text-sm text-tinta-suave">Ou um desenho do livro:</p>
        <div className="flex flex-wrap gap-3">
          {(Object.keys(ILUSTRACOES) as NomeIlustracao[]).map((desenho) => {
            const valor = `ilustracao:${desenho}`;
            return (
              <button
                key={desenho}
                type="button"
                onClick={() => setAvatar(valor)}
                className={opcao(avatar === valor)}
                aria-label={ILUSTRACOES[desenho].nome}
                aria-pressed={avatar === valor}
                title={ILUSTRACOES[desenho].nome}
              >
                <Ilustracao nome={desenho} tamanho={TAMANHO} />
              </button>
            );
          })}
        </div>
      </fieldset>

      {mensagem && (
        <p role="status" className={`rounded-lg px-4 py-3 ${mensagem.tipo === "erro" ? "bg-salgado/10 text-salgado" : "bg-bebidas/10 text-bebidas"}`}>
          {mensagem.texto}
        </p>
      )}

      <div className="border-t border-borda pt-5">
        <button disabled={salvando || enviando} className="rounded-full bg-capa px-6 py-3 font-semibold text-papel hover:bg-capa-escura disabled:opacity-60">
          {salvando ? "Salvando…" : "Salvar perfil"}
        </button>
      </div>
    </form>
  );
}
