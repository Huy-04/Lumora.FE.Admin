<script setup lang="ts">
type DetailTab = {
  label: string;
  value: string;
};

withDefaults(defineProps<{
  title?: string;
  tabs?: DetailTab[];
  activeTab?: string;
  pending?: boolean;
  error?: string | null;
  errorTitle?: string;
}>(), {
  title: "",
  tabs: () => [],
  activeTab: "",
  pending: false,
  error: null,
  errorTitle: "Unable to load detail",
});

defineEmits<{
  "select-tab": [value: string];
}>();
</script>

<template>
  <div class="detail-shell">
    <slot name="modals" />

    <AppNotice v-if="error" tone="danger" :title="errorTitle">
      {{ error }}
    </AppNotice>

    <template v-else>
      <section v-if="!pending && title" class="detail-header">
        <h1 class="detail-title">{{ title }}</h1>

        <div v-if="tabs.length" class="detail-tabs">
          <button
            v-for="tab in tabs"
            :key="tab.value"
            type="button"
            class="detail-tab"
            :class="{ 'detail-tab-active': activeTab === tab.value }"
            @click="$emit('select-tab', tab.value)"
          >
            {{ tab.label }}
          </button>
        </div>
      </section>

      <section v-if="pending" class="detail-stack">
        <slot name="pending">
          <div class="soft-card h-72 animate-pulse" />
          <div class="soft-card h-48 animate-pulse" />
        </slot>
      </section>

      <section v-else class="detail-stack">
        <slot />
      </section>
    </template>
  </div>
</template>
