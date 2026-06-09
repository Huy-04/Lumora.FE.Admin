export const toUtcDateFilter = (value: string | undefined | null, boundary: "start" | "end") => {
  if (!value) return undefined;

  return boundary === "start"
    ? `${value}T00:00:00.000Z`
    : `${value}T23:59:59.999Z`;
};
