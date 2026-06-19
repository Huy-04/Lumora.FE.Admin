import type { PaginatedResponse } from "~/Shared/types/api";

export type WarehouseStatus = "Active" | "Inactive";

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

export type WarehouseListResponse = PaginatedResponse<WarehouseResponse>;
