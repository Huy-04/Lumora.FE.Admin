<script setup lang="ts">
import type { UserResponse } from "~/features/users/types";

const props = defineProps<{
  user: UserResponse;
}>();

const {
  adminPassword,
  errorMessage,
  passwordRules,
  pending,
  submit,
  successMessage,
} = useUserPasswordTab(() => props.user);
</script>

<template>
  <div class="grid max-w-6xl content-start gap-6">
    <AppPanel eyebrow="Password">
      <form class="grid gap-5" @submit.prevent="submit">
        <AppInput v-model="adminPassword" label="New password" type="password" placeholder="Enter new password" required />
        <AppPasswordChecklist v-if="adminPassword" :rules="passwordRules" />

        <AppNotice v-if="errorMessage" tone="danger" title="Password action failed">
          {{ errorMessage }}
        </AppNotice>

        <div class="flex justify-end border-t border-line pt-5">
          <AppButton :loading="pending" type="submit">Set password</AppButton>
        </div>
      </form>

      <AppNotice v-if="successMessage" tone="success" title="Password updated" class="mt-4">
        {{ successMessage }}
      </AppNotice>
    </AppPanel>
  </div>
</template>
