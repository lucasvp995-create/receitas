-- Livro de Receitas da Família: fase 4 (lista de compras)
-- Rode este arquivo no SQL Editor do Supabase, depois do 0002.

-- A lista de compras de cada pessoa. Cada item lembra de qual receita veio.
create table public.compras (
  id uuid primary key default gen_random_uuid(),
  perfil_id uuid not null default auth.uid() references public.perfis (id) on delete cascade,
  texto text not null check (length(trim(texto)) between 1 and 300),
  receita_id uuid references public.receitas (id) on delete set null,
  receita_titulo text,
  feito boolean not null default false,
  criado_em timestamptz not null default now()
);
create index compras_perfil on public.compras (perfil_id, criado_em);

alter table public.compras enable row level security;

create policy "cada um vê a sua lista" on public.compras
  for select to authenticated using (perfil_id = auth.uid());
create policy "cada um põe na sua lista" on public.compras
  for insert to authenticated with check (public.e_da_familia() and perfil_id = auth.uid());
create policy "cada um marca a sua lista" on public.compras
  for update to authenticated using (perfil_id = auth.uid()) with check (perfil_id = auth.uid());
create policy "cada um limpa a sua lista" on public.compras
  for delete to authenticated using (perfil_id = auth.uid());
