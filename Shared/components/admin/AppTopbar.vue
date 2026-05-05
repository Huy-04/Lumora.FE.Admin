<script setup lang="ts">

const route = useRoute();
const { groups } = useAdminNavigation();

const flatItems = computed(() => groups.value.flatMap((group) => group.items));
const accountBreadcrumbs = [
  {
    path: "/profile/sessions",
    items: [
      { label: "Profile", to: "/profile" },
      { label: "Sessions", to: "/profile/sessions" },
    ],
  },
  {
    path: "/profile/avatar",
    items: [
      { label: "Profile", to: "/profile" },
      { label: "Avatar", to: "/profile/avatar" },
    ],
  },
  {
    path: "/profile",
    items: [
      { label: "Profile", to: "/profile" },
    ],
  },
  {
    path: "/settings",
    items: [
      { label: "Settings", to: "/settings" },
    ],
  },
];
const breadcrumbs = computed(() => {
  const accountMatch = accountBreadcrumbs.find((entry) =>
    route.path === entry.path || route.path.startsWith(`${entry.path}/`),
  );

  if (accountMatch) {
    return accountMatch.items;
  }

  const activeItem = flatItems.value.find((item) =>
    route.path === item.to || (item.to !== "/" && route.path.startsWith(`${item.to}/`)),
  );

  return activeItem ? [activeItem] : [{ label: "Dashboard", to: "/" }];
});
</script>

<template>
  <header class="layout-topbar">
    <div class="layout-breadcrumb">
      <NuxtLink to="/" class="layout-breadcrumb-link">
        Admin
      </NuxtLink>
      <template v-for="(item, index) in breadcrumbs" :key="item.to">
        <span class="layout-breadcrumb-separator">/</span>
        <NuxtLink
          :to="item.to"
          :class="index === breadcrumbs.length - 1 ? 'layout-breadcrumb-current' : 'layout-breadcrumb-link'"
        >
          {{ item.label }}
        </NuxtLink>
      </template>
    </div>
  </header>
</template>
