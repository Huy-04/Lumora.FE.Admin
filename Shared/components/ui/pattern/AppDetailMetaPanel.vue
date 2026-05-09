<script setup lang="ts">
import AppPanel from "~/Shared/components/ui/AppPanel.vue";

defineProps<{
  eyebrow: string;
}>();
</script>

<template>
  <AppPanel :eyebrow="eyebrow">
    <dl class="divide-y divide-line/60">
      <slot />
    </dl>
  </AppPanel>
</template>
