import type { Metadata } from "next";
import { sair } from "@/lib/acoes";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Sem acesso" };

export default async function SemAcessoPage() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  const email = data?.claims?.email as string | undefined;

  return (
    <main className="flex flex-1 items-center justify-center px-4 py-10">
      <div className="bg-papel-claro w-full max-w-md rounded-2xl border border-borda p-8 text-center shadow-sm">
        <h1 className="caixa text-2xl text-salgado">Este livro é só da família</h1>
        <p className="mt-4 text-tinta-suave">
          {email ? (
            <>
              A conta <strong className="text-tinta">{email}</strong> ainda não foi convidada.
            </>
          ) : (
            "A sua conta ainda não foi convidada."
          )}{" "}
          Peça para o Lucas adicionar o seu e-mail e entre de novo.
        </p>
        <form action={sair} className="mt-8">
          <button className="rounded-full bg-capa px-5 py-2.5 font-semibold text-papel hover:bg-capa-escura">
            Entrar com outra conta
          </button>
        </form>
      </div>
    </main>
  );
}
