<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    tone?: "default" | "success" | "warning" | "danger";
  }>(),
  {
    tone: "default",
  },
);

const toneClass = computed(() => {
  if (props.tone === "success") return "app-badge-success";
  if (props.tone === "warning") return "app-badge-warning";
  if (props.tone === "danger") return "app-badge-danger";
  return "app-badge-default";
});
</script>

<template>
  <span
    class="app-badge"
    :class="toneClass"
  >
    <slot />
  </span>
</template>
