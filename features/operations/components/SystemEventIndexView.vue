<script setup lang="ts">
import type { SystemEventIndexPageState } from "~/features/operations/composables/useSystemEventIndexPage";

const props = defineProps<{
  page: SystemEventIndexPageState;
}>();

const {
  applyFilters,
  clearFilters,
  error,
  firstItemNumber,
  goToNextPage,
  goToPreviousPage,
  lastItemNumber,
  loadErrorMessage,
  localFilters,
  page,
  pageSize,
  pageSizeOptions,
  pending,
  statusOptions,
  summaryStats,
  systemEvents,
  totalPages,
} = props.page;

const { formatDateTime } = useAuthPresentation();

const statusTone = (status: string) => {
  if (status === "Processed") return "success";
  if (status === "Failed") return "danger";
  if (status === "Pending") return "warning";
  return "default";
};
</script>

<template>
  <AppIndexPage
    v-model="localFilters.keyword.value"
    eyebrow="Operations"
    search-label="Search system events"
    search-placeholder="Event ID, aggregate ID, payload, or error"
    :total-items="summaryStats[0]?.value ?? 0"
    item-label="events"
    :pending="pending"
    :error="error ? 'Error loading data' : null"
    :error-detail="error ? loadErrorMessage : ''"
    :items-length="systemEvents.length"
    empty-title="No system events found"
    empty-detail="Adjust filters or wait for backend workers to create outbox events."
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
    <template #filters>
      <div class="grid w-full gap-4 md:grid-cols-2 lg:grid-cols-4">
        <AppSelect v-model="localFilters.status.value" label="Status" :options="statusOptions" />
        <AppInput v-model="localFilters.eventType.value" label="Event type" placeholder="Exact event type" />
        <AppInput v-model="localFilters.occurredFrom.value" label="Occurred from" type="date" />
        <AppInput v-model="localFilters.occurredTo.value" label="Occurred to" type="date" />
      </div>
    </template>

    <template #table>
      <table class="data-table min-w-[1280px]">
        <thead>
          <tr>
            <th class="min-w-[240px]">Event</th>
            <th class="min-w-[260px]">Aggregate</th>
            <th class="min-w-[110px]">Status</th>
            <th class="min-w-[90px]">Retries</th>
            <th class="min-w-[170px]">Occurred</th>
            <th class="min-w-[170px]">Processed</th>
            <th class="min-w-[220px]">Error</th>
            <th class="w-[96px] text-center">Open</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="event in systemEvents" :key="event.id">
            <td>
              <p class="table-title">{{ event.eventType }}</p>
              <p class="table-copy">{{ event.id }}</p>
            </td>
            <td class="break-all font-mono text-xs">{{ event.aggregateId }}</td>
            <td><AppBadge :tone="statusTone(event.status)">{{ event.status }}</AppBadge></td>
            <td>{{ event.retryCount }}</td>
            <td>{{ formatDateTime(event.occurredOn) }}</td>
            <td>{{ event.processedAt ? formatDateTime(event.processedAt) : "Pending" }}</td>
            <td>{{ event.errorPreview || "None" }}</td>
            <td>
              <div class="flex justify-center">
                <NuxtLink class="secondary-link table-action" :to="`/system-events/${event.id}`">Open</NuxtLink>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </template>
  </AppIndexPage>
</template>
