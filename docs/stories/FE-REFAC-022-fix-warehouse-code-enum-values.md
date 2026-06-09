# FE-REFAC-022 - Fix warehouse code enum values

## Summary

Browser mutation testing against deployed BE found that warehouse create sent
`Code=3` for `DN`, and BE returned `400 InvalidStatus`.

## Contract

FE warehouse code options must match `Lumora.BE`:

- `HN = 0`
- `HCM = 1`
- `DN = 2`

## Validation

- GitNexus impact for `useInventoryOptions`: LOW risk.
- `npm.cmd run prepare`: passed.
- `npm.cmd run build`: passed after stopping the existing preview process that
  was locking `.output`.
- Browser warehouse create retest against `https://api.hlbeer.me`: passed with
  final URL `/warehouses/019ea7e3-4931-702e-afff-60f21e6e6281` and no API
  failures.
