<script setup lang="ts">
import type { PermissionResponse } from "~/features/permissions/types";

const props = defineProps<{
  permission: PermissionResponse;
}>();

const emit = defineEmits<{
  refresh: [];
}>();

const {
  actionError,
  actionPending,
  actionSuccess,
  form,
  operationOptions,
  permissionModuleOptions,
  permissionScopeOptions,
  savePermission,
  subModuleOptions,
} = usePermissionEditTab(() => props.permission, () => emit("refresh"));
</script>

<template>
  <div class="grid gap-6 content-start max-w-6xl">
    <AppPanel
      eyebrow="Edit permission"
    >
      <form class="form-stack" @submit.prevent="savePermission">
        <div class="grid gap-4 md:grid-cols-2">
          <AppSelect v-model="form.module" label="Module" :options="permissionModuleOptions" />
          <AppSelect v-model="form.subModule" label="SubModule" :options="subModuleOptions" />
        </div>
        <div class="grid gap-4 md:grid-cols-2">
          <AppSelect v-model="form.operation" label="Operation" :options="operationOptions" />
          <AppSelect v-model="form.scope" label="Scope" :options="permissionScopeOptions" />
        </div>

        <div class="mt-4">
          <AppTextarea v-model="form.description" label="Description" placeholder="Describe where this permission is used." />
        </div>

        <div class="flex flex-wrap items-center justify-end gap-3 pt-2">
          <AppButton :loading="actionPending" type="submit">Save changes</AppButton>
        </div>
      </form>

      <AppNotice v-if="actionSuccess" tone="success" title="Permission updated" class="mt-4">
        {{ actionSuccess }}
      </AppNotice>

      <AppNotice v-if="actionError" tone="danger" title="Permission update failed" class="mt-4">
        {{ actionError }}
      </AppNotice>
    </AppPanel>
  </div>
</template>
