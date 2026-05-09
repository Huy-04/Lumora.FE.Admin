<script setup lang="ts">
import { PhCaretDown } from "@phosphor-icons/vue";

const props = withDefaults(defineProps<{
  title: string;
  countLabel: string;
  checked: boolean;
  indeterminate?: boolean;
  open?: boolean;
  collapsible?: boolean;
  contentId?: string;
}>(), {
  indeterminate: false,
  open: true,
  collapsible: true,
  contentId: undefined,
});

const emit = defineEmits<{
  "toggle-all": [];
  "update:open": [value: boolean];
}>();

const toggleOpen = () => {
  if (!props.collapsible) return;
  emit("update:open", !props.open);
};
</script>

<template>
  <section class="overflow-hidden rounded-xl border border-line bg-surface">
    <div class="grid gap-3 border-b border-line/70 bg-surface-quiet px-5 py-4 md:grid-cols-[minmax(0,1fr)_8rem] md:items-center">
      <div class="flex min-w-0 items-center gap-3">
        <input
          type="checkbox"
          class="h-4 w-4 cursor-pointer rounded accent-ink"
          :aria-label="`Toggle ${title}`"
          :checked="checked"
          :indeterminate="indeterminate"
          @change.stop="emit('toggle-all')"
          @click.stop
        />
        <button
          v-if="collapsible"
          type="button"
          class="min-w-0 text-left text-sm font-semibold text-ink outline-none transition hover:text-smoke focus:text-smoke"
          :aria-expanded="open"
          :aria-controls="contentId"
          @click="toggleOpen"
        >
          {{ title }}
        </button>
        <span v-else class="min-w-0 text-sm font-semibold text-ink">
          {{ title }}
        </span>
      </div>

      <button
        v-if="collapsible"
        type="button"
        class="inline-flex min-w-[5.75rem] items-center justify-between gap-3 justify-self-start rounded-full border border-line bg-surface-quiet px-4 py-2 text-xs font-semibold text-smoke outline-none transition hover:border-ink/20 hover:bg-line/20 focus:shadow-[0_0_0_3px_rgba(24,24,27,0.08)] md:justify-self-end"
        :aria-expanded="open"
        :aria-controls="contentId"
        @click="toggleOpen"
      >
        <span>{{ countLabel }}</span>
        <PhCaretDown
          :size="14"
          class="text-smoke transition-transform duration-200"
          :class="open ? 'rotate-180' : ''"
        />
      </button>
      <span
        v-else
        class="inline-flex min-w-[5.75rem] items-center justify-center justify-self-start rounded-full border border-line bg-surface px-4 py-2 text-xs font-semibold text-smoke md:justify-self-end"
      >
        {{ countLabel }}
      </span>
    </div>

    <div v-if="!collapsible || open" :id="contentId">
      <slot />
    </div>
  </section>
</template>
