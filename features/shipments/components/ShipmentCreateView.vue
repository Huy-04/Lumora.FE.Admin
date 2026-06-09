<script setup lang="ts">
import type { ShipmentCreatePageState } from "~/features/shipments/composables/useShipmentCreatePage";

const props = defineProps<{
  page: ShipmentCreatePageState;
}>();

const {
  canCreateShipment,
  errorMessage,
  form,
  pending,
  submit,
} = props.page;
</script>

<template>
  <div class="page-shell">
    <section class="grid max-w-6xl gap-6">
      <AppPanel eyebrow="Create shipment">
        <form class="form-stack" @submit.prevent="submit">
          <div class="grid gap-4 md:grid-cols-2">
            <AppInput
              v-model="form.orderId"
              label="Processing order ID"
              placeholder="Order GUID"
              required
            />
            <AppInput
              v-model="form.shipmentNumber"
              label="Shipment number"
              placeholder="Leave blank to auto-generate"
            />
          </div>

          <AppNotice v-if="errorMessage" tone="danger" title="Create shipment failed">
            {{ errorMessage }}
          </AppNotice>

          <div class="flex justify-end gap-4 border-t border-line pt-5">
            <NuxtLink class="secondary-link min-w-[9rem]" to="/shipments">
              Cancel
            </NuxtLink>
            <AppButton :loading="pending" :disabled="!canCreateShipment" type="submit" class="min-w-[12rem]">
              Create shipment
            </AppButton>
          </div>
        </form>
      </AppPanel>
    </section>
  </div>
</template>
