import type { OrderResponse } from "~/features/orders/types/orders";
import type { OrderAction, OrderReasonPreset } from "~/features/orders/composables/useOrderDetailPage";

const ORDER_CANCEL_REASON_MIN_LENGTH = 5;
const ORDER_REASON_MAX_LENGTH = 500;

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

export const useOrderDetailActions = (
  orderApi: ReturnType<typeof useOrderAdminApi>,
  data: Ref<OrderResponse | null | undefined>,
  refresh: () => Promise<void>,
) => {
  const actionPending = ref<OrderAction["key"] | "">("");
  const actionError = ref("");
  const requestedAction = ref<OrderAction | null>(null);
  const actionReason = ref("");
  const selectedReasonPreset = ref("");

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
    if (!requestedAction.value || !data.value) {
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
        data.value = await orderApi.confirmOrder(data.value.id);
      } else if (action.key === "start-processing") {
        data.value = await orderApi.startProcessingOrder(data.value.id);
      } else if (action.key === "mark-in-transit") {
        data.value = await orderApi.markOrderInTransit(data.value.id);
      } else if (action.key === "deliver") {
        data.value = await orderApi.deliverOrder(data.value.id);
      } else if (action.key === "complete") {
        data.value = await orderApi.completeOrder(data.value.id);
      } else if (action.key === "cancel") {
        data.value = await orderApi.cancelOrder(data.value.id, { reason: submittedReason });
      } else if (action.key === "return-to-sender") {
        data.value = await orderApi.returnOrderToSender(data.value.id, { reason: submittedReason });
      }

      closeAction();
      await refresh();
    } catch (requestError) {
      actionError.value = getProblemMessage(requestError, `Unable to ${action.label.toLowerCase()} this order.`);
    } finally {
      actionPending.value = "";
    }
  };

  return {
    actionError,
    actionPending,
    actionReason,
    closeAction,
    executeAction,
    reasonPresets,
    requestAction,
    requestedAction,
    selectReasonPreset,
    selectedReasonPreset,
  };
};
