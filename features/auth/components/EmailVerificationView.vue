<script setup lang="ts">
import type { EmailVerificationPage } from "~/features/auth/composables/useEmailVerificationPage";

const props = defineProps<{
  page: EmailVerificationPage;
}>();

const { form, pending, resendPending, successMessage, errorMessage, resendHelper, resendRemainingSeconds, currentUserId, resendLabel, submit, resend } = props.page;
</script>

<template>
  <div class="auth-form-shell">
    <section class="auth-form-section">
      <div class="grid gap-3">
        <p class="hairline-kicker">Email OTP</p>
        <h2 class="text-[2rem] font-medium tracking-tight text-ink">Verify the account email</h2>
        <p class="text-sm leading-relaxed text-smoke">
          Enter the latest verification code that was sent to the email inbox for this account.
        </p>
      </div>

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
    </section>
  </div>
</template>
