import { useState } from "#app";
import { onBeforeUnmount, watchEffect } from "vue";

export interface PageBreadcrumbItem {
  label: string;
  to?: string;
}

interface StaticPageBreadcrumbRoute {
  pattern: RegExp;
  items: PageBreadcrumbItem[];
}

let breadcrumbOwnerCounter = 0;

const createBreadcrumbOwner = () => {
  breadcrumbOwnerCounter += 1;
  return `page-breadcrumbs:${breadcrumbOwnerCounter}`;
};

const staticPageBreadcrumbRoutes: StaticPageBreadcrumbRoute[] = [
  { pattern: /^\/$/, items: [{ label: "Dashboard" }] },
  { pattern: /^\/users$/, items: [{ label: "Users" }] },
  { pattern: /^\/users\/create$/, items: [{ label: "Users", to: "/users" }, { label: "Create user" }] },
  { pattern: /^\/users\/[^/]+$/, items: [{ label: "Users" }] },
  { pattern: /^\/user-addresses\/[^/]+\/create$/, items: [{ label: "Users" }] },
  { pattern: /^\/user-addresses\/[^/]+\/[^/]+$/, items: [{ label: "Users" }] },
  { pattern: /^\/roles$/, items: [{ label: "Roles" }] },
  { pattern: /^\/roles\/create$/, items: [{ label: "Roles", to: "/roles" }, { label: "Create role" }] },
  { pattern: /^\/roles\/[^/]+$/, items: [{ label: "Roles" }] },
  { pattern: /^\/permissions$/, items: [{ label: "Permissions" }] },
  { pattern: /^\/permissions\/create$/, items: [{ label: "Permissions", to: "/permissions" }, { label: "Create permission" }] },
  { pattern: /^\/permissions\/[^/]+$/, items: [{ label: "Permissions" }] },
  { pattern: /^\/sessions$/, items: [{ label: "Sessions" }] },
  { pattern: /^\/profile$/, items: [{ label: "Profile" }] },
  {
    pattern: /^\/profile\/avatar$/,
    items: [
      { label: "Profile", to: "/profile" },
      { label: "Security", to: "/profile?tab=security" },
      { label: "Avatar" },
    ],
  },
  {
    pattern: /^\/profile\/sessions$/,
    items: [
      { label: "Profile", to: "/profile" },
      { label: "Security", to: "/profile?tab=security" },
      { label: "Sessions" },
    ],
  },
  { pattern: /^\/settings$/, items: [{ label: "Settings" }] },
  { pattern: /^\/categories$/, items: [{ label: "Categories" }] },
  { pattern: /^\/categories\/create$/, items: [{ label: "Categories", to: "/categories" }, { label: "Create category" }] },
  { pattern: /^\/categories\/[^/]+$/, items: [{ label: "Categories" }] },
  { pattern: /^\/products$/, items: [{ label: "Products" }] },
  { pattern: /^\/products\/create$/, items: [{ label: "Products", to: "/products" }, { label: "Create product" }] },
  { pattern: /^\/products\/[^/]+$/, items: [{ label: "Products" }] },
  { pattern: /^\/products\/[^/]+\/variants\/create$/, items: [{ label: "Products" }] },
  { pattern: /^\/products\/[^/]+\/variants\/[^/]+$/, items: [{ label: "Products" }] },
  { pattern: /^\/products\/[^/]+\/variant-images\/[^/]+$/, items: [{ label: "Products" }] },
  { pattern: /^\/products\/[^/]+\/gallery\/create$/, items: [{ label: "Products" }] },
  { pattern: /^\/products\/[^/]+\/gallery\/[^/]+$/, items: [{ label: "Products" }] },
  { pattern: /^\/orders$/, items: [{ label: "Orders" }] },
  { pattern: /^\/orders\/[^/]+$/, items: [{ label: "Orders" }] },
  { pattern: /^\/payments$/, items: [{ label: "Payments" }] },
  { pattern: /^\/payments\/[^/]+$/, items: [{ label: "Payments" }] },
  { pattern: /^\/inventory$/, items: [{ label: "Inventories" }] },
  { pattern: /^\/inventory\/[^/]+$/, items: [{ label: "Inventories" }] },
  { pattern: /^\/warehouses$/, items: [{ label: "Warehouses" }] },
  { pattern: /^\/warehouses\/[^/]+$/, items: [{ label: "Warehouses" }] },
  { pattern: /^\/shipments$/, items: [{ label: "Shipments" }] },
  { pattern: /^\/shipments\/[^/]+$/, items: [{ label: "Shipments" }] },
];

export const resolveStaticPageBreadcrumbs = (path: string): PageBreadcrumbItem[] =>
  staticPageBreadcrumbRoutes.find((route) => route.pattern.test(path))?.items
    ?? [{ label: "Dashboard", to: "/" }];

export const usePageBreadcrumbs = () => {
  const items = useState<PageBreadcrumbItem[]>("layout:page-breadcrumbs", () => []);
  const owner = useState<string | null>("layout:page-breadcrumb-owner", () => null);

  const setPageBreadcrumbs = (nextItems: PageBreadcrumbItem[], nextOwner?: string) => {
    owner.value = nextOwner ?? null;
    items.value = nextItems;
  };

  const clearPageBreadcrumbs = (currentOwner?: string) => {
    if (currentOwner && owner.value !== currentOwner) {
      return;
    }

    owner.value = null;
    items.value = [];
  };

  return {
    items,
    setPageBreadcrumbs,
    clearPageBreadcrumbs,
  };
};

export const useScopedPageBreadcrumbs = (resolveItems: () => PageBreadcrumbItem[]) => {
  const { setPageBreadcrumbs, clearPageBreadcrumbs } = usePageBreadcrumbs();
  const owner = createBreadcrumbOwner();

  watchEffect(() => {
    const nextItems = resolveItems().filter((item) => item.label.trim().length > 0);
    setPageBreadcrumbs(nextItems, owner);
  });

  onBeforeUnmount(() => {
    clearPageBreadcrumbs(owner);
  });
};
