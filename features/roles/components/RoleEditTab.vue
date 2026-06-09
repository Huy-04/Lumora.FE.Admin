<script setup lang="ts">
import type { RoleResponse } from "~/features/roles/types";

const props = defineProps<{
  role: RoleResponse;
}>();

const emit = defineEmits<{
  refresh: [];
}>();

const {
  actionError,
  actionPending,
  actionSuccess,
  form,
  saveRole,
} = useRoleEditTab(() => props.role, () => emit("refresh"));
</script>

<template>
  <div class="grid gap-6 content-start max-w-6xl">
    <AppPanel eyebrow="Edit role">
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

        <div class="flex flex-wrap items-center justify-end gap-3 border-t border-line pt-5">
          <AppButton :loading="actionPending" type="submit">Save changes</AppButton>
        </div>
      </form>
    </AppPanel>
  </div>
</template>
