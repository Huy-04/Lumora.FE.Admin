# Design

## Test Surface

The test uses browser automation against local FE preview and deployed BE
`https://api.hlbeer.me`. It observes network responses emitted by the UI, page
state, and visible failure messages.

## Safety

The test does not use sendmail-dependent flows or PayOS/provider payment flows.
Data mutation is allowed, but generated data is named with `Codex Smoke` when
the UI allows it.

## Non-Goals

- Full backend API-only testing.
- Email delivery verification.
- PayOS checkout, provider webhook, or provider settlement verification.
