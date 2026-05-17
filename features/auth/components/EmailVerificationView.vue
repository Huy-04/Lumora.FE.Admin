<script setup lang="ts">
import type { AuthEmailVerificationPageState } from "~/features/auth/composables/useEmailVerificationPage";

const props = defineProps<{
  page: AuthEmailVerificationPageState;
}>();

const { form, pending, resendPending, successMessage, errorMessage, resendHelper, resendRemainingSeconds, currentUserId, resendLabel, submit, resend } = props.page;
</script>

<template>
  <AuthFormCard
    eyebrow="Email OTP"
    title="Verify the account email"
    description="Enter the latest verification code that was sent to the email inbox for this account."
  >
    <form class="auth-form-grid" @submit.prevent="submit">
      <AppOtpInput
        v-model="form.otp"
        label="One-time code"
        :helper="resendHelper"
        required
      />

      <AppNotice v-if="successMessage" tone="success" title="Email verified">
        {{ successMessage }}
      </AppNotice>

      <AppNotice v-if="errorMessage" tone="danger" title="Verification failed">
        {{ errorMessage }}
      </AppNotice>

      <div class="grid gap-3 sm:grid-cols-2">
        <AppButton :loading="pending" block type="submit">Verify email</AppButton>
        <AppButton :loading="resendPending" :disabled="resendRemainingSeconds > 0 || !currentUserId" block type="button" variant="secondary" @click="resend">
          {{ resendLabel }}
        </AppButton>
      </div>
    </form>
  </AuthFormCard>
</template>
