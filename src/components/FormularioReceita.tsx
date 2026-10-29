"use client";

import Image from "next/image";
import { useState, useTransition } from "react";
import { criarReceita, editarReceita, type DadosReceita } from "@/lib/acoes";
import { CATEGORIAS, DIFICULDADES, PAISES, SECOES, type Rascunho, type Receita, type Secao } from "@/lib/livro";
import { reduzirFoto } from "@/lib/fotos";
import { createClient } from "@/lib/supabase/client";

type Props = {
  membroId: string;
  receita?: Receita;
  // Receita lida pela IA, para revisar antes de guardar.
  rascunho?: Rascunho;
  secaoInicial?: Secao;
  aoCancelar?: () => void;
};

export function FormularioReceita({ membroId, receita, rascunho, secaoInicial, aoCancelar }: Props) {
  const inicial = receita ?? rascunho;
  const [secao, setSecao] = useState<Secao>(inicial?.secao ?? secaoInicial ?? "salgado");
  const [foto, setFoto] = useState<File | null>(null);
  const [previa, setPrevia] = useState<string | null>(inicial?.foto_capa ?? null);
  const [erro, setErro] = useState<string | null>(null);
  const [salvando, iniciar] = useTransition();

  function escolherFoto(evento: React.ChangeEvent<HTMLInputElement>) {
    const arquivo = evento.target.files?.[0];
    if (!arquivo) return;
    setFoto(arquivo);
    setPrevia(URL.createObjectURL(arquivo));
  }

  function removerFoto() {
    setFoto(null);
    setPrevia(null);
  }

  function enviar(evento: React.FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    const form = new FormData(evento.currentTarget);
    const campo = (nome: string) => String(form.get(nome) ?? "");
    setErro(null);

    iniciar(async () => {
      let fotoCapa = previa && !foto ? previa : null;
      if (foto) {
        try {
          const supabase = createClient();
          const caminho = `${membroId}/${crypto.randomUUID()}.jpg`;
          const { error } = await supabase.storage
            .from("fotos")
            .upload(caminho, await reduzirFoto(foto), { contentType: "image/jpeg" });
          if (error) throw error;
          fotoCapa = supabase.storage.from("fotos").getPublicUrl(caminho).data.publicUrl;
        } catch {
          setErro("Não consegui enviar a foto. Tente outra ou salve sem foto.");
          return;
        }
      }

      const dados: DadosReceita = {
        titulo: campo("titulo"),
        secao,
        pais: campo("pais"),
        categoria: campo("categoria"),
        descricao: campo("descricao"),
        tempo_minutos: campo("tempo_minutos"),
        porcoes: campo("porcoes"),
        dificuldade: campo("dificuldade"),
        ingredientes: campo("ingredientes"),
        passos: campo("passos"),
        dicas: campo("dicas"),
        fonte_url: campo("fonte_url"),
        foto_capa: fotoCapa,
        origem: rascunho?.origem,
      };
      const resultado = receita ? await editarReceita(receita.id, dados) : await criarReceita(dados);
      if (resultado?.erro) setErro(resultado.erro);
    });
  }

  const rotulo = "mb-1.5 block text-sm font-semibold";
  const ajuda = "mt-1 text-sm text-tinta-suave";
  const corSecao = { salgado: "peer-checked:border-salgado peer-checked:bg-salgado/10 peer-checked:text-salgado", doce: "peer-checked:border-doce peer-checked:bg-doce/10 peer-checked:text-doce", bebidas: "peer-checked:border-bebidas peer-checked:bg-bebidas/10 peer-checked:text-bebidas" };

  return (
    <form onSubmit={enviar} className="space-y-6">
      <div>
        <label htmlFor="titulo" className={rotulo}>Nome da receita</label>
        <input id="titulo" name="titulo" required defaultValue={inicial?.titulo} placeholder="Ex.: Carbonara do vô" className="campo text-lg font-semibold" />
      </div>

      <fieldset>
        <legend className={rotulo}>Capítulo</legend>
        <div className="grid grid-cols-3 gap-2">
          {(Object.keys(SECOES) as Secao[]).map((opcao) => (
            <label key={opcao} className="cursor-pointer">
              <input type="radio" name="secao" value={opcao} checked={secao === opcao} onChange={() => setSecao(opcao)} className="peer sr-only" />
              <span className={`block rounded-lg border-2 border-borda bg-papel-claro py-2.5 text-center caixa text-sm transition peer-focus-visible:ring-2 peer-focus-visible:ring-dourado ${corSecao[opcao]}`}>
                {SECOES[opcao].nome}
              </span>
            </label>
          ))}
        </div>
      </fieldset>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="pais" className={rotulo}>País de origem</label>
          <input id="pais" name="pais" list="lista-paises" defaultValue={inicial?.pais ?? "Brasil"} className="campo" />
          <datalist id="lista-paises">
            {PAISES.map((pais) => <option key={pais} value={pais} />)}
          </datalist>
        </div>
        <div>
          <label htmlFor="categoria" className={rotulo}>Tipo de prato <span className="font-normal text-tinta-suave">(opcional)</span></label>
          <input id="categoria" name="categoria" list="lista-categorias" defaultValue={inicial?.categoria ?? ""} placeholder="Ex.: Massa, Bolo, Drink" className="campo" />
          <datalist id="lista-categorias">
            {CATEGORIAS.map((categoria) => <option key={categoria} value={categoria} />)}
          </datalist>
        </div>
      </div>

      <div>
        <label htmlFor="descricao" className={rotulo}>Uma frase sobre ela <span className="font-normal text-tinta-suave">(opcional)</span></label>
        <input id="descricao" name="descricao" defaultValue={inicial?.descricao ?? ""} placeholder="Ex.: Cremosa, sem creme de leite, como em Roma." className="campo" />
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        <div>
          <label htmlFor="tempo_minutos" className={rotulo}>Tempo (min)</label>
          <input id="tempo_minutos" name="tempo_minutos" type="number" inputMode="numeric" min={1} defaultValue={inicial?.tempo_minutos ?? ""} className="campo" />
        </div>
        <div>
          <label htmlFor="porcoes" className={rotulo}>Porções</label>
          <input id="porcoes" name="porcoes" type="number" inputMode="numeric" min={1} defaultValue={inicial?.porcoes ?? ""} className="campo" />
        </div>
        <div className="col-span-2 sm:col-span-1">
          <label htmlFor="dificuldade" className={rotulo}>Dificuldade</label>
          <select id="dificuldade" name="dificuldade" defaultValue={inicial?.dificuldade ?? ""} className="campo">
            <option value="">—</option>
            {Object.entries(DIFICULDADES).map(([valor, nome]) => <option key={valor} value={valor}>{nome}</option>)}
          </select>
        </div>
      </div>

      <div>
        <label htmlFor="ingredientes" className={rotulo}>Ingredientes</label>
        <textarea id="ingredientes" name="ingredientes" required rows={8} defaultValue={inicial?.ingredientes.join("\n")} placeholder={"400 g de espaguete\n150 g de guanciale\n4 gemas\nPara finalizar:\nPecorino ralado a gosto"} className="campo leading-relaxed" />
        <p className={ajuda}>Um ingrediente por linha. Termine uma linha com “:” para criar um subtítulo, como “Para o molho:”.</p>
      </div>

      <div>
        <label htmlFor="passos" className={rotulo}>Modo de preparo</label>
        <textarea id="passos" name="passos" required rows={8} defaultValue={inicial?.passos.join("\n")} placeholder={"Cozinhe a massa em água com sal.\nDoure o guanciale na frigideira.\nMisture tudo fora do fogo com as gemas."} className="campo leading-relaxed" />
        <p className={ajuda}>Um passo por linha. O livro numera sozinho.</p>
      </div>

      <div>
        <label htmlFor="dicas" className={rotulo}>Dicas <span className="font-normal text-tinta-suave">(opcional)</span></label>
        <textarea id="dicas" name="dicas" rows={3} defaultValue={inicial?.dicas ?? ""} placeholder="Segredos, substituições, como servir…" className="campo leading-relaxed" />
      </div>

      <div>
        <span className={rotulo}>Foto do prato <span className="font-normal text-tinta-suave">(opcional)</span></span>
        {previa ? (
          <div className="flex items-end gap-3">
            <div className="relative h-32 w-44 overflow-hidden rounded-lg border border-borda">
              <Image src={previa} alt="Prévia da foto" fill sizes="176px" className="object-cover" unoptimized />
            </div>
            <button type="button" onClick={removerFoto} className="text-sm text-salgado underline">Remover foto</button>
          </div>
        ) : (
          <label className="flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-borda bg-papel-claro px-4 py-8 text-center text-tinta-suave hover:border-tinta-suave">
            <span className="font-semibold text-tinta">Escolher ou tirar uma foto</span>
            <span className="text-sm">JPG, PNG ou HEIC do celular</span>
            <input type="file" accept="image/*" onChange={escolherFoto} className="sr-only" />
          </label>
        )}
      </div>

      <div>
        <label htmlFor="fonte_url" className={rotulo}>De onde veio? <span className="font-normal text-tinta-suave">(link, opcional)</span></label>
        <input id="fonte_url" name="fonte_url" type="url" inputMode="url" defaultValue={inicial?.fonte_url ?? ""} placeholder="https://…" className="campo" />
      </div>

      {erro && <p role="alert" className="rounded-lg bg-salgado/10 px-4 py-3 text-salgado">{erro}</p>}

      <div className="flex items-center gap-3 border-t border-borda pt-5">
        <button disabled={salvando} className="rounded-full bg-capa px-6 py-3 font-semibold text-papel hover:bg-capa-escura disabled:opacity-60">
          {salvando ? "Salvando…" : receita ? "Salvar alterações" : "Guardar no livro"}
        </button>
        <button type="button" onClick={aoCancelar ?? (() => history.back())} className="rounded-full px-4 py-3 text-tinta-suave hover:bg-papel-escuro">
          Cancelar
        </button>
      </div>
    </form>
  );
}
