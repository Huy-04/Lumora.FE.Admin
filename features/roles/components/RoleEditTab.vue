<script setup lang="ts">
import type { RoleResponse } from "~/features/roles/types";

const props = defineProps<{
  role: RoleResponse;
}>();

const emit = defineEmits<{
  refresh: [];
}>();

const rolesApi = useRolesAdminApi();

const form = reactive({
  roleName: "",
  description: "",
});

const actionPending = ref(false);
const actionError = ref("");
const actionSuccess = ref("");

watchEffect(() => {
  if (!props.role) return;

  form.roleName = props.role.roleName;
  form.description = props.role.description || "";
});

const saveRole = async () => {
  actionPending.value = true;
  actionError.value = "";
  actionSuccess.value = "";

  try {
    await rolesApi.updateRole(props.role.id, {
      roleName: form.roleName,
      description: form.description || null,
    });
    actionSuccess.value = "Role updated.";
    emit("refresh");
  } catch (requestError) {
    actionError.value = getProblemMessage(requestError, "Unable to update the role.");
  } finally {
    actionPending.value = false;
  }
};
</script>

<template>
  <div class="grid gap-6 content-start max-w-6xl">
    <AppPanel
      title="Edit role"
      description="Update the role name and description."
    >
      <form class="form-stack" @submit.prevent="saveRole">
        <div class="grid gap-5">
          <div class="max-w-2xl">
            <AppInput v-model="form.roleName" label="Role name" />
          </div>

          <AppTextarea
            v-model="form.description"
            label="Description"
            :rows="7"
          />
        </div>

        <AppNotice v-if="actionSuccess" tone="success" title="Role updated">
          {{ actionSuccess }}
        </AppNotice>

        <AppNotice v-if="actionError" tone="danger" title="Role update failed">
          {{ actionError }}
        </AppNotice>

        <div class="panel-action-row border-t border-line/70 pt-4">
          <AppButton :loading="actionPending" type="submit">Save changes</AppButton>
          <NuxtLink class="secondary-link" to="/roles">
            Back to roles
          </NuxtLink>
        </div>
      </form>
    </AppPanel>
  </div>
</template>
