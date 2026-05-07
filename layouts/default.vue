<script setup lang="ts">
const { mobileLinks } = useAdminNavigation();
const sidebarCollapsed = ref(false);

const toggleSidebar = () => {
  sidebarCollapsed.value = !sidebarCollapsed.value;
};
</script>

<template>
  <div
    class="layout-wrapper app-shell"
    :class="sidebarCollapsed ? 'layout-sidebar-collapsed' : ''"
  >
    <AppSidebar
      :collapsed="sidebarCollapsed"
      @toggle-sidebar="toggleSidebar"
    />

    <div class="layout-main-container">
      <AppTopbar />

      <nav class="mobile-nav-shell lg:hidden">
        <NuxtLink
          v-for="item in mobileLinks"
          :key="item.to"
          class="surface-nav-link whitespace-nowrap px-3 py-2"
          :to="item.to"
        >
          {{ item.label }}
        </NuxtLink>
      </nav>

      <main class="layout-main">
        <slot />
      </main>
    </div>
  </div>
</template>
