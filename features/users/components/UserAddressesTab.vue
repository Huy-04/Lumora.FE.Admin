<script setup lang="ts">
import type { UserAddressResponse } from "~/features/users/types";

const props = defineProps<{
  userId: string;
  addresses: UserAddressResponse[];
}>();

const emit = defineEmits<{
  refresh: [];
}>();

const usersApi = useUsersAdminApi();
const authz = useAdminAuthorization();
const { enumLabel } = useAuthPresentation();
const canCreateAddress = computed(() => authz.can(ADMIN_PERMISSION.userAddressCreateAll));
const canUpdateAddress = computed(() => authz.can(ADMIN_PERMISSION.userAddressUpdateAll));
const canRemoveAddress = computed(() => authz.can(ADMIN_PERMISSION.userAddressRemoveAll));

const actionPending = ref<"" | "remove">("");
const actionError = ref("");

const actionErrorOpen = computed(() => actionError.value.length > 0);

const closeActionError = () => {
  actionError.value = "";
};

// ── Confirm dialog ────────────────────────────────────────────────────────
const confirmAddressId = ref("");
const confirmOpen = ref(false);

const openConfirm = (addressId: string) => {
  confirmAddressId.value = addressId;
  confirmOpen.value = true;
};

const closeConfirm = () => {
  confirmAddressId.value = "";
  confirmOpen.value = false;
};

const executeConfirm = async () => {
  actionPending.value = "remove";
  actionError.value = "";

  try {
    await usersApi.deleteUserAddress(props.userId, confirmAddressId.value);
    closeConfirm();
    emit("refresh");
  } catch (err) {
    actionError.value = getProblemMessage(err, "Unable to remove the address.");
  } finally {
    actionPending.value = "";
  }
};
</script>

<template>
  <AppPanel eyebrow="Addresses">
    <AppConfirm
      :open="confirmOpen"
      title="Remove address?"
      detail="This address will be permanently removed."
      confirm-label="Remove"
      tone="danger"
      :loading="actionPending === 'remove'"
      @confirm="executeConfirm"
      @cancel="closeConfirm"
    />
    <AppConfirm
      :open="actionErrorOpen"
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
              v-if="canUpdateAddress"
              class="secondary-link table-action"
              :to="`/user-addresses/${userId}/${address.id}`"
            >
              Edit
            </NuxtLink>
            <AppButton
              v-if="canRemoveAddress"
              :loading="actionPending === 'remove'"
              class="table-action"
              variant="danger"
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
      detail="Add the first address for this user."
    />

    <div v-if="canCreateAddress" class="mt-4 flex justify-end border-t border-line/70 pt-4">
      <NuxtLink class="primary-link whitespace-nowrap" :to="`/user-addresses/${userId}/create`">
        Add address
      </NuxtLink>
    </div>

  </AppPanel>
</template>
