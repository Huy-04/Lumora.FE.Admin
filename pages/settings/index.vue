<script setup lang="ts">
import SettingsView from "~/features/settings/components/SettingsView.vue";

const page = await useSettingsPage();
</script>

<template>
  <SettingsView :page="page" />
</template>
