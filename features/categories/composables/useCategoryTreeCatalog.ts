import type { CategoryTreeNodeResponse } from "~/features/categories/types/categories";

export interface CategoryCatalogOption {
  label: string;
  value: string;
}

const visitCategoryTree = (
  nodes: CategoryTreeNodeResponse[],
  visitor: (node: CategoryTreeNodeResponse, parent: CategoryTreeNodeResponse | null) => void,
  parent: CategoryTreeNodeResponse | null = null,
) => {
  for (const node of nodes) {
    visitor(node, parent);
    visitCategoryTree(node.children, visitor, node);
  }
};

export const useCategoryTreeCatalog = () => {
  const flattenTree = (nodes: CategoryTreeNodeResponse[]): CategoryTreeNodeResponse[] => {
    const items: CategoryTreeNodeResponse[] = [];

    visitCategoryTree(nodes, (node) => {
      items.push(node);
    });

    return items;
  };

  const toOptions = (nodes: CategoryTreeNodeResponse[], activeOnly = false): CategoryCatalogOption[] => {
    const options: CategoryCatalogOption[] = [];

    visitCategoryTree(nodes, (node, parent) => {
      if (activeOnly && !node.isActive) {
        return;
      }

      const prefix = parent ? `${parent.name} / ` : "";
      options.push({
        label: `${prefix}${node.name} (#${node.sortOrder})`,
        value: node.id,
      });
    });

    return options;
  };

  const findNode = (nodes: CategoryTreeNodeResponse[], id: string): CategoryTreeNodeResponse | null => {
    let match: CategoryTreeNodeResponse | null = null;

    visitCategoryTree(nodes, (node) => {
      if (!match && node.id === id) {
        match = node;
      }
    });

    return match;
  };

  return {
    flattenTree,
    toOptions,
    findNode,
  };
};
