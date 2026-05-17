<script setup lang="ts">
import type { UserIndexPageState } from "~/features/users/composables/useUsersIndexPage";

const props = defineProps<{
  page: UserIndexPageState;
}>();

const {
  actionError,
  actionPending,
  applyFilters,
  canCreateUser,
  canRemoveUser,
  cancelRemove,
  clearFilters,
  confirmDetail,
  confirmTitle,
  confirmUser,
  data,
  enumLabel,
  error,
  firstItemNumber,
  goToNextPage,
  goToPreviousPage,
  lastItemNumber,
  localFilters,
  page,
  pageSize,
  pageSizeOptions,
  pending,
  removeUser,
  requestRemove,
  totalPages,
} = props.page;
</script>

<template>
  <AppIndexPage
    v-model="localFilters.keyword.value"
    eyebrow="Users API"
    search-label="Search users"
    search-placeholder="Search by name, email, username, or phone"
    create-route="/users/create"
    create-label="Create user"
    :can-create="canCreateUser"
    :total-items="data?.items?.length ?? 0"
    item-label="users"
    :pending="pending"
    :error="error ? 'Error loading data' : null"
    :error-detail="error ? getProblemMessage(error, 'The user directory is not available right now.') : ''"
    :action-error="actionError"
    action-error-title="User action failed"
    :items-length="data?.items?.length ?? 0"
    empty-title="No users found"
    empty-detail="Adjust the filters or create a new user."
    :first-item-number="firstItemNumber"
    :last-item-number="lastItemNumber"
    v-model:page-size="pageSize"
    :page-size-options="pageSizeOptions"
    :page="page"
    :total-pages="totalPages"
    @search="applyFilters"
    @refresh="clearFilters"
    @previous-page="goToPreviousPage"
    @next-page="goToNextPage"
  >
    <template #modals>
      <AppConfirm
        :open="confirmUser !== null"
        :title="confirmTitle"
        :detail="confirmDetail"
        confirm-label="Remove"
        tone="danger"
        :loading="actionPending === 'remove'"
        @confirm="removeUser"
        @cancel="cancelRemove"
      />
    </template>

    <template #filters>
      <div class="w-full sm:flex-1">
        <AppSelect
          v-model="localFilters.userStatus.value"
          label="User status"
          :options="[
            { label: 'All statuses', value: '' },
            { label: 'Active', value: 'Active' },
            { label: 'Inactive', value: 'Inactive' },
          ]"
        />
      </div>
      <div class="w-full sm:flex-1">
        <AppSelect
          v-model="localFilters.emailStatus.value"
          label="Email status"
          :options="[
            { label: 'All email states', value: '' },
            { label: 'Verified', value: 'Verified' },
            { label: 'Unverified', value: 'Unverified' },
          ]"
        />
      </div>
      <div class="w-full sm:flex-1">
        <AppSelect
          v-model="localFilters.phoneStatus.value"
          label="Phone status"
          :options="[
            { label: 'All phone states', value: '' },
            { label: 'Verified', value: 'Verified' },
            { label: 'Unverified', value: 'Unverified' },
          ]"
        />
      </div>
    </template>

    <template #table>
      <table class="data-table">
        <thead>
          <tr>
            <th class="min-w-[150px]">User</th>
            <th class="min-w-[180px]">Email</th>
            <th class="min-w-[120px]">Phone</th>
            <th class="min-w-[80px]">User Status</th>
            <th class="min-w-[80px]">Email Status</th>
            <th class="min-w-[80px]">Phone Status</th>
            <th class="w-[80px] text-center">Open</th>
            <th v-if="canRemoveUser" class="w-[96px] text-center">Remove</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="user in data?.items ?? []" :key="user.id">
            <td class="align-middle">
              <p class="table-title">{{ user.fullName }}</p>
              <p class="table-copy">{{ user.userName }}</p>
            </td>
            <td class="align-middle">
              <p class="max-w-[18rem] break-all text-sm leading-relaxed text-ink">{{ user.email }}</p>
            </td>
            <td class="align-middle">
              <p class="text-sm leading-relaxed text-ink">{{ user.phone }}</p>
            </td>
            <td class="align-middle">
              <AppBadge :tone="user.userStatus === 'Active' ? 'success' : 'warning'">
                {{ enumLabel(user.userStatus) }}
              </AppBadge>
            </td>
            <td class="align-middle">
              <AppBadge :tone="user.emailStatus === 'Verified' ? 'success' : 'warning'">
                {{ enumLabel(user.emailStatus) }}
              </AppBadge>
            </td>
            <td class="align-middle">
              <AppBadge :tone="user.phoneStatus === 'Verified' ? 'success' : 'warning'">
                {{ enumLabel(user.phoneStatus) }}
              </AppBadge>
            </td>
            <td class="align-middle">
              <div class="flex justify-center">
                <NuxtLink class="secondary-link table-action" :to="`/users/${user.id}`">
                  Open
                </NuxtLink>
              </div>
            </td>
            <td v-if="canRemoveUser" class="align-middle">
              <div class="flex justify-center">
                <AppButton class="table-action" variant="danger" @click="requestRemove(user.id)">
                  Remove
                </AppButton>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </template>
  </AppIndexPage>
</template>
