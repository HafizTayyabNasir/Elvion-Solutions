# Fix for Vercel Build Error

## Problem
You're getting error `P3005` because:
- Your database already has tables
- No migration files exist in `prisma/migrations/`
- `prisma migrate deploy` requires migration files

## Solution: Use `prisma db push` Instead

### Update Vercel Build Command

1. Go to your Vercel project dashboard
2. Navigate to **Settings → General → Build & Development Settings**
3. Find **"Build Command"** field
4. Change it from:
   ```
   npx prisma migrate deploy && next build
   ```
   To:
   ```
   npx prisma db push && npx prisma generate && next build
   ```

### Why This Works

- `prisma db push` syncs your schema directly to the database
- Doesn't require migration files
- Works with existing databases
- Non-interactive (perfect for CI/CD)
- `prisma generate` ensures Prisma Client is up to date

### What Each Command Does

1. `npx prisma db push` - Pushes schema changes to database
2. `npx prisma generate` - Generates Prisma Client
3. `next build` - Builds your Next.js application

### Alternative: If You Want to Use Migrations

If you prefer using migrations for version control:

1. **Locally, create a baseline migration:**
   ```bash
   cd elvion-frontend
   npx prisma migrate dev --name baseline --create-only
   npx prisma migrate resolve --applied baseline
   ```

2. **Commit the migration files:**
   ```bash
   git add prisma/migrations/
   git commit -m "Add baseline migration"
   git push
   ```

3. **Then use in Vercel:**
   ```
   npx prisma migrate deploy && npx prisma generate && next build
   ```

**For now, the quickest fix is to use `db push` as shown above.**

