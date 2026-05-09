import {
  PhCube,
  PhFingerprint,
  PhSquaresFour,
  PhHouse,
  PhKey,
  PhPackage,
  PhReceipt,
  PhShield,
  PhTruck,
  PhUsersThree,
  PhBuildings,
  PhCreditCard,
} from "@phosphor-icons/vue";

export interface AdminNavigationItem {
  label: string;
  to: string;
  icon: unknown;
}

export interface AdminNavigationGroup {
  label: string;
  items: AdminNavigationItem[];
  collapsible?: boolean;
}

export const useAdminNavigation = () => {
  const authz = useAdminAuthorization();

  const allGroups = computed<AdminNavigationGroup[]>(() => [
    {
      label: "",
      items: [
        { label: "Dashboard", to: "/", icon: PhHouse },
      ],
    },
    {
      label: "Auth",
      collapsible: true,
      items: [
        { label: "Users", to: "/users", icon: PhUsersThree },
        { label: "Roles", to: "/roles", icon: PhShield },
        { label: "Permissions", to: "/permissions", icon: PhKey },
        { label: "Sessions", to: "/sessions", icon: PhFingerprint },
      ],
    },
    {
      label: "Category",
      collapsible: true,
      items: [
        { label: "Categories", to: "/categories", icon: PhSquaresFour },
      ],
    },
    {
      label: "Product",
      collapsible: true,
      items: [
        { label: "Products", to: "/products", icon: PhCube },
      ],
    },
    {
      label: "Order",
      collapsible: true,
      items: [
        { label: "Orders", to: "/orders", icon: PhReceipt },
        { label: "Payments", to: "/payments", icon: PhCreditCard },
      ],
    },
    {
      label: "Inventory",
      collapsible: true,
      items: [
        { label: "Inventories", to: "/inventory", icon: PhPackage },
        { label: "Warehouses", to: "/warehouses", icon: PhBuildings },
      ],
    },
    {
      label: "Shipment",
      collapsible: true,
      items: [
        { label: "Shipments", to: "/shipments", icon: PhTruck },
      ],
    },
  ]);

  const groups = computed<AdminNavigationGroup[]>(() =>
    allGroups.value.map((group) => ({
      ...group,
      items: group.items.filter((item) => authz.canAccessPath(item.to)),
    }))
      .filter((group) => group.items.length > 0),
  );

  const mobileLinks = computed<AdminNavigationItem[]>(() =>
    groups.value.flatMap((group) => group.items),
  );

  return {
    groups,
    mobileLinks,
  };
};
