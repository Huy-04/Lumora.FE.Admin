<script setup lang="ts">
import AppDetailMetaPanel from "~/Shared/components/ui/pattern/AppDetailMetaPanel.vue";
import { useScopedPageBreadcrumbs } from "~/Shared/composables/usePageBreadcrumbs";
import type { CouponDetailPageState } from "~/features/coupons/composables/useCouponDetailPage";

const props = defineProps<{
  page: CouponDetailPageState;
}>();

const {
  actionError,
  actionPending,
  activeTab,
  canModifyCoupon,
  coupon,
  couponId,
  couponTabs,
  editForm,
  editErrors,
  error,
  isNotFound,
  loadErrorMessage,
  pending,
  selectTab,
  activateCoupon,
  deactivateCoupon,
  updateCoupon,
} = props.page;

const selectCouponTab = (tab: string) => {
  selectTab(tab as typeof activeTab.value);
};

const activeTabLabel = computed(() =>
  couponTabs.value.find((tab) => tab.value === activeTab.value)?.label ?? "Overview",
);

useScopedPageBreadcrumbs(() =>
  coupon.value
    ? [
        { label: "Coupons", to: "/coupons" },
        { label: coupon.value.code, to: `/coupons/${couponId.value}` },
        { label: activeTabLabel.value },
      ]
    : [],
);

const statusTone = (c: { isActive: boolean; isExpired: boolean; isUpcoming: boolean }) => {
  if (c.isExpired) return "danger";
  if (c.isUpcoming) return "warning";
  if (c.isActive) return "success";
  return "default";
};

const statusLabel = (c: { isActive: boolean; isExpired: boolean; isUpcoming: boolean }) => {
  if (c.isExpired) return "Expired";
  if (c.isUpcoming) return "Upcoming";
  if (c.isActive) return "Active";
  return "Inactive";
};

const toggleLabel = computed(() =>
  coupon.value?.isActive ? "Deactivate" : "Activate",
);

const handleToggleActive = () => {
  if (!coupon.value) return;
  if (coupon.value.isActive) {
    deactivateCoupon();
  } else {
    activateCoupon();
  }
};

const isTogglePending = computed(() =>
  actionPending.value === "activate" || actionPending.value === "deactivate",
);
</script>

<template>
  <AppDetailPage
    :title="coupon?.code ?? ''"
    :tabs="couponTabs"
    :active-tab="activeTab"
    :pending="pending"
    :error="isNotFound ? null : (error ? loadErrorMessage : null)"
    error-title="Unable to load coupon"
    @select-tab="selectCouponTab"
  >
    <!-- 404 Not Found state -->
    <template v-if="isNotFound">
      <AppNotice tone="danger" title="Coupon not found">
        The requested coupon does not exist or is unavailable.
      </AppNotice>
    </template>

    <template v-else-if="coupon">
      <!-- Overview tab -->
      <div v-if="activeTab === 'overview'" class="grid gap-6 content-start max-w-6xl">
        <AppPanel eyebrow="Actions">
          <div class="flex flex-wrap items-center justify-between gap-4">
            <div class="flex flex-wrap items-center gap-2">
              <AppBadge :tone="statusTone(coupon)">
                {{ statusLabel(coupon) }}
              </AppBadge>
              <span v-if="coupon.isFullyRedeemed" class="text-sm text-smoke">Fully redeemed</span>
            </div>
            <AppButton
              v-if="canModifyCoupon"
              :loading="isTogglePending"
              :disabled="isTogglePending"
              :variant="coupon.isActive ? 'danger' : 'secondary'"
              @click="handleToggleActive"
            >
              {{ toggleLabel }}
            </AppButton>
          </div>
          <AppNotice v-if="actionError && (actionPending === '' || isTogglePending)" tone="danger" title="Action failed" class="mt-4">
            {{ actionError }}
          </AppNotice>
        </AppPanel>

        <AppDetailMetaPanel eyebrow="Coupon details">
          <div class="flex items-baseline gap-4 py-3">
            <dt class="meta-label w-40 shrink-0">Code</dt>
            <dd class="text-sm font-medium text-ink">{{ coupon.code }}</dd>
          </div>
          <div class="flex items-baseline gap-4 py-3">
            <dt class="meta-label w-40 shrink-0">Coupon ID</dt>
            <dd class="break-all text-xs font-mono text-smoke">{{ coupon.id }}</dd>
          </div>
          <div class="flex items-baseline gap-4 py-3">
            <dt class="meta-label w-40 shrink-0">Discount percent</dt>
            <dd class="text-sm text-smoke">{{ coupon.percent }}%</dd>
          </div>
          <div class="flex items-baseline gap-4 py-3">
            <dt class="meta-label w-40 shrink-0">Max discount amount</dt>
            <dd class="text-sm text-smoke">{{ coupon.maxDiscountAmount.toLocaleString() }}</dd>
          </div>
          <div class="flex items-baseline gap-4 py-3">
            <dt class="meta-label w-40 shrink-0">Max redemptions</dt>
            <dd class="text-sm text-smoke">{{ coupon.maxRedemptions }}</dd>
          </div>
          <div class="flex items-baseline gap-4 py-3">
            <dt class="meta-label w-40 shrink-0">Used count</dt>
            <dd class="text-sm text-smoke">{{ coupon.usedCount }}</dd>
          </div>
          <div class="flex items-baseline gap-4 py-3">
            <dt class="meta-label w-40 shrink-0">Remaining redemptions</dt>
            <dd class="text-sm text-smoke">{{ coupon.remainingRedemptions }}</dd>
          </div>
          <div class="flex items-baseline gap-4 py-3">
            <dt class="meta-label w-40 shrink-0">Status</dt>
            <dd>
              <AppBadge :tone="statusTone(coupon)">
                {{ statusLabel(coupon) }}
              </AppBadge>
            </dd>
          </div>
        </AppDetailMetaPanel>

        <AppDetailMetaPanel eyebrow="Schedule">
          <div class="flex items-baseline gap-4 py-3">
            <dt class="meta-label w-40 shrink-0">Starts at</dt>
            <dd class="text-sm text-smoke">{{ new Date(coupon.startsAt).toLocaleString() }}</dd>
          </div>
          <div class="flex items-baseline gap-4 py-3">
            <dt class="meta-label w-40 shrink-0">Expires at</dt>
            <dd class="text-sm text-smoke">{{ new Date(coupon.expiresAt).toLocaleString() }}</dd>
          </div>
        </AppDetailMetaPanel>

        <AppDetailMetaPanel eyebrow="Audit trail">
          <div class="flex items-baseline gap-4 py-3">
            <dt class="meta-label w-40 shrink-0">Created at</dt>
            <dd class="text-sm text-smoke">{{ new Date(coupon.createdAt).toLocaleString() }}</dd>
          </div>
          <div class="flex items-baseline gap-4 py-3">
            <dt class="meta-label w-40 shrink-0">Created by</dt>
            <dd class="text-sm text-smoke">{{ coupon.createdBy || "System" }}</dd>
          </div>
          <div class="flex items-baseline gap-4 py-3">
            <dt class="meta-label w-40 shrink-0">Updated at</dt>
            <dd class="text-sm text-smoke">{{ new Date(coupon.updatedAt).toLocaleString() }}</dd>
          </div>
          <div class="flex items-baseline gap-4 py-3">
            <dt class="meta-label w-40 shrink-0">Updated by</dt>
            <dd class="text-sm text-smoke">{{ coupon.updatedBy || "System" }}</dd>
          </div>
        </AppDetailMetaPanel>
      </div>

      <!-- Edit tab -->
      <div v-else class="grid gap-6 content-start max-w-6xl">
        <AppPanel eyebrow="Edit coupon">
          <AppNotice v-if="!canModifyCoupon" tone="warning" title="Read-only access">
            You can view this coupon, but modifying coupon definitions requires Coupon.Coupon.Modify.All.
          </AppNotice>

          <form class="form-stack" @submit.prevent="updateCoupon">
            <div class="grid gap-4 md:grid-cols-2">
              <AppInput v-model="editForm.code" label="Code" :disabled="!canModifyCoupon" :error="editErrors.code" />
              <AppInput :model-value="String(editForm.percent)" label="Discount percent" type="number" :disabled="!canModifyCoupon" :error="editErrors.percent" @update:model-value="editForm.percent = Number($event)" />
            </div>

            <div class="grid gap-4 md:grid-cols-2">
              <AppInput :model-value="String(editForm.maxDiscountAmount)" label="Max discount amount" type="number" :disabled="!canModifyCoupon" :error="editErrors.maxDiscountAmount" @update:model-value="editForm.maxDiscountAmount = Number($event)" />
              <AppInput :model-value="String(editForm.maxRedemptions)" label="Max redemptions" type="number" :disabled="!canModifyCoupon" :error="editErrors.maxRedemptions" @update:model-value="editForm.maxRedemptions = Number($event)" />
            </div>

            <div class="grid gap-4 md:grid-cols-2">
              <AppInput v-model="editForm.startsAt" label="Starts at" type="datetime-local" :disabled="!canModifyCoupon" :error="editErrors.startsAt" />
              <AppInput v-model="editForm.expiresAt" label="Expires at" type="datetime-local" :disabled="!canModifyCoupon" :error="editErrors.expiresAt" />
            </div>

            <AppNotice v-if="actionError && actionPending === ''" tone="danger" title="Update failed" class="mt-4">
              {{ actionError }}
            </AppNotice>

            <div class="flex flex-wrap items-center justify-end gap-4 border-t border-line pt-5">
              <NuxtLink class="secondary-link min-w-[9rem]" :to="`/coupons/${coupon.id}`">
                Cancel
              </NuxtLink>
              <AppButton v-if="canModifyCoupon" :loading="actionPending === 'update'" type="submit" class="min-w-[12rem]">Save changes</AppButton>
            </div>
          </form>
        </AppPanel>
      </div>
    </template>
  </AppDetailPage>
</template>
