const pad = (value: number) => String(value).padStart(2, "0");

export const toDateTimeLocalValue = (value?: string | null) => {
  if (!value) return "";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";

  return [
    date.getFullYear(),
    pad(date.getMonth() + 1),
    pad(date.getDate()),
  ].join("-") + `T${pad(date.getHours())}:${pad(date.getMinutes())}`;
};

export const toUtcIsoFromDateTimeLocal = (value: string) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    throw new Error("Invalid date value.");
  }

  return date.toISOString();
};

export const toUtcDateFilter = (value: string | undefined | null, boundary: "start" | "end") => {
  if (!value) return undefined;

  return boundary === "start"
    ? `${value}T00:00:00.000Z`
    : `${value}T23:59:59.999Z`;
};

export const isAtLeastHoursApart = (start: string, end: string, hours: number) => {
  const startsAt = new Date(start);
  const expiresAt = new Date(end);

  if (Number.isNaN(startsAt.getTime()) || Number.isNaN(expiresAt.getTime())) {
    return false;
  }

  return expiresAt.getTime() - startsAt.getTime() >= hours * 60 * 60 * 1000;
};

export const hasAtMostDecimalPlaces = (value: number, places: number) => {
  if (!Number.isFinite(value)) return false;

  const [, decimals = ""] = String(value).split(".");
  return decimals.length <= places;
};
