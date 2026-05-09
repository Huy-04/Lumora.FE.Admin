import type { PaginatedResponse } from "~/Shared/types/api";

export type WarehouseStatus = "Active" | "Inactive";
export type InventoryStockStatus = "Active" | "OutOfStock" | "Locked";
export type InventoryStockAlertStatus = "InStock" | "LowStock" | "OutOfStock";

export interface WarehouseGhnStoreResponse {
  shopId: number;
  shopName: string;
  shopPhone: string;
  pickupAddress: string;
  districtId: number;
  wardCode: string;
  storeStatus: number;
  syncedAt: string;
}

export interface WarehouseResponse {
  id: string;
  code: number;
  name: string;
  address: string;
  phoneNational: string;
  status: WarehouseStatus;
  ghnStore?: WarehouseGhnStoreResponse | null;
  createdBy: string;
  updatedBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface InventoryStockResponse {
  id: string;
  inventoryId: string;
  warehouseId: string;
  quantity: number;
  reservedQuantity: number;
  availableQuantity: number;
  status: InventoryStockStatus | string;
  reorderPoint?: number | null;
  alertStatus: InventoryStockAlertStatus | string;
}

export interface InventoryResponse {
  id: string;
  productVariantId: string;
  productId: string;
  sku: string;
  totalQuantity: number;
  totalReservedQuantity: number;
  totalAvailableQuantity: number;
  stocks: InventoryStockResponse[];
  createdBy: string;
  updatedBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateWarehouseRequest {
  code: number;
  name: string;
  address: string;
  phoneNational: string;
}

export interface UpdateWarehouseRequest {
  name?: string | null;
  address?: string | null;
  phoneNational?: string | null;
}

export interface SyncWarehouseGhnStoreRequest {
  ghnShopId: number;
}

export interface CreateInventoryRequest {
  productVariantId: string;
}

export interface AddStockRequest {
  warehouseId: string;
  quantity: number;
  reorderPoint?: number | null;
}

export interface AdjustQuantityRequest {
  warehouseId: string;
  delta: number;
}

export interface SetStockStatusRequest {
  warehouseId: string;
  status: number;
}

export interface SetReorderPointRequest {
  warehouseId: string;
  reorderPoint?: number | null;
}

export type InventoryListResponse = PaginatedResponse<InventoryResponse>;
