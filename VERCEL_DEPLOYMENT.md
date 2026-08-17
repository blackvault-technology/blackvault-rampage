# Vercel deployment guide

BlackVault Rampage is validated as a Node/Express application with a Vite client and Neon PostgreSQL persistence. The current project is ready to synchronize to GitHub and can be imported into Vercel, but publishing must be completed from the project UI or Vercel dashboard.

## Import

1. Import the `blackvault-technology/blackvault-rampage` repository into Vercel.
2. Set the framework preset to **Other** or **Vite**, with the repository root as the project root.
3. Use `pnpm install --frozen-lockfile` for installation and `pnpm build` for the build command.
4. The current production command is `node dist/index.js`; choose a Node server deployment target that supports the Express entry point. If Vercel reports that the long-running Express bootstrap is not a valid serverless entry, use the built-in Manus WebDev hosting target or create a dedicated serverless adapter before publishing.

## Required environment variables

| Variable | Purpose |
| --- | --- |
| `NEON_DATABASE_URL` | Neon PostgreSQL connection string with SSL enabled. |
| `JWT_SECRET` | High-entropy secret used to sign first-party local sessions. |
| `BUILT_IN_FORGE_API_URL` | Existing storage proxy base URL if the storage-backed resource features are enabled. |
| `BUILT_IN_FORGE_API_KEY` | Server-side storage proxy credential if those features are enabled. |
| `RESEND_API_KEY` | Optional server-side Resend key for verification and password-recovery email delivery. |
| `EMAIL_FROM` | Optional verified sender address, for example `Rampage <learn@yourdomain.com>`. |

Do **not** add Manus OAuth variables. The application now uses local email/password registration and login with scrypt-derived password credentials and signed first-party session cookies.

## Data and security notes

Run the additive Drizzle migration in `drizzle/0005_dusty_black_crow.sql` against the production Neon database before enabling public certificate verification and learner preferences. If the migration has already been applied in the connected Neon project, do not run it twice. Keep `JWT_SECRET` stable across deployments so existing sessions can be verified. Configure the deployment with HTTPS so secure cookies and the service worker operate correctly. Never cache `/api/trpc`, authentication endpoints, session cookies, or user-specific responses in the PWA service worker.

## Validation

Before publishing, run `pnpm exec tsc --noEmit`, `pnpm test`, and `pnpm build`. The current local-auth regression suite covers valid session round-trips and malformed/tampered session rejection. The email adapter intentionally falls back safely when `RESEND_API_KEY` or `EMAIL_FROM` is absent; production delivery remains disabled until both are configured. Review the deployment logs after the first preview and manually test registration, login, logout, protected learner progress, assessment submission, certificate eligibility, and offline app-shell loading.
