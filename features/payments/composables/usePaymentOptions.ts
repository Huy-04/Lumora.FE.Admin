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
    { label: "PayOs", value: "PayOs" },
  ];

  const paymentProviderOptions: Array<{ label: string; value: PaymentProvider | "" }> = [
    { label: "All providers", value: "" },
    { label: "None", value: "None" },
    { label: "PayOs", value: "PayOs" },
  ];

  return {
    paymentMethodOptions,
    paymentProviderOptions,
    paymentStatusOptions,
  };
};
