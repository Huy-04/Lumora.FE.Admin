export const ADMIN_PERMISSION = {
  adminAccessAll: "Auth.Admin.Access.All",
  userReadAll: "Auth.User.Read.All",
  userReadSelf: "Auth.User.Read.Self",
  userCreateAll: "Auth.User.Create.All",
  userUpdateAll: "Auth.User.Update.All",
  userUpdateSelf: "Auth.User.Update.Self",
  userRemoveAll: "Auth.User.Remove.All",
  roleReadAll: "Auth.Role.Read.All",
  roleCreateAll: "Auth.Role.Create.All",
  roleUpdateAll: "Auth.Role.Update.All",
  roleRemoveAll: "Auth.Role.Remove.All",
  permissionReadAll: "Auth.Permission.Read.All",
  permissionCreateAll: "Auth.Permission.Create.All",
  permissionUpdateAll: "Auth.Permission.Update.All",
  permissionRemoveAll: "Auth.Permission.Remove.All",
  userAddressReadAll: "Auth.UserAddress.Read.All",
  userAddressCreateAll: "Auth.UserAddress.Create.All",
  userAddressUpdateAll: "Auth.UserAddress.Update.All",
  userAddressRemoveAll: "Auth.UserAddress.Remove.All",
  refreshTokenReadAll: "Auth.RefreshToken.Read.All",
  refreshTokenReadSelf: "Auth.RefreshToken.Read.Self",
  refreshTokenRemoveAll: "Auth.RefreshToken.Revoke.All",
  refreshTokenRemoveSelf: "Auth.RefreshToken.Revoke.Self",
  userRoleReadAll: "Auth.UserRole.Read.All",
  userRoleCreateAll: "Auth.UserRole.Create.All",
  userRoleRemoveAll: "Auth.UserRole.Remove.All",
  rolePermissionReadAll: "Auth.RolePermission.Read.All",
  rolePermissionCreateAll: "Auth.RolePermission.Create.All",
  rolePermissionRemoveAll: "Auth.RolePermission.Remove.All",
  categoryReadAll: "Category.Category.Read.All",
  categoryCreateAll: "Category.Category.Create.All",
  categoryUpdateAll: "Category.Category.Update.All",
  categoryActivateAll: "Category.Category.Activate.All",
  categoryDeactivateAll: "Category.Category.Deactivate.All",
  categoryReorderAll: "Category.Category.Reorder.All",
  categoryDeleteAll: "Category.Category.Delete.All",
  productReadAll: "Product.Product.Read.All",
  productCreateAll: "Product.Product.Create.All",
  productUpdateAll: "Product.Product.Update.All",
  productReorderAll: "Product.Product.Reorder.All",
  productPublishAll: "Product.Product.Publish.All",
  productDiscontinueAll: "Product.Product.Discontinue.All",
  productDeleteAll: "Product.Product.Delete.All",
  productRestoreAll: "Product.Product.Restore.All",
  productFeatureAll: "Product.Product.Feature.All",
  orderReadAll: "Order.Order.Read.All",
  orderReadSelf: "Order.Order.Read.Self",
  orderModifyAll: "Order.Order.Modify.All",
  orderModifySelf: "Order.Order.Modify.Self",
  paymentReadAll: "Payment.Payment.Read.All",
  paymentManageAll: "Payment.Payment.Modify.All",
  warehouseReadAll: "Inventory.Warehouse.Read.All",
  warehouseCreateAll: "Inventory.Warehouse.Create.All",
  warehouseUpdateAll: "Inventory.Warehouse.Update.All",
  warehouseRemoveAll: "Inventory.Warehouse.Remove.All",
  inventoryReadAll: "Inventory.Inventory.Read.All",
  inventoryCreateAll: "Inventory.Inventory.Create.All",
  inventoryUpdateAll: "Inventory.Inventory.Update.All",
  // NOTE: Location-based inventory scopes (HN, HCM, DN) removed — pending BE team confirmation if custom scopes are needed
  inventoryRemoveAll: "Inventory.Inventory.Remove.All",
  shipmentReadAll: "Shipment.Shipment.Read.All",
  shipmentReadSelf: "Shipment.Shipment.Read.Self",
  shipmentModifyAll: "Shipment.Shipment.Modify.All",
  shipmentModifySelf: "Shipment.Shipment.Modify.Self",
  systemEventReadAll: "Operations.SystemEvents.Read.All",
  cartReadAll: "Cart.Cart.Read.All",
  cartReadSelf: "Cart.Cart.Read.Self",
  cartModifyAll: "Cart.Cart.Modify.All",
  cartModifySelf: "Cart.Cart.Modify.Self",
  couponReadAll: "Coupon.Coupon.Read.All",
  couponModifyAll: "Coupon.Coupon.Modify.All",
  reviewReadAll: "Review.Review.Read.All",
  reviewModifyAll: "Review.Review.Modify.All",
} as const;

type PermissionRequirement = string | readonly string[];

interface RouteAccessRule {
  pattern: RegExp;
  requirements: readonly PermissionRequirement[];
}

const routeAccessRules: RouteAccessRule[] = [
  { pattern: /^\/users$/, requirements: [ADMIN_PERMISSION.userReadAll] },
  { pattern: /^\/users\/create$/, requirements: [ADMIN_PERMISSION.userCreateAll] },
  { pattern: /^\/users\/[^/]+$/, requirements: [ADMIN_PERMISSION.userReadAll] },
  { pattern: /^\/roles$/, requirements: [ADMIN_PERMISSION.roleReadAll] },
  { pattern: /^\/roles\/create$/, requirements: [ADMIN_PERMISSION.roleCreateAll] },
  { pattern: /^\/roles\/[^/]+$/, requirements: [ADMIN_PERMISSION.roleReadAll] },
  { pattern: /^\/permissions$/, requirements: [ADMIN_PERMISSION.permissionReadAll] },
  { pattern: /^\/permissions\/create$/, requirements: [ADMIN_PERMISSION.permissionCreateAll] },
  { pattern: /^\/permissions\/[^/]+$/, requirements: [ADMIN_PERMISSION.permissionReadAll] },
  { pattern: /^\/categories$/, requirements: [ADMIN_PERMISSION.categoryReadAll] },
  { pattern: /^\/categories\/create$/, requirements: [ADMIN_PERMISSION.categoryCreateAll] },
  { pattern: /^\/categories\/[^/]+$/, requirements: [ADMIN_PERMISSION.categoryReadAll] },
  { pattern: /^\/products$/, requirements: [ADMIN_PERMISSION.productReadAll] },
  { pattern: /^\/products\/create$/, requirements: [ADMIN_PERMISSION.productCreateAll] },
  { pattern: /^\/products\/[^/]+\/gallery\/create$/, requirements: [ADMIN_PERMISSION.productUpdateAll] },
  { pattern: /^\/products\/[^/]+\/gallery\/[^/]+$/, requirements: [ADMIN_PERMISSION.productReadAll] },
  { pattern: /^\/products\/[^/]+\/variants\/create$/, requirements: [ADMIN_PERMISSION.productUpdateAll] },
  { pattern: /^\/products\/[^/]+\/variants\/[^/]+$/, requirements: [ADMIN_PERMISSION.productReadAll] },
  { pattern: /^\/products\/[^/]+$/, requirements: [ADMIN_PERMISSION.productReadAll] },
  { pattern: /^\/orders$/, requirements: [ADMIN_PERMISSION.orderReadAll] },
  { pattern: /^\/orders\/[^/]+$/, requirements: [ADMIN_PERMISSION.orderReadAll] },
  { pattern: /^\/coupons$/, requirements: [ADMIN_PERMISSION.couponReadAll] },
  { pattern: /^\/coupons\/create$/, requirements: [ADMIN_PERMISSION.couponModifyAll] },
  { pattern: /^\/coupons\/[^/]+$/, requirements: [ADMIN_PERMISSION.couponReadAll] },
  { pattern: /^\/payments$/, requirements: [ADMIN_PERMISSION.paymentReadAll] },
  { pattern: /^\/payments\/[^/]+$/, requirements: [ADMIN_PERMISSION.paymentReadAll] },
  { pattern: /^\/inventory$/, requirements: [ADMIN_PERMISSION.inventoryReadAll] },
  { pattern: /^\/inventory\/create$/, requirements: [ADMIN_PERMISSION.inventoryCreateAll] },
  { pattern: /^\/inventory\/[^/]+$/, requirements: [ADMIN_PERMISSION.inventoryReadAll] },
  { pattern: /^\/inventory-stocks\/[^/]+\/create$/, requirements: [ADMIN_PERMISSION.inventoryUpdateAll] },
  { pattern: /^\/inventory-stocks\/[^/]+\/warehouses\/[^/]+\/add$/, requirements: [ADMIN_PERMISSION.inventoryUpdateAll] },
  { pattern: /^\/inventory-stocks\/[^/]+\/warehouses\/[^/]+\/reorder-point$/, requirements: [ADMIN_PERMISSION.inventoryUpdateAll] },
  { pattern: /^\/warehouses$/, requirements: [ADMIN_PERMISSION.warehouseReadAll] },
  { pattern: /^\/warehouses\/create$/, requirements: [ADMIN_PERMISSION.warehouseCreateAll] },
  { pattern: /^\/warehouses\/[^/]+$/, requirements: [ADMIN_PERMISSION.warehouseReadAll] },
  { pattern: /^\/shipments$/, requirements: [ADMIN_PERMISSION.shipmentReadAll] },
  { pattern: /^\/shipments\/create$/, requirements: [ADMIN_PERMISSION.shipmentModifyAll] },
  { pattern: /^\/shipments\/[^/]+$/, requirements: [ADMIN_PERMISSION.shipmentReadAll] },
  { pattern: /^\/reviews$/, requirements: [ADMIN_PERMISSION.reviewReadAll] },
  { pattern: /^\/reviews\/[^/]+$/, requirements: [ADMIN_PERMISSION.reviewReadAll] },
  { pattern: /^\/system-events$/, requirements: [[ADMIN_PERMISSION.systemEventReadAll, ADMIN_PERMISSION.adminAccessAll]] },
  { pattern: /^\/system-events\/[^/]+$/, requirements: [[ADMIN_PERMISSION.systemEventReadAll, ADMIN_PERMISSION.adminAccessAll]] },
  { pattern: /^\/sessions$/, requirements: [ADMIN_PERMISSION.userReadAll, ADMIN_PERMISSION.refreshTokenReadAll] },
  { pattern: /^\/profile\/sessions$/, requirements: [[ADMIN_PERMISSION.refreshTokenReadAll, ADMIN_PERMISSION.refreshTokenReadSelf]] },
  { pattern: /^\/user-addresses\/[^/]+\/create$/, requirements: [ADMIN_PERMISSION.userAddressCreateAll] },
  { pattern: /^\/user-addresses\/[^/]+\/[^/]+$/, requirements: [ADMIN_PERMISSION.userAddressUpdateAll] },
];

export const useAdminAuthorization = () => {
  const session = useAuthSession();

  const permissionSet = computed(() => new Set(session.permissions.value));
  const isPermissionGroup = (requirement: PermissionRequirement): requirement is readonly string[] => Array.isArray(requirement);

  const can = (requirement: PermissionRequirement) => {
    if (isPermissionGroup(requirement)) {
      return requirement.some((permission) => permissionSet.value.has(permission));
    }

    return permissionSet.value.has(requirement);
  };

  const canAll = (requirements: readonly PermissionRequirement[]) => requirements.every((requirement) => can(requirement));

  const canAccessPath = (path: string) => {
    const normalizedPath = path.split("?")[0] ?? path;
    if (!can(ADMIN_PERMISSION.adminAccessAll)) {
      return false;
    }

    const matchedRule = routeAccessRules.find((rule) => rule.pattern.test(normalizedPath));

    if (!matchedRule) {
      return true;
    }

    return canAll(matchedRule.requirements);
  };

  const firstAccessiblePath = () => {
    if (!can(ADMIN_PERMISSION.adminAccessAll)) {
      return "/auth/access-denied";
    }

    const fallbacks = ["/", "/profile", "/settings"];
    const preferred = ["/users", "/roles", "/permissions", "/categories", "/products", "/inventory", "/orders", "/coupons", "/payments", "/shipments", "/reviews", "/system-events", "/sessions"];

    const preferredPath = preferred.find((path) => canAccessPath(path));
    return preferredPath ?? fallbacks.find((path) => canAccessPath(path)) ?? "/";
  };

  return {
    can,
    canAll,
    canAccessPath,
    firstAccessiblePath,
  };
};
