<script setup lang="ts">
import type { RoleCreatePage } from "~/features/roles/composables/useRoleCreatePage";

const props = defineProps<{
  page: RoleCreatePage;
}>();

const { form, pending, errorMessage, submit } = props.page;
</script>

<template>
  <div class="page-shell">
    <section class="max-w-4xl">
      <AppPanel eyebrow="Create role" title="Create role" description="Add a role record that can be assigned and extended with permissions after creation.">
        <form class="form-stack" @submit.prevent="submit">
          <AppInput v-model="form.roleName" label="Role name" placeholder="InventoryManager" />
          <AppTextarea
            v-model="form.description"
            label="Description"
            placeholder="Can review stock, update availability, and manage product visibility."
          />

          <AppNotice v-if="errorMessage" tone="danger" title="Create role failed">
            {{ errorMessage }}
          </AppNotice>

          <div class="panel-action-row">
            <AppButton :loading="pending" type="submit">Create role</AppButton>
            <NuxtLink class="secondary-link" to="/roles">
              Back to roles
            </NuxtLink>
          </div>
        </form>
      </AppPanel>
    </section>
  </div>
</template>
