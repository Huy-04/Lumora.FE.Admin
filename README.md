# Lumora.FE.Admin

Nuxt 3 admin frontend for the Lumora ecommerce system.

## What This Repo Contains

- Admin auth, session, and permission-gated navigation.
- Operational screens for users, roles, permissions, categories, products,
  inventory, orders, payments, shipments, reviews, and system events.
- A Nuxt server proxy for backend API and SignalR hub traffic.
- Harness docs and CLI state for agent-readable project workflow.

## Stack

- Nuxt 3
- Vue 3
- TypeScript
- Tailwind CSS
- SignalR client

## Important Local Commands

```powershell
npm run dev
npm run build
npx nuxt prepare
.\scripts\harness.cmd query matrix
```

## Important Project Docs

- `docs/AUTH.md`
- `docs/web-admin-flow-contracts.md`
- `docs/HARNESS.md`
- `docs/FEATURE_INTAKE.md`
- `docs/ARCHITECTURE.md`

## Backend Pairing

This app is paired with `C:\Code\Project\Lumora.Ecom\Lumora.BE`.

- FE route and action assumptions should stay aligned with backend controllers
  and policies.
- Flow-contract changes should be reflected in `docs/web-admin-flow-contracts.md`.
- Harness installation in this repo follows the Windows-friendly pattern already
  used in `Lumora.BE`.
