# Rotate secrets

- Strava client secret, Resend API key, and Supabase PAT were pasted in chat — treat as leaked.
- Update envs in Vercel, Dokploy, and local `.env.local`; Resend key also in the `send-auth-email` edge-function secrets.
- [x] Resend API key — rotated 2026-11-14
- [x] Supabase PAT — revoked 2026-11-14
- [ ] Strava client secret — SKIPPED for now (user has no Strava dashboard access currently); still leaked, must be rotated later + envs updated + redeploy
