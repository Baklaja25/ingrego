# Lokalna Postavka Baze Podataka

Pošto baza radi na Vercelu, ali ne radi lokalno, trebate kopirati **točne** environment varijable iz Vercela u vaš lokalni `.env` fajl.

## Korak 1: Kopiraj Environment Varijable iz Vercela

1. **Idite na Vercel Dashboard**: https://vercel.com/dashboard
2. **Odaberite vaš projekt** (IngreGo)
3. **Idite na Settings** → **Environment Variables**
4. **Pronađite i kopirajte** sljedeće varijable:
   - `DATABASE_URL`
   - `DIRECT_URL`
   - `NEXTAUTH_SECRET`
   - `NEXTAUTH_URL`
   - `OPENAI_API_KEY` (ako postoji)
   - `GOOGLE_CLIENT_ID` (ako postoji)
   - `GOOGLE_CLIENT_SECRET` (ako postoji)

## Korak 2: Ažuriraj Lokalni `.env` Fajl

Otvori `.env` fajl u root direktoriju projekta i **zamijeni** vrijednosti sa onima iz Vercela.

**Format za Supabase (vaš projekt: `bmhyvwbjljfpuqhggbsy`):**

```env
# Database Configuration
# Kopiraj točne vrijednosti iz Vercela!

# Connection Pooler (port 6543) - za regularne upite
DATABASE_URL="postgresql://postgres.bmhyvwbjljfpuqhggbsy:[PASSWORD]@aws-1-eu-west-1.pooler.supabase.com:6543/postgres?pgbouncer=true"

# Direct Connection (port 5432) - za migracije
DIRECT_URL="postgresql://postgres.bmhyvwbjljfpuqhggbsy:[PASSWORD]@aws-1-eu-west-1.pooler.supabase.com:5432/postgres"

# NextAuth
NEXTAUTH_SECRET="[kopiraj iz Vercela]"
NEXTAUTH_URL="http://localhost:3000"

# Optional
OPENAI_API_KEY="[kopiraj iz Vercela ako postoji]"
GOOGLE_CLIENT_ID="[kopiraj iz Vercela ako postoji]"
GOOGLE_CLIENT_SECRET="[kopiraj iz Vercela ako postoji]"
```

## Korak 3: Provjeri Format Connection Stringa

**Važno:** Provjerite da connection string ima točan format:

✅ **Ispravno:**
```
postgresql://postgres.bmhyvwbjljfpuqhggbsy:PASSWORD@aws-1-eu-west-1.pooler.supabase.com:6543/postgres?pgbouncer=true
```

❌ **Pogrešno:**
- Nedostaje `?pgbouncer=true` na kraju DATABASE_URL
- Pogrešan port (mora biti 6543 za DATABASE_URL, 5432 za DIRECT_URL)
- Pogrešan password
- Dodatni razmaci ili znakovi

## Korak 4: Testiraj Konekciju

Nakon što ažurirate `.env` fajl:

1. **Restartujte dev server** (zaustavite i pokrenite ponovo):
   ```bash
   npm run dev
   ```

2. **Ili testirajte Prisma konekciju:**
   ```bash
   npm run db:generate
   npx prisma db pull
   ```

## Česti Problemi

### Problem: "Invalid credentials"
- **Rješenje:** Provjerite da je password u connection stringu točan. Password može sadržavati posebne znakove koji trebaju biti URL-encoded.

### Problem: "Connection timeout"
- **Rješenje:** Provjerite da li vaša mreža blokira konekcije na Supabase. Pokušajte koristiti VPN ili drugačiju mrežu.

### Problem: "DIRECT_URL is required"
- **Rješenje:** Provjerite da imate i `DATABASE_URL` i `DIRECT_URL` u `.env` fajlu.

## Alternativa: Koristi Vercel CLI

Ako imate Vercel CLI instaliran, možete direktno povući environment varijable:

```bash
# Instaliraj Vercel CLI (ako nije instaliran)
npm i -g vercel

# Login
vercel login

# Link projekta
vercel link

# Povuci environment varijable
vercel env pull .env.local
```

Ovo će automatski kreirati `.env.local` fajl sa svim environment varijablama iz Vercela.

## Provjera

Nakon postavke, provjerite da li radi:

```bash
# Generiraj Prisma Client
npm run db:generate

# Testiraj konekciju
npx prisma studio
```

Ako se Prisma Studio otvori bez grešaka, konekcija radi ispravno! 🎉





