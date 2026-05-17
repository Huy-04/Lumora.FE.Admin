import type { ComputedRef, Ref } from "vue";

export interface SystemEventChangedNotification {
  id: string;
  eventType: string;
  aggregateId: string;
  status: string;
  occurredOn: string;
  processedAt?: string | null;
  retryCount: number;
  hasError: boolean;
  errorPreview?: string | null;
}

export const useOperationsRealtime = (
  onSystemEventChanged: (notification: SystemEventChangedNotification) => void | Promise<void>,
  options?: { enabled?: Ref<boolean> | ComputedRef<boolean> | boolean },
) => useSignalRHub<SystemEventChangedNotification>(
  "system-event.changed",
  onSystemEventChanged,
  {
    hubPath: "/hubs/operations",
    enabled: options?.enabled,
  },
);
