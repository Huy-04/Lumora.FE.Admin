import type { UserRoleResponse } from "~/features/users/types";

export const useAuthPresentation = () => {
  const formatDateTime = (value?: string | null) => {
    if (!value) return "Not available";

    return new Intl.DateTimeFormat("en-GB", {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(new Date(value));
  };

  const formatDate = (value?: string | null) => {
    if (!value) return "Not available";

    return new Intl.DateTimeFormat("en-GB", {
      dateStyle: "medium",
    }).format(new Date(value));
  };

  const enumLabel = (value?: string | null) => {
    if (!value) return "Unknown";

    return value.replace(/([a-z])([A-Z])/g, "$1 $2");
  };

  const formatIpAddress = (value?: string | null) => {
    if (!value) return "Unknown IP";
    if (value === "::1" || value === "127.0.0.1") return "Localhost";

    return value;
  };

  const roleSummary = (roles: UserRoleResponse[]) => {
    if (!roles.length) return "No roles";
    if (roles.length === 1) return roles[0].roleName;
    return `${roles[0].roleName} +${roles.length - 1}`;
  };

  return {
    formatDate,
    formatDateTime,
    formatIpAddress,
    enumLabel,
    roleSummary,
  };
};
