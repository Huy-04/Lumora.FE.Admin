import type { PaymentMethod, PaymentProvider, PaymentStatus, PaymentSearchResponse } from "~/features/payments/types";

export const usePaymentIndexPage = async () => {
  // 1. Dependency injection
  const paymentApi = usePaymentAdminApi();
  const authz = useAdminAuthorization();
  const { paymentMethodOptions, paymentProviderOptions, paymentStatusOptions } = usePaymentOptions();

  // 2. Permissions
  const canReadPayments = computed(() => authz.can(ADMIN_PERMISSION.paymentReadAll));

  // 3. Pagination
  const totalItems = ref(0);
  const pagination = usePagination(totalItems);

  // 4. Filters
  const { localFilters, appliedFilters, applyFilters, clearFilters, hasActiveFilters } =
    useFilters(
      {
        keyword: "",
        status: "" as PaymentStatus | "",
        method: "" as PaymentMethod | "",
        provider: "" as PaymentProvider | "",
        createdFrom: "",
        createdTo: "",
      },
      { onApply: () => { pagination.page.value = 1; } },
    );

  // 5. Data fetching
  const emptyPayments = (): PaymentSearchResponse => ({
    items: [],
    totalCount: 0,
    page: pagination.page.value,
    size: Number(pagination.pageSize.value),
    totalPages: 0,
  });

  const { data, pending, error, refresh } = await useAsyncData(
    () => `payments:${appliedFilters.keyword.value || "all"}:${appliedFilters.status.value || "all"}:${appliedFilters.method.value || "all"}:${appliedFilters.provider.value || "all"}:${appliedFilters.createdFrom.value || "none"}:${appliedFilters.createdTo.value || "none"}:${pagination.page.value}:${pagination.pageSize.value}`,
    () => {
      if (!canReadPayments.value) {
        return Promise.resolve(emptyPayments());
      }

      return paymentApi.searchPayments({
        keyword: appliedFilters.keyword.value || undefined,
        status: appliedFilters.status.value || undefined,
        method: appliedFilters.method.value || undefined,
        provider: appliedFilters.provider.value || undefined,
        createdFrom: appliedFilters.createdFrom.value || undefined,
        createdTo: appliedFilters.createdTo.value || undefined,
        page: pagination.page.value,
        size: Number(pagination.pageSize.value),
      });
    },
  );

  // 6. Computed derivations
  watch(() => data.value?.totalCount, (count) => {
    totalItems.value = count ?? 0;
  }, { immediate: true });

  const payments = computed(() => data.value?.items ?? []);
  const totalPayments = computed(() => data.value?.totalCount ?? 0);
  const loadErrorMessage = computed(() => getProblemMessage(error.value, "The payment ledger is not available right now."));

  const summaryStats = computed(() => [
    { label: "Payments", value: `${totalPayments.value}`, detail: "Payments matching the current admin search." },
    { label: "Succeeded", value: `${payments.value.filter((payment) => payment.status === "Succeeded").length}`, detail: "Succeeded payments on this page." },
    { label: "Pending", value: `${payments.value.filter((payment) => payment.status === "Pending" || payment.status === "Processing").length}`, detail: "Payments waiting for provider or fallback resolution." },
    { label: "Failed", value: `${payments.value.filter((payment) => payment.status === "Failed").length}`, detail: "Failed payments on this page." },
  ]);

  // 7. Actions/mutations
  // (none for payment index)

  // 8. Watchers
  // (pagination reset on filter apply and pageSize change handled by usePagination and useFilters)

  // 9. Return statement
  return {
    applyFilters,
    canReadPayments,
    clearFilters,
    error,
    hasActiveFilters,
    loadErrorMessage,
    localFilters,
    paymentMethodOptions,
    paymentProviderOptions,
    paymentStatusOptions,
    payments,
    pending,
    refresh,
    summaryStats,
    totalPayments,
    ...pagination,
  };
};

export type PaymentIndexPageState = Awaited<ReturnType<typeof usePaymentIndexPage>>;
