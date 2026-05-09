<script setup lang="ts">
import type { UserResponse } from "~/features/users/types";

const props = defineProps<{
  user: UserResponse;
}>();

const usersApi = useUsersAdminApi();

const pending = ref(false);
const errorMessage = ref("");
const successMessage = ref("");
const adminPassword = ref("");
const { rules: passwordRules } = usePasswordRules(adminPassword);

const submit = async () => {
  if (!adminPassword.value.trim()) {
    errorMessage.value = "Please enter a new password.";
    return;
  }

  pending.value = true;
  errorMessage.value = "";
  successMessage.value = "";

  try {
    await usersApi.adminSetPassword(props.user.id, { password: adminPassword.value });
    adminPassword.value = "";
    successMessage.value = "Password has been set successfully.";
  } catch (requestError) {
    errorMessage.value = getProblemMessage(requestError, "Unable to set the password.");
  } finally {
    pending.value = false;
  }
};
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
