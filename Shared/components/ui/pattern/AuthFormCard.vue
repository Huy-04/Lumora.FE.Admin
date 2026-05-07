<script setup lang="ts">
defineProps<{
  eyebrow: string;
  title: string;
  description: string;
}>();
</script>

<template>
  <section class="auth-form-section auth-login-card">
    <header class="grid gap-3">
      <p class="hairline-kicker">{{ eyebrow }}</p>
      <h2 class="text-[2rem] font-medium tracking-tight text-ink">
        {{ title }}
      </h2>
      <p class="text-sm leading-relaxed text-smoke">
        {{ description }}
      </p>
    </header>

    <slot />
  </section>
</template>
