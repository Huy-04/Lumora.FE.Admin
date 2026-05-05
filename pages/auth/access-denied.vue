<script setup lang="ts">
definePageMeta({
  layout: "auth",
});

const session = useAuthSession();
const pending = ref(false);

const logout = async () => {
  pending.value = true;

  try {
    await session.logout();
  } finally {
    pending.value = false;
    await navigateTo("/auth/login");
  }
};
</script>

<template>
  <div class="grid gap-6">
    <AppPanel
      title="Admin access required"
      description="Your account is signed in, but it does not have permission to open Lumora Admin."
    >
      <div class="grid gap-4">
        <AppNotice tone="warning" title="Access denied">
          Ask an administrator to assign the Admin.Access permission before returning to this workspace.
        </AppNotice>

        <div class="panel-action-row">
          <AppButton :loading="pending" @click="logout">
            Sign out
          </AppButton>
        </div>
      </div>
    </AppPanel>
  </div>
</template>
