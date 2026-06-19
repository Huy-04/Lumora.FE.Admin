import type {
  CreateWarehouseRequest,
  SyncWarehouseGhnStoreRequest,
  UpdateWarehouseRequest,
  WarehouseListResponse,
  WarehouseResponse,
} from "~/features/warehouses/types/warehouses";

const warehouseRoute = (path = "") => `/warehouses${path}`;

export const useWarehouseAdminApi = () => {
  const api = useApiClient();

  return {
    searchWarehouses: (params: {
      keyword?: string;
      code?: number;
      status?: string;
      hasGhnStore?: boolean;
      page?: number;
      size?: number;
    }) =>
      api.request<WarehouseListResponse>(`${warehouseRoute("/search")}${toSearchParams({
        keyword: params.keyword,
        code: params.code,
        status: params.status,
        hasGhnStore: params.hasGhnStore,
        page: params.page ?? 1,
        size: params.size ?? 20,
      })}`),

    getWarehouses: () =>
      api.request<WarehouseResponse[]>(warehouseRoute()),

    getWarehouseById: (warehouseId: string) =>
      api.request<WarehouseResponse>(warehouseRoute(`/${warehouseId}`)),

    createWarehouse: (payload: CreateWarehouseRequest) =>
      api.request<WarehouseResponse>(warehouseRoute(), {
        method: "POST",
        body: payload,
      }),

    updateWarehouse: (warehouseId: string, payload: UpdateWarehouseRequest) =>
      api.request<WarehouseResponse>(warehouseRoute(`/${warehouseId}`), {
        method: "PUT",
        body: payload,
      }),

    activateWarehouse: (warehouseId: string) =>
      api.request<WarehouseResponse>(warehouseRoute(`/${warehouseId}/activate`), { method: "POST" }),

    deactivateWarehouse: (warehouseId: string) =>
      api.request<WarehouseResponse>(warehouseRoute(`/${warehouseId}/deactivate`), { method: "POST" }),

    syncWarehouseGhnStore: (warehouseId: string, payload: SyncWarehouseGhnStoreRequest) =>
      api.request<WarehouseResponse>(warehouseRoute(`/${warehouseId}/ghn-store/sync`), {
        method: "POST",
        body: payload,
      }),

    removeWarehouse: (warehouseId: string) =>
      api.request<void>(warehouseRoute(`/${warehouseId}`), { method: "DELETE" }),
  };
};
