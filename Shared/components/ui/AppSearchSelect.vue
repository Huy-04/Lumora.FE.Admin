<script setup lang="ts">
const props = defineProps<{
  label: string;
  modelValue?: string;
  options: ReadonlyArray<{ label: string; value: string }>;
  placeholder?: string;
  disabled?: boolean;
  loading?: boolean;
  error?: string;
  required?: boolean;
}>();

const emit = defineEmits<{
  "update:modelValue": [value: string];
  "search": [query: string];
}>();

const searchQuery = ref("");
const open = ref(false);
let blurTimeout: ReturnType<typeof setTimeout> | null = null;

const filteredOptions = computed(() => {
  const query = searchQuery.value.toLowerCase().trim();
  const filtered = query
    ? props.options.filter((o) => o.label.toLowerCase().includes(query))
    : props.options;
  return filtered.slice(0, 50);
});

// Sync searchQuery with selected option label
watch(
  () => props.modelValue,
  (value) => {
    if (value) {
      const match = props.options.find((o) => o.value === value);
      if (match) {
        searchQuery.value = match.label;
      }
    } else {
      searchQuery.value = "";
    }
  },
  { immediate: true },
);

// Also watch options in case they load after modelValue is set
watch(
  () => props.options,
  () => {
    if (props.modelValue) {
      const match = props.options.find((o) => o.value === props.modelValue);
      if (match) {
        searchQuery.value = match.label;
      }
    }
  },
);

const selectOption = (option: { label: string; value: string }) => {
  emit("update:modelValue", option.value);
  searchQuery.value = option.label;
  open.value = false;
};

const handleBlur = () => {
  blurTimeout = setTimeout(() => {
    open.value = false;
  }, 150);
};

const handleFocus = () => {
  if (blurTimeout) {
    clearTimeout(blurTimeout);
    blurTimeout = null;
  }
  open.value = true;
};

const handleInput = () => {
  open.value = true;
  emit("search", searchQuery.value);
  // Clear selection when user types (search mode)
  if (props.modelValue) {
    const match = props.options.find((o) => o.value === props.modelValue);
    if (match && searchQuery.value !== match.label) {
      emit("update:modelValue", "");
    }
  }
};
</script>

<template>
  <label class="grid gap-2">
    <span class="app-label">
      {{ label }}
      <span v-if="required" class="text-danger">*</span>
    </span>
    <div class="relative">
      <input
        type="text"
        class="app-input"
        :class="[error ? 'app-input-error' : '', disabled ? 'app-input-disabled' : '']"
        :placeholder="placeholder"
        :disabled="disabled"
        v-model="searchQuery"
        @focus="handleFocus"
        @blur="handleBlur"
        @input="handleInput"
      />
      <div v-if="open && filteredOptions.length" class="app-search-select-dropdown">
        <button
          v-for="option in filteredOptions"
          :key="option.value"
          type="button"
          class="app-search-select-option"
          :class="{ 'app-search-select-option-active': option.value === modelValue }"
          @mousedown.prevent="selectOption(option)"
        >
          {{ option.label }}
        </button>
      </div>
      <div v-if="loading" class="absolute right-3 top-1/2 -translate-y-1/2">
        <span class="h-2 w-2 animate-pulse rounded-full bg-smoke inline-block" />
      </div>
    </div>
    <span v-if="error" class="app-field-error">{{ error }}</span>
  </label>
</template>
