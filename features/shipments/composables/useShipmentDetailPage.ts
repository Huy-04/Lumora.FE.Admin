import type { ShipmentResponse } from "~/features/shipments/types";

export const useShipmentDetailPage = async () => {
  // 1. Dependency injection
  const route = useRoute();
  const shipmentApi = useShipmentAdminApi();
  const authz = useAdminAuthorization();

  type ShipmentTab = "overview" | "tracking" | "cancellation";

  // 2. Permissions
  const shipmentId = computed(() => String(route.params.id ?? ""));

  const canSubmitShipment = computed(() => authz.can(ADMIN_PERMISSION.shipmentModifyAll));
  const actionPending = ref("");
  const actionError = ref("");
  const activeTab = ref<ShipmentTab>("overview");

  // 3. Data fetching
  const { data, pending, error, refresh } = await useAsyncData(
    () => `shipment:${shipmentId.value}`,
    () => shipmentApi.getShipmentById(shipmentId.value),
  );

  // 4. Computed derivations
  const shipment = computed<ShipmentResponse | null>(() => data.value ?? null);
  const loadErrorMessage = computed(() => getProblemMessage(error.value, "This shipment is not available right now."));
  const isDraft = computed(() => shipment.value?.status === "Draft");
  const shipmentTabs = computed<Array<{ label: string; value: ShipmentTab }>>(() => [
    { label: "Overview", value: "overview" },
    { label: "Tracking", value: "tracking" },
    ...(shipment.value?.cancellation ? [{ label: "Cancellation", value: "cancellation" as const }] : []),
  ]);

  const normalizeTab = (value: unknown): ShipmentTab => {
    const resolved = value === "tracking" || value === "timeline" || value === "status"
      ? "tracking"
      : value === "submit"
        ? "tracking"
        : value === "cancellation"
          ? "cancellation"
          : "overview";

    return shipmentTabs.value.some((tab) => tab.value === resolved) ? resolved : "overview";
  };

  // 5. Actions/mutations
  const submitShipment = async () => {
    if (!shipment.value) {
      return;
    }

    actionPending.value = "submit";
    actionError.value = "";

    try {
      data.value = await shipmentApi.submitShipment(shipment.value.id);
      await refresh();
    } catch (requestError) {
      actionError.value = getProblemMessage(requestError, "Unable to submit shipment.");
    } finally {
      actionPending.value = "";
    }
  };

  // 6. Watchers
  watch(
    () => route.query.tab,
    (value) => {
      activeTab.value = normalizeTab(value);
    },
    { immediate: true },
  );

  watchEffect(() => {
    activeTab.value = normalizeTab(activeTab.value);
  });

  const selectTab = async (tab: ShipmentTab) => {
    const nextTab = normalizeTab(tab);

    activeTab.value = nextTab;
    await navigateTo(
      {
        path: `/shipments/${shipmentId.value}`,
        query: nextTab === "overview" ? {} : { tab: nextTab },
      },
      { replace: true },
    );
  };

  // 7. Return statement
  return {
    actionError,
    actionPending,
    activeTab,
    canSubmitShipment,
    error,
    isDraft,
    loadErrorMessage,
    pending,
    refresh,
    selectTab,
    shipment,
    shipmentId,
    shipmentTabs,
    submitShipment,
  };
};

export type ShipmentDetailPageState = Awaited<ReturnType<typeof useShipmentDetailPage>>;
