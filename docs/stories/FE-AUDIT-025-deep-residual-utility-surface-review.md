# FE-AUDIT-025 - Deep residual utility-surface review

## Why

The main business modules and shared admin shell have already been audited. The remaining gap is a set of smaller utility surfaces that can still hide route/access or FE-vs-BE drift:

- auth utility pages
- profile utility pages
- user-address route shells

## Scope

- `pages/auth/*`
- `pages/profile/*`
- `pages/user-addresses/*`
- corresponding feature composables/views where shell-level semantics are defined

## Review goals

- verify route and access semantics
- verify FE page flow against current backend behavior where applicable
- catch any residual drift skipped by broader module stories

## Non-goals

- no broad redesign
- no duplication of already-closed module findings unless they are still live here
