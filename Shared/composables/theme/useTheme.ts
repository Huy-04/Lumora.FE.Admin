export const useTheme = () => {
  const preference = useCookie<"light" | "dark">("lumora_theme", {
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
    default: () => "light",
  });

  const isDark = computed(() => preference.value === "dark");

  const apply = (theme: "light" | "dark") => {
    preference.value = theme;
    if (import.meta.client) {
      document.documentElement.classList.toggle("dark", theme === "dark");
    }
  };

  const toggle = () => {
    apply(isDark.value ? "light" : "dark");
  };

  // Apply on mount (client only)
  onMounted(() => {
    apply(preference.value);
  });

  // SSR: set the class during render
  if (import.meta.server) {
    const event = useRequestEvent();
    if (event) {
      const cookie = getCookie(event, "lumora_theme");
      if (cookie === "dark") {
        useHead({
          htmlAttrs: { class: "dark" },
        });
      }
    }
  }

  return {
    isDark,
    preference,
    apply,
    toggle,
  };
};