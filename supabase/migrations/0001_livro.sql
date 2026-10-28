-- Livro de Receitas da Família: fase 1 (o livro)
-- Rode este arquivo inteiro no SQL Editor do Supabase.

create extension if not exists unaccent with schema extensions;

-- Quem pode entrar: só e-mails convidados viram membros da família.
create table public.convites (
  email text primary key check (email = lower(email))
);

create table public.perfis (
  id uuid primary key references auth.users (id) on delete cascade,
  nome text not null,
  avatar_url text,
  criado_em timestamptz not null default now()
);

create table public.receitas (
  id uuid primary key default gen_random_uuid(),
  titulo text not null check (length(trim(titulo)) > 0),
  secao text not null check (secao in ('salgado', 'doce', 'bebidas')),
  pais text not null default 'Brasil',
  categoria text,
  descricao text,
  tempo_minutos integer check (tempo_minutos > 0),
  porcoes integer check (porcoes > 0),
  dificuldade text check (dificuldade in ('facil', 'media', 'dificil')),
  -- Uma linha por ingrediente. Uma linha terminada em ":" é um subtítulo ("Para o molho:").
  ingredientes text[] not null default '{}',
  passos text[] not null default '{}',
  dicas text,
  foto_capa text,
  fonte_url text,
  origem text not null default 'familia' check (origem in ('familia', 'importada', 'sugerida')),
  autor_id uuid not null default auth.uid() references public.perfis (id),
  texto_busca text not null default '',
  criado_em timestamptz not null default now(),
  atualizado_em timestamptz not null default now()
);

create index receitas_secao_pais on public.receitas (secao, pais);
create index receitas_criado_em on public.receitas (criado_em desc);

-- Busca sem acento e sem maiúsculas: "acucar" encontra "Açúcar".
create function public.receitas_antes_de_salvar() returns trigger
language plpgsql set search_path = public, extensions as $$
begin
  new.texto_busca := lower(unaccent(concat_ws(' ',
    new.titulo, new.pais, new.categoria, new.descricao,
    array_to_string(new.ingredientes, ' '))));
  new.atualizado_em := now();
  return new;
end;
$$;

create trigger receitas_antes_de_salvar
  before insert or update on public.receitas
  for each row execute function public.receitas_antes_de_salvar();

-- Acesso ------------------------------------------------------------------

create function public.e_da_familia() returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.perfis where id = auth.uid());
$$;

-- Chamada logo após o login: cria o perfil se o e-mail foi convidado.
create function public.entrar_na_familia() returns boolean
language plpgsql security definer set search_path = public as $$
declare
  usuario auth.users;
begin
  select * into usuario from auth.users where id = auth.uid();
  if usuario is null
     or not exists (select 1 from public.convites where email = lower(usuario.email)) then
    return false;
  end if;

  insert into public.perfis (id, nome, avatar_url)
  values (
    usuario.id,
    coalesce(usuario.raw_user_meta_data ->> 'full_name',
             usuario.raw_user_meta_data ->> 'name',
             split_part(usuario.email, '@', 1)),
    usuario.raw_user_meta_data ->> 'avatar_url'
  )
  on conflict (id) do nothing;
  return true;
end;
$$;

revoke execute on function public.e_da_familia() from anon;
revoke execute on function public.entrar_na_familia() from anon;

alter table public.convites enable row level security;
alter table public.perfis enable row level security;
alter table public.receitas enable row level security;

create policy "família vê perfis" on public.perfis
  for select to authenticated using (public.e_da_familia());
create policy "cada um edita o seu perfil" on public.perfis
  for update to authenticated using (id = auth.uid()) with check (id = auth.uid());

create policy "família vê receitas" on public.receitas
  for select to authenticated using (public.e_da_familia());
create policy "família adiciona receitas" on public.receitas
  for insert to authenticated with check (public.e_da_familia() and autor_id = auth.uid());
create policy "autor edita a sua receita" on public.receitas
  for update to authenticated using (autor_id = auth.uid()) with check (autor_id = auth.uid());
create policy "autor apaga a sua receita" on public.receitas
  for delete to authenticated using (autor_id = auth.uid());

-- Fotos --------------------------------------------------------------------
-- Bucket público para leitura (os links são impossíveis de adivinhar);
-- só a família envia, cada pessoa na sua própria pasta.

insert into storage.buckets (id, name, public)
values ('fotos', 'fotos', true)
on conflict (id) do nothing;

create policy "família envia fotos" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'fotos' and public.e_da_familia()
              and (storage.foldername(name))[1] = auth.uid()::text);
create policy "dono apaga as suas fotos" on storage.objects
  for delete to authenticated
  using (bucket_id = 'fotos' and (storage.foldername(name))[1] = auth.uid()::text);
