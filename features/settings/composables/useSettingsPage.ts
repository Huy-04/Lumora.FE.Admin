export const useSettingsPage = async () => {
  // 1. Dependency injection
  const { isDark, toggle } = useTheme();

  // 2. Return statement
  return {
    isDark,
    toggle,
  };
};

export type SettingPageState = Awaited<ReturnType<typeof useSettingsPage>>;
