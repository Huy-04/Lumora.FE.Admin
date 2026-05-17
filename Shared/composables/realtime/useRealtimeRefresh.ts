export const useRealtimeRefresh = (
  refresh: () => Promise<unknown> | unknown,
  delayMs = 600,
) => {
  let timer: ReturnType<typeof setTimeout> | null = null;

  const scheduleRefresh = () => {
    if (timer) {
      clearTimeout(timer);
    }

    timer = setTimeout(() => {
      timer = null;
      void refresh();
    }, delayMs);
  };

  onBeforeUnmount(() => {
    if (timer) {
      clearTimeout(timer);
      timer = null;
    }
  });

  return {
    scheduleRefresh,
  };
};
