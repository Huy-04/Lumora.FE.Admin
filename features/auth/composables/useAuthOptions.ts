const phoneRegionOptions = [
  { value: "VN", label: "VN (+84)" },
  { value: "US", label: "US (+1)" },
  { value: "CA", label: "CA (+1)" },
  { value: "GB", label: "GB (+44)" },
  { value: "AU", label: "AU (+61)" },
  { value: "NZ", label: "NZ (+64)" },
  { value: "SG", label: "SG (+65)" },
  { value: "MY", label: "MY (+60)" },
  { value: "TH", label: "TH (+66)" },
  { value: "ID", label: "ID (+62)" },
  { value: "PH", label: "PH (+63)" },
  { value: "JP", label: "JP (+81)" },
  { value: "KR", label: "KR (+82)" },
  { value: "CN", label: "CN (+86)" },
  { value: "HK", label: "HK (+852)" },
  { value: "TW", label: "TW (+886)" },
  { value: "IN", label: "IN (+91)" },
  { value: "DE", label: "DE (+49)" },
  { value: "FR", label: "FR (+33)" },
  { value: "IT", label: "IT (+39)" },
  { value: "ES", label: "ES (+34)" },
  { value: "NL", label: "NL (+31)" },
  { value: "SE", label: "SE (+46)" },
  { value: "CH", label: "CH (+41)" },
  { value: "PL", label: "PL (+48)" },
  { value: "PT", label: "PT (+351)" },
  { value: "BR", label: "BR (+55)" },
  { value: "MX", label: "MX (+52)" },
  { value: "RU", label: "RU (+7)" },
  { value: "AE", label: "AE (+971)" },
  { value: "SA", label: "SA (+966)" },
  { value: "TR", label: "TR (+90)" },
  { value: "ZA", label: "ZA (+27)" },
  { value: "KH", label: "KH (+855)" },
] as const;

const permissionModuleValues = [
  "Auth",
  "Category",
  "Product",
  "Order",
  "Payment",
  "Cart",
  "Coupon",
] as const;

const permissionSubModuleValues = [
  "User",
  "Role",
  "Permission",
  "UserAddress",
  "RefreshToken",
  "UserRole",
  "RolePermission",
  "Category",
  "Product",
  "Cart",
  "Coupon",
  "Admin",
] as const;

/** Map Module → allowed SubModules */
const moduleSubModuleMap: Record<string, string[]> = {
  Auth: ["User", "Role", "Permission", "UserAddress", "RefreshToken", "UserRole", "RolePermission", "Admin"],
  Category: ["Category"],
  Product: ["Product"],
  Order: [],
  Payment: [],
  Cart: ["Cart"],
  Coupon: ["Coupon"],
};

const permissionOperationValues = ["Read", "Create", "Update", "Remove", "Access"] as const;
const permissionScopeValues = ["All", "Self"] as const;
const genderValues = ["Unknown", "Male", "Female"] as const;
const userStatusValues = ["Active", "Inactive"] as const;
const verificationStatusValues = ["Verified", "Unverified"] as const;
const userAddressTypeValues = ["Home", "Office"] as const;

const toOptions = (values: readonly string[]) => values.map((value) => ({ label: value, value }));

export const useAuthOptions = () => ({
  phoneRegionOptions,
  permissionModuleOptions: toOptions(permissionModuleValues),
  permissionSubModuleOptions: toOptions(permissionSubModuleValues),
  getSubModuleOptions: (module: string) => {
    const allowed = moduleSubModuleMap[module] ?? permissionSubModuleValues;
    return toOptions(allowed as readonly string[]);
  },
  permissionOperationOptions: toOptions(permissionOperationValues),
  permissionScopeOptions: toOptions(permissionScopeValues),
  genderOptions: toOptions(genderValues),
  userStatusOptions: toOptions(userStatusValues),
  verificationStatusOptions: toOptions(verificationStatusValues),
  userAddressTypeOptions: toOptions(userAddressTypeValues),
});
