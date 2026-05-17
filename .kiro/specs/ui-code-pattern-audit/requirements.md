# Requirements Document

## Introduction

Tài liệu này định nghĩa các yêu cầu cho việc audit và sửa chữa các pattern không nhất quán trong dự án Lumora.FE.Admin. Mục tiêu là đảm bảo tất cả các feature modules tuân thủ các pattern đã thiết lập mà không thay đổi business logic.

## Glossary

- **Page_Shell**: File `.vue` trong thư mục `pages/` chỉ chứa import composable, gọi composable, và render view component
- **Feature_Module**: Thư mục trong `features/` chứa `components/`, `composables/`, và `types/`
- **Index_Page_Composable**: Composable quản lý state cho trang danh sách, tuân theo cấu trúc 9 phần
- **API_Composable**: Composable cung cấp các phương thức gọi API cho một feature
- **View_Component**: Component Vue nhận page state qua prop và render UI
- **Pattern_Component**: Component shared trong `Shared/components/ui/pattern/` (AppIndexPage, AppDetailPage, etc.)
- **Audit_Fix**: Thay đổi code để match standard pattern mà không thay đổi business logic
- **Standard_Pattern**: Pattern được sử dụng bởi đa số features (majority wins)

## Requirements

### Requirement 1: Page Shell Pattern Compliance

**User Story:** As a developer, I want all page files to follow the thin shell pattern, so that page logic is consistently separated into composables and view components.

#### Acceptance Criteria

1. THE Page_Shell SHALL contain only imports, a single composable invocation (`const page = await use{Feature}{PageType}Page()`), and a single view component render in template
2. WHEN a Page_Shell contains inline logic, template conditions, or multiple components, THE Audit_Fix SHALL extract that logic to the appropriate composable without changing behavior
3. THE Page_Shell SHALL use named imports with correct paths: `~/features/{feature}/composables/use{Feature}{PageType}Page` and `~/features/{feature}/components/{Feature}{PageType}View.vue`

### Requirement 2: Feature Directory Structure Compliance

**User Story:** As a developer, I want all features to have a consistent directory structure, so that code is predictably organized across the project.

#### Acceptance Criteria

1. THE Feature_Module SHALL contain subdirectories `components/`, `composables/`, and `types/` (types is optional only when feature has no type definitions)
2. WHEN a Feature_Module has type definitions scattered in composable files, THE Audit_Fix SHALL move them to `types/index.ts`
3. THE Feature_Module SHALL name its API composable as `use{Feature}AdminApi.ts`
4. THE Feature_Module SHALL name page composables following `use{Feature}{PageType}Page.ts` convention

### Requirement 3: Index Page Composable Structure Compliance

**User Story:** As a developer, I want all index page composables to follow the established 9-section structure, so that they are readable and maintainable.

#### Acceptance Criteria

1. THE Index_Page_Composable SHALL organize code into sections: dependency injection, permissions, pagination, filters, data fetching, computed derivations, actions/mutations, watchers, and return statement
2. THE Index_Page_Composable SHALL use `usePagination(totalItems)` for pagination state management
3. THE Index_Page_Composable SHALL use `useFilters()` with `onApply` callback that resets pagination page to 1
4. THE Index_Page_Composable SHALL use `useAsyncData` with a key string derived from current filter and pagination state
5. THE Index_Page_Composable SHALL wire `totalItems` via a watcher on `data.value?.totalCount`
6. THE Index_Page_Composable SHALL use `getProblemMessage(error.value, "fallback")` for error message computation
7. THE Index_Page_Composable SHALL spread `...pagination` at the end of the return object
8. THE Index_Page_Composable SHALL export a type alias: `export type {Feature}IndexPageState = Awaited<ReturnType<typeof use{Feature}IndexPage>>`

### Requirement 4: API Composable Pattern Compliance

**User Story:** As a developer, I want all API composables to follow the same structure, so that API interactions are consistent and predictable.

#### Acceptance Criteria

1. THE API_Composable SHALL use `useApiClient()` internally and call `api.request<T>()` for all HTTP requests
2. THE API_Composable SHALL define a route builder function at the top: `const featureRoute = (path = "") => \`/{feature-plural}${path}\``
3. THE API_Composable SHALL use `encodeURIComponent()` for all path parameters containing dynamic IDs
4. WHEN a search endpoint exists, THE API_Composable SHALL define a `buildSearchQuery` helper function
5. THE API_Composable SHALL return an object with named method functions (not classes or standalone functions)

### Requirement 5: View Component Pattern Compliance

**User Story:** As a developer, I want all view components to use the shared pattern components consistently, so that UI layout and behavior is uniform.

#### Acceptance Criteria

1. THE View_Component for index pages SHALL use `AppIndexPage` as its root template element
2. THE View_Component for detail pages SHALL use `AppDetailPage` as its root template element
3. THE View_Component SHALL accept a single prop typed with the page state type: `defineProps<{ page: {Feature}{PageType}PageState }>()`
4. THE View_Component SHALL destructure `props.page` at the top of `<script setup>`
5. WHEN a View_Component renders a data table, it SHALL use `<table class="data-table min-w-[{width}px]">` structure
6. WHEN a View_Component has filter UI, it SHALL use the `#filters` slot with `<div class="grid w-full gap-4 md:grid-cols-{n}">` wrapper
7. THE View_Component for index pages SHALL bind standard AppIndexPage events: `@search`, `@refresh`, `@previous-page`, `@next-page`

### Requirement 6: Naming Convention Compliance

**User Story:** As a developer, I want all files and exports to follow consistent naming conventions, so that navigating the codebase is intuitive.

#### Acceptance Criteria

1. THE Feature_Module directory SHALL use lowercase plural naming (e.g., `products`, `categories`, `orders`)
2. THE API_Composable SHALL be named `use{Feature}AdminApi.ts` where Feature is singular PascalCase
3. THE page composable SHALL be named `use{Feature}{PageType}Page.ts`
4. THE view component SHALL be named `{Feature}{PageType}View.vue`
5. THE tab component SHALL be named `{Feature}{TabName}Tab.vue`
6. THE types file SHALL be named `types/index.ts` and use named exports

### Requirement 7: Error Handling Pattern Compliance

**User Story:** As a developer, I want all action handlers to follow the same error handling pattern, so that error states are consistently managed.

#### Acceptance Criteria

1. THE Index_Page_Composable SHALL declare `actionPending`, `actionTargetId`, and `actionError` refs for mutation state tracking
2. WHEN an action handler executes, it SHALL set `actionPending` to the action name, `actionTargetId` to the target ID, and clear `actionError` before the try block
3. IF an action handler fails, THEN it SHALL set `actionError` using `getProblemMessage(requestError, "fallback message")`
4. WHEN an action handler completes (success or failure), it SHALL reset `actionPending` to `""` and `actionTargetId` to `""` in the finally block
5. WHEN an action succeeds, THE composable SHALL call `await refresh()` to reload data

### Requirement 8: Table UI Pattern Compliance

**User Story:** As a developer, I want all data tables to follow the same HTML structure and CSS class patterns, so that tables look and behave consistently.

#### Acceptance Criteria

1. THE data table SHALL use `<table class="data-table min-w-[{width}px]">` with appropriate min-width
2. THE table header cells SHALL use `<th class="min-w-[{width}px]">` for content columns
3. THE table action column header SHALL use `<th class="w-[96px] text-center">` 
4. THE table primary cell SHALL use `<p class="table-title">` for main text and `<p class="table-copy">` for secondary text
5. THE table action cell SHALL wrap its content in `<div class="flex justify-center">`
6. WHEN a table row links to a detail page, it SHALL use `<NuxtLink class="secondary-link table-action" :to="...">Open</NuxtLink>`

### Requirement 9: No Business Logic Modification

**User Story:** As a developer, I want the audit to only fix pattern inconsistencies without changing any business logic, so that application behavior remains identical.

#### Acceptance Criteria

1. THE Audit_Fix SHALL NOT modify API endpoints, request payloads, or response handling logic
2. THE Audit_Fix SHALL NOT modify computed derivation logic or filter behavior
3. THE Audit_Fix SHALL NOT add, remove, or modify permissions checks
4. THE Audit_Fix SHALL NOT change conditional rendering logic that depends on data state
5. THE Audit_Fix SHALL NOT modify event handler implementations beyond structural reorganization
6. IF a structural change requires moving code between files, THEN THE Audit_Fix SHALL preserve the exact same runtime behavior

### Requirement 10: Form UI Pattern Compliance

**User Story:** As a developer, I want all forms to use consistent structure and components, so that form layouts are uniform and accessible.

#### Acceptance Criteria

1. THE form element SHALL use `class="form-stack"` and `@submit.prevent` handler
2. THE form SHALL use AppInput, AppSelect, AppTextarea, or AppSearchSelect components instead of raw HTML input elements
3. THE form submit button SHALL use `<AppButton type="submit" variant="primary" :loading="pending">` pattern
4. WHEN a form has multiple sections, THE form SHALL use `<fieldset>` or `<div>` wrappers with appropriate spacing
5. THE form SHALL NOT use raw `<input>`, `<select>`, or `<textarea>` HTML elements

### Requirement 11: Modal/Confirmation Pattern Compliance

**User Story:** As a developer, I want all confirmation dialogs to use AppConfirm, so that destructive actions have consistent user experience.

#### Acceptance Criteria

1. THE confirmation dialog SHALL use `<AppConfirm>` component with `:open`, `title`, `detail`, `confirm-label` props
2. THE confirmation dialog for destructive actions SHALL set `:tone="'danger'"` on AppConfirm
3. THE confirmation dialog SHALL bind `:loading="actionPending"` during async operations
4. THE confirmation dialog SHALL emit `@confirm` and `@cancel` events
5. THE Audit_Fix SHALL replace custom modal implementations with AppConfirm without changing confirmation logic

### Requirement 12: Loading State Pattern Compliance

**User Story:** As a developer, I want all loading states to follow the skeleton pattern, so that users see consistent loading indicators.

#### Acceptance Criteria

1. WHEN data is loading for index pages, THE View_Component SHALL rely on AppIndexPage built-in loading handling
2. WHEN data is loading for detail pages, THE View_Component SHALL rely on AppDetailPage built-in loading handling
3. WHEN custom skeleton loading is needed, THE View_Component SHALL use `<div class="soft-card animate-pulse">` pattern
4. THE Audit_Fix SHALL NOT introduce new spinner or loading implementations where skeleton pattern applies

### Requirement 13: Permission Check Pattern Compliance

**User Story:** As a developer, I want all permission checks to use the centralized authorization composable, so that access control is consistent and maintainable.

#### Acceptance Criteria

1. THE Index_Page_Composable SHALL use `useAdminAuthorization()` for permission state
2. THE permission check SHALL use `authz.can(ADMIN_PERMISSION.{feature}{action}{scope})` computed pattern
3. THE View_Component SHALL use `v-if="canDoThing"` to conditionally render action buttons and columns
4. THE Audit_Fix SHALL NOT add or remove permission checks — only align existing checks to use the standard pattern
5. WHEN permission constants are needed, THE composable SHALL import from the `ADMIN_PERMISSION` enum

### Requirement 14: Create/Detail Page Composable Compliance

**User Story:** As a developer, I want create and detail page composables to follow consistent patterns, so that form handling and data loading are predictable.

#### Acceptance Criteria

1. THE create page composable SHALL use `reactive({})` for form state
2. THE create page composable SHALL declare `pending` ref and `errorMessage` ref for submission state
3. THE create page composable SHALL define a `submit` async function that sets pending, calls API, navigates on success, and catches errors with `getProblemMessage`
4. THE detail page composable SHALL use `useAsyncData` for initial data loading
5. THE detail page composable SHALL export type: `export type {Feature}DetailPageState = Awaited<ReturnType<typeof use{Feature}DetailPage>>`
6. THE create page composable SHALL export type: `export type {Feature}CreatePageState = Awaited<ReturnType<typeof use{Feature}CreatePage>>`
