<script setup lang="ts">
import { PhCaretDown, PhGear, PhSignOut, PhUserCircle } from "@phosphor-icons/vue";

const route = useRoute();
const { groups } = useAdminNavigation();
const session = useAuthSession();
const props = defineProps<{
  collapsed?: boolean;
}>();
const emit = defineEmits<{
  "toggle-sidebar": [];
}>();

const openGroups = reactive<Record<string, boolean>>({});

watchEffect(() => {
  for (const group of groups.value) {
    if (!(group.label in openGroups)) {
      openGroups[group.label] = true;
    }
  }
});

const collapsedItems = computed(() => groups.value.flatMap((group) => group.items));
const isActive = (to: string) => route.path === to || (to !== "/" && route.path.startsWith(`${to}/`));
const toggleGroup = (label: string) => {
  openGroups[label] = !openGroups[label];
};

const currentUser = computed(() => session.user.value);
const accountOpen = ref(false);
const accountMenuRef = ref<HTMLElement | null>(null);
const displayName = computed(() => currentUser.value?.fullName || "Administrator");
const accountInitial = computed(() => displayName.value.trim().charAt(0).toUpperCase() || "A");
const avatarUrl = computed(() => currentUser.value?.img?.trim() || "");
const logoutPending = ref(false);

const closeMenuOnOutsideClick = (event: MouseEvent) => {
  if (!accountMenuRef.value) return;

  const target = event.target;
  if (target instanceof Node && !accountMenuRef.value.contains(target)) {
    accountOpen.value = false;
  }
};

onMounted(() => {
  document.addEventListener("click", closeMenuOnOutsideClick);
});

onBeforeUnmount(() => {
  document.removeEventListener("click", closeMenuOnOutsideClick);
});

watch(
  () => route.fullPath,
  () => {
    accountOpen.value = false;
  },
);

const handleLogout = async () => {
  logoutPending.value = true;

  try {
    await session.logout();
    accountOpen.value = false;
    await navigateTo("/auth/login");
  } finally {
    logoutPending.value = false;
  }
};
</script>

<template>
  <aside
    class="layout-sidebar hidden lg:block"
    :class="collapsed ? 'layout-sidebar-is-collapsed' : ''"
  >
    <div class="layout-sidebar-brand">
      <NuxtLink
        class="layout-sidebar-logo"
        to="/"
        :aria-label="props.collapsed ? 'Lumora Admin' : undefined"
      >
        <div class="layout-sidebar-logo-mark">
          L
        </div>
        <span v-if="!collapsed">Lumora</span>
      </NuxtLink>

      <button
        class="layout-sidebar-toggle"
        type="button"
        :aria-label="collapsed ? 'Expand navigation' : 'Collapse navigation'"
        @click="emit('toggle-sidebar')"
      >
        <PhCaretDown
          :size="17"
          class="transition duration-200 ease-out"
          :class="collapsed ? '-rotate-90' : 'rotate-90'"
        />
      </button>
    </div>

    <div class="layout-sidebar-body">
      <nav v-if="collapsed" class="grid gap-2">
        <NuxtLink
          v-for="item in collapsedItems"
          :key="item.to"
          :to="item.to"
          class="surface-nav-link transition duration-300 ease-out"
          :class="isActive(item.to) ? 'surface-nav-link-active' : ''"
          :title="item.label"
          :aria-label="item.label"
        >
          <component :is="item.icon" :size="19" />
        </NuxtLink>
      </nav>

      <nav v-else class="grid gap-4">
        <div class="px-3 py-2">
          <p class="layout-menu-label">Navigation</p>
        </div>

        <section
          v-for="group in groups"
          :key="group.label"
          class="grid gap-2"
        >
          <div
            v-if="!group.collapsible && !group.label"
            class="grid gap-1"
          >
            <NuxtLink
              v-for="item in group.items"
              :key="item.to"
              :to="item.to"
              class="surface-nav-link transition duration-300 ease-out"
              :class="isActive(item.to) ? 'surface-nav-link-active' : ''"
            >
              <component :is="item.icon" :size="18" />
              <span>{{ item.label }}</span>
            </NuxtLink>
          </div>

          <div
            v-else-if="group.collapsible"
            class="grid gap-1"
          >
            <button
              class="layout-menu-group-button"
              type="button"
              @click="toggleGroup(group.label)"
            >
              <span>{{ group.label }}</span>
              <PhCaretDown
                :size="16"
                class="transition duration-300 ease-out"
                :class="openGroups[group.label] ? 'rotate-180' : ''"
              />
            </button>

            <div v-if="openGroups[group.label]" class="grid gap-1">
              <NuxtLink
                v-for="item in group.items"
                :key="item.to"
                :to="item.to"
                class="surface-nav-link transition duration-300 ease-out"
                :class="isActive(item.to) ? 'surface-nav-link-active' : ''"
              >
                <component :is="item.icon" :size="18" />
                <span>{{ item.label }}</span>
              </NuxtLink>
            </div>
          </div>

          <template v-else>
            <p v-if="group.label" class="layout-menu-label px-3">
              {{ group.label }}
            </p>
            <NuxtLink
              v-for="item in group.items"
              :key="item.to"
              :to="item.to"
              class="surface-nav-link transition duration-300 ease-out"
              :class="isActive(item.to) ? 'surface-nav-link-active' : ''"
            >
              <component :is="item.icon" :size="18" />
              <span>{{ item.label }}</span>
            </NuxtLink>
          </template>
        </section>
      </nav>
    </div>

    <div ref="accountMenuRef" class="layout-sidebar-account">
      <button
        class="layout-sidebar-account-button"
        :class="collapsed ? 'layout-sidebar-account-button-collapsed' : ''"
        type="button"
        :aria-label="collapsed ? 'Open account menu' : undefined"
        @click="accountOpen = !accountOpen"
      >
        <div class="layout-account-avatar">
          <img
            v-if="avatarUrl"
            :src="avatarUrl"
            :alt="displayName"
            class="h-full w-full object-cover"
          >
          <span v-else>{{ accountInitial }}</span>
        </div>

        <template v-if="!collapsed">
          <div class="layout-account-copy min-w-0 text-left">
            <p>{{ displayName }}</p>
            <span>Administrator</span>
          </div>
          <PhCaretDown
            :size="14"
            class="layout-account-caret transition duration-200 ease-out"
            :class="accountOpen ? 'rotate-180' : ''"
          />
        </template>
      </button>

      <div
        v-if="accountOpen"
        class="layout-account-menu surface-popover"
        :class="collapsed ? 'layout-account-menu-collapsed' : ''"
      >
        <div class="layout-account-summary">
          <div class="layout-account-avatar layout-account-avatar-large">
            <img
              v-if="avatarUrl"
              :src="avatarUrl"
              :alt="displayName"
              class="h-full w-full object-cover"
            >
            <span v-else>{{ accountInitial }}</span>
          </div>
          <div class="layout-account-copy min-w-0 text-left">
            <p>{{ displayName }}</p>
            <span>Administrator</span>
          </div>
        </div>

        <div class="my-1 border-t border-line/60" />

        <NuxtLink
          class="surface-menu-item"
          to="/profile"
          @click="accountOpen = false"
        >
          <PhUserCircle :size="18" />
          <span>Profile</span>
        </NuxtLink>

        <NuxtLink
          class="surface-menu-item"
          to="/settings"
          @click="accountOpen = false"
        >
          <PhGear :size="18" />
          <span>Settings</span>
        </NuxtLink>

        <div class="my-1 border-t border-line/60" />

        <button
          :disabled="logoutPending"
          class="surface-menu-item layout-account-menu-danger w-full disabled:cursor-not-allowed disabled:opacity-60"
          type="button"
          @click="handleLogout"
        >
          <PhSignOut :size="18" />
          <span>Sign out</span>
        </button>
      </div>
    </div>
  </aside>
</template>
