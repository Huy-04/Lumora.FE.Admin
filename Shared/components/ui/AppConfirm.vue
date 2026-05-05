<script setup lang="ts">
import { PhQuestion, PhWarning, PhWarningOctagon } from "@phosphor-icons/vue";

defineProps<{
  open: boolean;
  title: string;
  detail?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  tone?: "danger" | "warning" | "default";
  loading?: boolean;
  hideConfirm?: boolean;
}>();

const emit = defineEmits<{
  confirm: [];
  cancel: [];
}>();
</script>

<template>
  <Teleport to="body">
    <Transition
      enter-active-class="transition duration-200 ease-out"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition duration-150 ease-in"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div
        v-if="open"
        class="fixed inset-0 z-50 flex items-center justify-center px-4"
        role="dialog"
        aria-modal="true"
      >
        <div
          class="absolute inset-0 bg-black/40 backdrop-blur-sm dark:bg-black/60"
          @click="emit('cancel')"
        />

        <Transition
          enter-active-class="transition duration-200 ease-out"
          enter-from-class="opacity-0 scale-95 translate-y-2"
          enter-to-class="opacity-100 scale-100 translate-y-0"
          leave-active-class="transition duration-150 ease-in"
          leave-from-class="opacity-100 scale-100 translate-y-0"
          leave-to-class="opacity-0 scale-95 translate-y-2"
        >
          <div
            v-if="open"
            class="relative z-10 grid w-full max-w-sm gap-5 px-6 py-6 soft-card"
          >
            <div class="flex items-start gap-4">
              <div
                class="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-full"
                :class="
                  tone === 'danger'
                    ? 'bg-danger/12 text-danger dark:bg-danger/16'
                    : tone === 'warning'
                      ? 'bg-warning/12 text-warning dark:bg-warning/16'
                      : 'bg-moss/12 text-pine dark:bg-white/8 dark:text-smoke'
                "
              >
                <PhWarningOctagon v-if="tone === 'danger'" :size="18" weight="fill" />
                <PhWarning v-else-if="tone === 'warning'" :size="18" weight="fill" />
                <PhQuestion v-else :size="18" weight="bold" />
              </div>

              <div class="min-w-0">
                <p class="text-sm font-semibold leading-snug text-ink">{{ title }}</p>
                <p v-if="detail" class="mt-1 text-xs leading-relaxed text-smoke">{{ detail }}</p>
              </div>
            </div>

            <div class="flex justify-end gap-2">
              <AppButton
                variant="ghost"
                :disabled="loading"
                @click="emit('cancel')"
              >
                {{ cancelLabel ?? "Huỷ" }}
              </AppButton>
              <AppButton
                v-if="!hideConfirm"
                :variant="tone === 'danger' ? 'danger' : 'primary'"
                :loading="loading"
                @click="emit('confirm')"
              >
                {{ confirmLabel ?? "Xác nhận" }}
              </AppButton>
            </div>
          </div>
        </Transition>
      </div>
    </Transition>
  </Teleport>
</template>
