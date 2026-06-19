import type { PaymentResponse } from "~/features/payments/types/payments";

type PaymentActionKey = "manual-success" | "manual-failed";

export interface PaymentAction {
  key: PaymentActionKey;
  label: string;
  detail: string;
  tone?: "default" | "danger" | "warning";
}

export const usePaymentDetailPage = async () => {
  // 1. Dependency injection
  const route = useRoute();
  const paymentApi = usePaymentAdminApi();
  const authz = useAdminAuthorization();

  type PaymentTab = "overview" | "attempts" | "operations";

  // 2. Permissions
  const paymentId = computed(() => String(route.params.id ?? ""));
  const canManagePayments = computed(() => authz.can(ADMIN_PERMISSION.paymentManageAll));

  const actionPending = ref<PaymentActionKey | "">("");
  const actionError = ref("");
  const requestedAction = ref<PaymentAction | null>(null);
  const activeTab = ref<PaymentTab>("overview");

  // 3. Data fetching
  const { data, pending, error, refresh } = await useAsyncData(
    () => `payment:${paymentId.value}`,
    () => paymentApi.getPaymentById(paymentId.value),
  );

  // 4. Computed derivations
  const payment = computed<PaymentResponse | null>(() => data.value ?? null);
  const loadErrorMessage = computed(() => getProblemMessage(error.value, "This payment is not available right now."));
  const canManualResolve = computed(() =>
    canManagePayments.value
    && Boolean(payment.value)
    && (payment.value?.status === "Pending" || payment.value?.status === "Processing"),
  );

  const paymentTabs = computed<Array<{ label: string; value: PaymentTab }>>(() => [
    { label: "Overview", value: "overview" },
    { label: "Attempts", value: "attempts" },
    ...(canManualResolve.value ? [{ label: "Operations", value: "operations" as const }] : []),
  ]);

  const normalizeTab = (value: unknown): PaymentTab => {
    const resolved = value === "attempts"
      ? "attempts"
      : value === "operations" || value === "actions"
        ? "operations"
        : "overview";

    return paymentTabs.value.some((tab) => tab.value === resolved) ? resolved : "overview";
  };

  const availableActions = computed<PaymentAction[]>(() => {
    if (!canManualResolve.value) {
      return [];
    }

    return [
      {
        key: "manual-success",
        label: "Mark succeeded",
        detail: "Use this only for an admin-confirmed COD/provider fallback payment.",
      },
      {
        key: "manual-failed",
        label: "Mark failed",
        detail: "Use this when the payment cannot be completed and the order payment state must be closed as failed.",
        tone: "danger",
      },
    ];
  });

  // 5. Actions/mutations
  const requestAction = (action: PaymentAction) => {
    requestedAction.value = action;
    actionError.value = "";
  };

  const closeAction = () => {
    requestedAction.value = null;
  };

  const executeAction = async () => {
    if (!requestedAction.value || !payment.value) {
      return;
    }

    const action = requestedAction.value;
    actionPending.value = action.key;
    actionError.value = "";

    try {
      if (action.key === "manual-success") {
        await paymentApi.markManualSuccess(payment.value.orderId);
      } else {
        await paymentApi.markManualFailed(payment.value.orderId);
      }

      closeAction();
      await refresh();
    } catch (requestError) {
      actionError.value = getProblemMessage(requestError, `Unable to ${action.label.toLowerCase()} for this payment.`);
    } finally {
      actionPending.value = "";
    }
  };

  // 6. Watchers
  watch(
    () => [route.query.tab, paymentTabs.value.map((tab) => tab.value).join("|")] as const,
    ([value]) => {
      activeTab.value = normalizeTab(value);
    },
    { immediate: true },
  );

  const selectTab = async (tab: PaymentTab) => {
    const nextTab = normalizeTab(tab);
    activeTab.value = nextTab;

    await navigateTo(
      {
        path: `/payments/${paymentId.value}`,
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
    availableActions,
    closeAction,
    error,
    executeAction,
    loadErrorMessage,
    payment,
    paymentId,
    paymentTabs,
    pending,
    refresh,
    requestedAction,
    requestAction,
    selectTab,
  };
};

export type PaymentDetailPageState = Awaited<ReturnType<typeof usePaymentDetailPage>>;
