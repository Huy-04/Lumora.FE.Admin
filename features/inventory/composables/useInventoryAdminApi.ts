import type {
  AddStockRequest,
  AdjustQuantityRequest,
  CreateInventoryRequest,
  CreateWarehouseRequest,
  InventoryListResponse,
  InventoryResponse,
  SetReorderPointRequest,
  SetStockStatusRequest,
  SyncWarehouseGhnStoreRequest,
  UpdateWarehouseRequest,
  WarehouseListResponse,
  WarehouseResponse,
} from "~/features/inventory/types";

const inventoryRoute = (path = "") => `/inventories${path}`;
const warehouseRoute = (path = "") => `/warehouses${path}`;

export const useInventoryAdminApi = () => {
  const api = useApiClient();

  return {
    getInventories: (page = 1, size = 20) =>
      api.request<InventoryListResponse>(`${inventoryRoute()}${toSearchParams({ page, size })}`),

    searchInventories: (params: {
      keyword?: string;
      sku?: string;
      productId?: string;
      productVariantId?: string;
      warehouseId?: string;
      stockStatus?: number;
      page?: number;
      size?: number;
    }) =>
      api.request<InventoryListResponse>(`${inventoryRoute("/search")}${toSearchParams({
        keyword: params.keyword,
        sku: params.sku,
        productId: params.productId,
        productVariantId: params.productVariantId,
        warehouseId: params.warehouseId,
        stockStatus: params.stockStatus,
        page: params.page ?? 1,
        size: params.size ?? 20,
      })}`),

    getInventoryById: (inventoryId: string) =>
      api.request<InventoryResponse>(inventoryRoute(`/${inventoryId}`)),

    getInventoryByProductVariantId: (productVariantId: string) =>
      api.request<InventoryResponse>(inventoryRoute(`/by-product-variant/${productVariantId}`)),

    createInventory: (payload: CreateInventoryRequest) =>
      api.request<InventoryResponse>(inventoryRoute(), {
        method: "POST",
        body: payload,
      }),

    removeInventory: (inventoryId: string) =>
      api.request<void>(inventoryRoute(`/${inventoryId}`), { method: "DELETE" }),

    addStock: (inventoryId: string, payload: AddStockRequest) =>
      api.request<InventoryResponse>(inventoryRoute(`/${inventoryId}/stocks`), {
        method: "POST",
        body: payload,
      }),

    adjustQuantity: (inventoryId: string, payload: AdjustQuantityRequest) =>
      api.request<InventoryResponse>(inventoryRoute(`/${inventoryId}/quantity`), {
        method: "PUT",
        body: payload,
      }),

    setStockStatus: (inventoryId: string, payload: SetStockStatusRequest) =>
      api.request<InventoryResponse>(inventoryRoute(`/${inventoryId}/status`), {
        method: "PUT",
        body: payload,
      }),

    setReorderPoint: (inventoryId: string, payload: SetReorderPointRequest) =>
      api.request<InventoryResponse>(inventoryRoute(`/${inventoryId}/reorder-point`), {
        method: "PUT",
        body: payload,
      }),

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
