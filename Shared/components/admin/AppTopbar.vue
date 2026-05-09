<script setup lang="ts">
import { resolveStaticPageBreadcrumbs, usePageBreadcrumbs } from "~/Shared/composables/usePageBreadcrumbs";

const route = useRoute();
const pageBreadcrumbs = usePageBreadcrumbs();

const breadcrumbs = computed(() =>
  pageBreadcrumbs.items.value.length
    ? pageBreadcrumbs.items.value
    : resolveStaticPageBreadcrumbs(route.path),
);
</script>

<template>
  <header class="layout-topbar">
    <div class="layout-breadcrumb">
      <NuxtLink to="/" class="layout-breadcrumb-link">
        Admin
      </NuxtLink>
      <template v-for="(item, index) in breadcrumbs" :key="`${item.to ?? item.label}-${index}`">
        <span class="layout-breadcrumb-separator">/</span>
        <NuxtLink
          v-if="item.to"
          :to="item.to"
          :class="index === breadcrumbs.length - 1 ? 'layout-breadcrumb-current' : 'layout-breadcrumb-link'"
        >
          {{ item.label }}
        </NuxtLink>
        <span
          v-else
          :class="index === breadcrumbs.length - 1 ? 'layout-breadcrumb-current' : 'layout-breadcrumb-link'"
        >
          {{ item.label }}
        </span>
      </template>
    </div>
  </header>
</template>
