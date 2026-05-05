<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    tone?: "info" | "success" | "warning" | "danger";
    title?: string;
  }>(),
  {
    tone: "info",
    title: "",
  },
);

const toneClass = computed(() => {
  const map: Record<string, string> = {
    info: "app-notice-info",
    success: "app-notice-success",
    warning: "app-notice-warning",
    danger: "app-notice-danger",
  };
  return map[props.tone] ?? "app-notice-info";
});
</script>

<template>
  <div class="app-notice" :class="toneClass">
    <p v-if="title" class="app-notice-title">{{ title }}</p>
    <p :class="title ? 'mt-1' : ''">
      <slot />
    </p>
  </div>
</template>