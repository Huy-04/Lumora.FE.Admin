<script setup lang="ts">
import type { RolesIndexPage } from "~/features/roles/composables/useRolesIndexPage";

defineProps<{
  page: RolesIndexPage;
}>();
</script>

<template>
  <AppIndexPage
    eyebrow="Roles API"
    search-label="Search roles"
    :total-items="page.summaryStats.value[0]?.value ?? 0"
    item-label="roles"
    :pending="page.pending.value"
    :error="page.error.value ? 'Error loading data' : null"
    :error-detail="page.error.value ? getProblemMessage(page.error.value, 'The role list is unavailable.') : ''"
    :action-error="page.actionError.value"
    action-error-title="Role action failed"
    :items-length="page.filteredRoles.value.length"
    empty-title="No roles found"
    empty-detail="Try another search or create a new role."
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
        :open="page.confirmRole.value !== null"
        :title="page.confirmTitle.value"
        :detail="page.confirmDetail"
        confirm-label="Remove"
        tone="danger"
        :loading="page.actionPending.value === 'remove'"
        @confirm="page.removeRole"
        @cancel="page.cancelRemove"
      />
    </template>

    <template #search-input>
      <AppInput v-model="page.localSearch.value" label="" placeholder="Search by role name or description" @keyup.enter="page.applyFilters" />
    </template>

    <template #actions>
      <AppButton variant="primary" @click="page.applyFilters">
        Search
      </AppButton>
      <AppButton variant="primary" @click="page.clearFilters">
        Refresh
      </AppButton>
      <NuxtLink v-if="page.canCreateRole.value" class="primary-link" to="/roles/create">
        Create role
      </NuxtLink>
    </template>

    <template #table>
      <table class="data-table">
        <thead>
          <tr>
            <th class="w-[24%]">Role</th>
            <th class="w-[56%]">Description</th>
            <th class="w-[10%] text-center">Open</th>
            <th v-if="page.canRemoveRole.value" class="w-[10%] text-center">Remove</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="role in page.pagedRoles.value" :key="role.id">
            <td class="align-middle">
              <p class="table-title">{{ role.roleName }}</p>
            </td>
            <td class="align-middle">
              <p class="table-copy !mt-0 text-sm">{{ role.description || "No description yet." }}</p>
            </td>
            <td class="align-middle">
              <div class="flex justify-center">
                <NuxtLink class="secondary-link table-action" :to="`/roles/${role.id}`">
                  Open
                </NuxtLink>
              </div>
            </td>
            <td v-if="page.canRemoveRole.value" class="align-middle">
              <div class="flex justify-center">
                <AppButton class="table-action" variant="danger" @click="page.requestRemove(role.id)">
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
