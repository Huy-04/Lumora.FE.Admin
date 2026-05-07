<script setup lang="ts">
import { PhShieldCheck } from "@phosphor-icons/vue";
import type { UserResponse } from "~/features/users/types";

const props = defineProps<{
  user: UserResponse;
}>();

const emit = defineEmits<{
  updated: [];
}>();

const authApi = useAuthApi();
const identity = useDeviceIdentity();

const passwordForm = reactive({
  oldPassword: "",
  newPassword: "",
});

const newPasswordRef = computed(() => passwordForm.newPassword);
const { rules: passwordRules } = usePasswordRules(newPasswordRef);

const passwordPending = ref(false);
const passwordSuccess = ref("");
const passwordError = ref("");

const submitPassword = async () => {
  passwordPending.value = true;
  passwordSuccess.value = "";
  passwordError.value = "";

  try {
    await authApi.changePassword({
      oldPassword: passwordForm.oldPassword,
      newPassword: passwordForm.newPassword,
    });
    passwordSuccess.value = "Password changed successfully.";
    passwordForm.oldPassword = "";
    passwordForm.newPassword = "";
  } catch (requestError) {
    passwordError.value = getProblemMessage(requestError, "Unable to change password.");
  } finally {
    passwordPending.value = false;
  }
};

</script>

<template>
  <div class="grid max-w-6xl content-start gap-6">
    <AppPanel
      eyebrow="Sessions"
      title="Session activity"
    >
      <div class="grid gap-4 md:grid-cols-[minmax(0,1fr)_auto] md:items-center">
        <div class="soft-card p-4">
          <div class="flex items-center gap-3">
            <div class="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-line bg-pearl text-ink dark:bg-white/8">
              <PhShieldCheck :size="20" />
            </div>
            <div class="min-w-0">
              <p class="text-sm font-semibold text-ink">{{ identity.deviceName }}</p>
              <p class="text-xs text-smoke">Current device</p>
            </div>
          </div>
        </div>
        <NuxtLink class="secondary-link" to="/profile/sessions">Manage sessions</NuxtLink>
      </div>
    </AppPanel>

    <AppPanel
      eyebrow="Security"
      title="Change password"
      description="Enter your current password and choose a new one."
    >
      <form class="form-stack" @submit.prevent="submitPassword">
        <AppInput
          v-model="passwordForm.oldPassword"
          label="Current password"
          type="password"
          autocomplete="current-password"
          required
        />
        <AppInput
          v-model="passwordForm.newPassword"
          label="New password"
          type="password"
          autocomplete="new-password"
          required
        />
        <AppPasswordChecklist v-if="passwordForm.newPassword" :rules="passwordRules" />

        <AppNotice v-if="passwordSuccess" tone="success" title="Password changed">
          {{ passwordSuccess }}
        </AppNotice>
        <AppNotice v-if="passwordError" tone="danger" title="Password change failed">
          {{ passwordError }}
        </AppNotice>

        <div class="panel-action-row">
          <AppButton :loading="passwordPending" type="submit">Change password</AppButton>
        </div>
      </form>
    </AppPanel>

  </div>
</template>
