import type { ComputedRef, Ref } from "vue";

export interface CatalogChangedNotification {
  entity: string;
  entityId: string;
  occurredOn: string;
  version: number;
}

export const useCatalogRealtime = (
  onChanged: (notification: CatalogChangedNotification) => void | Promise<void>,
  options?: { enabled?: Ref<boolean> | ComputedRef<boolean> | boolean },
) => useSignalRHub<CatalogChangedNotification>(
  "catalog.changed",
  onChanged,
  {
    hubPath: "/hubs/catalog",
    enabled: options?.enabled,
  },
);
