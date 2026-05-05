<script setup lang="ts">
import { PhArrowClockwise } from "@phosphor-icons/vue";
import type { UsersIndexPage } from "~/features/users/composables/useUsersIndexPage";

defineProps<{
  page: UsersIndexPage;
}>();
</script>

<template>
  <AppIndexPage
    eyebrow="Users API"
    search-label="Search users"
    :total-items="page.data.value?.items?.length ?? 0"
    item-label="users"
    :pending="page.pending.value"
    :error="page.error.value ? 'Error loading data' : null"
    :error-detail="page.error.value ? getProblemMessage(page.error.value, 'The user directory is not available right now.') : ''"
    :action-success="page.actionSuccess.value"
    action-success-title="User removed"
    :action-error="page.actionError.value"
    action-error-title="User action failed"
    :items-length="page.data.value?.items?.length ?? 0"
    empty-title="No users found"
    empty-detail="Adjust the filters or create a new user."
    :first-item-number="page.firstItemNumber.value"
    :last-item-number="page.lastItemNumber.value"
    v-model:page-size="page.pageSize.value"
    :page-size-options="page.pageSizeOptions"
    :page="page.page.value"
    :total-pages="page.totalPages.value"
    @previous-page="page.goToPreviousPage"
    @next-page="page.goToNextPage"
  >
    <template #modals>
      <AppConfirm
        :open="page.confirmUser.value !== null"
        :title="page.confirmTitle.value"
        :detail="page.confirmDetail"
        confirm-label="Remove"
        tone="danger"
        :loading="page.actionPending.value === 'remove'"
        @confirm="page.removeUser"
        @cancel="page.cancelRemove"
      />
    </template>

    <template #search-input>
      <AppInput v-model="page.localKeyword.value" label="" placeholder="Search by name, email, username, or phone" @keyup.enter="page.applyFilters" />
    </template>

    <template #actions>
      <AppButton variant="primary" @click="page.applyFilters">
        Search
      </AppButton>
      <AppButton
        v-if="page.keyword.value || page.userStatus.value || page.emailStatus.value || page.phoneStatus.value"
        variant="secondary"
        @click="page.clearFilters"
      >
        Clear
      </AppButton>
      <AppButton aria-label="Reload users" class="toolbar-refresh-button" icon-only variant="secondary" @click="page.refresh">
        <PhArrowClockwise color="#171c1a" :size="22" weight="bold" />
      </AppButton>
      <NuxtLink v-if="page.canCreateUser.value" class="primary-link" to="/users/create">
        Create user
      </NuxtLink>
    </template>

    <template #filters>
      <div class="w-full sm:flex-1">
        <AppSelect
          v-model="page.localUserStatus.value"
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
          v-model="page.localEmailStatus.value"
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
          v-model="page.localPhoneStatus.value"
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
            <th v-if="page.canRemoveUser.value" class="w-[96px] text-center">Remove</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="user in page.data.value?.items ?? []" :key="user.id">
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
                {{ page.enumLabel(user.userStatus) }}
              </AppBadge>
            </td>
            <td class="align-middle">
              <AppBadge :tone="user.emailStatus === 'Verified' ? 'success' : 'warning'">
                {{ page.enumLabel(user.emailStatus) }}
              </AppBadge>
            </td>
            <td class="align-middle">
              <AppBadge :tone="user.phoneStatus === 'Verified' ? 'success' : 'warning'">
                {{ page.enumLabel(user.phoneStatus) }}
              </AppBadge>
            </td>
            <td class="align-middle">
              <div class="flex justify-center">
                <NuxtLink class="secondary-link table-action" :to="`/users/${user.id}`">
                  Open
                </NuxtLink>
              </div>
            </td>
            <td v-if="page.canRemoveUser.value" class="align-middle">
              <div class="flex justify-center">
                <AppButton class="table-action" variant="danger" @click="page.requestRemove(user.id)">
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
