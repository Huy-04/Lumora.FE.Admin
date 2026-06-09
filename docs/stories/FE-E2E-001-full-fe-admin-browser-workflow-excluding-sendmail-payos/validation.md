# Validation

## Test Plan

| Layer | Proof |
| --- | --- |
| Unit | Not applicable for browser workflow test. |
| Integration | FE browser requests are checked against deployed BE responses. |
| E2E | Authenticated browser workflow coverage excluding sendmail and PayOS. |
| Platform | Existing build/preview and any rerun `npm.cmd run build` after fixes. |

## Evidence

Completed against FE preview `http://127.0.0.1:3000` configured with
`NUXT_API_PROXY_TARGET=https://api.hlbeer.me`.

- Authenticated as `admin@lumora.local`.
- Navigation/read smoke: 41/41 admin routes and first visible detail routes
  loaded with no visible failure state and no post-login API 4xx/5xx failures.
- Mutation smoke before fix: role, category, coupon, user, product, product
  variant, and inventory creation passed through FE forms with no API failures.
- Warehouse create initially failed through FE because FE sent warehouse code
  values `1/2/3` while BE expects `HN=0`, `HCM=1`, `DN=2`; fixed under
  `FE-REFAC-022`.
- Warehouse create retest after `FE-REFAC-022`: passed through FE form with
  final URL `/warehouses/019ea7e3-4931-702e-afff-60f21e6e6281` and no API
  failures.
- Excluded by request: forgot/reset/verify/resend-email flows and PayOS
  checkout/provider/webhook behavior.

Residual note: browser console still reports Nuxt/Vue hydration mismatch
warnings across pages. These warnings were present before this fix and did not
correspond to API failures or visible workflow failure in this smoke pass.
