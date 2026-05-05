<script setup lang="ts">
defineProps<{
  title: string;
  detail: string;
}>();
</script>

<template>
  <div class="soft-card app-empty-state">
    <p class="app-empty-state-kicker">No matching records</p>
    <h3 class="app-empty-state-title">{{ title }}</h3>
    <p class="app-empty-state-detail">{{ detail }}</p>
  </div>
</template>
