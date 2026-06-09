export const useInventoryOptions = () => {
  const stockStatusOptions = [
    { label: "Active", value: "0" },
    { label: "OutOfStock", value: "1" },
    { label: "Locked", value: "2" },
  ];

  const stockStatusFilterOptions = [
    { label: "All statuses", value: "" },
    { label: "Active", value: "0" },
    { label: "Out of Stock", value: "1" },
    { label: "Locked", value: "2" },
  ];

  const warehouseCodeOptions = [
    { label: "HN", value: "0" },
    { label: "HCM", value: "1" },
    { label: "DN", value: "2" },
  ];

  return {
    stockStatusOptions,
    stockStatusFilterOptions,
    warehouseCodeOptions,
  };
};
