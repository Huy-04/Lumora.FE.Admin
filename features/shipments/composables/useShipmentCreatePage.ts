export const useShipmentCreatePage = async () => {
  // 1. Dependency injection
  const shipmentApi = useShipmentAdminApi();
  const authz = useAdminAuthorization();

  // 2. Permissions
  const canCreateShipment = computed(() => authz.can(ADMIN_PERMISSION.shipmentModifyAll));

  // 3. Form state
  const form = reactive({
    orderId: "",
    shipmentNumber: "",
  });

  const pending = ref(false);
  const errorMessage = ref("");

  // 4. Actions/mutations
  const submit = async () => {
    if (!canCreateShipment.value || pending.value) {
      return;
    }

    const orderId = form.orderId.trim();
    const shipmentNumber = form.shipmentNumber.trim();

    if (!orderId) {
      errorMessage.value = "Processing order ID is required.";
      return;
    }

    pending.value = true;
    errorMessage.value = "";

    try {
      const created = await shipmentApi.createShipment({
        orderId,
        shipmentNumber: shipmentNumber || null,
      });

      await navigateTo(`/shipments/${created.id}`);
    } catch (requestError) {
      errorMessage.value = getProblemMessage(requestError, "Unable to create shipment.");
    } finally {
      pending.value = false;
    }
  };

  // 5. Return statement
  return {
    canCreateShipment,
    errorMessage,
    form,
    pending,
    submit,
  };
};

export type ShipmentCreatePageState = Awaited<ReturnType<typeof useShipmentCreatePage>>;
