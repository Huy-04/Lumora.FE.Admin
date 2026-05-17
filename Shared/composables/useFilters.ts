import type { ComputedRef, Ref } from "vue";

interface FilterOptions {
  onApply?: () => void;
}

interface FilterReturn<T extends Record<string, unknown>> {
  localFilters: { [K in keyof T]: Ref<T[K]> };
  appliedFilters: { [K in keyof T]: Ref<T[K]> };
  applyFilters: () => void;
  clearFilters: () => void;
  hasActiveFilters: ComputedRef<boolean>;
}

export const useFilters = <T extends Record<string, unknown>>(
  defaults: T,
  options: FilterOptions = {},
): FilterReturn<T> => {
  const { onApply } = options;

  const localFilters = Object.fromEntries(
    Object.entries(defaults).map(([key, value]) => [key, ref(value)]),
  ) as { [K in keyof T]: Ref<T[K]> };

  const appliedFilters = Object.fromEntries(
    Object.entries(defaults).map(([key, value]) => [key, ref(value)]),
  ) as { [K in keyof T]: Ref<T[K]> };

  const applyFilters = () => {
    for (const key of Object.keys(defaults)) {
      (appliedFilters as Record<string, Ref>)[key].value =
        (localFilters as Record<string, Ref>)[key].value;
    }
    onApply?.();
  };

  const clearFilters = () => {
    for (const [key, value] of Object.entries(defaults)) {
      (localFilters as Record<string, Ref>)[key].value = value;
    }
    applyFilters();
  };

  const hasActiveFilters = computed(() =>
    Object.entries(defaults).some(
      ([key, defaultValue]) =>
        (appliedFilters as Record<string, Ref>)[key].value !== defaultValue,
    ),
  );

  return {
    localFilters,
    appliedFilters,
    applyFilters,
    clearFilters,
    hasActiveFilters,
  };
};
