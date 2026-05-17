<script setup lang="ts">
import { useScopedPageBreadcrumbs } from "~/Shared/composables/usePageBreadcrumbs";
import type { UserAddressEditPage } from "~/features/users/composables/useUserAddressEditPage";

const props = defineProps<{
  page: UserAddressEditPage;
}>();

const {
  error,
  pending,
  data,
  userId,
  form,
  userAddressTypeOptions,
  provinceOptions,
  districtOptions,
  wardOptions,
  selectedProvinceId,
  selectedDistrictId,
  provincesLoading,
  districtsLoading,
  wardsLoading,
  onProvinceChange,
  onDistrictChange,
  onWardChange,
  saveAddress,
  actionPending,
  actionError,
} = props.page;

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
      <section v-if="pending" class="detail-stack">
        <div class="soft-card h-72 animate-pulse" />
      </section>

      <section v-else class="grid max-w-6xl content-start gap-6">
        <AppPanel eyebrow="Edit address">
          <form class="form-stack" @submit.prevent="saveAddress">
            <div class="grid gap-4 md:grid-cols-2">
              <AppInput v-model="form.fullName" label="Full name" required />
              <AppInput v-model="form.phone" label="Phone" required />
            </div>

            <div class="grid gap-4 md:grid-cols-2">
              <AppSearchSelect
                :model-value="selectedProvinceId ?? ''"
                label="Province / City"
                :options="provinceOptions"
                :loading="provincesLoading"
                placeholder="Type to search province"
                required
                @update:model-value="onProvinceChange($event)"
              />
              <AppSearchSelect
                :model-value="selectedDistrictId ?? ''"
                label="District"
                :options="districtOptions"
                :disabled="!selectedProvinceId"
                :loading="districtsLoading"
                placeholder="Type to search district"
                required
                @update:model-value="onDistrictChange($event)"
              />
            </div>

            <div class="grid gap-4 md:grid-cols-2">
              <AppSearchSelect
                :model-value="form.ghnWardCode || ''"
                label="Ward"
                :options="wardOptions"
                :disabled="!selectedDistrictId"
                :loading="wardsLoading"
                placeholder="Type to search ward"
                required
                @update:model-value="onWardChange($event)"
              />
              <AppSelect v-model="form.addressType" label="Address type" :options="userAddressTypeOptions" />
            </div>

            <AppInput v-model="form.street" label="Street / House number" required />

            <label class="choice-row">
              <input v-model="form.isDefault" type="checkbox" class="h-4 w-4 rounded border-line text-ink focus:ring-ember/20" />
              Set as default address
            </label>

            <div class="flex justify-end gap-4 border-t border-line pt-5">
              <NuxtLink class="secondary-link min-w-[9rem]" :to="{ path: `/users/${userId}`, query: { tab: 'addresses' } }">
                Cancel
              </NuxtLink>
              <AppButton :loading="actionPending" type="submit" class="min-w-[12rem]">
                Save changes
              </AppButton>
            </div>

            <AppNotice v-if="actionError" tone="danger" title="Update failed">
              {{ actionError }}
            </AppNotice>
          </form>
        </AppPanel>
      </section>
    </template>
  </div>
</template>
