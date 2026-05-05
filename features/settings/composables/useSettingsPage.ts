import { PhMoon, PhSun } from "@phosphor-icons/vue";

export const useSettingsPage = async () => {
  const { isDark, toggle } = useTheme();

  return {
    isDark,
    toggle,
  };
};

export type SettingsPage = Awaited<ReturnType<typeof useSettingsPage>>;
