<script setup lang="ts">
import { useScopedPageBreadcrumbs } from "~/Shared/composables/usePageBreadcrumbs";
import type { UserAddressEditPage } from "~/features/users/composables/useUserAddressEditPage";

const props = defineProps<{
  page: UserAddressEditPage;
}>();

const { error, pending, data, userId, form, userAddressTypeOptions, saveAddress, actionPending, actionError } = props.page;

useScopedPageBreadcrumbs(() =>
  data.value
    ? [
        { label: "Users", to: "/users" },
        { label: data.value.user.fullName, to: `/users/${userId.value}` },
        { label: "Addresses", to: `/users/${userId.value}?tab=addresses` },
        { label: "Edit address" },
      ]
    : [],
);
</script>

<template>
  <div class="detail-shell">
    <AppNotice v-if="error" tone="danger" title="Unable to load address">
      {{ getProblemMessage(error, "The address record could not be loaded.") }}
    </AppNotice>

    <template v-else>
      <section v-if="!pending && data" class="detail-header">
        <div class="detail-crumbs">
          <NuxtLink class="detail-crumb-link" to="/">Auth</NuxtLink>
          <span>/</span>
          <NuxtLink class="detail-crumb-link" to="/users">Users</NuxtLink>
          <span>/</span>
          <NuxtLink class="detail-crumb-link" :to="{ path: `/users/${userId}`, query: { tab: 'addresses' } }">
            Addresses
          </NuxtLink>
        </div>
        <div class="grid gap-2">
          <h1 class="detail-title">Edit address</h1>
          <p class="detail-copy">
            Update the saved address for {{ data.user.fullName }}.
          </p>
        </div>
      </section>

      <section v-if="pending" class="detail-stack">
        <div class="soft-card h-72 animate-pulse" />
      </section>

      <section v-else class="detail-stack">
        <AppPanel title="Address form" description="Update this user-address record and keep the default flag in sync.">
          <form class="form-stack" @submit.prevent="saveAddress">
            <div class="grid gap-4 md:grid-cols-2">
              <AppInput v-model="form.fullName" label="Full name" />
              <AppInput v-model="form.phone" label="Phone" />
            </div>

            <div class="grid gap-4 md:grid-cols-2">
              <AppInput v-model="form.province" label="Province" />
              <AppInput v-model="form.district" label="District" />
            </div>

            <div class="grid gap-4 md:grid-cols-2">
              <AppInput v-model="form.ward" label="Ward" />
              <AppSelect v-model="form.addressType" label="Address type" :options="userAddressTypeOptions" />
            </div>

            <AppInput v-model="form.street" label="Street" />

            <label class="choice-row">
              <input v-model="form.isDefault" type="checkbox" class="h-4 w-4 rounded border-line text-ink focus:ring-ember/20" />
              Set as default address
            </label>

            <div class="panel-action-row">
              <AppButton :loading="actionPending" type="submit">Save address</AppButton>
              <NuxtLink class="secondary-link" :to="{ path: `/users/${userId}`, query: { tab: 'addresses' } }">
                Back to addresses
              </NuxtLink>
            </div>
          </form>

          <AppNotice v-if="actionError" tone="danger" title="Address action failed">
            {{ actionError }}
          </AppNotice>
        </AppPanel>
      </section>
    </template>
  </div>
</template>
