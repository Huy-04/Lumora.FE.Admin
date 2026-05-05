import type { PaginatedResponse } from "~/Shared/types/api";
import type {
  CategoryRequest,
  CategoryResponse,
  CategoryTreeNodeResponse,
  CategoryUpdateRequest,
  MoveCategoryRequest,
  ReorderCategoryRequest,
} from "~/features/categories/types";
import { toSearchParams } from "~/Shared/api/queryParams";

export const useCategoryAdminApi = () => {
  const api = useApiClient();

  return {
    getCategories: (page = 1, size = 50) =>
      api.request<PaginatedResponse<CategoryResponse>>(`/Categories${toSearchParams({ page, size })}`),

    searchCategories: (params: Record<string, string | number | boolean | undefined | null>) =>
      api.request<PaginatedResponse<CategoryResponse>>(`/Categories/search${toSearchParams(params)}`),

    getCategoryTree: () => api.request<CategoryTreeNodeResponse[]>("/Categories/tree"),

    getAllCategoryTree: () => api.request<CategoryTreeNodeResponse[]>("/Categories/all"),

    getCategoryById: (id: string) => api.request<CategoryResponse>(`/Categories/${id}`),

    createCategory: (payload: CategoryRequest) =>
      api.request<CategoryResponse>("/Categories", {
        method: "POST",
        body: payload,
      }),

    createCategoryChild: (parentId: string, payload: CategoryRequest) =>
      api.request<CategoryResponse>(`/Categories/${parentId}/children`, {
        method: "POST",
        body: payload,
      }),

    updateCategory: (id: string, payload: CategoryUpdateRequest) =>
      api.request<CategoryResponse>(`/Categories/${id}`, {
        method: "PUT",
        body: payload,
      }),

    moveCategory: (id: string, payload: MoveCategoryRequest) =>
      api.request<CategoryResponse>(`/Categories/${id}/move`, {
        method: "POST",
        body: payload,
      }),

    activateCategory: (id: string) =>
      api.request<CategoryResponse>(`/Categories/${id}/activate`, {
        method: "POST",
      }),

    deactivateCategory: (id: string) =>
      api.request<CategoryResponse>(`/Categories/${id}/deactivate`, {
        method: "POST",
      }),

    reorderCategories: (payload: ReorderCategoryRequest) =>
      api.request<void>("/Categories/reorder", {
        method: "POST",
        body: payload,
      }),

    deleteCategory: (id: string) =>
      api.request<void>(`/Categories/${id}`, {
        method: "DELETE",
      }),

    restoreCategory: (id: string) =>
      api.request<CategoryResponse>(`/Categories/${id}/restore`, {
        method: "POST",
      }),
  };
};
