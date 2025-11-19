# Rješavanje Problema s Lokalnom Bazom

## Problem
Baza radi na Vercelu, ali ne radi lokalno. Test skripta pokazuje da konekcija radi, ali aplikacija ne.

## Rješenje

### Korak 1: Zaustavite Dev Server
Ako je `npm run dev` pokrenut, zaustavite ga sa `Ctrl+C`.

### Korak 2: Regenerirajte Prisma Client
```bash
npm run db:generate
```

### Korak 3: Očistite Next.js Cache
```bash
rm -rf .next
```
Ili na Windows PowerShell:
```powershell
Remove-Item -Recurse -Force .next
```

### Korak 4: Restartajte Dev Server
```bash
npm run dev
```

## Alternativno: Kompletan Reset

Ako i dalje ne radi, pokušajte kompletan reset:

```bash
# 1. Zaustavite dev server

# 2. Obrišite cache
Remove-Item -Recurse -Force .next
Remove-Item -Recurse -Force node_modules\.prisma

# 3. Regenerirajte Prisma Client
npm run db:generate

# 4. Restartajte dev server
npm run dev
```

## Provjera

Nakon restartanja, testirajte registraciju. Ako i dalje ne radi:

1. **Provjerite da su environment varijable točne:**
   - Otvorite `.env` fajl
   - Provjerite da `DATABASE_URL` i `DIRECT_URL` imaju točne vrijednosti iz Vercela
   - Provjerite da nema dodatnih razmaka ili znakova

2. **Provjerite format connection stringa:**
   ```env
   DATABASE_URL="postgresql://postgres.bmhyvwbjljfpuqhggbsy:[PASSWORD]@aws-1-eu-west-1.pooler.supabase.com:6543/postgres?pgbouncer=true"
   DIRECT_URL="postgresql://postgres.bmhyvwbjljfpuqhggbsy:[PASSWORD]@aws-1-eu-west-1.pooler.supabase.com:5432/postgres"
   ```

3. **Testirajte konekciju:**
   ```bash
   node test-db-connection.js
   ```

## Česti Problemi

### "EPERM: operation not permitted"
- **Uzrok:** Dev server ili neki drugi proces koristi Prisma Client
- **Rješenje:** Zaustavite sve Node.js procese i pokušajte ponovo

### "PrismaClientInitializationError"
- **Uzrok:** Prisma Client nije regeneriran nakon promjene `.env`
- **Rješenje:** Regenerirajte Prisma Client (`npm run db:generate`)

### "Invalid credentials"
- **Uzrok:** Pogrešan password u connection stringu
- **Rješenje:** Kopirajte točne vrijednosti iz Vercela Dashboard

## Test Skripta

Koristite `test-db-connection.js` za brzu provjeru:

```bash
node test-db-connection.js
```

Ako ova skripta radi, problem je u Next.js cache-u ili Prisma Client-u koji treba regenerirati.





