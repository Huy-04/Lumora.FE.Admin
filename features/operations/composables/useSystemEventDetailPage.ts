import type { SystemEventDetailResponse } from "~/features/operations/types/operations";

export const useSystemEventDetailPage = async () => {
  // 1. Dependency injection
  const route = useRoute();
  const systemEventApi = useSystemEventAdminApi();

  const systemEventId = computed(() => String(route.params.id ?? ""));

  // 5. Data fetching
  const { data, pending, error, refresh } = await useAsyncData(
    () => `system-event:${systemEventId.value}`,
    () => systemEventApi.getSystemEventById(systemEventId.value),
  );

  // 8. Watchers
  const realtimeRefresh = useRealtimeRefresh(refresh);
  useOperationsRealtime((notification) => {
    if (notification.id === systemEventId.value) {
      realtimeRefresh.scheduleRefresh();
    }
  });

  // 6. Computed derivations
  const systemEvent = computed<SystemEventDetailResponse | null>(() => data.value ?? null);
  const loadErrorMessage = computed(() => getProblemMessage(error.value, "This system event is not available right now."));
  const parsedPayload = computed<Record<string, unknown> | null>(() => {
    const rawPayload = systemEvent.value?.payload ?? "";

    try {
      const parsed = JSON.parse(rawPayload) as unknown;
      return parsed && typeof parsed === "object" && !Array.isArray(parsed)
        ? parsed as Record<string, unknown>
        : null;
    } catch {
      return null;
    }
  });

  const formattedPayload = computed(() => {
    const rawPayload = systemEvent.value?.payload ?? "";

    try {
      return JSON.stringify(JSON.parse(rawPayload), null, 2);
    } catch {
      return rawPayload;
    }
  });
  const formatPayloadValue = (value: unknown) => {
    if (value === null || value === undefined) {
      return "None";
    }

    if (typeof value === "string" || typeof value === "number" || typeof value === "boolean") {
      return String(value);
    }

    return JSON.stringify(value);
  };

  const payloadFields = computed(() =>
    Object.entries(parsedPayload.value ?? {}).map(([key, value]) => ({
      key,
      value: formatPayloadValue(value),
    })),
  );

  // 9. Return statement
  return {
    error,
    formattedPayload,
    loadErrorMessage,
    payloadFields,
    pending,
    refresh,
    systemEvent,
    systemEventId,
  };
};

export type SystemEventDetailPageState = Awaited<ReturnType<typeof useSystemEventDetailPage>>;
