<script setup lang="ts">
import { PhArrowClockwise } from "@phosphor-icons/vue";
import type { ShipmentDetailPageState } from "~/features/shipments/composables/useShipmentDetailPage";

const props = defineProps<{
  page: ShipmentDetailPageState;
}>();

const {
  actionError,
  actionPending,
  actionSuccess,
  canSubmitShipment,
  error,
  isDraft,
  lifecycleStats,
  loadErrorMessage,
  pending,
  refresh,
  shipment,
  submitForm,
  submitOpen,
  submitShipment,
} = props.page;
</script>

<template>
  <div class="page-shell">
    <AppPanel
      v-if="shipment"
      eyebrow="Shipment detail"
      :title="shipment.shipmentNumber"
      description="Shipment submit calls GHN through the backend. Status sync controls are intentionally not exposed here."
    >
      <div class="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div class="flex flex-wrap gap-2">
          <AppBadge :tone="shipment.status === 'Delivered' ? 'success' : shipment.status === 'Cancelled' ? 'danger' : shipment.status === 'Draft' ? 'warning' : 'default'">
            {{ shipment.status }}
          </AppBadge>
          <AppBadge>{{ shipment.carrier }}</AppBadge>
          <AppBadge v-if="shipment.carrierOrderCode">{{ shipment.carrierOrderCode }}</AppBadge>
        </div>
        <div class="flex flex-wrap gap-2">
          <AppButton aria-label="Reload shipment" icon-only variant="secondary" @click="refresh">
            <PhArrowClockwise color="#171c1a" :size="22" weight="bold" />
          </AppButton>
          <AppButton v-if="canSubmitShipment && isDraft" variant="primary" @click="submitOpen = !submitOpen">
            Submit to GHN
          </AppButton>
        </div>
      </div>

      <AppNotice v-if="actionSuccess" class="mt-6" tone="success" title="Shipment updated">
        {{ actionSuccess }}
      </AppNotice>
      <AppNotice v-if="actionError" class="mt-6" tone="danger" title="Shipment action failed">
        {{ actionError }}
      </AppNotice>
    </AppPanel>

    <AppNotice v-if="error" tone="danger" title="Unable to load shipment">
      {{ loadErrorMessage }}
    </AppNotice>

    <div v-if="pending" class="soft-card h-64 animate-pulse" />

    <template v-else-if="shipment">
      <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-6">
        <AppStat v-for="stat in lifecycleStats" :key="stat.label" :label="stat.label" :value="stat.value" :detail="stat.detail" />
      </div>

      <AppPanel v-if="submitOpen && canSubmitShipment && isDraft" title="Submit to GHN" description="All fields are optional overrides. Backend still builds the canonical payload from order and warehouse data.">
        <form class="grid gap-4 lg:grid-cols-2" @submit.prevent="submitShipment">
          <AppInput v-model="submitForm.requiredNote" label="Required note" placeholder="CHOTHUHANG, CHOXEMHANGKHONGTHU, KHONGCHOXEMHANG" />
          <AppInput v-model="submitForm.content" label="Content" placeholder="Package content" />
          <AppInput v-model="submitForm.insuranceValue" label="Insurance value" type="number" />
          <AppInput v-model="submitForm.returnPhone" label="Return phone" />
          <AppInput v-model="submitForm.returnDistrictId" label="Return district id" type="number" />
          <AppInput v-model="submitForm.returnWardCode" label="Return ward code" />
          <AppInput v-model="submitForm.pickStationId" label="Pick station id" />
          <AppInput v-model="submitForm.deliverStationId" label="Deliver station id" />
          <AppInput v-model="submitForm.pickShift" class="lg:col-span-2" label="Pick shift" placeholder="Comma-separated shift ids" />
          <AppTextarea v-model="submitForm.returnAddress" label="Return address" class="lg:col-span-2" />
          <AppTextarea v-model="submitForm.note" label="Carrier note" class="lg:col-span-2" />
          <div class="flex flex-wrap justify-end gap-3 lg:col-span-2">
            <AppButton variant="secondary" :disabled="actionPending !== ''" @click="submitOpen = false">
              Cancel
            </AppButton>
            <AppButton :loading="actionPending === 'submit'" type="submit">
              Submit shipment
            </AppButton>
          </div>
        </form>
      </AppPanel>

      <div class="grid gap-6 xl:grid-cols-[1fr_420px]">
        <AppPanel title="Shipment identity" description="Local shipment data and linked order context.">
          <div class="grid gap-3 text-sm">
            <p><span class="text-smoke">Shipment id:</span> {{ shipment.id }}</p>
            <p><span class="text-smoke">Order id:</span> {{ shipment.orderId }}</p>
            <p><span class="text-smoke">Carrier:</span> {{ shipment.carrier }}</p>
            <p><span class="text-smoke">Carrier order:</span> {{ shipment.carrierOrderCode ?? "Not submitted" }}</p>
            <p><span class="text-smoke">Created:</span> {{ new Date(shipment.createdAt).toLocaleString() }}</p>
            <p><span class="text-smoke">Updated:</span> {{ new Date(shipment.updatedAt).toLocaleString() }}</p>
          </div>
        </AppPanel>

        <AppPanel title="Timestamps" description="Carrier lifecycle timestamps stored by backend.">
          <div class="grid gap-3 text-sm">
            <p><span class="text-smoke">Submitted:</span> {{ shipment.submittedAt ? new Date(shipment.submittedAt).toLocaleString() : "Pending" }}</p>
            <p><span class="text-smoke">Picked:</span> {{ shipment.pickedAt ? new Date(shipment.pickedAt).toLocaleString() : "Pending" }}</p>
            <p><span class="text-smoke">Delivered:</span> {{ shipment.deliveredAt ? new Date(shipment.deliveredAt).toLocaleString() : "Pending" }}</p>
            <p><span class="text-smoke">Returned:</span> {{ shipment.returnedAt ? new Date(shipment.returnedAt).toLocaleString() : "Pending" }}</p>
            <p><span class="text-smoke">Cancelled:</span> {{ shipment.cancelledAt ? new Date(shipment.cancelledAt).toLocaleString() : "Pending" }}</p>
          </div>
        </AppPanel>
      </div>

      <AppPanel v-if="shipment.cancellation" title="Cancellation" description="Stored cancellation metadata.">
        <p class="text-sm text-smoke">{{ shipment.cancellation.reason }}</p>
      </AppPanel>
    </template>
  </div>
</template>
