export const useInventoryOptions = () => {
  const stockStatusOptions = [
    { label: "Active", value: "0" },
    { label: "OutOfStock", value: "1" },
    { label: "Locked", value: "2" },
  ];

  const warehouseCodeOptions = [
    { label: "HN", value: "1" },
    { label: "HCM", value: "2" },
    { label: "DN", value: "3" },
  ];

  return {
    stockStatusOptions,
    warehouseCodeOptions,
  };
};
