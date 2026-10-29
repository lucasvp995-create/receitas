import type { Metadata } from "next";
import { FormularioPerfil } from "@/components/FormularioPerfil";
import { fotoDoGoogle, getMembro } from "@/lib/dados";

export const metadata: Metadata = { title: "Meu perfil" };

export default async function PerfilPage() {
  const [membro, google] = await Promise.all([getMembro(), fotoDoGoogle()]);

  return (
    <div className="bg-papel-claro mx-auto max-w-2xl rounded-2xl border border-borda px-5 py-7 shadow-sm sm:px-10">
      <h1 className="caixa text-2xl text-salgado">Meu perfil</h1>
      <p className="mt-1 mb-6 text-tinta-suave">É assim que a família vê você nas fotos, comentários e amassavas.</p>
      <FormularioPerfil membro={membro} fotoGoogle={google} />
    </div>
  );
}
