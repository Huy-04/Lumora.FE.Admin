<script setup lang="ts">
import type { WarehouseCreatePageState } from "~/features/warehouses/composables/useWarehouseCreatePage";

const PHONE_NATIONAL_PATTERN = /^0\d{9}$/;

const props = defineProps<{
  page: WarehouseCreatePageState;
}>();

const {
  form,
  pending,
  errorMessage,
  warehouseCodeOptions,
  provinces,
  districts,
  wards,
  provincesLoading,
  districtsLoading,
  wardsLoading,
  submit,
} = props.page;

const phoneError = computed(() => {
  if (!form.phoneNational) return "";
  return PHONE_NATIONAL_PATTERN.test(form.phoneNational)
    ? ""
    : "Phone must be in national format (e.g. 0901234567).";
});
</script>

<template>
  <div class="page-shell">
    <section class="grid max-w-6xl gap-6">
      <AppPanel eyebrow="Create warehouse">
        <form class="form-stack" @submit.prevent="submit">
          <div class="grid gap-4 md:grid-cols-2">
            <AppSelect
              v-model="form.code"
              label="Warehouse code"
              :options="warehouseCodeOptions"
            />
            <AppInput v-model="form.name" label="Name" placeholder="Warehouse name" />
          </div>

          <div class="grid gap-4 md:grid-cols-2">
            <AppInput
              v-model="form.phoneNational"
              label="Phone"
              placeholder="Phone number"
              inputmode="tel"
              :error="phoneError"
            />
          </div>

          <div class="grid gap-4 md:grid-cols-2">
            <AppSearchSelect
              v-model="form.provinceId"
              label="Province"
              :options="provinces"
              :loading="provincesLoading"
              placeholder="Type to search province"
            />
            <AppSearchSelect
              v-model="form.districtId"
              label="District"
              :options="districts"
              :disabled="!form.provinceId"
              :loading="districtsLoading"
              placeholder="Type to search district"
            />
          </div>

          <div class="grid gap-4 md:grid-cols-2">
            <AppSearchSelect
              v-model="form.wardCode"
              label="Ward"
              :options="wards"
              :disabled="!form.districtId"
              :loading="wardsLoading"
              placeholder="Type to search ward"
            />
            <AppInput v-model="form.street" label="Street" placeholder="House number, street name" />
          </div>

          <AppNotice v-if="errorMessage" tone="danger" title="Create warehouse failed">
            {{ errorMessage }}
          </AppNotice>

          <div class="flex justify-end gap-4 border-t border-line pt-5">
            <NuxtLink class="secondary-link min-w-[9rem]" to="/warehouses">
              Cancel
            </NuxtLink>
            <AppButton :loading="pending" type="submit" class="min-w-[12rem]">Create warehouse</AppButton>
          </div>
        </form>
      </AppPanel>
    </section>
  </div>
</template>
