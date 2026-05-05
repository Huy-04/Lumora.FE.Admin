import { toSearchParams } from "~/Shared/api/queryParams";
import type {
  AddStockRequest,
  AdjustQuantityRequest,
  CreateInventoryRequest,
  CreateWarehouseRequest,
  InventoryListResponse,
  InventoryResponse,
  SetLowStockThresholdRequest,
  SetStockStatusRequest,
  SyncWarehouseGhnStoreRequest,
  UpdateWarehouseRequest,
  WarehouseResponse,
} from "~/features/inventory/types";

const inventoryRoute = (path = "") => `/inventories${path}`;
const warehouseRoute = (path = "") => `/warehouses${path}`;

export const useInventoryAdminApi = () => {
  const api = useApiClient();

  return {
    getInventories: (page = 1, size = 50) =>
      api.request<InventoryListResponse>(`${inventoryRoute()}${toSearchParams({ page, size })}`),

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

    setLowStockThreshold: (inventoryId: string, payload: SetLowStockThresholdRequest) =>
      api.request<InventoryResponse>(inventoryRoute(`/${inventoryId}/threshold`), {
        method: "PUT",
        body: payload,
      }),

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
      api.request<WarehouseResponse>(warehouseRoute(`/${warehouseId}/activate`), { method: "PUT" }),

    deactivateWarehouse: (warehouseId: string) =>
      api.request<WarehouseResponse>(warehouseRoute(`/${warehouseId}/deactivate`), { method: "PUT" }),

    syncWarehouseGhnStore: (warehouseId: string, payload: SyncWarehouseGhnStoreRequest) =>
      api.request<WarehouseResponse>(warehouseRoute(`/${warehouseId}/ghn-store/sync`), {
        method: "POST",
        body: payload,
      }),
  };
};
