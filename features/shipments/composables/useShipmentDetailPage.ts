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
  const shipmentId = computed(() => String(route.params.id ?? ""));

  const canSubmitShipment = computed(() => authz.can(ADMIN_PERMISSION.shipmentModifyAll));
  const actionPending = ref("");
  const actionError = ref("");
  const actionSuccess = ref("");
  const submitOpen = ref(false);

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

  const lifecycleStats = computed(() => [
    {
      label: "Status",
      value: shipment.value?.status ?? "-",
      detail: "Local shipment lifecycle state.",
    },
    {
      label: "Carrier",
      value: shipment.value?.carrier ?? "-",
      detail: "Carrier selected by backend.",
    },
    {
      label: "Carrier code",
      value: shipment.value?.carrierOrderCode ?? "Not submitted",
      detail: "GHN order code after submit.",
    },
    {
      label: "Submitted",
      value: shipment.value?.submittedAt ? new Date(shipment.value.submittedAt).toLocaleDateString() : "Pending",
      detail: "Submit timestamp from backend.",
    },
  ]);

  const submitShipment = async () => {
    if (!shipment.value) {
      return;
    }

    actionPending.value = "submit";
    actionError.value = "";
    actionSuccess.value = "";

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
      actionSuccess.value = "Shipment submitted to GHN.";
      submitOpen.value = false;
      await refresh();
    } catch (requestError) {
      actionError.value = getProblemMessage(requestError, "Unable to submit shipment.");
    } finally {
      actionPending.value = "";
    }
  };

  return {
    actionError,
    actionPending,
    actionSuccess,
    canSubmitShipment,
    error,
    isDraft,
    lifecycleStats,
    loadErrorMessage,
    pending,
    refresh,
    shipment,
    submitForm,
    submitOpen,
    submitShipment,
  };
};

export type ShipmentDetailPageState = Awaited<ReturnType<typeof useShipmentDetailPage>>;
