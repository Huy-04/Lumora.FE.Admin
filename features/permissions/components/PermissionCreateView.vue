<script setup lang="ts">
import type { PermissionCreatePage } from "~/features/permissions/composables/usePermissionCreatePage";

const props = defineProps<{
  page: PermissionCreatePage;
}>();

const { form, subModuleOptions, permissionModuleOptions, operationOptions, permissionScopeOptions, pending, errorMessage, submit } = props.page;
</script>

<template>
  <div class="page-shell">
    <section class="grid max-w-6xl gap-6">
      <AppPanel eyebrow="Create permission">
        <form class="form-stack" @submit.prevent="submit">
          <div class="grid gap-4 md:grid-cols-2">
            <AppSelect v-model="form.module" label="Module" :options="permissionModuleOptions" />
            <AppSelect v-model="form.subModule" label="SubModule" :options="subModuleOptions" />
          </div>
          <div class="grid gap-4 md:grid-cols-2">
            <AppSelect v-model="form.operation" label="Operation" :options="operationOptions" />
            <AppSelect v-model="form.scope" label="Scope" :options="permissionScopeOptions" />
          </div>
          <AppTextarea v-model="form.description" label="Description" placeholder="Describe where this permission is used." />

          <AppNotice v-if="errorMessage" tone="danger" title="Create permission failed">
            {{ errorMessage }}
          </AppNotice>

          <div class="flex justify-end gap-4 border-t border-line pt-5">
            <NuxtLink class="secondary-link min-w-[9rem]" to="/permissions">
              Cancel
            </NuxtLink>
            <AppButton :loading="pending" type="submit" class="min-w-[12rem]">Create permission</AppButton>
          </div>
        </form>
      </AppPanel>
    </section>
  </div>
</template>
