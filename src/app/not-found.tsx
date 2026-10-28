import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center px-4 py-16 text-center">
      <h1 className="font-titulo text-4xl font-semibold">Página arrancada</h1>
      <p className="mt-3 text-tinta-suave">Essa página não está no livro.</p>
      <Link href="/" className="mt-6 rounded-full bg-capa px-5 py-2.5 font-semibold text-papel hover:bg-capa-escura">
        Voltar ao índice
      </Link>
    </main>
  );
}
