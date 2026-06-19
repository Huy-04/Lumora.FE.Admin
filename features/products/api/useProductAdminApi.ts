import type { PaginatedResponse } from "~/Shared/types/api";
import type {
  AddImageRequest,
  AddVariantRequest,
  ChangeVariantStatusRequest,
  CreateProductRequest,
  ProductAttributeResponse,
  ProductAssetResponse,
  ProductAssetsResponse,
  ProductGalleryResponse,
  ProductResponse,
  ProductVariantResponse,
  ReorderProductsRequest,
  ReorderImagesRequest,
  ReorderVariantsRequest,
  UpdateImageRequest,
  UpdateImageAltRequest,
  UpdateProductRequest,
  UpdateVariantRequest,
} from "~/features/products/types/products";

const productRoute = (path = "") => `/Products${path}`;
const productChildRoute = (productId: string, childPath = "") => `/Products/${productId}${childPath}`;

export const useProductAdminApi = () => {
  const api = useApiClient();

  return {
    getProducts: (page = 1, size = 50) =>
      api.request<PaginatedResponse<ProductResponse>>(`${productRoute()}${toSearchParams({ page, size })}`),

    getAllProducts: (page = 1, size = 50) =>
      api.request<PaginatedResponse<ProductResponse>>(`${productRoute("/all")}${toSearchParams({ page, size })}`),

    searchProducts: (params: Record<string, string | number | boolean | undefined | null>) =>
      api.request<PaginatedResponse<ProductResponse>>(`${productRoute("/search")}${toSearchParams(params)}`),

    getProductById: (id: string) => api.request<ProductResponse>(productChildRoute(id)),

    getProductBySlug: (slug: string) =>
      api.request<ProductResponse>(productRoute(`/slug/${encodeURIComponent(slug)}`)),

    getProductsByCategory: (categoryId: string, page = 1, size = 50) =>
      api.request<PaginatedResponse<ProductResponse>>(
        `${productRoute(`/category/${categoryId}`)}${toSearchParams({ page, size })}`,
      ),

    createProduct: (payload: CreateProductRequest) =>
      api.request<ProductResponse>(productRoute(), {
        method: "POST",
        body: payload,
      }),

    updateProduct: (id: string, payload: UpdateProductRequest) =>
      api.request<ProductResponse>(productChildRoute(id), {
        method: "PUT",
        body: payload,
      }),

    reorderProducts: (payload: ReorderProductsRequest) =>
      api.request<void>(productRoute("/reorder"), {
        method: "POST",
        body: payload,
      }),

    deleteProduct: (id: string) =>
      api.request<void>(productChildRoute(id), {
        method: "DELETE",
      }),

    publishProduct: (id: string) =>
      api.request<ProductResponse>(productChildRoute(id, "/publish"), {
        method: "POST",
      }),

    unpublishProduct: (id: string) =>
      api.request<ProductResponse>(productChildRoute(id, "/unpublish"), {
        method: "POST",
      }),

    discontinueProduct: (id: string) =>
      api.request<ProductResponse>(productChildRoute(id, "/discontinue"), {
        method: "POST",
      }),

    republishProduct: (id: string) =>
      api.request<ProductResponse>(productChildRoute(id, "/republish"), {
        method: "PATCH",
      }),

    restoreProduct: (id: string) =>
      api.request<ProductResponse>(productChildRoute(id, "/restore"), {
        method: "POST",
      }),

    markProductFeatured: (id: string) =>
      api.request<ProductResponse>(productChildRoute(id, "/mark-featured"), {
        method: "POST",
      }),

    unmarkProductFeatured: (id: string) =>
      api.request<ProductResponse>(productChildRoute(id, "/unmark-featured"), {
        method: "POST",
      }),

    getProductVariants: (id: string) =>
      api.request<ProductVariantResponse[]>(productChildRoute(id, "/variants")),

    addProductVariant: (id: string, payload: AddVariantRequest) =>
      api.request<ProductResponse>(productChildRoute(id, "/variants"), {
        method: "POST",
        body: payload,
      }),

    updateProductVariant: (id: string, variantId: string, payload: UpdateVariantRequest) =>
      api.request<ProductResponse>(productChildRoute(id, `/variants/${variantId}`), {
        method: "PUT",
        body: payload,
      }),

    removeProductVariant: (id: string, variantId: string) =>
      api.request<ProductResponse>(productChildRoute(id, `/variants/${variantId}`), {
        method: "DELETE",
      }),

    setProductDefaultVariant: (id: string, variantId: string) =>
      api.request<ProductResponse>(productChildRoute(id, `/variants/${variantId}/set-default`), {
        method: "POST",
      }),

    changeProductVariantStatus: (id: string, variantId: string, payload: ChangeVariantStatusRequest) =>
      api.request<ProductResponse>(productChildRoute(id, `/variants/${variantId}/status`), {
        method: "POST",
        body: payload,
      }),

    reorderProductVariants: (id: string, payload: ReorderVariantsRequest) =>
      api.request<ProductResponse>(productChildRoute(id, "/variants/reorder"), {
        method: "POST",
        body: payload,
      }),

    getProductGallery: (productId: string) =>
      api.request<ProductGalleryResponse>(productChildRoute(productId, "/gallery")),

    getProductAssets: (productId: string) =>
      api.request<ProductAssetsResponse>(productChildRoute(productId, "/assets")),

    uploadProductAsset: (productId: string, file: File) => {
      const formData = new FormData();
      formData.set("file", file);

      return api.request<ProductAssetResponse>(productChildRoute(productId, "/assets"), {
        method: "POST",
        body: formData,
      });
    },

    uploadProductAssets: (productId: string, files: File[]) => {
      const formData = new FormData();
      for (const file of files) {
        formData.append("files", file);
      }

      return api.request<ProductAssetsResponse>(productChildRoute(productId, "/assets/batch"), {
        method: "POST",
        body: formData,
      });
    },

    removeProductAsset: (productId: string, assetId: string) =>
      api.request<void>(productChildRoute(productId, `/assets/${assetId}`), {
        method: "DELETE",
      }),

    removeProductAssets: (productId: string, assetIds: string[]) =>
      api.request<void>(productChildRoute(productId, "/assets/remove-batch"), {
        method: "POST",
        body: { assetIds },
      }),

    addProductImage: (productId: string, payload: AddImageRequest) =>
      api.request<ProductGalleryResponse>(productChildRoute(productId, "/gallery"), {
        method: "POST",
        body: payload,
      }),

    removeProductImage: (productId: string, imageId: string) =>
      api.request<ProductGalleryResponse>(productChildRoute(productId, `/gallery/${imageId}`), {
        method: "DELETE",
      }),

    updateProductImageAlt: (productId: string, imageId: string, payload: UpdateImageAltRequest) =>
      api.request<ProductGalleryResponse>(productChildRoute(productId, `/gallery/${imageId}/alt`), {
        method: "PUT",
        body: payload,
      }),

    updateProductImage: (productId: string, imageId: string, payload: UpdateImageRequest) =>
      api.request<ProductGalleryResponse>(productChildRoute(productId, `/gallery/${imageId}`), {
        method: "PUT",
        body: payload,
      }),

    setPrimaryProductImage: (productId: string, imageId: string) =>
      api.request<ProductGalleryResponse>(productChildRoute(productId, `/gallery/${imageId}/set-primary`), {
        method: "POST",
      }),

    reorderProductImages: (productId: string, payload: ReorderImagesRequest) =>
      api.request<ProductGalleryResponse>(productChildRoute(productId, "/gallery/reorder"), {
        method: "POST",
        body: payload,
      }),

    getProductAttributes: (productId: string) =>
      api.request<ProductAttributeResponse>(productChildRoute(productId, "/attributes")),

    addProductSkinType: (productId: string, skinType: number) =>
      api.request<ProductAttributeResponse>(productChildRoute(productId, `/attributes/skin-types/${skinType}`), {
        method: "POST",
      }),

    removeProductSkinType: (productId: string, skinType: number) =>
      api.request<ProductAttributeResponse>(productChildRoute(productId, `/attributes/skin-types/${skinType}`), {
        method: "DELETE",
      }),

    addProductSkinConcern: (productId: string, skinConcern: number) =>
      api.request<ProductAttributeResponse>(productChildRoute(productId, `/attributes/skin-concerns/${skinConcern}`), {
        method: "POST",
      }),

    removeProductSkinConcern: (productId: string, skinConcern: number) =>
      api.request<ProductAttributeResponse>(productChildRoute(productId, `/attributes/skin-concerns/${skinConcern}`), {
        method: "DELETE",
      }),
  };
};
