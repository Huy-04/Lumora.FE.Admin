import { getProblemDetails, getProblemMessage } from "~/Shared/api/apiErrors";

const toCouponFieldKey = (field: string) => {
  const normalized = field
    .replace(/^\$\./, "")
    .replace(/^request\./i, "")
    .trim();

  const [root] = normalized.split(".");
  const lower = root.toLowerCase();

  switch (lower) {
    case "code":
    case "percent":
    case "maxdiscountamount":
    case "maxredemptions":
    case "startsat":
    case "expiresat":
      return lower;
    default:
      return null;
  }
};

const toCouponFieldName = (key: string) => {
  switch (key) {
    case "maxdiscountamount":
      return "maxDiscountAmount";
    case "maxredemptions":
      return "maxRedemptions";
    case "startsat":
      return "startsAt";
    case "expiresat":
      return "expiresAt";
    default:
      return key;
  }
};

export const getCouponFieldErrors = (error: unknown) => {
  const problem = getProblemDetails(error);
  const problemErrors = problem?.errors;
  const fieldErrors: Record<string, string> = {};

  if (!problemErrors) {
    return fieldErrors;
  }

  if (Array.isArray(problemErrors)) {
    for (const entry of problemErrors) {
      const fieldKey = entry.field ? toCouponFieldKey(entry.field) : null;
      if (!fieldKey) {
        continue;
      }

      const key = toCouponFieldName(fieldKey);
      if (fieldErrors[key]) {
        continue;
      }

      fieldErrors[key] = getProblemMessage(
        { data: { errors: [entry], status: problem?.status } },
        entry.errorCode,
      );
    }

    return fieldErrors;
  }

  for (const [field, messages] of Object.entries(problemErrors)) {
    const fieldKey = toCouponFieldKey(field);
    if (!fieldKey) {
      continue;
    }

    const key = toCouponFieldName(fieldKey);
    if (fieldErrors[key]) {
      continue;
    }

    const firstMessage = Array.isArray(messages) ? messages[0] : messages;
    if (firstMessage) {
      fieldErrors[key] = firstMessage;
    }
  }

  return fieldErrors;
};
