import type { PaymentMethod, PaymentProvider, PaymentStatus } from "~/features/payments/types";

export const usePaymentOptions = () => {
  const paymentStatusOptions: Array<{ label: string; value: PaymentStatus | "" }> = [
    { label: "All payment states", value: "" },
    { label: "Pending", value: "Pending" },
    { label: "Processing", value: "Processing" },
    { label: "Succeeded", value: "Succeeded" },
    { label: "Failed", value: "Failed" },
  ];

  const paymentMethodOptions: Array<{ label: string; value: PaymentMethod | "" }> = [
    { label: "All methods", value: "" },
    { label: "COD", value: "COD" },
    { label: "VnPay", value: "VnPay" },
  ];

  const paymentProviderOptions: Array<{ label: string; value: PaymentProvider | "" }> = [
    { label: "All providers", value: "" },
    { label: "None", value: "None" },
    { label: "VnPay", value: "VnPay" },
  ];

  return {
    paymentMethodOptions,
    paymentProviderOptions,
    paymentStatusOptions,
  };
};
