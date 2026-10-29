import Image from "next/image";
import { eIlustracao, Ilustracao } from "@/components/Ilustracoes";
import type { Pessoa } from "@/lib/livro";

// Foto do Google, foto enviada, desenho do livro ("ilustracao:tomate") ou a inicial.
export function Avatar({ pessoa, tamanho = 28 }: { pessoa: Pessoa | null; tamanho?: number }) {
  const avatar = pessoa?.avatar_url;
  if (avatar?.startsWith("ilustracao:")) {
    const nome = avatar.slice("ilustracao:".length);
    if (eIlustracao(nome)) return <Ilustracao nome={nome} tamanho={tamanho} />;
  } else if (avatar) {
    return (
      <Image
        src={avatar}
        alt=""
        width={tamanho}
        height={tamanho}
        className="shrink-0 rounded-full object-cover"
        style={{ width: tamanho, height: tamanho }}
      />
    );
  }
  return (
    <span
      className="flex shrink-0 items-center justify-center rounded-full bg-dourado font-semibold text-capa"
      style={{ width: tamanho, height: tamanho, fontSize: tamanho * 0.45 }}
      aria-hidden
    >
      {(pessoa?.nome ?? "?").charAt(0).toUpperCase()}
    </span>
  );
}
