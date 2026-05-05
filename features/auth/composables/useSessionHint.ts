export const useSessionHint = () => {
  const hint = useCookie<string | null>("lumora_session_hint", {
    sameSite: "lax",
    path: "/",
    default: () => null,
  });

  const hasHint = computed(() => hint.value === "1");

  const markAuthenticated = () => {
    hint.value = "1";
  };

  const clear = () => {
    hint.value = null;
  };

  return {
    hint,
    hasHint,
    markAuthenticated,
    clear,
  };
};
