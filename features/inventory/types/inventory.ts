import type { PaginatedResponse } from "~/Shared/types/api";

export type InventoryStockStatus = "Active" | "OutOfStock" | "Locked";
export type InventoryStockAlertStatus = "InStock" | "LowStock" | "OutOfStock";

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

