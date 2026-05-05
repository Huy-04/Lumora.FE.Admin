export const useInventoryOptions = () => {
  const stockStatusOptions = [
    { label: "Available", value: "0" },
    { label: "Unavailable", value: "1" },
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
