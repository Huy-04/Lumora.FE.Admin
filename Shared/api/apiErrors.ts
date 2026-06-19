import { friendlyErrorMessages, friendlyFieldLabels } from "./apiErrorMessages";
import type {
  ProblemDetails,
  ProblemErrorDetail,
  ValidationProblemErrors,
} from "~/Shared/types/api";

export const getProblemDetails = (error: unknown): ProblemDetails | null => {
  const candidate = error as {
    data?: ProblemDetails;
    response?: {
      _data?: ProblemDetails;
    };
  } | null;

  return candidate?.data ?? candidate?.response?._data ?? null;
};

export const getProblemStatus = (error: unknown): number | null => {
  const problem = getProblemDetails(error);
  const candidate = error as {
    status?: number;
    statusCode?: number;
    response?: {
      status?: number;
      statusCode?: number;
    };
  } | null;

  return problem?.status
    ?? candidate?.status
    ?? candidate?.statusCode
    ?? candidate?.response?.status
    ?? candidate?.response?.statusCode
    ?? null;
};

export const getProblemCodes = (error: unknown) => {
  const problem = getProblemDetails(error);
  const errorCodes = normalizeProblemErrors(problem?.errors).map((entry) => entry.errorCode);

  return new Set(
    [problem?.title, ...errorCodes]
      .filter((value): value is string => Boolean(value)),
  );
};

const toSentenceCase = (value: string) =>
  value
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    .replace(/[_-]+/g, " ")
    .trim()
    .replace(/^\w/, (char) => char.toUpperCase());

const normalizeFieldName = (field?: string | null) => {
  if (!field) {
    return null;
  }

  const normalizedField = field
    .replace(/^\$\./, "")
    .replace(/^\$$/, "")
    .replace(/^request\./i, "")
    .replace(/\[(\d+)\]/g, " $1 ")
    .replace(/\./g, " ")
    .trim();

  return normalizedField || null;
};

const getFriendlyFieldLabel = (field?: string | null) => {
  const normalizedField = normalizeFieldName(field);

  if (!normalizedField) {
    return null;
  }

  return friendlyFieldLabels[normalizedField] ?? toSentenceCase(normalizedField);
};

const getNumericParameter = (parameter: ProblemErrorDetail["parameter"], key: string) => {
  const value = parameter?.[key];
  if (typeof value === "number") {
    return value;
  }

  if (typeof value === "string") {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }

  return null;
};

const getBooleanParameter = (parameter: ProblemErrorDetail["parameter"], key: string) => parameter?.[key] === true;

const formatPasswordRequirementMessage = (entry: ProblemErrorDetail) => {
  const minimumLength = getNumericParameter(entry.parameter, "Minimum") ?? getNumericParameter(entry.parameter, "minLength") ?? 8;
  const requirements = [];

  if (getBooleanParameter(entry.parameter, "requireUppercase")) {
    requirements.push("an uppercase letter");
  }

  if (getBooleanParameter(entry.parameter, "requireLowercase")) {
    requirements.push("a lowercase letter");
  }

  if (getBooleanParameter(entry.parameter, "requireDigit")) {
    requirements.push("a number");
  }

  if (getBooleanParameter(entry.parameter, "requireSpecialCharacter")) {
    requirements.push("a special character");
  }

  if (!requirements.length) {
    return `Password must be at least ${minimumLength} characters long.`;
  }

  return `Password must be at least ${minimumLength} characters long and include ${requirements.join(", ")}.`;
};

const formatProblemError = (entry: ProblemErrorDetail) => {
  const fieldLabel = getFriendlyFieldLabel(entry.field);
  const normalizedField = normalizeFieldName(entry.field);

  switch (entry.errorCode) {
    case "TOKEN_REVOKED":
    case "TokenRevoked":
      if (normalizedField === "Authorization") {
        return "Your previous session is no longer valid. Please sign in again.";
      }

      if (normalizedField === "PasswordHash") {
        return "This reset code is invalid or has expired. Please request a new code and try again.";
      }

      if (normalizedField === "EmailStatus" || normalizedField === "Email") {
        return "This verification code is invalid or has expired. Please request a new code and try again.";
      }

      if (normalizedField === "PhoneStatus" || normalizedField === "Phone") {
        return "This phone verification code is invalid or has expired. Please request a new code and try again.";
      }

      return "This verification request is no longer valid. Please try again.";
    case "InvalidFormat":
      if (normalizedField === "Password") {
        return formatPasswordRequirementMessage(entry);
      }

      if (normalizedField === "Email") {
        return "Email must be a valid email address.";
      }

      if (normalizedField === "Phone") {
        return "Phone must be a valid number for the selected region.";
      }

      if (normalizedField === "Img") {
        return "Image URL must be a valid http:// or https:// URL.";
      }

      if (normalizedField === "Slug") {
        return "Slug can contain lowercase letters, numbers, and single hyphens only.";
      }

      return fieldLabel ? `${fieldLabel} format is invalid.` : friendlyErrorMessages.InvalidFormat;
    case "Required":
      return fieldLabel ? `${fieldLabel} is required.` : friendlyErrorMessages.Required;
    case "MaximumLength":
    {
      const maximumLength = getNumericParameter(entry.parameter, "MaxLength");
      if (!fieldLabel) {
        return friendlyErrorMessages.MaximumLength;
      }

      return maximumLength === null
        ? `${fieldLabel} is too long.`
        : `${fieldLabel} must be at most ${maximumLength} characters long.`;
    }
    case "MinimumLength":
    {
      const minimumLength = getNumericParameter(entry.parameter, "Minimum");
      if (!fieldLabel) {
        return friendlyErrorMessages.MinimumLength;
      }

      return minimumLength === null
        ? `${fieldLabel} is too short.`
        : `${fieldLabel} must be at least ${minimumLength} characters long.`;
    }
    case "AlreadyExists":
      return fieldLabel ? `${fieldLabel} already exists.` : friendlyErrorMessages.AlreadyExists;
    case "AccessDenied":
      return friendlyErrorMessages.AccessDenied;
    default:
      return friendlyErrorMessages[entry.errorCode] ?? (fieldLabel ? `${fieldLabel}: ${entry.errorCode}` : entry.errorCode);
  }
};

const normalizeProblemErrors = (errors: ProblemDetails["errors"]): ProblemErrorDetail[] => {
  if (!errors) {
    return [];
  }

  if (Array.isArray(errors)) {
    return errors;
  }

  return Object.entries(errors as ValidationProblemErrors).flatMap(([field, messages]) => {
    const values = Array.isArray(messages) ? messages : [messages];

    return values
      .filter((message): message is string => Boolean(message))
      .map((message) => ({
        field,
        errorCode: message,
      }));
  });
};

export const getProblemMessage = (error: unknown, fallback = "Request failed."): string => {
  const problem = getProblemDetails(error);
  const status = getProblemStatus(error);
  const normalizedErrors = normalizeProblemErrors(problem?.errors);

  if (normalizedErrors.length) {
    const mapped = normalizedErrors
      .map((entry) => {
        if (friendlyErrorMessages[entry.errorCode]) {
          return formatProblemError(entry);
        }

        const fieldLabel = getFriendlyFieldLabel(entry.field);
        return fieldLabel ? `${fieldLabel}: ${entry.errorCode}` : entry.errorCode;
      })
      .join(" | ");

    return mapped;
  }

  if (problem?.detail) {
    return problem.detail;
  }

  if (problem?.title && !Object.values(friendlyErrorMessages).includes(problem.title)) {
    const friendly = friendlyErrorMessages[problem.title];
    if (friendly) {
      return friendly;
    }
    return problem.title;
  }

  if (status === 401) {
    return "Your session is not available. Please sign in again.";
  }

  if (status === 403) {
    return "You do not have permission to perform this action.";
  }

  if (status === 404) {
    return "The requested resource could not be found.";
  }

  if (status === 409) {
    return "The request could not be completed because the data already exists or has changed.";
  }

  if (status === 422) {
    return "Please review the entered information and try again.";
  }

  if (status === 429) {
    return "Too many requests. Please wait a moment and try again.";
  }

  if (status === 502 || status === 503 || status === 504) {
    return "The server is temporarily unavailable. Please try again in a moment.";
  }

  if (error instanceof Error && error.message) {
    if (error.message.includes("[GET]") || error.message.includes("[POST]") || error.message.includes("[PUT]") || error.message.includes("[DELETE]")) {
      return fallback;
    }

    return error.message;
  }

  return fallback;
};
