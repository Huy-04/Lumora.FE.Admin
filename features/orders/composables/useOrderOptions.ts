import type { OrderPaymentStatus, OrderStatus } from "~/features/orders/types/orders";

export const useOrderOptions = () => {
  const orderStatusOptions: Array<{ label: string; value: OrderStatus | "" }> = [
    { label: "All order states", value: "" },
    { label: "Pending", value: "Pending" },
    { label: "Confirmed", value: "Confirmed" },
    { label: "Processing", value: "Processing" },
    { label: "In transit", value: "InTransit" },
    { label: "Delivered", value: "Delivered" },
    { label: "Completed", value: "Completed" },
    { label: "Cancelled", value: "Cancelled" },
    { label: "Returned to sender", value: "ReturnedToSender" },
  ];

  const paymentStatusOptions: Array<{ label: string; value: OrderPaymentStatus | "" }> = [
    { label: "All payment states", value: "" },
    { label: "Awaiting", value: "Awaiting" },
    { label: "Paid", value: "Paid" },
    { label: "Failed", value: "Failed" },
  ];

  return {
    orderStatusOptions,
    paymentStatusOptions,
  };
};
