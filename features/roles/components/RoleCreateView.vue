<script setup lang="ts">
import type { RoleCreatePage } from "~/features/roles/composables/useRoleCreatePage";

const props = defineProps<{
  page: RoleCreatePage;
}>();

const { form, pending, errorMessage, submit } = props.page;
</script>

<template>
  <div class="page-shell">
    <section class="grid max-w-6xl gap-6">
      <AppPanel eyebrow="Create role">
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

          <div class="flex justify-end gap-4 border-t border-line pt-5">
            <NuxtLink class="secondary-link min-w-[9rem]" to="/roles">
              Cancel
            </NuxtLink>
            <AppButton :loading="pending" type="submit" class="min-w-[12rem]">Create role</AppButton>
          </div>
        </form>
      </AppPanel>
    </section>
  </div>
</template>
