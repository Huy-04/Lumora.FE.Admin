<script setup lang="ts">
import { PhMoon, PhSun } from "@phosphor-icons/vue";
import type { SettingPageState } from "~/features/settings/composables/useSettingsPage";

const props = defineProps<{
  page: SettingPageState;
}>();

const { isDark, toggle } = props.page;
</script>

<template>
  <div class="detail-shell">
    <section class="detail-stack">
      <div class="grid max-w-6xl content-start gap-6">
        <AppPanel eyebrow="Settings">
          <div class="grid gap-4">
            <div class="rounded-xl border border-line bg-surface px-5 py-4">
              <div class="grid gap-4 md:grid-cols-[minmax(0,1fr)_auto] md:items-center">
                <div class="flex min-w-0 items-center gap-3">
                  <div class="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-line bg-surface-quiet">
                    <PhSun v-if="!isDark" :size="20" class="text-amber-500" />
                    <PhMoon v-else :size="20" class="text-smoke" />
                  </div>
                  <div class="min-w-0">
                    <p class="text-sm font-semibold text-ink">Theme</p>
                    <p class="mt-1 text-sm text-smoke">{{ isDark ? "Dark mode" : "Light mode" }}</p>
                  </div>
                </div>
                <button
                  type="button"
                  class="surface-toggle justify-self-start md:justify-self-end"
                  :class="{ 'is-active': isDark }"
                  :aria-label="isDark ? 'Switch to light mode' : 'Switch to dark mode'"
                  @click="toggle"
                >
                  <span
                    class="surface-toggle-thumb"
                    :class="{ 'is-active': isDark }"
                  />
                </button>
              </div>
            </div>
          </div>
        </AppPanel>
      </div>
    </section>
  </div>
</template>
