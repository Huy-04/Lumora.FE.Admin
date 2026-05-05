<template>
  <div class="auth-layout-grid">
    <section class="auth-stage">
      <header class="auth-stage-header">
        <NuxtLink class="flex items-center gap-3" to="/auth/login">
          <div class="grid h-11 w-11 place-items-center rounded-[18px] border border-line bg-ink text-xs font-semibold tracking-[0.22em] text-cream shadow-[inset_0_1px_0_rgba(255,255,255,0.12)] dark:bg-pearl dark:text-ink">
            L
          </div>
          <div>
            <p class="text-[10px] font-semibold uppercase tracking-[0.24em] text-smoke">Lumora</p>
            <p class="text-base font-semibold tracking-tight text-ink">Admin access</p>
          </div>
        </NuxtLink>

        <span class="subtle-pill">Commerce admin</span>
      </header>

      <main class="auth-stage-main">
        <div class="mx-auto w-full max-w-[420px]">
          <slot />
        </div>
      </main>
    </section>
  </div>
</template>
