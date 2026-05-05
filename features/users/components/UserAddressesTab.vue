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
const actionSuccess = ref("");

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
  actionSuccess.value = "";

  try {
    await usersApi.deleteUserAddress(props.userId, confirmAddressId.value);
    actionSuccess.value = "Address removed.";
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
  <AppPanel
    title="Saved addresses"
    description="Manage address records for this user and keep the default address up to date."
  >
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

    <div v-if="canCreateAddress" class="mb-4 flex flex-wrap gap-3">
      <NuxtLink class="primary-link" :to="`/user-addresses/${userId}/create`">
        Add address
      </NuxtLink>
    </div>

    <div v-if="addresses.length" class="stack-list">
      <article v-for="address in addresses" :key="address.id" class="stack-card">
        <div class="stack-card-head">
          <div>
            <p class="table-title">{{ enumLabel(address.addressType) }}</p>
            <p class="stack-card-copy">{{ address.fullName }} / {{ address.phone }}</p>
          </div>
          <div class="flex flex-wrap gap-2">
            <AppBadge :tone="address.isDefault ? 'success' : 'default'">
              {{ address.isDefault ? "Default" : "Saved" }}
            </AppBadge>
            <NuxtLink v-if="canUpdateAddress" class="secondary-link" :to="`/user-addresses/${userId}/${address.id}`">
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
        <p class="mt-4 text-sm leading-relaxed text-smoke">
          {{ address.street }}, {{ address.ward }}, {{ address.district }}, {{ address.province }}
        </p>
      </article>
    </div>

    <AppEmptyState
      v-else
      title="No saved addresses"
      detail="Add the first address for this user."
    />

    <AppNotice v-if="actionSuccess" tone="success" title="Address action completed" class="mt-4">
      {{ actionSuccess }}
    </AppNotice>

    <AppNotice v-if="actionError" tone="danger" title="Address action failed" class="mt-4">
      {{ actionError }}
    </AppNotice>
  </AppPanel>
</template>
