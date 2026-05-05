<script setup lang="ts">
import { PhMoon, PhSun } from "@phosphor-icons/vue";
import type { SettingsPage } from "~/features/settings/composables/useSettingsPage";

const props = defineProps<{
  page: SettingsPage;
}>();

const { isDark, toggle } = props.page;
</script>

<template>
  <div class="detail-shell">
    <section class="detail-header">
      <h1 class="detail-title">Settings</h1>
      <p class="detail-copy">Appearance and preferences.</p>
    </section>

    <section class="detail-stack">
      <div class="grid gap-6 content-start max-w-4xl">
        <AppPanel
          eyebrow="Appearance"
          title="Theme"
          description="Switch between light and dark mode. Your preference is saved automatically."
        >
          <div class="form-stack">
            <div class="soft-card flex items-center justify-between gap-4 p-4">
              <div class="flex items-center gap-3">
                <div class="grid h-10 w-10 place-items-center rounded-xl border border-line bg-pearl/70 dark:bg-white/8">
                  <PhSun v-if="!isDark" :size="20" class="text-amber-500" />
                  <PhMoon v-else :size="20" class="text-parchment" />
                </div>
                <div>
                  <p class="text-sm font-medium text-ink">{{ isDark ? "Dark mode" : "Light mode" }}</p>
                  <p class="text-xs text-smoke">Current theme</p>
                </div>
              </div>
              <button
                type="button"
                class="surface-toggle"
                :class="{ 'is-active': isDark }"
                @click="toggle"
              >
                <span
                  class="surface-toggle-thumb"
                  :class="{ 'is-active': isDark }"
                />
              </button>
            </div>
          </div>
        </AppPanel>
      </div>
    </section>
  </div>
</template>
