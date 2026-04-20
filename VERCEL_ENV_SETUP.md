# Vercel Environment Variables Setup

## Required Environment Variables

Add these environment variables in your Vercel project settings:

1. **DATABASE_URL** - Your Neon PostgreSQL connection string
   - Format: `postgresql://user:password@host:port/database?sslmode=require`

2. **JWT_SECRET** - Secret key for JWT token signing
   - Generate a strong random string (e.g., using `openssl rand -base64 32`)

3. **ADMIN_EMAIL** - Admin login email
   - Example: `team@elvionsolutions.com`

4. **ADMIN_PASSWORD** - Admin login password
   - Use a strong password (will be hashed and stored in database)

## How to Add Environment Variables in Vercel

1. Go to your Vercel project dashboard
2. Navigate to Settings → Environment Variables
3. Add each variable:
   - **Key**: Variable name (e.g., `ADMIN_EMAIL`)
   - **Value**: Variable value (e.g., `team@elvionsolutions.com`)
   - **Environment**: Select all (Production, Preview, Development)
4. Click "Save"
5. Redeploy your application for changes to take effect

## Database Migration

### Step 1: Create Migration Locally (One-time)

First, run the migration locally to create the migration files:

```bash
npx prisma migrate dev --name add_internship_application
```

This will:
- Create migration files in `prisma/migrations/`
- Apply the migration to your local database
- Generate Prisma Client

### Step 2: Update Vercel Build Command

Since your database already has tables, use `prisma db push` instead:

**Option 1: Use `prisma db push` (Recommended for existing databases)**

In your Vercel project settings, update the **Build Command** to:

```
npx prisma db push && npx prisma generate && next build
```

**Why `db push` instead of `migrate deploy`?**
- Your database already has tables (from previous setup)
- `db push` syncs schema without requiring migration files
- Works perfectly with existing databases
- Non-interactive and safe for CI/CD

**Option 2: If you want to use migrations (for new projects)**

1. First, create a baseline migration locally:
```bash
npx prisma migrate dev --name init --create-only
npx prisma migrate resolve --applied init
```

2. Then use in Vercel:
```
npx prisma migrate deploy && npx prisma generate && next build
```

**For your current situation, use Option 1 (`db push`)**

## Features Implemented

✅ User profile picture in navbar (shows email initial)
✅ Admin login via environment variables
✅ Appointment page shows only admin-created slots
✅ Admin dashboard shows:
   - Contact form messages
   - Home page comments
   - All registered users
   - Internship applications
   - Appointment slots management

## Admin Dashboard Access

1. Login with credentials set in `ADMIN_EMAIL` and `ADMIN_PASSWORD`
2. Admin user will be automatically created/updated in database
3. Access admin dashboard at `/admin/dashboard`

