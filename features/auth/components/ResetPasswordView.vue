<script setup lang="ts">
import type { ResetPasswordPage } from "~/features/auth/composables/useResetPasswordPage";

const props = defineProps<{
  page: ResetPasswordPage;
}>();

const { form, step, pending, resendPending, successMessage, errorMessage, emailError, resetCodeError, passwordError, passwordRules, resendHelper, resendRemainingSeconds, resendLabel, requestCode, verifyCode, completeReset, resend } = props.page;
</script>

<template>
  <section class="auth-form-section">
    <header class="grid gap-3">
      <p class="hairline-kicker">Password reset</p>
      <h2 class="text-[2rem] font-medium tracking-tight text-ink">
        {{ step === "request"
          ? "Reset your password"
          : step === "verify"
            ? "Verify the reset code"
            : step === "complete"
              ? "Choose a new password"
              : "Password updated" }}
      </h2>
      <p class="text-sm leading-relaxed text-smoke">
        {{ step === "request"
          ? "Enter the email linked to your account and we'll send a reset code."
          : step === "verify"
            ? "Enter the code that was sent to your email inbox."
            : step === "complete"
              ? "Code confirmed. Set your new password below."
              : "Your password has been updated successfully." }}
      </p>
    </header>

    <!-- ── Step 1: Request ── -->
    <template v-if="step === 'request'">
      <form class="auth-form-grid" @submit.prevent="requestCode">
        <AppInput
          v-model="form.email"
          label="Email"
          placeholder="name@company.com"
          type="email"
          autocomplete="email"
          required
          :error="emailError"
        />

        <AppNotice v-if="successMessage" tone="success" title="Code sent">
          {{ successMessage }}
        </AppNotice>
        <AppNotice v-if="errorMessage" tone="danger" title="Request failed">
          {{ errorMessage }}
        </AppNotice>

        <AppButton :loading="pending" block type="submit">Send reset code</AppButton>

        <NuxtLink class="secondary-link justify-self-start" to="/auth/login">Back to login</NuxtLink>
      </form>
    </template>

    <!-- ── Step 2: Verify ── -->
    <template v-else-if="step === 'verify'">
      <form class="auth-form-grid" @submit.prevent="verifyCode">
        <AppInput
          :model-value="form.email"
          disabled
          label="Email"
          type="email"
        />

        <AppOtpInput
          v-model="form.resetCode"
          label="Reset code"
          :helper="resendHelper"
          required
          :error="resetCodeError"
        />

        <AppNotice v-if="successMessage" tone="success" title="Code sent">
          {{ successMessage }}
        </AppNotice>
        <AppNotice v-if="errorMessage" tone="danger" title="Verification failed">
          {{ errorMessage }}
        </AppNotice>

        <div class="grid gap-3 sm:grid-cols-2">
          <AppButton :loading="pending" block type="submit">Verify code</AppButton>
          <AppButton :loading="resendPending" :disabled="resendRemainingSeconds > 0" block type="button" variant="secondary" @click="resend">
            {{ resendLabel }}
          </AppButton>
        </div>
      </form>
    </template>

    <!-- ── Step 3: Complete ── -->
    <template v-else-if="step === 'complete'">
      <form class="auth-form-grid" @submit.prevent="completeReset">
        <AppInput
          v-model="form.newPassword"
          label="New password"
          placeholder="Enter a new password"
          type="password"
          autocomplete="new-password"
          required
          :error="passwordError"
        />
        <AppPasswordChecklist v-if="form.newPassword" :rules="passwordRules" />

        <AppNotice v-if="successMessage" tone="success" title="Code verified">
          {{ successMessage }}
        </AppNotice>
        <AppNotice v-if="errorMessage" tone="danger" title="Reset failed">
          {{ errorMessage }}
        </AppNotice>

        <AppButton :loading="pending" block type="submit">Save new password</AppButton>
      </form>
    </template>

    <!-- ── Step 4: Done ── -->
    <template v-else>
      <AppNotice tone="success" title="Password updated">
        {{ successMessage }}
      </AppNotice>

      <NuxtLink class="secondary-link justify-self-start" to="/auth/login">Back to login</NuxtLink>
    </template>
  </section>
</template>
