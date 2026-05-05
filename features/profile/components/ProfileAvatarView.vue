<script setup lang="ts">
import type { ProfileAvatarPage } from "~/features/profile/composables/useProfileAvatarPage";

const props = defineProps<{
  page: ProfileAvatarPage;
}>();

const { pending, error, presetAvatars, hasAvatar, previewUrl, displayName, avatarInitial, isPresetSelected, selectPreset, customUrlInput, applyCustomUrl, removeAvatar, resetDraft, saveSuccess, saveError, savePending, submitAvatar } = props.page;
</script>

<template>
  <div class="page-shell">
    <section class="detail-header">
      <h1 class="detail-title">Profile photo</h1>
      <p class="detail-copy">
        Pick a preset or use a custom image URL in a layout that gives the avatar editor enough room to breathe.
      </p>
      <div class="detail-tabs">
        <NuxtLink class="detail-nav-link" to="/profile">Back to profile</NuxtLink>
      </div>
    </section>

    <section v-if="pending" class="grid gap-6 lg:grid-cols-[260px_1fr]">
      <div class="soft-card h-[360px] animate-pulse" />
      <div class="soft-card h-[420px] animate-pulse" />
    </section>

    <AppNotice v-else-if="error" tone="danger" title="Unable to load avatar settings">
      {{ getProblemMessage(error, "The avatar editor could not be loaded.") }}
    </AppNotice>

    <section v-else class="grid gap-6 lg:grid-cols-[260px_1fr]">
      <AppPanel
        eyebrow="Preview"
        title="Current avatar"
        description="Your profile picture as it appears across the workspace."
      >
        <div class="grid gap-5">
          <div class="rounded-[32px] border border-line/70 bg-panel px-6 py-7 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] dark:bg-panel/80">
            <div class="mx-auto grid h-32 w-32 place-items-center overflow-hidden rounded-[36px] border border-line bg-pearl text-3xl font-semibold text-smoke shadow-[0_18px_40px_-24px_rgba(15,23,42,0.45)]">
              <img
                v-if="hasAvatar"
                :src="previewUrl"
                :alt="displayName"
                class="h-full w-full object-cover"
              >
              <span v-else>{{ avatarInitial }}</span>
            </div>
            <div class="mt-5 text-center">
              <p class="text-base font-semibold tracking-tight text-ink">{{ displayName }}</p>
              <p class="mt-1 text-sm leading-6 text-smoke">
                {{ hasAvatar ? "Custom or preset image selected." : "No image selected. The workspace will fall back to your initials." }}
              </p>
            </div>
          </div>

        </div>
      </AppPanel>

      <AppPanel
        eyebrow="Editor"
        title="Choose a new avatar"
        description="Presets are the fastest option. A custom image URL works too when you need a specific brand or portrait."
      >
        <form class="grid gap-6" @submit.prevent="submitAvatar">
          <div class="grid gap-4 md:grid-cols-2">
            <button
              v-for="preset in presetAvatars"
              :key="preset.url"
              type="button"
              class="tactile grid gap-4 rounded-[28px] border px-4 py-4 text-left transition duration-300 ease-out"
              :class="isPresetSelected(preset.url) ? 'border-ink bg-panel shadow-[0_18px_35px_-24px_rgba(15,23,42,0.4)] dark:bg-panel/80' : 'border-line bg-surface hover:border-ink/35 hover:bg-panel/70 dark:bg-surface/80'"
              @click="selectPreset(preset.url)"
            >
              <div class="flex items-center gap-4">
                <div class="h-20 w-20 overflow-hidden rounded-[24px] border border-line bg-pearl">
                  <img :src="preset.url" :alt="preset.label" class="h-full w-full object-cover">
                </div>
                <div class="min-w-0">
                  <p class="text-sm font-semibold text-ink">{{ preset.label }}</p>
                  <p class="mt-1 text-sm leading-6 text-smoke">{{ preset.note }}</p>
                </div>
              </div>
            </button>
          </div>

          <div class="rounded-[28px] border border-line/70 bg-surface px-4 py-4 dark:bg-surface/80">
            <AppInput
              v-model="customUrlInput"
              label="Image URL"
              placeholder="https://example.com/avatar.png"
            />
            <div class="mt-3 flex flex-wrap gap-3">
              <AppButton type="button" variant="secondary" @click="applyCustomUrl">
                Preview URL
              </AppButton>
              <AppButton v-if="hasAvatar" type="button" variant="ghost" @click="removeAvatar">
                Remove avatar
              </AppButton>
              <button
                type="button"
                class="secondary-link"
                @click="resetDraft"
              >
                Reset changes
              </button>
            </div>
          </div>

          <AppNotice v-if="saveSuccess" tone="success" title="Avatar updated">
            {{ saveSuccess }}
          </AppNotice>
          <AppNotice v-if="saveError" tone="danger" title="Avatar update failed">
            {{ saveError }}
          </AppNotice>

          <div class="panel-action-row">
            <AppButton :loading="savePending" type="submit">Save avatar</AppButton>
            <NuxtLink class="secondary-link" to="/profile">Back to profile</NuxtLink>
          </div>
        </form>
      </AppPanel>
    </section>
  </div>
</template>
