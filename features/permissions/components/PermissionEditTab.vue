<script setup lang="ts">
import type { PermissionResponse } from "~/features/permissions/types";

const props = defineProps<{
  permission: PermissionResponse;
}>();

const emit = defineEmits<{
  refresh: [];
}>();

const permissionsApi = usePermissionsAdminApi();
const { permissionModuleOptions, getSubModuleOptions, permissionOperationOptions, permissionScopeOptions } = useAuthOptions();

const form = reactive({
  module: "Auth",
  subModule: "User",
  operation: "Read",
  scope: "All",
  description: "",
});

const subModuleOptions = computed(() => getSubModuleOptions(form.module));

// When module changes, reset subModule to first valid option
watch(() => form.module, (newModule) => {
  const opts = getSubModuleOptions(newModule);
  if (opts.length && !opts.some((o) => o.value === form.subModule)) {
    form.subModule = opts[0].value;
  }
});

const actionPending = ref(false);
const actionError = ref("");
const actionSuccess = ref("");

watchEffect(() => {
  if (!props.permission) return;

  form.module = props.permission.module;
  form.subModule = props.permission.subModule;
  form.operation = props.permission.operation;
  form.scope = props.permission.scope;
  form.description = props.permission.description || "";
});

const savePermission = async () => {
  actionPending.value = true;
  actionError.value = "";
  actionSuccess.value = "";

  try {
    await permissionsApi.updatePermission(props.permission.id, {
      module: form.module,
      subModule: form.subModule,
      operation: form.operation,
      scope: form.scope,
      description: form.description || null,
    });
    actionSuccess.value = "Permission updated.";
    emit("refresh");
  } catch (requestError) {
    actionError.value = getProblemMessage(requestError, "Unable to update the permission.");
  } finally {
    actionPending.value = false;
  }
};
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
          <AppSelect v-model="form.operation" label="Operation" :options="permissionOperationOptions" />
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
