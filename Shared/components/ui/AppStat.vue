<script setup lang="ts">
defineProps<{
  label: string;
  value: string;
  detail: string;
}>();
</script>

<template>
  <article class="soft-card app-stat-card">
    <p class="hairline-kicker">
      {{ label }}
    </p>
    <h3 class="app-stat-value">{{ value }}</h3>
    <p class="app-stat-copy">{{ detail }}</p>
  </article>
</template>
