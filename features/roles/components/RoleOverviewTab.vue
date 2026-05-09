<script setup lang="ts">
import AppDetailMetaPanel from "~/Shared/components/ui/pattern/AppDetailMetaPanel.vue";
import type {
  RoleResponse,
  RolePermissionResponse,
} from "~/features/roles/types";

defineProps<{
  role: RoleResponse;
  permissions: RolePermissionResponse[];
}>();

const { formatDateTime } = useAuthPresentation();
</script>

<template>
  <div class="grid gap-6 content-start max-w-6xl">
    <AppDetailMetaPanel eyebrow="Role details">
        <div class="flex items-baseline gap-4 py-3">
          <dt class="meta-label w-40 shrink-0">Role name</dt>
          <dd class="text-sm font-medium text-ink">{{ role.roleName }}</dd>
        </div>
        <div class="flex items-baseline gap-4 py-3">
          <dt class="meta-label w-40 shrink-0">Role ID</dt>
          <dd class="break-all text-xs font-mono text-smoke">{{ role.id }}</dd>
        </div>
        <div class="flex items-baseline gap-4 py-3">
          <dt class="meta-label w-40 shrink-0">Description</dt>
          <dd class="text-sm text-smoke">{{ role.description || "-" }}</dd>
        </div>
        <div class="flex items-baseline gap-4 py-3">
          <dt class="meta-label w-40 shrink-0">Permissions</dt>
          <dd class="text-sm font-medium text-ink">{{ permissions.length }} attached</dd>
        </div>
    </AppDetailMetaPanel>

    <AppDetailMetaPanel eyebrow="Audit trail">
        <div class="flex items-baseline gap-4 py-3">
          <dt class="meta-label w-40 shrink-0">Created at</dt>
          <dd class="text-sm text-smoke">{{ role.createdAt ? formatDateTime(role.createdAt) : "-" }}</dd>
        </div>
        <div class="flex items-baseline gap-4 py-3">
          <dt class="meta-label w-40 shrink-0">Created by</dt>
          <dd class="text-sm text-smoke">{{ role.createdBy || "System" }}</dd>
        </div>
        <div class="flex items-baseline gap-4 py-3">
          <dt class="meta-label w-40 shrink-0">Updated at</dt>
          <dd class="text-sm text-smoke">{{ role.updatedAt ? formatDateTime(role.updatedAt) : "-" }}</dd>
        </div>
        <div class="flex items-baseline gap-4 py-3">
          <dt class="meta-label w-40 shrink-0">Updated by</dt>
          <dd class="text-sm text-smoke">{{ role.updatedBy || "System" }}</dd>
        </div>
    </AppDetailMetaPanel>
  </div>
</template>
