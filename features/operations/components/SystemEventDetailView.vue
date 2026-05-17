<script setup lang="ts">
import AppDetailMetaPanel from "~/Shared/components/ui/pattern/AppDetailMetaPanel.vue";
import { useScopedPageBreadcrumbs } from "~/Shared/composables/usePageBreadcrumbs";
import type { SystemEventDetailPageState } from "~/features/operations/composables/useSystemEventDetailPage";

const props = defineProps<{
  page: SystemEventDetailPageState;
}>();

const {
  error,
  formattedPayload,
  loadErrorMessage,
  payloadFields,
  pending,
  systemEvent,
  systemEventId,
} = props.page;

const { formatDateTime } = useAuthPresentation();

const statusTone = (status: string) => {
  if (status === "Processed") return "success";
  if (status === "Failed") return "danger";
  if (status === "Pending") return "warning";
  return "default";
};

useScopedPageBreadcrumbs(() =>
  systemEvent.value
    ? [
        { label: "System Events", to: "/system-events" },
        { label: systemEvent.value.eventType, to: `/system-events/${systemEventId.value}` },
      ]
    : [],
);
</script>

<template>
  <AppDetailPage
    :title="systemEvent?.eventType ?? ''"
    :pending="pending"
    :error="error ? loadErrorMessage : null"
    error-title="Unable to load system event"
  >
    <template v-if="systemEvent">
      <div class="grid gap-6 content-start max-w-6xl">
        <AppDetailMetaPanel eyebrow="Event details">
          <div class="flex items-baseline gap-4 py-3">
            <dt class="meta-label w-40 shrink-0">Event ID</dt>
            <dd class="break-all text-xs font-mono text-smoke">{{ systemEvent.id }}</dd>
          </div>
          <div class="flex items-baseline gap-4 py-3">
            <dt class="meta-label w-40 shrink-0">Event type</dt>
            <dd class="text-sm font-medium text-ink">{{ systemEvent.eventType }}</dd>
          </div>
          <div class="flex items-baseline gap-4 py-3">
            <dt class="meta-label w-40 shrink-0">Aggregate ID</dt>
            <dd class="break-all text-xs font-mono text-smoke">{{ systemEvent.aggregateId }}</dd>
          </div>
          <div class="flex items-baseline gap-4 py-3">
            <dt class="meta-label w-40 shrink-0">Status</dt>
            <dd><AppBadge :tone="statusTone(systemEvent.status)">{{ systemEvent.status }}</AppBadge></dd>
          </div>
          <div class="flex items-baseline gap-4 py-3">
            <dt class="meta-label w-40 shrink-0">Retries</dt>
            <dd class="text-sm text-smoke">{{ systemEvent.retryCount }}</dd>
          </div>
          <div class="flex items-baseline gap-4 py-3">
            <dt class="meta-label w-40 shrink-0">Occurred</dt>
            <dd class="text-sm text-smoke">{{ formatDateTime(systemEvent.occurredOn) }}</dd>
          </div>
          <div class="flex items-baseline gap-4 py-3">
            <dt class="meta-label w-40 shrink-0">Processed</dt>
            <dd class="text-sm text-smoke">{{ systemEvent.processedAt ? formatDateTime(systemEvent.processedAt) : "Pending" }}</dd>
          </div>
        </AppDetailMetaPanel>

        <AppDetailMetaPanel v-if="payloadFields.length" eyebrow="Payload values">
          <div v-for="field in payloadFields" :key="field.key" class="flex items-baseline gap-4 py-3">
            <dt class="meta-label w-40 shrink-0">{{ field.key }}</dt>
            <dd class="break-all text-sm text-smoke">{{ field.value }}</dd>
          </div>
        </AppDetailMetaPanel>

        <AppPanel eyebrow="Payload">
          <pre class="max-h-[520px] overflow-auto rounded-lg border border-line bg-surface p-4 text-xs leading-6 text-smoke">{{ formattedPayload }}</pre>
        </AppPanel>

        <AppPanel v-if="systemEvent.error" eyebrow="Error">
          <pre class="max-h-[320px] overflow-auto whitespace-pre-wrap rounded-lg border border-danger/30 bg-danger/5 p-4 text-xs leading-6 text-danger">{{ systemEvent.error }}</pre>
        </AppPanel>
      </div>
    </template>
  </AppDetailPage>
</template>
