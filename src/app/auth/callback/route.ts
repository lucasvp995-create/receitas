import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// O Google devolve a pessoa aqui. Trocamos o código pela sessão e
// conferimos se o e-mail foi convidado para o livro.
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  if (!code) return NextResponse.redirect(`${origin}/login?erro=1`);

  const supabase = await createClient();
  const { error } = await supabase.auth.exchangeCodeForSession(code);
  if (error) return NextResponse.redirect(`${origin}/login?erro=1`);

  const { data: convidado } = await supabase.rpc("entrar_na_familia");
  return NextResponse.redirect(`${origin}${convidado ? "/" : "/sem-acesso"}`);
}
