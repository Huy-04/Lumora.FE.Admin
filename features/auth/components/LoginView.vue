<script setup lang="ts">
import type { AuthLoginPageState } from "~/features/auth/composables/useLoginPage";

const props = defineProps<{
  page: AuthLoginPageState;
}>();

const { form, pending, errorMessage, sessionExpiredMessage, emailError, passwordError, submit } = props.page;
</script>

<template>
  <AuthFormCard
    eyebrow="Sign in"
    title="Sign in to Lumora Admin"
    description="Use your work email and password."
  >
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
      <AppInput
        v-model="form.password"
        label="Password"
        placeholder="Enter your password"
        type="password"
        autocomplete="current-password"
        required
        :error="passwordError"
      />

      <NuxtLink class="block text-right text-sm font-medium text-deep-champagne hover:text-charcoal" to="/auth/forgot-password">
        Forgot password
      </NuxtLink>

      <AppNotice v-if="errorMessage" tone="danger" title="Sign-in failed">
        {{ errorMessage }}
      </AppNotice>
      <AppNotice v-else-if="sessionExpiredMessage" tone="warning" title="Session expired">
        {{ sessionExpiredMessage }}
      </AppNotice>
      <AppButton :loading="pending" block type="submit">Sign in</AppButton>
    </form>
  </AuthFormCard>
</template>
