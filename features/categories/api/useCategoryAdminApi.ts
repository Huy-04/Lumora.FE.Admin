import type { PaginatedResponse } from "~/Shared/types/api";
import type {
  CategoryRequest,
  CategoryResponse,
  CategoryTreeNodeResponse,
  CategoryUpdateRequest,
  MoveCategoryRequest,
  ReorderCategoryRequest,
} from "~/features/categories/types/categories";

const categoryRoute = (path = "") => `/categories${path}`;
const categoryChildRoute = (categoryId: string, childPath = "") =>
  `/categories/${categoryId}${childPath}`;

export const useCategoryAdminApi = () => {
  const api = useApiClient();

  return {
    getCategories: (page = 1, size = 50) =>
      api.request<PaginatedResponse<CategoryResponse>>(
        `${categoryRoute()}${toSearchParams({ page, size })}`,
      ),

    searchCategories: (params: Record<string, string | number | boolean | undefined | null>) =>
      api.request<PaginatedResponse<CategoryResponse>>(
        `${categoryRoute("/search")}${toSearchParams(params)}`,
      ),

    getCategoryTree: () =>
      api.request<CategoryTreeNodeResponse[]>(categoryRoute("/tree")),

    getAllCategoryTree: () =>
      api.request<CategoryTreeNodeResponse[]>(categoryRoute("/all")),

    getCategoryById: (id: string) =>
      api.request<CategoryResponse>(categoryChildRoute(id)),

    createCategory: (payload: CategoryRequest) =>
      api.request<CategoryResponse>(categoryRoute(), {
        method: "POST",
        body: payload,
      }),

    createCategoryChild: (parentId: string, payload: CategoryRequest) =>
      api.request<CategoryResponse>(categoryChildRoute(parentId, "/children"), {
        method: "POST",
        body: payload,
      }),

    updateCategory: (id: string, payload: CategoryUpdateRequest) =>
      api.request<CategoryResponse>(categoryChildRoute(id), {
        method: "PUT",
        body: payload,
      }),

    moveCategory: (id: string, payload: MoveCategoryRequest) =>
      api.request<CategoryResponse>(categoryChildRoute(id, "/move"), {
        method: "POST",
        body: payload,
      }),

    activateCategory: (id: string) =>
      api.request<CategoryResponse>(categoryChildRoute(id, "/activate"), {
        method: "POST",
      }),

    deactivateCategory: (id: string) =>
      api.request<CategoryResponse>(categoryChildRoute(id, "/deactivate"), {
        method: "POST",
      }),

    reorderCategories: (payload: ReorderCategoryRequest) =>
      api.request<void>(categoryRoute("/reorder"), {
        method: "POST",
        body: payload,
      }),

    deleteCategory: (id: string) =>
      api.request<void>(categoryChildRoute(id), {
        method: "DELETE",
      }),

    restoreCategory: (id: string) =>
      api.request<CategoryResponse>(categoryChildRoute(id, "/restore"), {
        method: "POST",
      }),
  };
};
