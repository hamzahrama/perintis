# PERINTIS Production Deployment

Status: checklist only. No deployment or production DB mutation performed.

## Required Vercel environment variables

Set for Production, Preview, and Development as needed:

- `NEXT_PUBLIC_SUPABASE_URL` — Supabase project URL.
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` — Supabase publishable/anon key.

Do not set `SUPABASE_SERVICE_ROLE_KEY` in this app. App uses Supabase SSR with user session and RLS.

`DATABASE_URL` and `DIRECT_URL` are only needed for Prisma CLI tooling. Current app does not use Prisma at runtime. Keep them out of Vercel unless a reviewed Prisma operation requires them.

## Supabase production setup

1. Create or select production Supabase project.
2. Confirm project region and database version compatibility.
3. Configure Auth Site URL to production URL.
4. Add exact redirect URLs required by enabled auth flows.
5. Configure production email provider before enabling email confirmations.
6. Review Auth rate limits and password policy.
7. Apply `supabase/migrations/20261113000000_initial_schema.sql` using approved Supabase migration workflow.
8. Verify RLS is enabled and policies exist for every public user table.
9. Never run local seed or demo fixture against production.

## Vercel deployment

1. Import repository into Vercel.
2. Select framework preset `Next.js`.
3. Add required environment variables.
4. Run `npm run lint`, `npm run typecheck`, and `npm run build` before deploy.
5. Deploy Preview first.
6. Test register/login, onboarding, dashboard, Daily, Calendar, Review, reminders, and logout.
7. Promote to Production only after smoke test passes.

## Auth redirect

Email/password flow currently redirects server-side to `/onboarding` or `/dashboard`; no OAuth callback route exists. If OAuth is added later, add an explicit `/auth/callback` route and register its exact HTTPS URL in Supabase Auth and Vercel.

## Rollback

- Revert Vercel deployment to previous known-good build.
- Do not delete or rewrite production data.
- Apply database changes only through reviewed, forward migrations.
