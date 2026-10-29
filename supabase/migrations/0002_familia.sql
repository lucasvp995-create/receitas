-- Livro de Receitas da Família: fase 3 (a família no livro)
-- Rode este arquivo inteiro no SQL Editor do Supabase, depois do 0001.

-- "Fiz essa receita": a foto (e um recado) de quem preparou.
create table public.versoes (
  id uuid primary key default gen_random_uuid(),
  receita_id uuid not null references public.receitas (id) on delete cascade,
  autor_id uuid not null default auth.uid() references public.perfis (id) on delete cascade,
  foto_url text not null,
  recado text check (length(recado) <= 1000),
  criado_em timestamptz not null default now()
);
create index versoes_receita on public.versoes (receita_id, criado_em desc);
create index versoes_criado_em on public.versoes (criado_em desc);

-- Amassava! O "curtir" da família, numa receita ou numa versão.
create table public.amassavas (
  id uuid primary key default gen_random_uuid(),
  autor_id uuid not null default auth.uid() references public.perfis (id) on delete cascade,
  receita_id uuid references public.receitas (id) on delete cascade,
  versao_id uuid references public.versoes (id) on delete cascade,
  criado_em timestamptz not null default now(),
  check (num_nonnulls(receita_id, versao_id) = 1)
);
create unique index amassavas_receita on public.amassavas (receita_id, autor_id) where receita_id is not null;
create unique index amassavas_versao on public.amassavas (versao_id, autor_id) where versao_id is not null;

create table public.comentarios (
  id uuid primary key default gen_random_uuid(),
  receita_id uuid not null references public.receitas (id) on delete cascade,
  autor_id uuid not null default auth.uid() references public.perfis (id) on delete cascade,
  texto text not null check (length(trim(texto)) between 1 and 2000),
  criado_em timestamptz not null default now()
);
create index comentarios_receita on public.comentarios (receita_id, criado_em);

-- "Quero fazer": a lista pessoal de cada um.
create table public.favoritos (
  perfil_id uuid not null default auth.uid() references public.perfis (id) on delete cascade,
  receita_id uuid not null references public.receitas (id) on delete cascade,
  criado_em timestamptz not null default now(),
  primary key (perfil_id, receita_id)
);

alter table public.versoes enable row level security;
alter table public.amassavas enable row level security;
alter table public.comentarios enable row level security;
alter table public.favoritos enable row level security;

create policy "família vê versões" on public.versoes
  for select to authenticated using (public.e_da_familia());
create policy "família posta versões" on public.versoes
  for insert to authenticated with check (public.e_da_familia() and autor_id = auth.uid());
create policy "autor apaga a sua versão" on public.versoes
  for delete to authenticated using (autor_id = auth.uid());

create policy "família vê amassavas" on public.amassavas
  for select to authenticated using (public.e_da_familia());
create policy "família amassa" on public.amassavas
  for insert to authenticated with check (public.e_da_familia() and autor_id = auth.uid());
create policy "cada um desfaz o seu amassava" on public.amassavas
  for delete to authenticated using (autor_id = auth.uid());

create policy "família vê comentários" on public.comentarios
  for select to authenticated using (public.e_da_familia());
create policy "família comenta" on public.comentarios
  for insert to authenticated with check (public.e_da_familia() and autor_id = auth.uid());
create policy "autor apaga o seu comentário" on public.comentarios
  for delete to authenticated using (autor_id = auth.uid());

create policy "cada um vê os seus favoritos" on public.favoritos
  for select to authenticated using (perfil_id = auth.uid());
create policy "cada um marca favoritos" on public.favoritos
  for insert to authenticated with check (public.e_da_familia() and perfil_id = auth.uid());
create policy "cada um desmarca favoritos" on public.favoritos
  for delete to authenticated using (perfil_id = auth.uid());
