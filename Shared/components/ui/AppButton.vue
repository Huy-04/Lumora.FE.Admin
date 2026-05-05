<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    variant?: "primary" | "secondary" | "ghost" | "danger";
    block?: boolean;
    type?: "button" | "submit" | "reset";
    loading?: boolean;
    disabled?: boolean;
    iconOnly?: boolean;
    ariaLabel?: string;
  }>(),
  {
    variant: "primary",
    block: false,
    type: "button",
    loading: false,
    disabled: false,
    iconOnly: false,
    ariaLabel: "",
  },
);

const variantClass = computed(() => {
  const map: Record<string, string> = {
    primary: "app-button-primary",
    secondary: "app-button-secondary",
    ghost: "app-button-ghost",
    danger: "app-button-danger",
  };
  return map[props.variant] ?? "app-button-primary";
});
</script>

<template>
  <button
    :type="type"
    :disabled="disabled || loading"
    :aria-label="ariaLabel || undefined"
    class="app-button"
    :class="[variantClass, block ? 'w-full' : '', iconOnly ? 'app-button-icon-only' : '']"
  >
    <span
      v-if="loading"
      class="h-2 w-2 animate-pulse rounded-full bg-current opacity-70"
      aria-hidden="true"
    />
    <slot />
  </button>
</template>