<script setup lang="ts">
import { PhArrowClockwise } from "@phosphor-icons/vue";
import type { WarehouseDetailPageState } from "~/features/inventory/composables/useWarehouseDetailPage";

const props = defineProps<{
  page: WarehouseDetailPageState;
}>();

const {
  actionError,
  actionPending,
  actionSuccess,
  canUpdateWarehouse,
  error,
  form,
  ghnShopId,
  loadErrorMessage,
  pending,
  refresh,
  syncGhnStore,
  toggleWarehouse,
  updateWarehouse,
  warehouse,
} = props.page;
</script>

<template>
  <div class="page-shell">
    <AppPanel v-if="warehouse" eyebrow="Warehouse detail" :title="warehouse.name" description="Warehouse address and GHN store snapshot are updated through Inventory backend rules.">
      <div class="flex flex-wrap items-center justify-between gap-3">
        <div class="flex flex-wrap gap-2">
          <AppBadge>{{ warehouse.status }}</AppBadge>
          <AppBadge>Code {{ warehouse.code }}</AppBadge>
          <AppBadge>{{ warehouse.ghnStore ? "GHN synced" : "GHN not synced" }}</AppBadge>
        </div>
        <div class="flex flex-wrap gap-2">
          <AppButton aria-label="Reload warehouse" icon-only variant="secondary" @click="refresh">
            <PhArrowClockwise color="#171c1a" :size="22" weight="bold" />
          </AppButton>
          <AppButton v-if="canUpdateWarehouse" variant="secondary" :loading="actionPending === 'toggle'" @click="toggleWarehouse">
            {{ warehouse.status === "Active" ? "Deactivate" : "Activate" }}
          </AppButton>
        </div>
      </div>
      <AppNotice v-if="actionSuccess" class="mt-6" tone="success" title="Warehouse updated">{{ actionSuccess }}</AppNotice>
      <AppNotice v-if="actionError" class="mt-6" tone="danger" title="Warehouse action failed">{{ actionError }}</AppNotice>
    </AppPanel>

    <AppNotice v-if="error" tone="danger" title="Unable to load warehouse">{{ loadErrorMessage }}</AppNotice>
    <div v-if="pending" class="soft-card h-64 animate-pulse" />

    <template v-else-if="warehouse">
      <div class="grid gap-6 xl:grid-cols-[1fr_420px]">
        <AppPanel title="Warehouse form" description="Address updates are sent as a full address bundle.">
          <form class="grid gap-4 md:grid-cols-2" @submit.prevent="updateWarehouse">
            <AppInput v-model="form.name" label="Name" />
            <AppInput v-model="form.phoneNational" label="Phone" />
            <AppInput v-model="form.province" label="Province" />
            <AppInput v-model="form.district" label="District" />
            <AppInput v-model="form.ward" label="Ward" />
            <AppInput v-model="form.street" label="Street" />
            <div class="md:col-span-2">
              <AppButton v-if="canUpdateWarehouse" :loading="actionPending === 'update'" type="submit">
                Save warehouse
              </AppButton>
            </div>
          </form>
        </AppPanel>

        <div class="grid gap-6">
          <AppPanel title="GHN store" description="Sync stores a GHN snapshot on the warehouse record.">
            <div class="grid gap-4">
              <template v-if="warehouse.ghnStore">
                <p class="text-sm"><span class="text-smoke">Shop:</span> {{ warehouse.ghnStore.shopName }}</p>
                <p class="text-sm"><span class="text-smoke">Phone:</span> {{ warehouse.ghnStore.shopPhone }}</p>
                <p class="text-sm"><span class="text-smoke">Address:</span> {{ warehouse.ghnStore.pickupAddress }}</p>
              </template>
              <AppInput v-model.number="ghnShopId" label="GHN shop id" type="number" />
              <AppButton v-if="canUpdateWarehouse" :loading="actionPending === 'sync-ghn'" @click="syncGhnStore">
                Sync GHN store
              </AppButton>
            </div>
          </AppPanel>

          <AppPanel title="Audit trail" description="Administrative authorship and timestamps.">
            <div class="grid gap-3 text-sm">
              <p><span class="text-smoke">Created:</span> {{ new Date(warehouse.createdAt).toLocaleString() }}</p>
              <p><span class="text-smoke">Updated:</span> {{ new Date(warehouse.updatedAt).toLocaleString() }}</p>
            </div>
          </AppPanel>
        </div>
      </div>
    </template>
  </div>
</template>
