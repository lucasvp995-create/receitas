# Receitas da Família

O livro de receitas da família: Salgado, Doce e Bebidas, organizado por país, com login pelo Google só para quem foi convidado.

Built with Next.js 16 (installable as a PWA), Supabase (Google login, Postgres, photo storage) and hosted on Vercel. All three have free tiers that cover a family. Recipe import uses the Claude API, which is pay-as-you-go (a few cents per imported recipe).

## What's in phase 1

- Book cover and index with the three chapters: Salgado, Doce, Bebidas
- Each chapter filtered by country (flags), recipe cards with photo
- Recipe page: ingredients you can tick off while cooking, numbered steps, tips, source link
- Add and edit recipes by hand, with a cover photo (resized on the phone before upload)
- Search by name, ingredient or country, ignoring accents ("acucar" finds "açúcar")
- Google login; only invited e-mails get in, and only the author can edit or delete a recipe

## What's in phase 2

- **Import with AI** (`/importar`): paste a recipe link (any blog, any language), a YouTube video, up to 4 photos of a cookbook or handwritten page, or pasted text such as an Instagram caption. Claude rewrites it in Brazilian Portuguese with metric units, picks the chapter and country, and you review everything in the normal form before saving. Imported recipes are marked "Importada" and keep the source link.
- **Adjust servings** on every recipe page: − / + recalculates the ingredient quantities (fractions like ½ included). Recipes without a serving count scale by half, double, triple…

## What's in phase 3

- **Fiz essa receita!**: anyone can post a photo of how the dish turned out, with a note. These show under each recipe in "Na cozinha da família" and on the home page.
- **Amassava!** instead of a like button, on recipes and on each family photo, showing who amassou ("Você, Ana e mais 1 amassavam").
- **Conversa**: comments at the bottom of each recipe.
- **Quero fazer**: a personal bookmark list (only you see yours), in the avatar menu.
- **Meu perfil**: change your name and avatar (Google photo, your own photo, or one of 8 food drawings).

Run `supabase/migrations/0002_familia.sql` in the Supabase SQL Editor after `0001` (once).

## What's in phase 4

- **Sugestões da IA** (`/sugestoes`): tell it what you feel like (or nothing) and Claude suggests 3 new, complete recipes, avoiding what's already in the book and leaning on what the family amassou most. Pick one, review it, and save it ("Sugerida pelo livro").
- **Lista de compras** (`/compras`): on any recipe, "Pôr na lista de compras" adds the ingredients in the portions you chose. Tick items off, add your own, and copy the list for WhatsApp. Each person has their own list.
- **Imprimir**: a print button on every recipe, and `/imprimir` for the whole book (or one chapter) with cover, contents and one recipe per page. Choose "Save as PDF" to keep or share it.
- **Instagram and TikTok links** in Importar: the AI reads the post caption and cover image. Recipes that are only spoken in the video can't be read yet; paste the text or send a screenshot instead.

Run `supabase/migrations/0003_compras.sql` in the Supabase SQL Editor (once).

## Setup (one time, about 20 minutes)

### 1. Supabase

1. Create a free project at [supabase.com](https://supabase.com).
2. Open **SQL Editor**, paste the whole of [`supabase/migrations/0001_livro.sql`](supabase/migrations/0001_livro.sql) and run it, then do the same with [`0002_familia.sql`](supabase/migrations/0002_familia.sql) and [`0003_compras.sql`](supabase/migrations/0003_compras.sql).
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
2. Add the environment variables `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` with the values from step 1.4, plus `ANTHROPIC_API_KEY` for the AI import (create one at [platform.claude.com](https://platform.claude.com) → API Keys and add a little credit; setting a monthly spend limit there is a good idea). Then deploy.
   - Optional: `YOUTUBE_API_KEY` (Google Cloud → enable **YouTube Data API v3** → Credentials → API key, free). YouTube sometimes refuses to show video pages to servers; with this key the import can still read the video description, which is where most cooks write the recipe.
3. Back in Supabase, **Authentication → URL Configuration**: set **Site URL** to your Vercel address (for example `https://receitas-vidal.vercel.app`) and add `https://receitas-vidal.vercel.app/auth/callback` to **Redirect URLs**.

### 4. On the phones

- **iPhone:** open the site in Safari → Share → **Add to Home Screen**.
- **Android:** open it in Chrome → menu → **Install app**.

## Running locally

```bash
cp .env.example .env.local   # fill in the Supabase values and the Anthropic key
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
| `src/lib/acoes.ts` | Saving, editing, deleting, importing, signing out |
| `src/lib/importar.ts` | Reads a site, YouTube video, photos or text and asks Claude for the recipe in the book's format |
| `src/components/Familia.tsx` | Family photos and comments on the recipe page |
| `src/components/Ilustracoes.tsx` | The illustrated food avatars |
| `src/lib/sugerir.ts` | Asks Claude for new recipe suggestions |
| `src/components/ReceitaImpressa.tsx` | A recipe laid out as a printed book page |
| `src/lib/porcoes.ts` | Scales ingredient quantities for the servings adjuster |
| `src/app/(livro)/` | The book's pages: index, chapter, recipe, new, edit, search |
| `src/app/login`, `src/app/auth/callback` | Google login and the invite check |
| `src/proxy.ts` | Keeps the session fresh and sends logged-out visitors to `/login` |

## Ideas for later

Weekly menu planner, reading recipes that are only spoken in videos, an own domain.
