<script setup lang="ts">
defineProps<{
  label: string;
  placeholder?: string;
  helper?: string;
  modelValue?: string;
  disabled?: boolean;
  readonly?: boolean;
  rows?: number;
  maxlength?: number;
}>();

const emit = defineEmits<{
  "update:modelValue": [value: string];
}>();
</script>

<template>
  <label class="grid gap-2">
    <span class="app-label">{{ label }}</span>
    <textarea
      :placeholder="placeholder"
      :value="modelValue"
      :disabled="disabled"
      :readonly="readonly"
      :rows="rows ?? 4"
      :maxlength="maxlength"
      class="app-input min-h-[132px] resize-y disabled:cursor-not-allowed"
      @input="emit('update:modelValue', ($event.target as HTMLTextAreaElement).value)"
    />
    <span v-if="helper" class="app-field-helper">{{ helper }}</span>
  </label>
</template>
