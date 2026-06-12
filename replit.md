# Orbit Future — Starlink HQ

A full-stack SpaceX Starlink subscription and hardware platform. Users can browse plans, subscribe, purchase hardware, and manage their account. Admins can manage plans, subscriptions, orders, and support tickets.

## Architecture

- **Frontend**: React 19 + Vite + Tailwind CSS v4, served via Vercel
- **Backend**: Express 5 + TypeScript, runs on Replit (port 3001 in dev, 5000 Vite dev server)
- **Database**: PostgreSQL via Replit's built-in Helium DB + Drizzle ORM
- **Monorepo**: pnpm workspaces under `artifacts/`

Vercel rewrites `/api/*` → `https://orbitfuture--Orbitfuture.replit.app/api/*`

## Running locally on Replit

`bash start.sh` (managed by the "Start application" workflow)

- Dev: API on port 3001, Vite dev server on port 5000
- Production: API on port 3001 serves both API + built frontend

## Key packages

| Package | Location | Purpose |
|---|---|---|
| `@workspace/api-server` | `artifacts/api-server` | Express REST API |
| `@workspace/spacex-starlink` | `artifacts/spacex-starlink` | React frontend |
| `@workspace/db` | `artifacts/lib/db` | Drizzle schema + DB client |
| `@workspace/api-zod` | `artifacts/lib/api-zod` | Shared Zod validation |

## Database schema

Tables: `plans`, `subscriptions`, `users`, `wallets`, `wallet_transactions`, `flutterwave_transactions`, `whatsapp_orders`, `site_settings`, `support_tickets`

Push schema changes: `cd artifacts/lib/db && pnpm run db:push`

## Environment variables

| Key | Required | Description |
|---|---|---|
| `DATABASE_URL` | Yes | PostgreSQL connection string (auto-set by Replit) |
| `SESSION_SECRET` | Yes | JWT signing secret |
| `PAYSTACK_SECRET_KEY` | For payments | Paystack secret key (sk_live_... or sk_test_...) |
| `FLW_SECRET_KEY` | For wallet | Flutterwave secret key |
| `RESEND_API_KEY` | For emails | Resend transactional email key |
| `ADMIN_PASSWORD` | For admin | Admin dashboard password |
| `PAYSTACK_CURRENCY` | Optional | Currency for Paystack (default: USD) |
| `APP_URL` | Optional | Public app URL for redirect links |
| `EMAIL_FROM` | Optional | From address for emails |

## Payment flow

- **Plan purchase**: Paystack checkout → redirect back to `/plans?paystack_success=1&reference=xxx` → POST `/api/paystack-plan-verify`
- **Token top-up (wallet)**: Paystack checkout → redirect back to `/wallet?paystack_token_success=1&reference=xxx` → POST `/api/paystack-token-verify`
- **Wallet pay**: Direct token deduction via POST `/api/checkout/wallet-pay`
- **Flutterwave**: Used for wallet top-ups in local currencies (NGN, GHS, KES, etc.)

## Deployment

- Frontend → Vercel (auto-deploys from GitHub on push)
- Backend → Replit (always-on via "Start application" workflow)
- Vercel config: `vercel.json` at repo root

## User preferences

- Uses Paystack (not Stripe) for card payments
