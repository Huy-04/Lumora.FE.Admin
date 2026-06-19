<script setup lang="ts">
import type { UserAddressResponse } from "~/features/users/types/users";

defineProps<{
  addresses: UserAddressResponse[];
}>();

const emit = defineEmits<{
  updated: [];
}>();

const { enumLabel } = useAuthPresentation();
const {
  actionError,
  actionPending,
  closeActionError,
  closeConfirm,
  confirmOpen,
  openConfirm,
  removeAddress,
} = useProfileAddressesTab(() => emit("updated"));
</script>

<template>
  <div class="grid max-w-6xl content-start gap-6">
    <AppPanel eyebrow="Saved addresses">
      <template #actions>
        <NuxtLink class="primary-link whitespace-nowrap" to="/profile/addresses/create">
          Add address
        </NuxtLink>
      </template>

      <AppConfirm
        :open="confirmOpen"
        title="Remove address?"
        detail="This address will be permanently removed."
        confirm-label="Remove"
        tone="danger"
        :loading="actionPending === 'remove'"
        @confirm="removeAddress"
        @cancel="closeConfirm"
      />
      <AppConfirm
        :open="Boolean(actionError)"
        title="Address action failed"
        :detail="actionError"
        cancel-label="Close"
        tone="danger"
        hide-confirm
        @cancel="closeActionError"
      />

      <div v-if="addresses.length" class="grid gap-3">
        <article
          v-for="address in addresses"
          :key="address.id"
          class="rounded-xl border border-line bg-surface"
        >
          <div class="grid gap-4 px-5 py-4 xl:grid-cols-[minmax(220px,0.75fr)_minmax(520px,1.5fr)_auto] xl:items-center">
            <div class="min-w-0">
              <div class="flex flex-wrap items-center gap-2">
                <p class="text-base font-semibold tracking-tight text-ink">{{ enumLabel(address.addressType) }}</p>
                <AppBadge :tone="address.isDefault ? 'success' : 'default'">
                  {{ address.isDefault ? "Default" : "Saved" }}
                </AppBadge>
              </div>
              <p class="mt-1 truncate text-sm font-medium text-smoke">{{ address.fullName }}</p>
            </div>

            <dl class="grid gap-3 md:grid-cols-[minmax(180px,0.55fr)_minmax(260px,1fr)]">
              <div class="rounded-xl border border-line bg-surface-quiet px-4 py-3">
                <dt class="text-[0.68rem] font-semibold uppercase tracking-[0.14em] text-smoke">Phone</dt>
                <dd class="mt-1 font-mono text-sm font-semibold leading-6 text-ink">{{ address.phone }}</dd>
              </div>
              <div class="rounded-xl border border-line bg-surface-quiet px-4 py-3">
                <dt class="text-[0.68rem] font-semibold uppercase tracking-[0.14em] text-smoke">Address</dt>
                <dd class="mt-1 text-sm font-semibold leading-6 text-ink">
                  {{ address.street }}, {{ address.ward }}, {{ address.district }}, {{ address.province }}
                </dd>
              </div>
            </dl>

            <div class="flex flex-wrap gap-2 xl:justify-end">
              <NuxtLink
                class="secondary-link table-action"
                :to="`/profile/addresses/${address.id}`"
              >
                Edit
              </NuxtLink>
              <AppButton
                variant="danger"
                class="table-action"
                :loading="actionPending === 'remove'"
                @click="openConfirm(address.id)"
              >
                Remove
              </AppButton>
            </div>
          </div>
        </article>
      </div>

      <AppEmptyState
        v-else
        title="No saved addresses"
        detail="Add the first address for this profile."
      />
    </AppPanel>
  </div>
</template>
