import type { Metadata } from "next";
import { ListaCompras } from "@/components/ListaCompras";
import { listaDeCompras } from "@/lib/dados";

export const metadata: Metadata = { title: "Lista de compras" };

export default async function ComprasPage() {
  const itens = await listaDeCompras();
  return (
    <div className="bg-papel-claro mx-auto max-w-2xl rounded-2xl border border-borda px-5 py-7 shadow-sm sm:px-10">
      <h1 className="caixa text-2xl text-bebidas">Lista de compras</h1>
      <p className="mt-1 mb-6 text-tinta-suave">Só você vê a sua. Toque num item quando ele estiver no carrinho.</p>
      <ListaCompras itens={itens} />
    </div>
  );
}
