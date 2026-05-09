import type { PaymentMethod, PaymentProvider, PaymentStatus } from "~/features/payments/types";
import type { PaymentSearchResponse } from "~/features/payments/types";

export const usePaymentIndexPage = async () => {
  const paymentApi = usePaymentAdminApi();
  const authz = useAdminAuthorization();
  const { paymentMethodOptions, paymentProviderOptions, paymentStatusOptions } = usePaymentOptions();

  const canReadPayments = computed(() => authz.can(ADMIN_PERMISSION.paymentReadAll));

  const localKeyword = ref("");
  const localUserId = ref("");
  const localOrderId = ref("");
  const localStatus = ref<PaymentStatus | "">("");
  const localMethod = ref<PaymentMethod | "">("");
  const localProvider = ref<PaymentProvider | "">("");
  const localCreatedFrom = ref("");
  const localCreatedTo = ref("");

  const keyword = ref("");
  const userId = ref("");
  const orderId = ref("");
  const status = ref<PaymentStatus | "">("");
  const method = ref<PaymentMethod | "">("");
  const provider = ref<PaymentProvider | "">("");
  const createdFrom = ref("");
  const createdTo = ref("");
  const page = ref(1);
  const pageSize = ref("20");

  const pageSizeOptions = [
    { label: "20", value: "20" },
    { label: "50", value: "50" },
    { label: "100", value: "100" },
  ];

  const emptyPayments = (): PaymentSearchResponse => ({
    items: [],
    totalCount: 0,
    page: page.value,
    size: Number(pageSize.value),
    totalPages: 0,
  });

  const applyFilters = () => {
    keyword.value = localKeyword.value.trim();
    userId.value = localUserId.value.trim();
    orderId.value = localOrderId.value.trim();
    status.value = localStatus.value;
    method.value = localMethod.value;
    provider.value = localProvider.value;
    createdFrom.value = localCreatedFrom.value;
    createdTo.value = localCreatedTo.value;
    page.value = 1;
  };

  const clearFilters = () => {
    localKeyword.value = "";
    localUserId.value = "";
    localOrderId.value = "";
    localStatus.value = "";
    localMethod.value = "";
    localProvider.value = "";
    localCreatedFrom.value = "";
    localCreatedTo.value = "";
    applyFilters();
  };

  const { data, pending, error, refresh } = await useAsyncData(
    () => `payments:${keyword.value || "all"}:${userId.value || "all"}:${orderId.value || "all"}:${status.value || "all"}:${method.value || "all"}:${provider.value || "all"}:${createdFrom.value || "none"}:${createdTo.value || "none"}:${page.value}:${pageSize.value}`,
    () => {
      if (!canReadPayments.value) {
        return Promise.resolve(emptyPayments());
      }

      return paymentApi.searchPayments({
        keyword: keyword.value || undefined,
        userId: userId.value || undefined,
        orderId: orderId.value || undefined,
        status: status.value || undefined,
        method: method.value || undefined,
        provider: provider.value || undefined,
        createdFrom: createdFrom.value || undefined,
        createdTo: createdTo.value || undefined,
        page: page.value,
        size: Number(pageSize.value),
      });
    },
  );

  const payments = computed(() => data.value?.items ?? []);
  const totalPayments = computed(() => data.value?.totalCount ?? 0);
  const totalPages = computed(() => Math.max(1, Math.ceil(totalPayments.value / Number(pageSize.value))));
  const firstItemNumber = computed(() => totalPayments.value === 0 ? 0 : (page.value - 1) * Number(pageSize.value) + 1);
  const lastItemNumber = computed(() => Math.min(page.value * Number(pageSize.value), totalPayments.value));
  const loadErrorMessage = computed(() => getProblemMessage(error.value, "The payment ledger is not available right now."));

  const goToPreviousPage = () => {
    if (page.value > 1) page.value -= 1;
  };

  const goToNextPage = () => {
    if (page.value < totalPages.value) page.value += 1;
  };

  watch(pageSize, () => {
    page.value = 1;
  });

  const summaryStats = computed(() => [
    { label: "Payments", value: `${totalPayments.value}`, detail: "Payments matching the current admin search." },
    { label: "Succeeded", value: `${payments.value.filter((payment) => payment.status === "Succeeded").length}`, detail: "Succeeded payments on this page." },
    { label: "Pending", value: `${payments.value.filter((payment) => payment.status === "Pending" || payment.status === "Processing").length}`, detail: "Payments waiting for provider or fallback resolution." },
    { label: "Failed", value: `${payments.value.filter((payment) => payment.status === "Failed").length}`, detail: "Failed payments on this page." },
  ]);

  return {
    applyFilters,
    canReadPayments,
    clearFilters,
    error,
    firstItemNumber,
    goToNextPage,
    goToPreviousPage,
    lastItemNumber,
    loadErrorMessage,
    localCreatedFrom,
    localCreatedTo,
    localKeyword,
    localMethod,
    localOrderId,
    localProvider,
    localStatus,
    localUserId,
    page,
    pageSize,
    pageSizeOptions,
    paymentMethodOptions,
    paymentProviderOptions,
    paymentStatusOptions,
    payments,
    pending,
    refresh,
    summaryStats,
    totalPages,
    totalPayments,
  };
};

export type PaymentIndexPageState = Awaited<ReturnType<typeof usePaymentIndexPage>>;
