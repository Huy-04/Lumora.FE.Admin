<script setup lang="ts">
import type { UserCreatePage } from "~/features/users/composables/useUserCreatePage";

const props = defineProps<{
  page: UserCreatePage;
}>();

const { form, pending, passwordRules, errorMessage, phoneRegionOptions, genderOptions, submit } = props.page;
</script>

<template>
  <div class="page-shell">
    <section class="max-w-4xl">
      <AppPanel eyebrow="Create user" title="Create user" description="Create a user record with the same local-password contract used by the backend API.">
        <form class="form-stack" @submit.prevent="submit">
          <AppInput v-model="form.fullName" label="Full name" placeholder="John Doe" />
          <AppInput v-model="form.email" label="Email" placeholder="john.doe@lumora.vn" />
          <AppInput v-model="form.userName" label="Username" placeholder="johndoe" />
          <div class="grid gap-4 md:grid-cols-[minmax(9rem,0.55fr)_minmax(0,1fr)]">
            <AppSelect v-model="form.phoneRegion" label="Phone region" :options="phoneRegionOptions" />
            <AppInput v-model="form.phone" label="Phone number" placeholder="0901234567" />
          </div>
          <div class="grid gap-4 md:grid-cols-2">
            <AppSelect v-model="form.gender" label="Gender" :options="genderOptions" />
            <AppInput v-model="form.img" label="Image URL" placeholder="https://..." />
          </div>
          <AppInput v-model="form.password" label="Password" type="password" placeholder="SecurePassword123!" />
          <AppPasswordChecklist v-if="form.password" :rules="passwordRules" />

          <AppNotice v-if="errorMessage" tone="danger" title="Create user failed">
            {{ errorMessage }}
          </AppNotice>

          <div class="panel-action-row">
            <AppButton :loading="pending" type="submit">Create user</AppButton>
            <NuxtLink class="secondary-link" to="/users">
              Back to users
            </NuxtLink>
          </div>
        </form>
      </AppPanel>
    </section>
  </div>
</template>
