export type ProductStatus = "Draft" | "Published" | "Discontinued";
export type GenderTarget = "Unisex" | "Female" | "Male";
export type VariantStatus = "Active" | "Inactive";
export type SkinType = "All" | "Oily" | "Dry" | "Combination" | "Normal" | "Sensitive";
export type SkinConcern = "Acne" | "Aging" | "Darkspots" | "Dryness" | "Oiliness" | "Sensitivity" | "UnevenTone" | "LargePores" | "Dullness" | "Redness";

export interface ProductContentResponse {
  shortDescription?: string | null;
  description?: string | null;
  highlights?: string | null;
  ingredients?: string | null;
  howToUse?: string | null;
  storageGuide?: string | null;
  caution?: string | null;
  brandOrigin?: string | null;
  manufactureLocation?: string | null;
  manufactureDateNote?: string | null;
  shelfLifeNote?: string | null;
}

export interface ProductResponse {
  id: string;
  categoryId: string;
  name: string;
  brand: string;
  slug: string;
  content: ProductContentResponse;
  img?: string | null;
  sortOrder: number;
  status: ProductStatus;
  isFeatured: boolean;
  genderTarget: GenderTarget;
  seoTitle?: string | null;
  seoDescription?: string | null;
  isDeleted: boolean;
  deletedAt?: string | null;
  createdBy: string;
  updatedBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface ProductVariantResponse {
  id: string;
  sku: string;
  name: string;
  price: number;
  compareAtPrice?: number | null;
  weight: number;
  length: number;
  width: number;
  height: number;
  sortOrder: number;
  isDefault: boolean;
  status: VariantStatus;
  productAssetId?: string | null;
  img?: string | null;
}

export interface ProductImageResponse {
  id: string;
  img: string;
  alt?: string | null;
  sortOrder: number;
  isPrimary: boolean;
}

export interface ProductAssetResponse {
  id: string;
  productId: string;
  img: string;
  storagePath: string;
}

export interface ProductAssetsResponse {
  productId: string;
  assets: ProductAssetResponse[];
}

export interface ProductGalleryResponse {
  id: string;
  productId: string;
  images: ProductImageResponse[];
  createdBy: string;
  updatedBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface ProductAttributeResponse {
  id: string;
  productId: string;
  skinTypes: SkinType[];
  skinConcerns: SkinConcern[];
  createdBy: string;
  updatedBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateProductRequest {
  categoryId: string;
  name: string;
  brand: string;
  slug: string;
  genderTarget: number;
  content?: ProductContentResponse | null;
  seoTitle?: string | null;
  seoDescription?: string | null;
}

export interface UpdateProductRequest {
  name: string;
  brand: string;
  slug: string;
  genderTarget: number;
  categoryId: string;
  content?: ProductContentResponse | null;
  seoTitle?: string | null;
  seoDescription?: string | null;
}

export interface ReorderProductItemRequest {
  productId: string;
  sortOrder: number;
}

export interface ReorderProductsRequest {
  items: ReorderProductItemRequest[];
}

export interface AddVariantRequest {
  sku: string;
  name: string;
  price: number;
  weight: number;
  length: number;
  width: number;
  height: number;
  compareAtPrice?: number | null;
  productAssetId?: string | null;
}

export interface UpdateVariantRequest {
  sku: string;
  name: string;
  price: number;
  weight: number;
  length: number;
  width: number;
  height: number;
  compareAtPrice?: number | null;
  productAssetId?: string | null;
}

export interface ChangeVariantStatusRequest {
  status: number;
}

export interface ReorderVariantItemRequest {
  variantId: string;
  sortOrder: number;
}

export interface ReorderVariantsRequest {
  items: ReorderVariantItemRequest[];
}

export interface AddImageRequest {
  assetId: string;
  alt?: string | null;
}

export interface UpdateImageAltRequest {
  alt?: string | null;
}

export interface UpdateImageRequest {
  assetId: string;
  alt?: string | null;
}

export interface ReorderImageItemRequest {
  imageId: string;
  sortOrder: number;
}

export interface ReorderImagesRequest {
  items: ReorderImageItemRequest[];
}
