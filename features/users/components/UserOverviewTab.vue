<script setup lang="ts">
import type {
  UserResponse,
  UserRoleResponse,
} from "~/features/users/types";

const props = defineProps<{
  user: UserResponse;
  roles: UserRoleResponse[];
}>();

const { enumLabel, roleSummary, formatDateTime } = useAuthPresentation();

const phoneRegion = computed(() => {
  if (!props.user.phone) return "VN";
  const normalized = props.user.phone.trim();
  if (!normalized.startsWith("+")) return "VN";

  const regionMap: Array<{ prefix: string; region: string }> = [
    { prefix: "+84", region: "VN" },
    { prefix: "+65", region: "SG" },
    { prefix: "+60", region: "MY" },
    { prefix: "+66", region: "TH" },
    { prefix: "+81", region: "JP" },
    { prefix: "+82", region: "KR" },
    { prefix: "+86", region: "CN" },
    { prefix: "+852", region: "HK" },
    { prefix: "+886", region: "TW" },
    { prefix: "+91", region: "IN" },
    { prefix: "+49", region: "DE" },
    { prefix: "+33", region: "FR" },
    { prefix: "+44", region: "GB" },
    { prefix: "+61", region: "AU" },
    { prefix: "+64", region: "NZ" },
    { prefix: "+63", region: "PH" },
    { prefix: "+62", region: "ID" },
    { prefix: "+1", region: "US" },
    { prefix: "+39", region: "IT" },
    { prefix: "+34", region: "ES" },
    { prefix: "+31", region: "NL" },
    { prefix: "+46", region: "SE" },
    { prefix: "+41", region: "CH" },
    { prefix: "+48", region: "PL" },
    { prefix: "+351", region: "PT" },
    { prefix: "+55", region: "BR" },
    { prefix: "+52", region: "MX" },
    { prefix: "+7", region: "RU" },
    { prefix: "+971", region: "AE" },
    { prefix: "+966", region: "SA" },
    { prefix: "+90", region: "TR" },
    { prefix: "+27", region: "ZA" },
    { prefix: "+855", region: "KH" },
  ];
  return regionMap.find((entry) => normalized.startsWith(entry.prefix))?.region ?? "VN";
});
</script>

<template>
  <div class="grid gap-6 content-start max-w-6xl">
    <AppPanel title="Identity" description="Core profile information.">
      <dl class="divide-y divide-line/60">
        <div class="flex items-baseline gap-4 py-3">
          <dt class="meta-label w-40 shrink-0">Full name</dt>
          <dd class="text-sm font-medium text-ink">{{ user.fullName }}</dd>
        </div>
        <div class="flex items-baseline gap-4 py-3">
          <dt class="meta-label w-40 shrink-0">Username</dt>
          <dd class="text-sm font-medium text-ink">{{ user.userName || "—" }}</dd>
        </div>
        <div class="flex items-baseline gap-4 py-3">
          <dt class="meta-label w-40 shrink-0">User ID</dt>
          <dd class="break-all text-xs font-mono text-smoke">{{ user.id }}</dd>
        </div>
        <div class="flex items-baseline gap-4 py-3">
          <dt class="meta-label w-40 shrink-0">Email</dt>
          <dd class="break-all text-sm text-smoke">{{ user.email }}</dd>
        </div>
        <div class="flex items-baseline gap-4 py-3">
          <dt class="meta-label w-40 shrink-0">Phone</dt>
          <dd class="text-sm text-smoke">{{ user.phone ? `(${phoneRegion}) ${user.phone}` : "—" }}</dd>
        </div>
        <div class="flex items-baseline gap-4 py-3">
          <dt class="meta-label w-40 shrink-0">Gender</dt>
          <dd class="text-sm text-smoke">{{ user.gender || "Unknown" }}</dd>
        </div>
        <div class="flex items-baseline gap-4 py-3">
          <dt class="meta-label w-40 shrink-0">Roles</dt>
          <dd class="text-sm font-medium text-ink">{{ roleSummary(roles) }}</dd>
        </div>
      </dl>
    </AppPanel>

    <AppPanel title="Account status" description="Current state of the account and verification.">
      <dl class="divide-y divide-line/60">
        <div class="flex items-baseline gap-4 py-3">
          <dt class="meta-label w-40 shrink-0">User status</dt>
          <dd class="text-sm font-medium text-ink">{{ enumLabel(user.userStatus) }}</dd>
        </div>
        <div class="flex items-baseline gap-4 py-3">
          <dt class="meta-label w-40 shrink-0">Email status</dt>
          <dd class="text-sm text-smoke">{{ enumLabel(user.emailStatus) }}</dd>
        </div>
        <div class="flex items-baseline gap-4 py-3">
          <dt class="meta-label w-40 shrink-0">Phone status</dt>
          <dd class="text-sm text-smoke">{{ enumLabel(user.phoneStatus) }}</dd>
        </div>
      </dl>
    </AppPanel>

    <AppPanel title="Audit trail" description="Administrative authorship and timestamps.">
      <dl class="divide-y divide-line/60">
        <div class="flex items-baseline gap-4 py-3">
          <dt class="meta-label w-40 shrink-0">Created at</dt>
          <dd class="text-sm text-smoke">{{ user.createdAt ? formatDateTime(user.createdAt) : "—" }}</dd>
        </div>
        <div class="flex items-baseline gap-4 py-3">
          <dt class="meta-label w-40 shrink-0">Created by</dt>
          <dd class="text-sm text-smoke">{{ user.createdBy || "System" }}</dd>
        </div>
        <div class="flex items-baseline gap-4 py-3">
          <dt class="meta-label w-40 shrink-0">Updated at</dt>
          <dd class="text-sm text-smoke">{{ user.updatedAt ? formatDateTime(user.updatedAt) : "—" }}</dd>
        </div>
        <div class="flex items-baseline gap-4 py-3">
          <dt class="meta-label w-40 shrink-0">Updated by</dt>
          <dd class="text-sm text-smoke">{{ user.updatedBy || "System" }}</dd>
        </div>
      </dl>
    </AppPanel>
  </div>
</template>
