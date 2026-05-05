<script setup lang="ts">
defineProps<{
  id?: string;
  label: string;
  modelValue?: string;
  options: ReadonlyArray<{ label: string; value: string }>;
  helper?: string;
  disabled?: boolean;
  name?: string;
  required?: boolean;
  error?: string;
  placeholder?: string;
}>();

const emit = defineEmits<{
  "update:modelValue": [value: string];
}>();
</script>

<template>
  <label class="grid gap-2">
    <span class="app-label">
      {{ label }}
      <span v-if="required" class="text-danger">*</span>
    </span>
    <select
      :id="id"
      :name="name"
      :value="modelValue"
      :disabled="disabled"
      :required="required"
      :aria-invalid="Boolean(error)"
      class="app-select"
      :class="[error ? 'app-input-error' : '', disabled ? 'app-input-disabled' : '']"
      @change="emit('update:modelValue', ($event.target as HTMLSelectElement).value)"
    >
      <option v-if="placeholder" disabled value="">
        {{ placeholder }}
      </option>
      <option v-for="option in options" :key="option.value" :value="option.value">
        {{ option.label }}
      </option>
    </select>
    <span v-if="error" class="app-field-error">{{ error }}</span>
    <span v-else-if="helper" class="app-field-helper">{{ helper }}</span>
  </label>
</template>