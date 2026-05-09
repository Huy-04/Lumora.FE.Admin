import type { ShipmentResponse, SubmitShipmentRequest } from "~/features/shipments/types";

const nullableText = (value: string) => {
  const trimmed = value.trim();
  return trimmed === "" ? null : trimmed;
};

const nullableNumber = (value: string) => {
  const trimmed = value.trim();
  return trimmed === "" ? null : Number(trimmed);
};

const parsePickShift = (value: string) => {
  const values = value
    .split(",")
    .map((entry) => entry.trim())
    .filter(Boolean)
    .map(Number)
    .filter((entry) => !Number.isNaN(entry));

  return values.length ? values : null;
};

export const useShipmentDetailPage = async () => {
  const route = useRoute();
  const shipmentApi = useShipmentAdminApi();
  const authz = useAdminAuthorization();

  type ShipmentTab = "overview" | "tracking" | "submit" | "cancellation";

  const shipmentId = computed(() => String(route.params.id ?? ""));

  const canSubmitShipment = computed(() => authz.can(ADMIN_PERMISSION.shipmentModifyAll));
  const actionPending = ref("");
  const actionError = ref("");
  const activeTab = ref<ShipmentTab>("overview");

  const submitForm = reactive({
    requiredNote: "",
    note: "",
    content: "",
    insuranceValue: "",
    returnPhone: "",
    returnAddress: "",
    returnDistrictId: "",
    returnWardCode: "",
    pickStationId: "",
    deliverStationId: "",
    pickShift: "",
  });

  const { data, pending, error, refresh } = await useAsyncData(
    () => `shipment:${shipmentId.value}`,
    () => shipmentApi.getShipmentById(shipmentId.value),
  );

  const shipment = computed<ShipmentResponse | null>(() => data.value ?? null);
  const loadErrorMessage = computed(() => getProblemMessage(error.value, "This shipment is not available right now."));
  const isDraft = computed(() => shipment.value?.status === "Draft");
  const shipmentTabs = computed<Array<{ label: string; value: ShipmentTab }>>(() => [
    { label: "Overview", value: "overview" },
    { label: "Tracking", value: "tracking" },
    ...(canSubmitShipment.value && isDraft.value ? [{ label: "Submit", value: "submit" as const }] : []),
    ...(shipment.value?.cancellation ? [{ label: "Cancellation", value: "cancellation" as const }] : []),
  ]);

  const normalizeTab = (value: unknown): ShipmentTab => {
    const resolved = value === "tracking" || value === "timeline" || value === "status"
      ? "tracking"
      : value === "submit"
        ? "submit"
        : value === "cancellation"
          ? "cancellation"
          : "overview";

    return shipmentTabs.value.some((tab) => tab.value === resolved) ? resolved : "overview";
  };

  const submitShipment = async () => {
    if (!shipment.value) {
      return;
    }

    actionPending.value = "submit";
    actionError.value = "";

    const payload: SubmitShipmentRequest = {
      requiredNote: nullableText(submitForm.requiredNote),
      note: nullableText(submitForm.note),
      content: nullableText(submitForm.content),
      insuranceValue: nullableNumber(submitForm.insuranceValue),
      returnPhone: nullableText(submitForm.returnPhone),
      returnAddress: nullableText(submitForm.returnAddress),
      returnDistrictId: nullableNumber(submitForm.returnDistrictId),
      returnWardCode: nullableText(submitForm.returnWardCode),
      pickStationId: nullableText(submitForm.pickStationId),
      deliverStationId: nullableText(submitForm.deliverStationId),
      pickShift: parsePickShift(submitForm.pickShift),
    };

    try {
      data.value = await shipmentApi.submitShipment(shipment.value.id, payload);
      await refresh();
    } catch (requestError) {
      actionError.value = getProblemMessage(requestError, "Unable to submit shipment.");
    } finally {
      actionPending.value = "";
    }
  };

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
    submitForm,
    submitShipment,
  };
};

export type ShipmentDetailPageState = Awaited<ReturnType<typeof useShipmentDetailPage>>;
