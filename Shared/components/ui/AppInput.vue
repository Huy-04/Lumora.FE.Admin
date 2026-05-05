<script setup lang="ts">
import { PhEye, PhEyeSlash } from "@phosphor-icons/vue";

const props = defineProps<{
  id?: string;
  label: string;
  placeholder?: string;
  helper?: string;
  type?: string;
  modelValue?: string;
  disabled?: boolean;
  readonly?: boolean;
  maxlength?: number;
  name?: string;
  autocomplete?: string;
  inputmode?: "none" | "text" | "tel" | "url" | "email" | "numeric" | "decimal" | "search";
  required?: boolean;
  error?: string;
}>();

const emit = defineEmits<{
  "update:modelValue": [value: string];
}>();

const passwordVisible = ref(false);
const isPasswordField = computed(() => props.type === "password");
const resolvedType = computed(() => {
  if (!isPasswordField.value) {
    return props.type ?? "text";
  }

  return passwordVisible.value ? "text" : "password";
});
</script>

<template>
  <label class="grid gap-2">
    <span v-if="label" class="app-label">
      {{ label }}
      <span v-if="required" class="text-danger">*</span>
    </span>
    <span class="relative block">
      <input
        :id="id"
        :name="name"
        :type="resolvedType"
        :placeholder="placeholder"
        :value="modelValue"
        :disabled="disabled"
        :readonly="readonly"
        :maxlength="maxlength"
        :autocomplete="autocomplete"
        :inputmode="inputmode"
        :required="required"
        :aria-invalid="Boolean(error)"
        class="app-input"
        :class="[
          error ? 'app-input-error' : '',
          isPasswordField ? 'pr-12' : $slots.suffix ? 'pr-2' : '',
          disabled ? 'app-input-disabled' : '',
        ]"
        @input="emit('update:modelValue', ($event.target as HTMLInputElement).value)"
      />
      <button
        v-if="isPasswordField"
        type="button"
        class="absolute right-3 top-1/2 inline-flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full text-smoke transition duration-300 ease-out hover:bg-ink/5 hover:text-ink"
        :aria-label="passwordVisible ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'"
        @click="passwordVisible = !passwordVisible"
      >
        <PhEyeSlash v-if="passwordVisible" :size="18" />
        <PhEye v-else :size="18" />
      </button>
      <span v-if="$slots.suffix" class="absolute right-3 top-1/2 -translate-y-1/2">
        <slot name="suffix" />
      </span>
    </span>
    <span v-if="error" class="app-field-error">{{ error }}</span>
    <span v-else-if="helper" class="app-field-helper">{{ helper }}</span>
  </label>
</template>
