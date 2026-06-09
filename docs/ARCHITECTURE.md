# Architecture

Lumora.FE.Admin is a Nuxt 3 admin application for the Lumora ecommerce
system. This repo is a backend-coupled frontend: business truth lives in
`Lumora.BE`, while this frontend owns route composition, permission-gated UI,
same-origin proxying, and admin workflow presentation.

This document is a frontend pattern contract. Its job is to keep the codebase
coherent, not to mirror backend architecture detail.

## Runtime Shape

```text
pages/                  Route shells
features/               Feature-local composables, components, and types
Shared/                 Cross-feature components, composables, and helpers
middleware/             Global route/session gating
plugins/                Client runtime hooks
server/api/[...path].ts Nuxt proxy boundary to Lumora.BE
docs/                   Repo contracts and Harness artifacts
scripts/                Repo-local utilities and Harness entrypoints
```

## Source Of Truth

```text
Lumora.BE
  -> route behavior, permission rules, business transitions

server/api/[...path].ts and nuxt config
  -> frontend transport and same-origin runtime boundary

pages/* + features/*
  -> approved UI composition and user interaction flow
```

If frontend assumptions and backend behavior disagree, verify `Lumora.BE`
before changing UI behavior.

## Ownership Rules

### `pages/`

- `pages/` files are route shells.
- A page should usually create `const page = await use...Page()` and pass that
  state into a feature view.
- Route params and query parsing should stop at the page or page composable
  boundary.

### `features/{module}/composables`

- Own page orchestration, feature state, filter state, permission flags, and
  backend interaction for that feature.
- `use*Page.ts` is the default place for page-level coordination.
- `use*AdminApi.ts` is the default place for HTTP calls to the backend-facing
  admin surface.

### `features/{module}/components`

- Own rendering, local interaction, and small UI-only state.
- Prefer receiving typed state and action callbacks from feature composables.
- A view component should not invent backend payload shapes or build API URLs
  ad hoc.

### `Shared/`

- Holds cross-feature primitives only.
- Do not move module-specific behavior into `Shared/` just to reduce file size.
- Auth/session helpers that are reused across modules belong here or in the
  auth feature, not duplicated per module.

### `server/api/[...path].ts`

- This is the Nuxt proxy boundary.
- Browser code should call the local `/api/...` surface.
- Cookie-authenticated backend traffic and hub traffic stay same-origin through
  this boundary.

## Pattern Contract

The default runtime path is:

```text
page route
  -> use*Page composable
  -> feature view / tabs / panels
  -> use*AdminApi composable
  -> /api/... proxy
  -> Lumora.BE
```

This repo is healthy when that path stays predictable and module-local.

## Allowed And Discouraged Patterns

### Allowed

- Thin route pages.
- Feature-first modules under `features/{module}`.
- Page composables that coordinate loading, permissions, and view actions.
- Feature components that emit actions upward or consume passed-in handlers.
- Shared helpers that stay generic across modules.

### Discouraged

- Large page composables becoming catch-all controllers for unrelated concerns.
- View components that both render a large surface and directly own multiple
  backend mutations.
- Duplicating auth, session, or error-handling behavior across features when a
  shared helper already exists.
- Moving behavior into `Shared/` before it is proven to be cross-feature.

## API Call Placement

The default rule is: backend calls belong in feature composables, not in view
components.

A component may call `use*Api()` directly only when all of the following are
true:

- the behavior is tightly local to that component,
- the async flow does not spread across the page,
- the component is still understandable without hidden orchestration, and
- extracting the flow upward would add more indirection than clarity.

If a component starts owning multiple mutations, confirm dialogs, pending
states, cooldowns, pagination, selection state, or error branches, treat that
as a refactor trigger rather than the default pattern.

## Refactor Triggers

Refactor before a file becomes the next hotspot when any of these appear:

- a page composable starts mixing filters, permissions, modal state, realtime
  refresh, reorder flow, and mutation orchestration in one file,
- a tab or panel both renders a large surface and calls `use*Api()` directly,
- a component owns more than one async workflow plus its own confirm and error
  state,
- the same backend or auth flow is reimplemented in multiple feature modules,
- a file is still growing because responsibility is unclear, not because the UI
  is genuinely large.

## Known Tolerated Debt

The current codebase is clean overall, but a few files already sit near or
beyond those triggers. They should be treated as exceptions, not as examples to
copy:

- `features/products/components/ProductAssetsTab.vue`
- `features/products/components/ProductVariantsTab.vue`
- `features/profile/components/ProfilePhoneChangePanel.vue`
- `features/categories/components/CategoryEditTab.vue`
- `features/products/composables/useProductIndexPage.ts`

## Auth And Permission Contract

- The global auth gate lives in `middleware/auth.global.ts`.
- HttpOnly auth cookies are backend-owned. Frontend code does not read raw
  access or refresh tokens.
- Page and action availability must follow backend-issued permission state.
- Detailed auth flow rules live with the auth feature and the paired backend
  contract.

## Validation Expectations

- Compile readiness: `npm run build`
- Nuxt preparation/type surface: `npx nuxt prepare`
- Harness workflow surface: `.\scripts\harness.cmd query matrix`
- Architecture reviews should cite the exact source files that justify any
  hotspot or exception claim.
