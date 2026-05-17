import type { GhnDistrictResponse, GhnProvinceResponse, GhnWardResponse } from "~/features/shipments/types/ghn";

const ghnRoute = (path = "") => `/ghn${path}`;

export const useGhnApi = () => {
  const api = useApiClient();

  return {
    getProvinces: () =>
      api.request<GhnProvinceResponse[]>(ghnRoute("/provinces")),

    getDistricts: (provinceId: number) =>
      api.request<GhnDistrictResponse[]>(`${ghnRoute("/districts")}${toSearchParams({ provinceId })}`),

    getWards: (districtId: number) =>
      api.request<GhnWardResponse[]>(`${ghnRoute("/wards")}${toSearchParams({ districtId })}`),
  };
};
