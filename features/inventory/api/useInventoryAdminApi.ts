import type {
  AddStockRequest,
  AdjustQuantityRequest,
  CreateInventoryRequest,
  InventoryListResponse,
  InventoryResponse,
  SetReorderPointRequest,
  SetStockStatusRequest,
} from "~/features/inventory/types/inventory";

const inventoryRoute = (path = "") => `/inventories${path}`;

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
  };
};
