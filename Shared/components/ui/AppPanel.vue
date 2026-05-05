<script setup lang="ts">
defineProps<{
  eyebrow?: string;
  title?: string;
  description?: string;
}>();
</script>

<template>
  <section class="app-panel">
    <div class="app-panel-heading">
      <div class="flex flex-wrap items-start justify-between gap-4">
        <div class="grid gap-2">
          <p v-if="eyebrow" class="app-panel-eyebrow">
            {{ eyebrow }}
          </p>
          <h2 v-if="title" class="app-panel-title">
            {{ title }}
          </h2>
          <p v-if="description" class="app-panel-copy">
            {{ description }}
          </p>
        </div>
        <div v-if="$slots.actions" class="shrink-0">
          <slot name="actions" />
        </div>
      </div>
    </div>

    <div class="app-panel-body">
      <slot />
    </div>
  </section>
</template>
