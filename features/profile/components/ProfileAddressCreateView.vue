<script setup lang="ts">
import { useScopedPageBreadcrumbs } from "~/Shared/composables/usePageBreadcrumbs";
import type { ProfileAddressCreatePageState } from "~/features/profile/composables/useProfileAddressCreatePage";

const props = defineProps<{
  page: ProfileAddressCreatePageState;
}>();

const {
  form,
  userAddressTypeOptions,
  provinceOptions,
  districtOptions,
  wardOptions,
  selectedProvinceId,
  selectedDistrictId,
  onProvinceChange,
  onDistrictChange,
  onWardChange,
  saveAddress,
  actionPending,
  actionError,
} = props.page;

useScopedPageBreadcrumbs(() => [
  { label: "Profile", to: "/profile" },
  { label: "Addresses", to: "/profile?tab=addresses" },
  { label: "Add address" },
]);
</script>

<template>
  <div class="detail-shell">
    <section class="grid max-w-6xl content-start gap-6">
      <AppPanel eyebrow="Add address">
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
              placeholder="Type to search province"
              required
              @update:model-value="onProvinceChange($event)"
            />
            <AppSearchSelect
              :model-value="selectedDistrictId ?? ''"
              label="District"
              :options="districtOptions"
              placeholder="Type to search district"
              :disabled="!selectedProvinceId"
              required
              @update:model-value="onDistrictChange($event)"
            />
          </div>

          <div class="grid gap-4 md:grid-cols-2">
            <AppSearchSelect
              :model-value="form.ghnWardCode || ''"
              label="Ward"
              :options="wardOptions"
              placeholder="Type to search ward"
              :disabled="!selectedDistrictId"
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
            <NuxtLink class="secondary-link min-w-[9rem]" :to="{ path: '/profile', query: { tab: 'addresses' } }">
              Cancel
            </NuxtLink>
            <AppButton :loading="actionPending" type="submit" class="min-w-[12rem]">Add address</AppButton>
          </div>

          <AppNotice v-if="actionError" tone="danger" title="Address action failed">
            {{ actionError }}
          </AppNotice>
        </form>
      </AppPanel>
    </section>
  </div>
</template>
