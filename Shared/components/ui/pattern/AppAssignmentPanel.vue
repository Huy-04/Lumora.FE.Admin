<script setup lang="ts">
withDefaults(defineProps<{
  eyebrow?: string;
  hasItems: boolean;
  emptyTitle: string;
  emptyDetail: string;
  toolbarColumns?: string;
}>(), {
  eyebrow: "",
  toolbarColumns: "lg:grid-cols-[minmax(0,1fr)_auto]",
});
</script>

<template>
  <div class="grid max-w-6xl content-start gap-6">
    <slot name="modals" />

    <AppPanel :eyebrow="eyebrow">
      <div v-if="hasItems" class="grid gap-4">
        <div
          v-if="$slots.controls || $slots.summary"
          class="grid gap-3 lg:items-end"
          :class="toolbarColumns"
        >
          <slot name="controls" />
          <slot name="summary" />
        </div>

        <slot />

        <div v-if="$slots.actions" class="flex justify-end border-t border-line/70 pt-4">
          <slot name="actions" />
        </div>

        <slot name="notices" />
      </div>

      <slot v-else name="empty">
        <AppEmptyState :title="emptyTitle" :detail="emptyDetail" />
      </slot>
    </AppPanel>
  </div>
</template>
