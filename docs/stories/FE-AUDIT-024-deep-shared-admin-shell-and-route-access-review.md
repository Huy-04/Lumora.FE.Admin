# FE-AUDIT-024 - Deep shared admin shell and route-access review

## Why

Most business modules have already been audited and fixed. The next meaningful surface is the shared admin shell that controls route access, navigation visibility, and auth-driven page behavior across the whole FE Admin app.

## Scope

- `middleware/auth.global.ts`
- `features/auth/composables/useAdminAuthorization.ts`
- `Shared/composables/navigation/useAdminNavigation.ts`
- selected route shells under `pages/` where shell-level semantics are defined

## Review goals

- Verify FE route gating matches current BE permission behavior
- Verify navigation visibility and fallback routing are consistent with access rules
- Check auth middleware redirects and access-denied semantics
- Identify any cross-cutting shell drift that business-module audits would not catch

## Non-goals

- No redesign of the visual shell
- No BE contract changes
- No business-module logic review already covered by prior stories
