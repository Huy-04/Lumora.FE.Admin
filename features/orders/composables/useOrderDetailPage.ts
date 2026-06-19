import type { OrderResponse } from "~/features/orders/types/orders";

type OrderActionKey =
  | "confirm"
  | "start-processing"
  | "mark-in-transit"
  | "deliver"
  | "complete"
  | "cancel"
  | "return-to-sender";

export interface OrderAction {
  key: OrderActionKey;
  label: string;
  detail: string;
  tone?: "default" | "danger" | "warning";
  requiresReason?: boolean;
}

export interface OrderReasonPreset {
  label: string;
  value: string;
}

const canRunAction = (order: OrderResponse, action: OrderActionKey) => {
  switch (action) {
    case "confirm":
      return order.status === "Pending";
    case "start-processing":
      return order.status === "Confirmed" && order.stockReservationStatus === "Reserved";
    case "mark-in-transit":
      return order.status === "Processing" && order.stockReservationStatus === "Reserved";
    case "deliver":
      return order.status === "InTransit";
    case "complete":
      return order.status === "Delivered";
    case "cancel":
      return order.status === "Pending" || order.status === "Confirmed" || order.status === "Processing";
    case "return-to-sender":
      return order.status === "InTransit";
    default:
      return false;
  }
};

export const useOrderDetailPage = async () => {
  const route = useRoute();
  const orderApi = useOrderAdminApi();
  const authz = useAdminAuthorization();

  type OrderTab = "overview" | "items" | "lifecycle";

  const orderId = computed(() => String(route.params.id ?? ""));
  const canModifyOrder = computed(() => authz.can(ADMIN_PERMISSION.orderModifyAll));
  const orderTabs = computed<Array<{ label: string; value: OrderTab }>>(() => [
    { label: "Overview", value: "overview" },
    { label: "Items", value: "items" },
    { label: "Lifecycle", value: "lifecycle" },
  ]);

  const normalizeTab = (value: unknown): OrderTab => {
    if (value === "items") {
      return "items";
    }

    if (value === "operations" || value === "actions" || value === "lifecycle") {
      return "lifecycle";
    }

    return "overview";
  };

  const activeTab = ref<OrderTab>(normalizeTab(route.query.tab));

  const { data, pending, error, refresh } = await useAsyncData(
    () => `order:${orderId.value}`,
    () => orderApi.getOrderById(orderId.value),
  );

  const loadErrorMessage = computed(() => getProblemMessage(error.value, "This order is not available right now."));
  const order = computed(() => data.value ?? null);
  const hasStockReservationFailure = computed(() => order.value?.stockReservationStatus === "Failed");
  const hasProcessingException = computed(() =>
    order.value?.status === "Processing" && order.value?.stockReservationStatus !== "Reserved",
  );

  const availableActions = computed<OrderAction[]>(() => {
    if (!order.value || !canModifyOrder.value) {
      return [];
    }

    const actions: OrderAction[] = [
      {
        key: "confirm",
        label: "Confirm",
        detail: "Reserve inventory, move the order to Processing, and create a shipment draft.",
      },
      {
        key: "start-processing",
        label: "Start processing",
        detail: "Move a confirmed and reserved order into Processing and retry shipment-draft creation.",
      },
      {
        key: "mark-in-transit",
        label: "Mark in transit",
        detail: "Manual admin fallback when the shipment has moved into transit.",
      },
      {
        key: "deliver",
        label: "Deliver",
        detail: "Mark an in-transit order as Delivered.",
      },
      {
        key: "complete",
        label: "Complete",
        detail: "Close a delivered order.",
      },
      {
        key: "cancel",
        label: "Cancel",
        detail: "Cancel the order and release releasable local inventory.",
        tone: "danger",
        requiresReason: true,
      },
      {
        key: "return-to-sender",
        label: "Return to sender",
        detail: "Mark an in-transit order as returned back toward the shop.",
        tone: "warning",
        requiresReason: true,
      },
    ];

    return actions.filter((action) => canRunAction(order.value as OrderResponse, action.key));
  });

  const orderActions = useOrderDetailActions(orderApi, data, refresh);

  const totalQuantity = computed(() => order.value?.items.reduce((total, item) => total + item.quantity, 0) ?? 0);

  const selectTab = async (tab: OrderTab) => {
    const nextTab = normalizeTab(tab);

    if (!orderTabs.value.some((item) => item.value === nextTab)) {
      return;
    }

    activeTab.value = nextTab;
    await navigateTo(
      {
        path: `/orders/${orderId.value}`,
        query: nextTab === "overview" ? {} : { tab: nextTab },
      },
      { replace: true },
    );
  };

  watch(
    () => route.query.tab,
    (value) => {
      activeTab.value = normalizeTab(value);
    },
  );

  watchEffect(() => {
    activeTab.value = normalizeTab(activeTab.value);
  });

  return {
    activeTab,
    availableActions,
    canModifyOrder,
    error,
    hasStockReservationFailure,
    hasProcessingException,
    loadErrorMessage,
    order,
    orderId,
    orderTabs,
    pending,
    refresh,
    selectTab,
    totalQuantity,
    ...orderActions,
  };
};

export type OrderDetailPageState = Awaited<ReturnType<typeof useOrderDetailPage>>;
