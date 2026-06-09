# Exec Plan

## Goal

Make a source-backed determination of whether FE.Admin is clean against the
completed Lumora.BE admin contracts, then fix confirmed FE drift.

## Scope

In scope:

- Auth, profile, users, roles, permissions, sessions.
- Categories, products, inventory, warehouses.
- Orders, payments, shipments, coupons, reviews.
- Dashboard, operations, settings, shared shell, shared API/error helpers.
- Route, query, body, response, enum/status, permission, lifecycle action, and
  problem-details handling.

Out of scope:

- Backend behavior changes.
- StoreFront or Mobile.
- Cosmetic redesign not tied to contract clarity.
- Ownership cleanup for pre-existing dirty files unless needed for a confirmed
  drift fix.

## Risk Classification

Risk flags:

- Authorization.
- Public contracts.
- Existing behavior.
- Weak proof.
- Multi-domain.

Hard gates:

- Authorization.
- Public API/client-visible behavior.

## Work Phases

1. Discovery: inventory FE admin API/page surfaces and BE controller/handler
   surfaces.
2. Audit: compare route, permission, payload, status, lifecycle, and error
   semantics module by module.
3. Fix: only patch confirmed FE drift after GitNexus impact checks.
4. Verification: run Nuxt prepare, production build, diff checks, and any
   available runtime smoke.
5. Harness update: update story evidence and record detailed trace.

## Stop Conditions

Pause for human confirmation if:

- A backend behavior change appears necessary.
- A fix would weaken authorization or hide a backend validation rule.
- A dirty worktree change outside this story must be reverted or overwritten.
- Runtime proof requires credentials or environment not available locally.
