import type { Ref, ComputedRef } from "vue";

export interface PaginationOptions {
  defaultPageSize?: number;
  pageSizeOptions?: Array<{ label: string; value: string }>;
}

export interface PaginationReturn {
  page: Ref<number>;
  pageSize: Ref<string>;
  pageSizeOptions: Array<{ label: string; value: string }>;
  totalPages: ComputedRef<number>;
  firstItemNumber: ComputedRef<number>;
  lastItemNumber: ComputedRef<number>;
  goToNextPage: () => void;
  goToPreviousPage: () => void;
}

export const usePagination = (
  totalItems: Ref<number> | ComputedRef<number>,
  options: PaginationOptions = {},
): PaginationReturn => {
  const {
    defaultPageSize = 20,
    pageSizeOptions = [
      { label: "20", value: "20" },
      { label: "50", value: "50" },
      { label: "100", value: "100" },
    ],
  } = options;

  const page = ref(1);
  const pageSize = ref(String(defaultPageSize));

  const totalPages = computed(() =>
    Math.max(1, Math.ceil(toValue(totalItems) / Number(pageSize.value))),
  );

  const firstItemNumber = computed(() =>
    toValue(totalItems) === 0 ? 0 : (page.value - 1) * Number(pageSize.value) + 1,
  );

  const lastItemNumber = computed(() =>
    Math.min(page.value * Number(pageSize.value), toValue(totalItems)),
  );

  const goToNextPage = () => {
    if (page.value < totalPages.value) page.value += 1;
  };

  const goToPreviousPage = () => {
    if (page.value > 1) page.value -= 1;
  };

  watch(pageSize, () => {
    page.value = 1;
  });

  return {
    page,
    pageSize,
    pageSizeOptions,
    totalPages,
    firstItemNumber,
    lastItemNumber,
    goToNextPage,
    goToPreviousPage,
  };
};
