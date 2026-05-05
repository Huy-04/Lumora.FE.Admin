<script setup lang="ts">
import type { PasswordRule } from "../../composables/usePasswordRules";

defineProps<{
  rules: PasswordRule[];
}>();
</script>

<template>
  <!-- Use min-height to prevent layout shift when checklist appears/disappears -->
  <div class="min-h-[90px]">
    <ul v-show="rules.length" class="app-password-checklist">
      <li
        v-for="rule in rules"
        :key="rule.key"
        class="flex items-center gap-2 text-xs leading-relaxed"
        :class="rule.met ? 'text-success' : 'text-smoke'"
      >
        <span class="grid h-3.5 w-3.5 shrink-0 place-items-center">
          <svg
            v-if="rule.met"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 16 16"
            fill="currentColor"
            class="h-3.5 w-3.5"
          >
            <path
              fill-rule="evenodd"
              d="M12.416 3.376a.75.75 0 0 1 .208 1.04l-5 7.5a.75.75 0 0 1-1.154.114l-3-3a.75.75 0 0 1 1.06-1.06l2.353 2.353 4.493-6.74a.75.75 0 0 1 1.04-.207Z"
              clip-rule="evenodd"
            />
          </svg>
          <span
            v-else
            class="block h-1.5 w-1.5 rounded-full bg-current opacity-40"
          />
        </span>
        {{ rule.label }}
      </li>
    </ul>
  </div>
</template>