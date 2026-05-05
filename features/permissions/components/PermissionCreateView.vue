<script setup lang="ts">
import type { PermissionCreatePage } from "~/features/permissions/composables/usePermissionCreatePage";

const props = defineProps<{
  page: PermissionCreatePage;
}>();

const { form, subModuleOptions, permissionModuleOptions, permissionOperationOptions, permissionScopeOptions, pending, errorMessage, submit } = props.page;
</script>

<template>
  <div class="page-shell">
    <section class="max-w-4xl">
      <AppPanel eyebrow="Create permission" title="Create permission" description="Add a policy rule using the same module, operation, and scope contract enforced by the backend.">
        <form class="form-stack" @submit.prevent="submit">
          <div class="grid gap-4 md:grid-cols-2">
            <AppSelect v-model="form.module" label="Module" :options="permissionModuleOptions" />
            <AppSelect v-model="form.subModule" label="SubModule" :options="subModuleOptions" />
          </div>
          <div class="grid gap-4 md:grid-cols-2">
            <AppSelect v-model="form.operation" label="Operation" :options="permissionOperationOptions" />
            <AppSelect v-model="form.scope" label="Scope" :options="permissionScopeOptions" />
          </div>
          <AppTextarea v-model="form.description" label="Description" placeholder="Describe where this permission is used." />

          <AppNotice v-if="errorMessage" tone="danger" title="Create permission failed">
            {{ errorMessage }}
          </AppNotice>

          <div class="panel-action-row">
            <AppButton :loading="pending" type="submit">Create permission</AppButton>
            <NuxtLink class="secondary-link" to="/permissions">
              Back to permissions
            </NuxtLink>
          </div>
        </form>
      </AppPanel>
    </section>
  </div>
</template>
