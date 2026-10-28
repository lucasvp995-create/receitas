# Receitas da Família

O livro de receitas da família: Salgado, Doce e Bebidas, organizado por país, com login pelo Google só para quem foi convidado.

Built with Next.js 16 (installable as a PWA), Supabase (Google login, Postgres, photo storage) and hosted on Vercel. All three have free tiers that cover a family.

## What's in phase 1

- Book cover and index with the three chapters: Salgado, Doce, Bebidas
- Each chapter filtered by country (flags), recipe cards with photo
- Recipe page: ingredients you can tick off while cooking, numbered steps, tips, source link
- Add and edit recipes by hand, with a cover photo (resized on the phone before upload)
- Search by name, ingredient or country, ignoring accents ("acucar" finds "açúcar")
- Google login; only invited e-mails get in, and only the author can edit or delete a recipe

## Setup (one time, about 20 minutes)

### 1. Supabase

1. Create a free project at [supabase.com](https://supabase.com).
2. Open **SQL Editor**, paste the whole of [`supabase/migrations/0001_livro.sql`](supabase/migrations/0001_livro.sql) and run it.
3. Still in the SQL Editor, invite the family (use the Google e-mails, in lowercase):

   ```sql
   insert into convites (email) values
     ('pessoa1@gmail.com'),
     ('pessoa2@gmail.com'),
     ('pessoa3@gmail.com'),
     ('pessoa4@gmail.com');
   ```

4. In **Project Settings → API** (or the **Connect** button) copy the **Project URL** and the **Publishable key**.

### 2. Google login

1. In [Google Cloud Console](https://console.cloud.google.com/apis/credentials) create a project, then **Create credentials → OAuth client ID → Web application**.
2. Under **Authorized redirect URIs** add `https://<your-project>.supabase.co/auth/v1/callback`.
3. On the **OAuth consent screen** choose **External** and either add the 4 e-mails as test users or click **Publish app** (the app only asks for name, e-mail and photo, so Google does not require a review).
4. In Supabase, **Authentication → Sign In / Providers → Google**: turn it on and paste the Client ID and Client secret.

### 3. Vercel

1. At [vercel.com](https://vercel.com) choose **Add New → Project** and import this GitHub repository.
2. Add the environment variables `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` with the values from step 1.4, then deploy.
3. Back in Supabase, **Authentication → URL Configuration**: set **Site URL** to your Vercel address (for example `https://receitas-vidal.vercel.app`) and add `https://receitas-vidal.vercel.app/auth/callback` to **Redirect URLs**.

### 4. On the phones

- **iPhone:** open the site in Safari → Share → **Add to Home Screen**.
- **Android:** open it in Chrome → menu → **Install app**.

## Running locally

```bash
cp .env.example .env.local   # fill in the two Supabase values
npm install
npm run dev
```

Add `http://localhost:3000/auth/callback` to Supabase's Redirect URLs to log in locally.

## Code map

| Path | What it is |
| --- | --- |
| `supabase/migrations/` | Tables, search trigger, invite check and access rules |
| `src/lib/livro.ts` | Sections, countries and flags, recipe types |
| `src/lib/dados.ts` | Reading from the database (server only) |
| `src/lib/acoes.ts` | Saving, editing, deleting, signing out |
| `src/app/(livro)/` | The book's pages: index, chapter, recipe, new, edit, search |
| `src/app/login`, `src/app/auth/callback` | Google login and the invite check |
| `src/proxy.ts` | Keeps the session fresh and sends logged-out visitors to `/login` |

## Next phases

2. AI import from a link, a YouTube video or a photo of a cookbook, saved in Portuguese
3. Family: "minha versão" photos, likes, comments, favorites
4. Recipe suggestions, Instagram/TikTok import, shopping list, print the book
