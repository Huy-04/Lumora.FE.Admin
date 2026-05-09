<script setup lang="ts">
import type { UserResponse } from "~/features/users/types";

const props = defineProps<{
  user: UserResponse;
}>();

const emit = defineEmits<{
  updated: [];
}>();

const authApi = useAuthApi();
const { enumLabel, formatDateTime } = useAuthPresentation();
const { genderOptions } = useAuthOptions();

const form = reactive({
  fullName: "",
  userName: "",
  gender: "Unknown",
  img: "",
});

const savePending = ref(false);
const saveSuccess = ref("");
const saveError = ref("");

const emailVerificationOpen = ref(false);
const emailChangeOpen = ref(false);
const phoneVerificationOpen = ref(false);
const phoneChangeOpen = ref(false);

watch(
  () => props.user,
  (user) => {
    form.fullName = user.fullName;
    form.userName = user.userName;
    form.gender = user.gender || "Unknown";
    form.img = user.img || "";

    if (user.emailStatus === "Verified") {
      emailVerificationOpen.value = false;
    }

    if (user.phoneStatus === "Verified") {
      phoneVerificationOpen.value = false;
    }
  },
  { immediate: true },
);

const submitProfile = async () => {
  savePending.value = true;
  saveSuccess.value = "";
  saveError.value = "";

  try {
    await authApi.updateProfile({
      fullName: form.fullName,
      userName: form.userName,
      gender: form.gender,
      img: form.img,
    });
    saveSuccess.value = "Profile updated.";
    emit("updated");
  } catch (requestError) {
    saveError.value = getProblemMessage(requestError, "Unable to save the profile.");
  } finally {
    savePending.value = false;
  }
};

const statusTone = (value?: string | null) => {
  if (value === "Active" || value === "Verified") return "text-emerald-700 bg-emerald-50 border-emerald-200 dark:text-emerald-200 dark:bg-emerald-400/10 dark:border-emerald-400/20";
  if (value === "Pending" || value === "Unverified") return "text-amber-700 bg-amber-50 border-amber-200 dark:text-amber-200 dark:bg-amber-400/10 dark:border-amber-400/20";
  return "text-red-700 bg-red-50 border-red-200 dark:text-red-200 dark:bg-red-400/10 dark:border-red-400/20";
};

</script>

<template>
  <div class="grid max-w-6xl content-start gap-6">
    <AppPanel
      eyebrow="Personal info"
    >
      <form class="form-stack" @submit.prevent="submitProfile">
        <div class="rounded-[28px] border border-line/70 bg-panel px-4 py-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] dark:bg-panel/80">
          <label class="form-label mb-2 block">Avatar</label>
          <div class="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div class="flex items-center gap-4">
              <div class="h-16 w-16 shrink-0 overflow-hidden rounded-[22px] border border-line bg-pearl">
                <img
                  v-if="form.img"
                  :src="form.img"
                  alt="Avatar"
                  class="h-full w-full object-cover"
                />
                <div v-else class="grid h-full w-full place-items-center text-base font-semibold text-smoke">
                  {{ form.fullName?.trim()?.charAt(0)?.toUpperCase() || "?" }}
                </div>
              </div>
              <div class="min-w-0">
                <p class="text-sm font-semibold text-ink">Profile photo</p>
                <p class="mt-1 text-sm leading-6 text-smoke">
                  Manage presets or a custom image URL on a dedicated page so the full avatar editor has enough room.
                </p>
              </div>
            </div>
            <NuxtLink class="secondary-link whitespace-nowrap" to="/profile/avatar">
              Manage avatar
            </NuxtLink>
          </div>
        </div>

        <div class="grid gap-3 md:grid-cols-2">
          <AppInput :model-value="user.email" disabled label="Email">
            <template #suffix>
              <AppButton
                class="!min-h-[26px] !px-3 !py-0 text-[11px]"
                variant="secondary"
                @click="emailChangeOpen = true"
              >
                Change
              </AppButton>
            </template>
          </AppInput>
          <AppInput :model-value="user.phone || ''" disabled label="Phone">
            <template #suffix>
              <AppButton
                class="!min-h-[26px] !px-3 !py-0 text-[11px]"
                variant="secondary"
                @click="phoneChangeOpen = true"
              >
                Change
              </AppButton>
            </template>
          </AppInput>
        </div>

        <div class="grid gap-4 md:grid-cols-3">
          <AppInput :model-value="enumLabel(user.userStatus)" disabled label="Account status" />
          <AppInput :model-value="enumLabel(user.emailStatus)" disabled label="Email status">
            <template v-if="user.emailStatus === 'Unverified'" #suffix>
              <AppButton
                class="!min-h-[26px] !px-3 !py-0 text-[11px]"
                variant="secondary"
                @click="emailVerificationOpen = true"
              >
                Verify now
              </AppButton>
            </template>
          </AppInput>
          <AppInput :model-value="enumLabel(user.phoneStatus)" disabled label="Phone status">
            <template v-if="user.phone && user.phoneStatus === 'Unverified'" #suffix>
              <AppButton
                class="!min-h-[26px] !px-3 !py-0 text-[11px]"
                variant="secondary"
                @click="phoneVerificationOpen = true"
              >
                Verify now
              </AppButton>
            </template>
          </AppInput>
        </div>

        <div class="grid gap-4 md:grid-cols-3">
          <AppInput v-model="form.fullName" label="Full name" />
          <AppInput v-model="form.userName" label="Username" />
          <AppSelect v-model="form.gender" label="Gender" :options="genderOptions" />
        </div>

        <AppNotice v-if="saveSuccess" tone="success" title="Profile updated">
          {{ saveSuccess }}
        </AppNotice>
        <AppNotice v-if="saveError" tone="danger" title="Profile update failed">
          {{ saveError }}
        </AppNotice>

        <div class="panel-action-row">
          <AppButton :loading="savePending" type="submit">Save profile</AppButton>
        </div>
      </form>
    </AppPanel>

    <ProfileEmailChangePanel
      :open="emailChangeOpen"
      :user="user"
      @close="emailChangeOpen = false"
      @updated="emit('updated')"
    />
    <ProfileEmailVerificationPanel
      :open="emailVerificationOpen"
      :user="user"
      @close="emailVerificationOpen = false"
      @updated="emit('updated')"
    />
    <ProfilePhoneChangePanel
      :open="phoneChangeOpen"
      :user="user"
      @close="phoneChangeOpen = false"
      @updated="emit('updated')"
    />
    <ProfilePhoneVerificationPanel
      :open="phoneVerificationOpen"
      :user="user"
      @close="phoneVerificationOpen = false"
      @updated="emit('updated')"
    />
  </div>
</template>
