<script setup lang="ts">
import type { ForgotPasswordPage } from "~/features/auth/composables/useForgotPasswordPage";

const props = defineProps<{
  page: ForgotPasswordPage;
}>();

const { form, pending, successMessage, errorMessage, emailError, submit } = props.page;
</script>

<template>
  <section class="auth-form-section">
    <header class="grid gap-3">
      <p class="hairline-kicker">Password reset</p>
      <h2 class="text-[2rem] font-medium tracking-tight text-ink">
        Forgot password
      </h2>
      <p class="text-sm leading-relaxed text-smoke">
        Enter your email to get a reset code.
      </p>
    </header>

    <form class="auth-form-grid" @submit.prevent="submit">
      <AppInput
        v-model="form.email"
        label="Email"
        placeholder="name@company.com"
        type="email"
        autocomplete="email"
        required
        :error="emailError"
      />

      <AppNotice v-if="successMessage" tone="success" title="Recovery requested">
        {{ successMessage }}
      </AppNotice>

      <AppNotice v-else-if="errorMessage" tone="danger" title="Request failed">
        {{ errorMessage }}
      </AppNotice>

      <div class="flex items-center justify-between">
        <AppButton :loading="pending" type="submit">
          {{ successMessage ? "Send another code" : "Send recovery code" }}
        </AppButton>
        <NuxtLink class="text-sm font-medium text-smoke hover:text-ink transition-colors" to="/auth/login">Back to login</NuxtLink>
      </div>
    </form>
  </section>
</template>
