# FE Admin — Auth Architecture

Developer reference for the authentication and authorization implementation in Lumora.FE.Admin.

---

## Auth Flow Overview

### Login (`POST /api/authentication/admin-login`)

1. User submits email + password on the login page.
2. FE sends `{ email, password }` with headers `X-Device-Id` (required, UUID from localStorage) and `X-Device-Name` (optional).
3. BE validates credentials, sets HttpOnly cookies, and returns `LoginApiResponse` containing `userId`, `email`, `userName`, `roles`, `expiresAt`, and `permissions[]`.
4. FE stores the non-sensitive response fields (user info + permissions) in client state.
5. FE navigates to the dashboard.

### Token Refresh (`POST /api/authentication/refresh-access-token`)

- Called automatically by the API client interceptor when a 401 is received (excluding `/admin-login` and `/refresh-access-token` itself).
- Sends `X-Device-Id` header. No request body — refresh token is read from the HttpOnly cookie by BE.
- On success: BE rotates both `accessToken` and `refreshToken` cookies and returns updated `LoginApiResponse` (without permissions).
- On failure (401): auth state is cleared and user is redirected to login.
- Concurrent requests queue behind the refresh call and retry with the new token.

### Session Bootstrap (`GET /api/authentication/me`)

- Called on page load/refresh when the `auth` indicator cookie is present.
- Returns `CurrentUserResponse` containing full user profile and `permissions[]`.
- Used to hydrate client auth state without requiring re-login.
- If this call fails with 401, auth state is cleared and user lands on login.

### Logout (`POST /api/authentication/logout`)

- Sends `X-Device-Id` header. No body.
- BE clears all auth cookies and revokes the session.
- FE clears local auth state and redirects to login.

---

## Cookie Architecture

| Cookie | HttpOnly | FE Readable | Set/Cleared By | Purpose |
|--------|----------|-------------|----------------|---------|
| `accessToken` | Yes | No | BE | JWT access token — automatically promoted to `Authorization: Bearer` header by BE middleware |
| `refreshToken` | Yes | No | BE | JWT refresh token — used by BE on `/refresh-access-token` |
| `auth` | **No** | **Yes** | BE | Indicator cookie (value `"1"`) — signals active session to FE |

### Rules

- FE **never** reads or writes `accessToken` / `refreshToken`.
- FE **never** sets the `auth` cookie client-side — only BE manages it.
- FE reads the `auth` cookie solely for session-presence detection (e.g., deciding whether to call `/me` on page load, or showing/hiding the login page).
- The `auth-heartbeat.client.ts` plugin polls the `auth` cookie to detect external logout (cookie cleared by another tab or token expiry).

### Cookie-to-Header Middleware (BE)

BE's `AuthenticationCookieMiddleware` copies the `accessToken` cookie value into the `Authorization: Bearer` header on every request **if** no `Authorization` header is already present. This means FE does not need to manually attach tokens — cookies handle transport.

---

## Permission Gating

### Gate: `Auth.Admin.Access.All`

The global route guard (`middleware/auth.global.ts`) checks:

1. Is the `auth` indicator cookie present? If not → redirect to login.
2. Is client auth state hydrated? If not → call `/me` to bootstrap.
3. Does the user have `Auth.Admin.Access.All` permission? If not → deny access to the entire admin surface.

### Per-Route / Per-Action Permission Rules

- Menu items and page sections are conditionally rendered based on the permissions array from `/me`.
- Permission format follows `Module.SubModule.Operation.Scope` (e.g., `Auth.Users.Read.All`, `Auth.Roles.Write.All`).
- The `useAdminAuthorization` composable exposes helpers to check single or multiple permissions.

### Permission Refresh After Self-Role Edit (Fix Applied)

**Problem:** When an admin edits their own roles (via user-role sync), the cached permissions become stale. UI elements gated by permissions would not reflect the change until the next page refresh or re-login.

**Fix:** After a successful role sync on the current user's own record, FE now calls `GET /api/authentication/me` to refresh the permissions array in client state. This ensures the UI immediately reflects the updated permission set without requiring logout/login.

---

## Device Identity

- `X-Device-Id`: UUID generated once and persisted in localStorage. Stable per browser — never regenerated per request.
- `X-Device-Name`: Optional human-friendly string (e.g., browser user-agent summary), also stored in localStorage.
- Both headers are attached to: `admin-login`, `refresh-access-token`, `logout`.

---

## Error Handling (Auth-Related)

| Scenario | FE Behavior |
|----------|-------------|
| 401 with `errorCode: TOKEN_REVOKED` | Clear auth state, redirect to login |
| 401 (other) | Attempt token refresh; if refresh also fails → clear state, redirect to login |
| 429 (rate limited) | Show cooldown message, disable submit |
| Login failure (400/401) | Show generic "Invalid email or password" — never reveal email existence |

---

## Key Files

| File | Purpose |
|------|---------|
| `features/auth/composables/useAuthApi.ts` | Login, logout, `/me` API calls |
| `features/auth/composables/useAuthSession.ts` | Client auth state management |
| `features/auth/composables/useAuthRefresh.ts` | Token refresh interceptor logic |
| `Shared/api/useApiClient.ts` | Central HTTP client with error/refresh handling |
| `Shared/composables/useDeviceIdentity.ts` | Device ID/name generation and persistence |
| `middleware/auth.global.ts` | Route guard (session + permission check) |
| `plugins/auth-heartbeat.client.ts` | Polls `auth` cookie for external logout detection |
