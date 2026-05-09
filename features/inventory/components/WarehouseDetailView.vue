<script setup lang="ts">
import AppDetailMetaPanel from "~/Shared/components/ui/pattern/AppDetailMetaPanel.vue";
import { useScopedPageBreadcrumbs } from "~/Shared/composables/usePageBreadcrumbs";
import type { WarehouseDetailPageState } from "~/features/inventory/composables/useWarehouseDetailPage";

const props = defineProps<{
  page: WarehouseDetailPageState;
}>();

const {
  actionError,
  actionPending,
  activeTab,
  canUpdateWarehouse,
  error,
  form,
  ghnShopId,
  loadErrorMessage,
  pending,
  selectTab,
  syncGhnStore,
  toggleWarehouse,
  updateWarehouse,
  warehouse,
  warehouseId,
  warehouseTabs,
} = props.page;

const { formatDateTime } = useAuthPresentation();

const selectWarehouseTab = (tab: string) => {
  selectTab(tab as typeof activeTab.value);
};

const activeTabLabel = computed(() =>
  warehouseTabs.value.find((tab) => tab.value === activeTab.value)?.label ?? "Overview",
);

useScopedPageBreadcrumbs(() =>
  warehouse.value
    ? [
        { label: "Warehouses", to: "/warehouses" },
        { label: warehouse.value.name, to: `/warehouses/${warehouseId.value}` },
        { label: activeTabLabel.value },
      ]
    : [],
);

const actionErrorOpen = computed(() => actionError.value.length > 0);

const closeActionError = () => {
  actionError.value = "";
};
</script>

<template>
  <AppDetailPage
    :title="warehouse?.name ?? ''"
    :tabs="warehouseTabs"
    :active-tab="activeTab"
    :pending="pending"
    :error="error ? loadErrorMessage : null"
    error-title="Unable to load warehouse"
    @select-tab="selectWarehouseTab"
  >
    <template #modals>
      <AppConfirm
        :open="actionErrorOpen"
        title="Warehouse action failed"
        :detail="actionError"
        cancel-label="Close"
        tone="danger"
        hide-confirm
        @cancel="closeActionError"
      />
    </template>

    <template v-if="warehouse">
      <div v-if="activeTab === 'overview'" class="grid gap-6 content-start max-w-6xl">
        <AppDetailMetaPanel eyebrow="Warehouse details">
          <div class="flex items-baseline gap-4 py-3">
            <dt class="meta-label w-40 shrink-0">Name</dt>
            <dd class="text-sm font-medium text-ink">{{ warehouse.name }}</dd>
          </div>
          <div class="flex items-baseline gap-4 py-3">
            <dt class="meta-label w-40 shrink-0">Warehouse ID</dt>
            <dd class="break-all text-xs font-mono text-smoke">{{ warehouse.id }}</dd>
          </div>
          <div class="flex items-baseline gap-4 py-3">
            <dt class="meta-label w-40 shrink-0">Code</dt>
            <dd class="text-sm font-medium text-ink">{{ warehouse.code }}</dd>
          </div>
          <div class="flex items-baseline gap-4 py-3">
            <dt class="meta-label w-40 shrink-0">Status</dt>
            <dd class="flex flex-wrap gap-2">
              <AppBadge :tone="warehouse.status === 'Active' ? 'success' : 'default'">
                {{ warehouse.status }}
              </AppBadge>
              <AppBadge :tone="warehouse.ghnStore ? 'success' : 'warning'">
                {{ warehouse.ghnStore ? "GHN synced" : "GHN not synced" }}
              </AppBadge>
            </dd>
          </div>
          <div class="flex items-baseline gap-4 py-3">
            <dt class="meta-label w-40 shrink-0">Phone</dt>
            <dd class="text-sm text-smoke">{{ warehouse.phoneNational }}</dd>
          </div>
          <div class="flex items-baseline gap-4 py-3">
            <dt class="meta-label w-40 shrink-0">Address</dt>
            <dd class="text-sm text-smoke">{{ warehouse.address }}</dd>
          </div>
        </AppDetailMetaPanel>

        <AppDetailMetaPanel eyebrow="GHN store">
          <template v-if="warehouse.ghnStore">
            <div class="flex items-baseline gap-4 py-3">
              <dt class="meta-label w-40 shrink-0">Shop</dt>
              <dd class="text-sm font-medium text-ink">{{ warehouse.ghnStore.shopName }}</dd>
            </div>
            <div class="flex items-baseline gap-4 py-3">
              <dt class="meta-label w-40 shrink-0">Shop ID</dt>
              <dd class="text-sm text-smoke">{{ warehouse.ghnStore.shopId }}</dd>
            </div>
            <div class="flex items-baseline gap-4 py-3">
              <dt class="meta-label w-40 shrink-0">Phone</dt>
              <dd class="text-sm text-smoke">{{ warehouse.ghnStore.shopPhone }}</dd>
            </div>
            <div class="flex items-baseline gap-4 py-3">
              <dt class="meta-label w-40 shrink-0">Pickup address</dt>
              <dd class="text-sm text-smoke">{{ warehouse.ghnStore.pickupAddress }}</dd>
            </div>
            <div class="flex items-baseline gap-4 py-3">
              <dt class="meta-label w-40 shrink-0">Synced at</dt>
              <dd class="text-sm text-smoke">{{ formatDateTime(warehouse.ghnStore.syncedAt) }}</dd>
            </div>
          </template>
          <div v-else class="flex items-baseline gap-4 py-3">
            <dt class="meta-label w-40 shrink-0">Snapshot</dt>
            <dd class="text-sm text-smoke">Not synced</dd>
          </div>
        </AppDetailMetaPanel>

        <AppDetailMetaPanel eyebrow="Audit trail">
          <div class="flex items-baseline gap-4 py-3">
            <dt class="meta-label w-40 shrink-0">Created at</dt>
            <dd class="text-sm text-smoke">{{ formatDateTime(warehouse.createdAt) }}</dd>
          </div>
          <div class="flex items-baseline gap-4 py-3">
            <dt class="meta-label w-40 shrink-0">Created by</dt>
            <dd class="text-sm text-smoke">{{ warehouse.createdBy || "System" }}</dd>
          </div>
          <div class="flex items-baseline gap-4 py-3">
            <dt class="meta-label w-40 shrink-0">Updated at</dt>
            <dd class="text-sm text-smoke">{{ formatDateTime(warehouse.updatedAt) }}</dd>
          </div>
          <div class="flex items-baseline gap-4 py-3">
            <dt class="meta-label w-40 shrink-0">Updated by</dt>
            <dd class="text-sm text-smoke">{{ warehouse.updatedBy || "System" }}</dd>
          </div>
        </AppDetailMetaPanel>
      </div>

      <div v-else-if="activeTab === 'edit'" class="grid gap-6 content-start max-w-6xl">
        <AppPanel eyebrow="Edit warehouse">
          <form class="grid divide-y divide-line/60" @submit.prevent="updateWarehouse">
            <div class="grid gap-4 py-3 md:grid-cols-2">
              <AppInput v-model="form.name" label="Name" />
              <AppInput v-model="form.phoneNational" label="Phone" />
            </div>
            <div class="grid gap-4 py-3">
              <AppInput v-model="form.address" label="Address" />
            </div>
            <div class="flex justify-end pt-4">
              <AppButton v-if="canUpdateWarehouse" :loading="actionPending === 'update'" type="submit">
                Save warehouse
              </AppButton>
            </div>
          </form>
        </AppPanel>
      </div>

      <div v-else-if="activeTab === 'ghn-store'" class="grid gap-6 content-start max-w-6xl">
        <AppPanel eyebrow="GHN store">
          <div class="grid divide-y divide-line/60">
            <template v-if="warehouse.ghnStore">
              <div class="flex items-baseline gap-4 py-3">
                <span class="meta-label w-40 shrink-0">Shop</span>
                <span class="text-sm font-medium text-ink">{{ warehouse.ghnStore.shopName }}</span>
              </div>
              <div class="flex items-baseline gap-4 py-3">
                <span class="meta-label w-40 shrink-0">Phone</span>
                <span class="text-sm text-smoke">{{ warehouse.ghnStore.shopPhone }}</span>
              </div>
              <div class="flex items-baseline gap-4 py-3">
                <span class="meta-label w-40 shrink-0">Address</span>
                <span class="text-sm text-smoke">{{ warehouse.ghnStore.pickupAddress }}</span>
              </div>
            </template>
            <div v-else class="flex items-baseline gap-4 py-3">
              <span class="meta-label w-40 shrink-0">Snapshot</span>
              <span class="text-sm text-smoke">Not synced</span>
            </div>
            <div class="grid gap-4 py-3">
              <AppInput v-model="ghnShopId" label="GHN shop id" type="number" />
            </div>
            <div class="flex justify-end pt-4">
              <AppButton v-if="canUpdateWarehouse" :loading="actionPending === 'sync-ghn'" @click="syncGhnStore">
                Sync GHN store
              </AppButton>
            </div>
          </div>
        </AppPanel>
      </div>

      <div v-else class="grid gap-6 content-start max-w-6xl">
        <AppPanel eyebrow="Warehouse status">
          <div class="flex flex-wrap items-center justify-between gap-4">
            <div class="flex flex-wrap items-center gap-3">
              <p class="text-sm font-semibold text-ink">Current state</p>
              <AppBadge :tone="warehouse.status === 'Active' ? 'success' : 'default'">
                {{ warehouse.status }}
              </AppBadge>
            </div>
            <div class="flex shrink-0 justify-end">
              <AppButton
                v-if="canUpdateWarehouse"
                variant="secondary"
                :loading="actionPending === 'toggle'"
                @click="toggleWarehouse"
              >
                {{ warehouse.status === "Active" ? "Deactivate" : "Activate" }}
              </AppButton>
            </div>
          </div>
        </AppPanel>
      </div>
    </template>
  </AppDetailPage>
</template>
