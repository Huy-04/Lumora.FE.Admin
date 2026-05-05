export type QueryParamValue = string | number | boolean | undefined | null;

export const toSearchParams = (params: Record<string, QueryParamValue>) => {
  const search = new URLSearchParams();

  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null || value === "") {
      continue;
    }

    search.set(key, String(value));
  }

  const query = search.toString();
  return query ? `?${query}` : "";
};
