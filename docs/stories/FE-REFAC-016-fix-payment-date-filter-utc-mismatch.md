# FE-REFAC-016 Fix Payment Date-Filter UTC Mismatch

## Status

planned

## Lane

normal

## Product Contract

Align the FE Admin `Payment` module with current Lumora.BE semantics for UTC
date filters in admin payment search.

Primary scope:

- `features/payments/composables/usePaymentIndexPage.ts`

## Relevant Product Docs

- `docs/ARCHITECTURE.md`

## Acceptance Criteria

- Payment index date filters submit UTC boundary values compatible with the
  live BE `SearchPaymentsQHandler` validation.
- Existing FE view/page contracts remain stable.
- Verification uses local FE compile/build proof after the FE-only change.

## Design Notes

- Commands: Harness CLI for story lifecycle and trace recording.
- Queries: FE source is the primary change target; BE controller/query source
  defines the expected behavior.
- API: no backend contract changes in scope.
- Tables: `intake`, `story`, `story_gate`, and `trace`.
- Fix target: FE Admin Payment module.
- Behavior source: Lumora.BE PaymentsController, SearchPaymentsQHandler, and
  PaymentErrors UTC filter validation.

## Validation

| Layer | Expected proof |
| --- | --- |
| Unit | Not required as a separate artifact in this repo workflow |
| Integration | Payment FE behavior rechecked against live BE semantics |
| E2E | Not required for this FE-only batch |
| Platform | `npx.cmd nuxt prepare` and `npm.cmd run build` |
| Release | Not applicable |

## Harness Delta

- Record closure friction if the story still expects unit proof after human
  acceptance.

## Evidence

- Live FE source changes for payment index date-filter behavior.
- Live BE source alignment for UTC date-filter validation.
- Prepare/build verification after the FE-only fix.
