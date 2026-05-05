<script setup lang="ts">
const props = withDefaults(defineProps<{
  label: string;
  modelValue?: string[];
  helper?: string;
  required?: boolean;
  disabled?: boolean;
  readonly?: boolean;
  error?: string;
  length?: number;
  name?: string;
  autocomplete?: string;
}>(), {
  modelValue: () => [],
  helper: "",
  required: false,
  disabled: false,
  readonly: false,
  error: "",
  length: 6,
  name: undefined,
  autocomplete: "one-time-code",
});

const emit = defineEmits<{
  "update:modelValue": [value: string[]];
  complete: [value: string];
}>();

const inputRefs = ref<Array<HTMLInputElement | null>>([]);

const sanitizeChunk = (value: string) => value.toUpperCase().replace(/[^A-Z0-9]/g, "");

const values = computed(() =>
  Array.from({ length: props.length }, (_, index) => sanitizeChunk(props.modelValue[index] ?? "").slice(0, 1)),
);

const focusInput = async (index: number) => {
  if (index < 0 || index >= props.length) {
    return;
  }

  await nextTick();
  const input = inputRefs.value[index];
  input?.focus();
  input?.select();
};

const emitValues = (nextValues: string[]) => {
  const normalized = Array.from({ length: props.length }, (_, index) => sanitizeChunk(nextValues[index] ?? "").slice(0, 1));
  emit("update:modelValue", normalized);

  if (normalized.every(Boolean)) {
    emit("complete", normalized.join(""));
  }
};

const replaceAt = (index: number, value: string) => {
  const nextValues = [...values.value];
  nextValues[index] = sanitizeChunk(value).slice(0, 1);
  emitValues(nextValues);
};

const fillFrom = async (index: number, rawValue: string) => {
  const chunk = sanitizeChunk(rawValue);
  const nextValues = [...values.value];

  if (!chunk) {
    nextValues[index] = "";
    emitValues(nextValues);
    return;
  }

  let cursor = index;

  for (const character of chunk) {
    if (cursor >= props.length) {
      break;
    }

    nextValues[cursor] = character;
    cursor += 1;
  }

  emitValues(nextValues);

  const nextIndex = Math.min(cursor, props.length - 1);
  await focusInput(nextIndex);
};

const handleInput = async (index: number, event: Event) => {
  const target = event.target as HTMLInputElement;
  const rawValue = target.value ?? "";

  if (!rawValue) {
    replaceAt(index, "");
    return;
  }

  if (rawValue.length > 1) {
    await fillFrom(index, rawValue);
    return;
  }

  const sanitized = sanitizeChunk(rawValue);

  if (!sanitized) {
    replaceAt(index, "");
    return;
  }

  replaceAt(index, sanitized);

  if (index < props.length - 1) {
    await focusInput(index + 1);
  }
};

const handlePaste = async (index: number, event: ClipboardEvent) => {
  event.preventDefault();
  await fillFrom(index, event.clipboardData?.getData("text") ?? "");
};

const handleKeydown = async (index: number, event: KeyboardEvent) => {
  if (event.key === "Backspace") {
    event.preventDefault();

    if (values.value[index]) {
      replaceAt(index, "");
      return;
    }

    if (index > 0) {
      replaceAt(index - 1, "");
      await focusInput(index - 1);
    }

    return;
  }

  if (event.key === "Delete") {
    event.preventDefault();
    replaceAt(index, "");
    return;
  }

  if (event.key === "ArrowLeft") {
    event.preventDefault();
    await focusInput(index - 1);
    return;
  }

  if (event.key === "ArrowRight") {
    event.preventDefault();
    await focusInput(index + 1);
    return;
  }

  if (event.key === "Home") {
    event.preventDefault();
    await focusInput(0);
    return;
  }

  if (event.key === "End") {
    event.preventDefault();
    await focusInput(props.length - 1);
    return;
  }

  if (event.key.length === 1 && !sanitizeChunk(event.key)) {
    event.preventDefault();
  }
};

const setInputRef = (index: number, element: unknown) => {
  inputRefs.value[index] = element instanceof HTMLInputElement ? element : null;
};

const selectInputText = (event: FocusEvent) => {
  (event.target as HTMLInputElement | null)?.select();
};
</script>

<template>
  <label class="grid gap-2">
    <span class="app-label">
      {{ label }}
      <span v-if="required" class="text-danger">*</span>
    </span>

    <div class="app-otp-grid">
      <input
        v-for="(entry, index) in values"
        :key="index"
        :ref="(element) => setInputRef(index, element)"
        :value="entry"
        :name="index === 0 ? name : undefined"
        :autocomplete="index === 0 ? autocomplete : 'off'"
        :disabled="disabled"
        :readonly="readonly"
        :required="required && index === 0"
        :aria-invalid="Boolean(error)"
        :aria-label="`${label} ô ${index + 1}`"
        class="app-otp-cell"
        :class="[disabled ? 'app-input-disabled' : '', error ? 'app-input-error' : '']"
        maxlength="1"
        inputmode="text"
        @focus="selectInputText"
        @input="handleInput(index, $event)"
        @keydown="handleKeydown(index, $event)"
        @paste="handlePaste(index, $event)"
      />
    </div>

    <span v-if="error" class="app-field-error">{{ error }}</span>
    <span v-else-if="helper" class="app-field-helper">{{ helper }}</span>
  </label>
</template>
