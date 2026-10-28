import type { Metadata } from "next";
import { Capa } from "@/components/Capa";
import { BotaoGoogle } from "./BotaoGoogle";

export const metadata: Metadata = { title: "Entrar" };

export default async function LoginPage({ searchParams }: PageProps<"/login">) {
  const { erro } = await searchParams;

  return (
    <main className="flex flex-1 items-center justify-center px-4 py-10">
      <div className="w-full max-w-sm">
        <Capa>
          <div className="mt-10">
            <BotaoGoogle />
          </div>
        </Capa>
        {erro && (
          <p className="mt-4 text-center text-sm text-salgado">
            Não foi possível entrar. Tente de novo.
          </p>
        )}
        <p className="mt-6 text-center text-sm text-tinta-suave">
          Um livro só da família. Entre com a sua conta Google.
        </p>
      </div>
    </main>
  );
}
