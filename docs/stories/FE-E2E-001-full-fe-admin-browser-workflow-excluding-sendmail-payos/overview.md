# FE-E2E-001 Full FE Admin Browser Workflow Test

## Status

in_progress

## Lane

high-risk

## Product Contract

FE Admin must pass authenticated browser workflow coverage against deployed BE
for admin surfaces, excluding sendmail-dependent flows and PayOS/payment-provider
flows.

## Explicit Exclusions

- Forgot password, verify email, change email, email/OTP resend, and any flow
  requiring sendmail delivery.
- PayOS payment-provider flow, provider checkout, and provider webhook behavior.

## Mutation Policy

Data mutation is allowed on deployed BE because the user can reset data. Test
records should use a `Codex Smoke` prefix where practical.

## Acceptance Criteria

- Login with deployed BE succeeds.
- Main admin index/detail/create/edit/navigation surfaces load without blocking
  API failures.
- Representative mutation flows pass where practical and do not require
  sendmail or PayOS.
- Any discovered FE defect is either fixed in a separate story or recorded as a
  finding with proof.
