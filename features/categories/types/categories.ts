export interface CategoryResponse {
  id: string;
  parentId?: string | null;
  name: string;
  slug: string;
  description?: string | null;
  level: number;
  sortOrder: number;
  isActive: boolean;
  isDeleted: boolean;
  deletedAt?: string | null;
  img?: string | null;
  seoTitle?: string | null;
  seoDescription?: string | null;
  createdBy: string;
  updatedBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface CategoryTreeNodeResponse {
  id: string;
  parentId?: string | null;
  name: string;
  slug: string;
  level: number;
  sortOrder: number;
  isActive: boolean;
  isDeleted: boolean;
  deletedAt?: string | null;
  img?: string | null;
  children: CategoryTreeNodeResponse[];
}

export interface CategoryRequest {
  name: string;
  slug: string;
  description?: string | null;
  img?: string | null;
  seoTitle?: string | null;
  seoDescription?: string | null;
}

export interface CategoryUpdateRequest {
  name: string;
  slug: string;
  description?: string | null;
  img?: string | null;
  seoTitle?: string | null;
  seoDescription?: string | null;
}

export interface ReorderCategoryItemRequest {
  categoryId: string;
  sortOrder: number;
}

export interface ReorderCategoryRequest {
  items: ReorderCategoryItemRequest[];
}

export interface MoveCategoryRequest {
  parentId?: string | null;
  sortOrder?: number | null;
}
