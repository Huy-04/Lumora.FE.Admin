# Design

## Domain Model

No backend domain model changes are planned. Lumora.BE remains the source of
truth for domain rules, aggregate transitions, enum values, authorization
policies, and problem-details error semantics.

## Application Flow

FE.Admin should keep the established flow:

```text
page route -> use*Page composable -> feature view -> use*AdminApi -> /api proxy -> Lumora.BE
```

Module-specific page composables own filters, permissions, action availability,
and mutation orchestration. Views should render the state and emit the supplied
actions.

## Interface Contract

The audit compares:

- FE admin API wrappers against BE controller routes.
- FE query/body builders against BE request/query DTOs and handler validation.
- FE response types and UI reads against BE response models.
- FE permission gates against BE authorization services and policies.
- FE status/action affordances against BE aggregate guards and handlers.
- FE error display against BE problem-details shape and common error codes.

## Data Model

No data model changes are planned.

## UI / Platform Impact

UI changes are allowed only when they remove confirmed contract or semantic
drift, such as hiding an invalid action, exposing a BE-supported filter, or
clarifying a backend error/permission state.

## Observability

Harness durable records provide the story, proof, and trace. Runtime telemetry
or backend logs are not changed by this story.

## Alternatives Considered

1. Treat `npm run build` as sufficient. Rejected because build readiness does
   not prove BE-to-FE contract cleanliness.
2. Clean the entire dirty worktree first. Rejected because unrelated changes
   may belong to the user or earlier accepted batches.
