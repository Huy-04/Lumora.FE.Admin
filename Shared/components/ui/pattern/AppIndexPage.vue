<script setup lang="ts">
type PageSizeValue = number | string;

const props = defineProps<{
  eyebrow?: string;
  title?: string;
  description?: string;
  
  // Header
  searchLabel?: string;
  totalItems?: number | string;
  itemLabel?: string;
  
  // Search (built-in)
  searchPlaceholder?: string;
  modelValue?: string;

  // Actions (built-in)
  createRoute?: string;
  createLabel?: string;
  canCreate?: boolean;

  // State
  pending?: boolean;
  error?: string | null;
  errorTitle?: string;
  errorDetail?: string;
  
  actionError?: string | null;
  actionErrorTitle?: string;
  
  // Empty State
  itemsLength?: number;
  emptyTitle?: string;
  emptyDetail?: string;

  // Pagination (v-model for pageSize, rest are props/emits)
  firstItemNumber?: number;
  lastItemNumber?: number;
  pageSize?: PageSizeValue;
  pageSizeOptions?: { label: string; value: PageSizeValue }[];
  page?: number;
  totalPages?: number;
}>();

const emit = defineEmits<{
  'update:pageSize': [value: PageSizeValue];
  'update:modelValue': [value: string];
  'previousPage': [];
  'nextPage': [];
  'search': [];
  'refresh': [];
}>();

const slots = defineSlots<{
  modals?: () => any;
  header?: () => any;
  'search-input'?: () => any;
  actions?: () => any;
  filters?: () => any;
  notices?: () => any;
  empty?: () => any;
  table?: () => any;
  pagination?: () => any;
  after?: () => any;
}>();

/** Whether to use the legacy slot-based header or the new built-in header */
const useSlotHeader = computed(() => !!slots['search-input'] || !!slots.actions);

const resolvePageSizeValue = (
  value: string,
  options?: { label: string; value: PageSizeValue }[],
) => {
  const matchedOption = options?.find((option) => String(option.value) === value);
  return matchedOption?.value ?? value;
};

const showCreate = computed(() => {
  if (!props.createRoute) return false;
  return props.canCreate !== false;
});

function handleSearchInput(event: Event) {
  emit('update:modelValue', (event.target as HTMLInputElement).value);
}

function handleSearchAction() {
  emit('search');
}

function handleRefreshAction() {
  emit('refresh');
}

function handleKeyupEnter() {
  emit('search');
}
</script>

<template>
  <div class="page-shell">
    <slot name="modals" />
    
    <AppPanel :eyebrow="eyebrow" :title="title" :description="description">
      <!-- HEADER AND FILTERS -->
      <div v-if="useSlotHeader || searchPlaceholder || $slots.filters || $slots.header" class="grid gap-5 mb-8">
        <slot name="header">
          <!-- Legacy slot-based approach (backward compat) -->
          <template v-if="useSlotHeader">
            <div class="flex flex-col gap-4 sm:flex-row sm:items-end">
              <div v-if="$slots['search-input'] || searchLabel" class="flex-1">
                <div class="mb-2 flex flex-wrap items-center gap-4">
                  <span v-if="searchLabel" class="app-label">{{ searchLabel }}</span>
                  <span v-if="totalItems !== undefined" class="result-count">
                    Total {{ itemLabel ? itemLabel : 'items' }}: {{ totalItems }}
                  </span>
                </div>
                <slot name="search-input" />
              </div>
              
              <div v-if="$slots.actions" class="flex flex-wrap items-end gap-3 shrink-0">
                <slot name="actions" />
              </div>
            </div>

            <div v-if="$slots.filters" class="flex flex-col gap-4 sm:flex-row sm:items-center">
              <slot name="filters" />
            </div>
          </template>

          <!-- New built-in approach -->
          <template v-else-if="searchPlaceholder">
            <div class="flex flex-col gap-4 sm:flex-row sm:items-end">
              <div class="flex-1">
                <div class="mb-2 flex flex-wrap items-center gap-4">
                  <span v-if="searchLabel" class="app-label">{{ searchLabel }}</span>
                  <span v-if="totalItems !== undefined" class="result-count">
                    Total {{ itemLabel ? itemLabel : 'items' }}: {{ totalItems }}
                  </span>
                </div>
                <AppInput
                  :model-value="modelValue"
                  label=""
                  :placeholder="searchPlaceholder"
                  @update:model-value="emit('update:modelValue', $event)"
                  @keyup.enter="handleKeyupEnter"
                />
              </div>
              
              <div class="flex flex-wrap items-end gap-3 shrink-0">
                <AppButton variant="primary" @click="handleSearchAction">
                  Search
                </AppButton>
                <AppButton variant="primary" @click="handleRefreshAction">
                  Refresh
                </AppButton>
                <NuxtLink v-if="showCreate" class="primary-link" :to="createRoute!">
                  {{ createLabel || 'Create' }}
                </NuxtLink>
              </div>
            </div>

            <div v-if="$slots.filters" class="flex flex-col gap-4 sm:flex-row sm:items-center">
              <slot name="filters" />
            </div>
          </template>
        </slot>
      </div>

      <!-- NOTICES -->
      <slot name="notices">
        <AppNotice v-if="error" tone="danger" :title="errorTitle || 'Unable to load data'">
          {{ errorDetail || error }}
        </AppNotice>

        <AppNotice v-if="actionError" tone="danger" :title="actionErrorTitle || 'Action failed'">
          {{ actionError }}
        </AppNotice>
      </slot>

      <!-- CONTENT -->
      <div v-if="pending" class="soft-card h-64 animate-pulse" />

      <div v-else-if="itemsLength === 0" class="grid gap-4">
        <slot name="empty">
          <AppEmptyState
            :title="emptyTitle || 'No items found'"
            :detail="emptyDetail || 'Adjust the filters or create a new item.'"
          />
        </slot>
      </div>

      <div v-else class="table-shell overflow-x-auto">
        <slot name="table" />
      </div>

      <!-- PAGINATION -->
      <slot name="pagination">
        <div v-if="itemsLength && itemsLength > 0 && totalPages" class="mt-5 flex flex-col gap-3 border-t border-line pt-4 md:flex-row md:items-center md:justify-between">
          <p class="text-sm text-smoke">
            Showing {{ firstItemNumber }}-{{ lastItemNumber }} of {{ totalItems }} {{ itemLabel ? itemLabel : 'items' }}.
          </p>
          <div class="flex flex-wrap items-center gap-3">
            <label v-if="pageSizeOptions" class="flex items-center gap-2 text-sm font-medium text-smoke">
              Page size
              <select
                :value="pageSize"
                @change="$emit(
                  'update:pageSize',
                  resolvePageSizeValue(($event.target as HTMLSelectElement).value, pageSizeOptions),
                )"
                class="rounded-none border border-line bg-surface px-2 py-1 text-sm text-ink outline-none focus:ring-1 focus:ring-accent"
              >
                <option v-for="opt in pageSizeOptions" :key="opt.value" :value="opt.value">{{ opt.label }}</option>
              </select>
            </label>
            <div v-if="page !== undefined && totalPages !== undefined" class="flex items-center gap-2">
              <AppButton variant="secondary" :disabled="page <= 1 || pending" @click="$emit('previousPage')">
                Previous
              </AppButton>
              <span class="text-sm text-smoke">Page {{ page }} / {{ totalPages }}</span>
              <AppButton variant="secondary" :disabled="page >= totalPages || pending" @click="$emit('nextPage')">
                Next
              </AppButton>
            </div>
          </div>
        </div>
      </slot>
    </AppPanel>
    <slot name="after" />
  </div>
</template>
