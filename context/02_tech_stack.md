# Tech Stack

## Frontend
- **Vite** — build tool
- **TypeScript** — language
- **Tailwind CSS** — styling
- **@supabase/supabase-js** — Supabase client
- **@dnd-kit/core** or **react-beautiful-dnd** — drag & drop

## Backend / Database
- **Supabase** (cloud, free tier)
  - PostgreSQL — primary database
  - Auto-generated REST API
  - Auth (email/password, JWT)
  - Edge Functions — custom logic if needed
  - Row Level Security (RLS) enabled

## Hosting
- **Vercel** (free tier) — frontend deployment
- Connected to GitHub repo for auto-deploy

## Environment Variables
```
VITE_SUPABASE_URL=<supabase project url>
VITE_SUPABASE_ANON_KEY=<anon/public key>
SUPABASE_SERVICE_ROLE_KEY=<service role key — for Sylvie AI access>
```

## Auth
- Supabase Auth, email/password
- Initial user: admin@test-alpha.batin.ai (or updated email)
- JWT tokens stored in httpOnly cookies
- Simple login page only — no complex auth flows

## Supabase Access Modes
| Mode | Key Used | Who |
|------|----------|-----|
| Frontend (browser) | anon key + RLS | CEO user |
| AI assistant (Sylvie) | service role key | Sylvie, bypasses RLS |
