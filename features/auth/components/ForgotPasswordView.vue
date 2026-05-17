<script setup lang="ts">
import type { AuthForgotPasswordPageState } from "~/features/auth/composables/useForgotPasswordPage";

const props = defineProps<{
  page: AuthForgotPasswordPageState;
}>();

const { form, pending, successMessage, errorMessage, emailError, submit } = props.page;
</script>

<template>
  <AuthFormCard
    eyebrow="Password reset"
    title="Forgot password"
    description="Enter your email to get a reset code."
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
  </AuthFormCard>
</template>
