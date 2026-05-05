const toTextValue = (value: string | number | null | undefined) => String(value ?? "").trim();

const parseNumber = (
  value: string | number | null | undefined,
  label: string,
  options?: {
    integer?: boolean;
    optional?: boolean;
  },
) => {
  const normalized = toTextValue(value);

  if (!normalized) {
    if (options?.optional) {
      return null;
    }

    throw new Error(`${label} is required.`);
  }

  const parsed = Number(normalized);
  if (!Number.isFinite(parsed)) {
    throw new Error(`${label} must be a valid number.`);
  }

  if (options?.integer && !Number.isInteger(parsed)) {
    throw new Error(`${label} must be a whole number.`);
  }

  return parsed;
};

export const useNumericForm = () => ({
  parseRequiredInt: (value: string | number | null | undefined, label: string) =>
    parseNumber(value, label, { integer: true }) as number,
  parseRequiredNumber: (value: string | number | null | undefined, label: string) =>
    parseNumber(value, label) as number,
  parseOptionalNumber: (value: string | number | null | undefined, label: string) =>
    parseNumber(value, label, { optional: true }),
});
