# FE-AUDIT-010 - Rescan Auth family current-state after FE fixes

## Summary

Rescan FE Admin Auth family against current Lumora.BE behavior after earlier FE-REFAC batches to confirm whether any live semantic mismatches remain.

## Scope

- `Shared/api/useApiClient.ts`
- `features/profile/composables/useProfileSessionsPage.ts`
- `features/profile/composables/useProfileEmailChangeFlow.ts`
- `features/profile/composables/useProfilePhoneChangeFlow.ts`
- targeted auth/profile/users/roles/permissions/session surfaces as needed for current-state confirmation

## BE Contract Source

- `../Lumora.BE/Lumora.Application/Modules/Auth/Features/User/Users/Commands/EmailChange/CompleteEmailChange/CompleteEmailChangeCHandler.cs`
- `../Lumora.BE/Lumora.Application/Modules/Auth/Features/User/Users/Commands/PhoneChange/CompletePhoneChange/CompletePhoneChangeCHandler.cs`
- `../Lumora.BE/Lumora.Application/Modules/Auth/Features/Admin/RefreshTokens/Commands/RevokeAllUserTokens/RevokeAllUserTokensCHandler.cs`
- `../Lumora.BE/Lumora.Application/Modules/Auth/Features/User/Users/Commands/EmailVerification/CompleteEmailVerification/CompleteEmailVerificationCHandler.cs`
- `../Lumora.BE/Lumora.Infrastructure/Modules/Auth/Services/Authorization/AuthAuthorizationService.cs`

## Review Goals

1. Confirm the previously fixed FE session/error semantics are present in live source.
2. Verify whether any meaningful Auth-family semantic drift remains after FE-REFAC-008 and FE-REFAC-009.
3. Separate real mismatches from minor UX/explanation debt.
