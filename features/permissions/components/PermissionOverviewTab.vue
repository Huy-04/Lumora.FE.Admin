<script setup lang="ts">
import type { PermissionResponse } from "~/features/permissions/types";

defineProps<{
  permission: PermissionResponse;
}>();

const { formatDateTime } = useAuthPresentation();
</script>

<template>
  <div class="grid gap-6 content-start max-w-6xl">
    <AppPanel title="Permission details" description="Contract definition used by backend policy checks.">
      <dl class="divide-y divide-line/60">
        <div class="flex items-baseline gap-4 py-3">
          <dt class="meta-label w-40 shrink-0">Permission name</dt>
          <dd class="text-sm font-medium text-ink">{{ permission.permissionName }}</dd>
        </div>
        <div class="flex items-baseline gap-4 py-3">
          <dt class="meta-label w-40 shrink-0">Permission ID</dt>
          <dd class="break-all text-xs font-mono text-smoke">{{ permission.id }}</dd>
        </div>
        <div class="flex items-baseline gap-4 py-3">
          <dt class="meta-label w-40 shrink-0">Module</dt>
          <dd class="text-sm font-medium text-ink">{{ permission.module }}</dd>
        </div>
        <div class="flex items-baseline gap-4 py-3">
          <dt class="meta-label w-40 shrink-0">SubModule</dt>
          <dd class="text-sm font-medium text-ink">{{ permission.subModule }}</dd>
        </div>
        <div class="flex items-baseline gap-4 py-3">
          <dt class="meta-label w-40 shrink-0">Operation</dt>
          <dd class="text-sm font-medium text-ink">{{ permission.operation }}</dd>
        </div>
        <div class="flex items-baseline gap-4 py-3">
          <dt class="meta-label w-40 shrink-0">Scope</dt>
          <dd class="text-sm font-medium text-ink">{{ permission.scope }}</dd>
        </div>
        <div class="flex items-baseline gap-4 py-3">
          <dt class="meta-label w-40 shrink-0">Description</dt>
          <dd class="text-sm text-smoke">{{ permission.description || "—" }}</dd>
        </div>
      </dl>
    </AppPanel>

    <AppPanel title="Audit trail" description="Administrative authorship and timestamps.">
      <dl class="divide-y divide-line/60">
        <div class="flex items-baseline gap-4 py-3">
          <dt class="meta-label w-40 shrink-0">Created at</dt>
          <dd class="text-sm text-smoke">{{ permission.createdAt ? formatDateTime(permission.createdAt) : "—" }}</dd>
        </div>
        <div class="flex items-baseline gap-4 py-3">
          <dt class="meta-label w-40 shrink-0">Created by</dt>
          <dd class="text-sm text-smoke">{{ permission.createdBy || "System" }}</dd>
        </div>
        <div class="flex items-baseline gap-4 py-3">
          <dt class="meta-label w-40 shrink-0">Updated at</dt>
          <dd class="text-sm text-smoke">{{ permission.updatedAt ? formatDateTime(permission.updatedAt) : "—" }}</dd>
        </div>
        <div class="flex items-baseline gap-4 py-3">
          <dt class="meta-label w-40 shrink-0">Updated by</dt>
          <dd class="text-sm text-smoke">{{ permission.updatedBy || "System" }}</dd>
        </div>
      </dl>
    </AppPanel>
  </div>
</template>
