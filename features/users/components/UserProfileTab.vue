<script setup lang="ts">
import type { UserResponse } from "~/features/users/types";

const props = defineProps<{
  user: UserResponse;
}>();

const emit = defineEmits<{
  refresh: [];
}>();

const {
  actionError,
  actionPending,
  actionSuccess,
  genderOptions,
  phoneRegionOptions,
  submitUpdate,
  updateForm,
  userStatusOptions,
  verificationStatusOptions,
} = useUserProfileTab(props, () => emit("refresh"));
</script>

<template>
  <div class="grid gap-6 content-start max-w-6xl">
    <AppPanel eyebrow="Edit user">
      <form class="form-stack" @submit.prevent="submitUpdate">
        <div class="grid gap-4 md:grid-cols-2">
          <AppInput v-model="updateForm.fullName" label="Full name" />
          <AppInput v-model="updateForm.userName" label="Username (Optional)" />
        </div>

        <div class="grid gap-4 md:grid-cols-2">
          <AppInput v-model="updateForm.email" label="Email" type="email" />
          <div class="grid gap-4 md:grid-cols-[minmax(9rem,0.55fr)_minmax(0,1fr)]">
            <AppSelect v-model="updateForm.phoneRegion" label="Phone region" :options="phoneRegionOptions" />
            <AppInput v-model="updateForm.phone" label="Phone number" type="tel" />
          </div>
        </div>

        <div class="grid gap-4 md:grid-cols-2">
          <AppSelect v-model="updateForm.gender" label="Gender" :options="genderOptions" />
          <AppSelect v-model="updateForm.userStatus" label="Account status" :options="userStatusOptions" />
        </div>

        <div class="grid gap-4 md:grid-cols-2">
          <AppSelect v-model="updateForm.emailStatus" label="Email verification" :options="verificationStatusOptions" />
          <AppSelect v-model="updateForm.phoneStatus" label="Phone verification" :options="verificationStatusOptions" />
        </div>

        <AppInput v-model="updateForm.img" label="Avatar URL" />

        <div class="flex justify-end border-t border-line pt-5">
          <AppButton :loading="actionPending" type="submit">Save changes</AppButton>
        </div>

        <AppNotice v-if="actionSuccess" tone="success" title="Update completed">
          {{ actionSuccess }}
        </AppNotice>

        <AppNotice v-if="actionError" tone="danger" title="Update failed">
          {{ actionError }}
        </AppNotice>
      </form>
    </AppPanel>
  </div>
</template>
