# Welcome to your Lovable project

## Project info

**URL**: https://lovable.dev/projects/740c90ea-d4a1-4367-bc3b-a5db11041371

# FitMate

A Vite + React + Supabase starter for gym management and occupancy tracking.

Quick start

1. Install dependencies:

```bash
npm install
```

2. Add your Supabase keys to `.env` (Vite requires `VITE_` prefix):

```env
VITE_SUPABASE_URL="https://<project>.supabase.co"
VITE_SUPABASE_PUBLISHABLE_KEY="<anon-key>"
```

3. Run dev server:

```bash
npm run dev
```

Supabase function: `supabase/functions/gym-occupancy/index.ts`
- Edge function that returns `status`, `percent`, `color`, and `activeCount`.
- Configure `CAPACITY` and `WINDOW_MINUTES` via environment variables in Supabase.

Notes

- Do not commit service_role keys. Use them server-side only.
- To more accurately track occupancy, add a `last_active` column to `profiles` and update it on login.
