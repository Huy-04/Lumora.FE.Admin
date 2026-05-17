<script setup lang="ts">
const page = await useDashboardPage();
</script>

<template>
  <DashboardView :page="page" />
</template>
