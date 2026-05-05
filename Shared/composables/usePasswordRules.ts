export interface PasswordRule {
  key: string;
  label: string;
  met: boolean;
}

export const usePasswordRules = (
  password: Ref<string> | ComputedRef<string>,
  minLength = 8,
) => {
  const rules = computed<PasswordRule[]>(() => [
    { key: "length", label: `At least ${minLength} characters`, met: password.value.length >= minLength },
    { key: "uppercase", label: "At least 1 uppercase character", met: /[A-Z]/.test(password.value) },
    { key: "lowercase", label: "At least 1 lowercase character", met: /[a-z]/.test(password.value) },
    { key: "digit", label: "At least 1 digit", met: /\d/.test(password.value) },
    { key: "special", label: "At least 1 special character", met: /[^a-zA-Z0-9]/.test(password.value) },
  ]);

  const allMet = computed(() => rules.value.every((rule) => rule.met));
  const anyFailing = computed(() => password.value.length > 0 && !allMet.value);

  return { rules, allMet, anyFailing };
};
