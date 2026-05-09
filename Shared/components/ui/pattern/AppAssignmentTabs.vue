<script setup lang="ts">
type AssignmentTab = {
  label: string;
  value: string;
  checkedCount: number;
  totalCount: number;
};

defineProps<{
  label: string;
  modelValue: string;
  tabs: ReadonlyArray<AssignmentTab>;
}>();

const emit = defineEmits<{
  "update:modelValue": [value: string];
}>();
</script>

<template>
  <div class="grid min-w-0 gap-2">
    <span class="app-label">{{ label }}</span>
    <div class="flex min-w-0 gap-2 overflow-x-auto rounded-xl border border-line bg-surface-quiet p-1">
      <button
        v-for="tab in tabs"
        :key="tab.value || 'all'"
        type="button"
        class="inline-flex min-h-[2.5rem] shrink-0 items-center gap-2 rounded-lg border px-3 text-sm font-semibold outline-none transition"
        :class="modelValue === tab.value
          ? 'border-success/30 bg-success/15 text-success shadow-sm'
          : 'border-transparent bg-transparent text-smoke hover:border-line hover:bg-surface'"
        @click="emit('update:modelValue', tab.value)"
      >
        <span>{{ tab.label }}</span>
        <span
          class="rounded-full border px-2 py-0.5 text-xs"
          :class="modelValue === tab.value
            ? 'border-success/30 bg-surface/60 text-success'
            : 'border-line bg-surface text-smoke'"
        >
          {{ tab.checkedCount }}/{{ tab.totalCount }}
        </span>
      </button>
    </div>
  </div>
</template>
