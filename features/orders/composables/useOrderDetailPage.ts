import type { OrderResponse } from "~/features/orders/types";

type OrderActionKey =
  | "confirm"
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

const ORDER_CANCEL_REASON_MIN_LENGTH = 5;
const ORDER_REASON_MAX_LENGTH = 500;

const canRunAction = (order: OrderResponse, action: OrderActionKey) => {
  switch (action) {
    case "confirm":
      return order.status === "Pending";
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
  // 1. Dependency injection
  const route = useRoute();
  const orderApi = useOrderAdminApi();
  const authz = useAdminAuthorization();

  type OrderTab = "overview" | "items" | "lifecycle";

  const orderId = computed(() => String(route.params.id ?? ""));

  // 2. Permissions
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

  // 3. Data fetching
  const { data, pending, error, refresh } = await useAsyncData(
    () => `order:${orderId.value}`,
    () => orderApi.getOrderById(orderId.value),
  );

  // 4. Computed derivations
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

  // 5. Actions/mutations
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
    let submittedReason = "";

    if (action.requiresReason) {
      const rawReason = actionReason.value;
      const trimmedReason = rawReason.trim();

      if (!trimmedReason) {
        actionError.value = "Reason is required for this order action.";
        return;
      }

      if (rawReason !== trimmedReason) {
        actionError.value = "Reason must not include leading or trailing whitespace.";
        return;
      }

      if (action.key === "cancel" && trimmedReason.length < ORDER_CANCEL_REASON_MIN_LENGTH) {
        actionError.value = `Cancellation reason must be at least ${ORDER_CANCEL_REASON_MIN_LENGTH} characters.`;
        return;
      }

      if (trimmedReason.length > ORDER_REASON_MAX_LENGTH) {
        actionError.value = "Reason must be at most 500 characters.";
        return;
      }

      submittedReason = trimmedReason;
    }

    actionPending.value = action.key;
    actionError.value = "";

    try {
      if (action.key === "confirm") {
        data.value = await orderApi.confirmOrder(order.value.id);
      } else if (action.key === "mark-in-transit") {
        data.value = await orderApi.markOrderInTransit(order.value.id);
      } else if (action.key === "deliver") {
        data.value = await orderApi.deliverOrder(order.value.id);
      } else if (action.key === "complete") {
        data.value = await orderApi.completeOrder(order.value.id);
      } else if (action.key === "cancel") {
        data.value = await orderApi.cancelOrder(order.value.id, { reason: submittedReason });
      } else if (action.key === "return-to-sender") {
        data.value = await orderApi.returnOrderToSender(order.value.id, { reason: submittedReason });
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

  // 6. Watchers
  watch(
    () => route.query.tab,
    (value) => {
      activeTab.value = normalizeTab(value);
    },
  );

  watchEffect(() => {
    activeTab.value = normalizeTab(activeTab.value);
  });

  // 7. Return statement
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
    hasProcessingException,
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
