import type { OrderResponse } from "~/features/orders/types";

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

const cancelReasonPresets: OrderReasonPreset[] = [
  { label: "Customer requested cancellation", value: "Customer requested cancellation." },
  { label: "Payment failed or expired", value: "Payment failed or expired." },
  { label: "Inventory unavailable", value: "Inventory unavailable." },
  { label: "Duplicate order", value: "Duplicate order." },
  { label: "Other", value: "" },
];

const returnReasonPresets: OrderReasonPreset[] = [
  { label: "Recipient unavailable", value: "Recipient unavailable." },
  { label: "Incorrect address", value: "Incorrect address." },
  { label: "Recipient refused delivery", value: "Recipient refused delivery." },
  { label: "Carrier delivery failed", value: "Carrier delivery failed." },
  { label: "Other", value: "" },
];

const canRunAction = (order: OrderResponse, action: OrderActionKey) => {
  switch (action) {
    case "confirm":
      return order.status === "Pending" && (order.stockReservationStatus === "Pending" || order.stockReservationStatus === "Failed");
    case "start-processing":
      return order.status === "Confirmed" && order.stockReservationStatus === "Reserved";
    case "mark-in-transit":
      return order.status === "Processing";
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
  const actionPending = ref<OrderActionKey | "">("");
  const actionError = ref("");
  const requestedAction = ref<OrderAction | null>(null);
  const actionReason = ref("");
  const selectedReasonPreset = ref("");

  const { data, pending, error, refresh } = await useAsyncData(
    () => `order:${orderId.value}`,
    () => orderApi.getOrderById(orderId.value),
  );

  const loadErrorMessage = computed(() => getProblemMessage(error.value, "This order is not available right now."));
  const order = computed(() => data.value ?? null);
  const hasStockReservationFailure = computed(() => order.value?.stockReservationStatus === "Failed");

  const availableActions = computed<OrderAction[]>(() => {
    if (!order.value || !canModifyOrder.value) {
      return [];
    }

    const actions: OrderAction[] = [
      {
        key: "confirm",
        label: "Confirm",
        detail: "Reserve inventory synchronously, then move the order to Confirmed.",
      },
      {
        key: "start-processing",
        label: "Start processing",
        detail: "Move to Processing after stock is Reserved, then create a local shipment draft as best effort.",
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

  const requestAction = (action: OrderAction) => {
    requestedAction.value = action;
    const presets = action.key === "return-to-sender" ? returnReasonPresets : cancelReasonPresets;
    selectedReasonPreset.value = action.requiresReason ? presets[0]?.label ?? "" : "";
    actionReason.value = action.requiresReason ? presets[0]?.value ?? "" : "";
    actionError.value = "";
  };

  const closeAction = () => {
    requestedAction.value = null;
    actionReason.value = "";
    selectedReasonPreset.value = "";
  };

  const reasonPresets = computed(() => {
    if (requestedAction.value?.key === "return-to-sender") {
      return returnReasonPresets;
    }

    if (requestedAction.value?.key === "cancel") {
      return cancelReasonPresets;
    }

    return [];
  });

  const selectReasonPreset = (preset: OrderReasonPreset) => {
    selectedReasonPreset.value = preset.label;
    actionReason.value = preset.value;
  };

  const executeAction = async () => {
    if (!requestedAction.value || !order.value) {
      return;
    }

    const action = requestedAction.value;
    if (action.requiresReason && !actionReason.value.trim()) {
      actionError.value = "Reason is required for this order action.";
      return;
    }

    actionPending.value = action.key;
    actionError.value = "";

    try {
      if (action.key === "confirm") {
        data.value = await orderApi.confirmOrder(order.value.id);
      } else if (action.key === "start-processing") {
        data.value = await orderApi.startProcessingOrder(order.value.id);
      } else if (action.key === "mark-in-transit") {
        data.value = await orderApi.markOrderInTransit(order.value.id);
      } else if (action.key === "deliver") {
        data.value = await orderApi.deliverOrder(order.value.id);
      } else if (action.key === "complete") {
        data.value = await orderApi.completeOrder(order.value.id);
      } else if (action.key === "cancel") {
        data.value = await orderApi.cancelOrder(order.value.id, { reason: actionReason.value.trim() });
      } else if (action.key === "return-to-sender") {
        data.value = await orderApi.returnOrderToSender(order.value.id, { reason: actionReason.value.trim() });
      }

      closeAction();
      await refresh();
    } catch (requestError) {
      actionError.value = getProblemMessage(requestError, `Unable to ${action.label.toLowerCase()} this order.`);
    } finally {
      actionPending.value = "";
    }
  };

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
    actionError,
    actionPending,
    actionReason,
    activeTab,
    availableActions,
    canModifyOrder,
    closeAction,
    error,
    executeAction,
    hasStockReservationFailure,
    loadErrorMessage,
    order,
    orderId,
    orderTabs,
    pending,
    refresh,
    requestedAction,
    requestAction,
    reasonPresets,
    selectReasonPreset,
    selectTab,
    selectedReasonPreset,
    totalQuantity,
  };
};

export type OrderDetailPageState = Awaited<ReturnType<typeof useOrderDetailPage>>;
