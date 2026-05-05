<script setup lang="ts">
import type { DashboardPage } from "~/features/dashboard/composables/useDashboardPage";

const props = defineProps<{
  page: DashboardPage;
}>();

const { currentUser } = props.page;
</script>

<template>
  <div class="page-shell flex flex-col items-center justify-center min-h-[calc(100vh-8rem)]">
    <div class="max-w-2xl text-center px-4">
      <div class="subtle-pill mb-6 py-1.5 px-3">
        Phase 1 &middot; Dashboard
      </div>
      
      <h1 class="text-3xl font-medium tracking-tight text-ink md:text-[2.75rem] leading-tight mb-6">
        A calm control room.
      </h1>
      
      <p class="text-base leading-relaxed text-smoke max-w-[54ch] mx-auto">
        Welcome, {{ currentUser?.fullName || "Administrator" }}. Since the core commerce metrics like orders, inventory, and payments are not yet connected, this space remains a clean, blank slate.
      </p>
    </div>
  </div>
</template>
