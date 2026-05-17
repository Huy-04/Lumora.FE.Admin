import type { HubConnection } from "@microsoft/signalr";
import type { ComputedRef, Ref } from "vue";

type SignalRConnectionStatus = "idle" | "connecting" | "connected" | "reconnecting" | "disconnected" | "failed";

type SignalREventHandler<TPayload> = (payload: TPayload) => void | Promise<void>;

interface SignalRHubOptions {
  hubPath: string;
  enabled?: Ref<boolean> | ComputedRef<boolean> | boolean;
}

const normalizeRealtimeBaseUrl = (value: string) => value.replace(/\/$/, "");

export const useSignalRHub = <TPayload>(
  eventName: string,
  handler: SignalREventHandler<TPayload>,
  options: SignalRHubOptions,
) => {
  const status = ref<SignalRConnectionStatus>("idle");
  const error = ref<unknown>(null);
  const enabled = computed(() => unref(options.enabled ?? true));
  let connection: HubConnection | null = null;

  const connect = async () => {
    if (!import.meta.client || !enabled.value || connection) {
      return;
    }

    status.value = "connecting";
    error.value = null;

    try {
      const { HubConnectionBuilder, LogLevel } = await import("@microsoft/signalr");
      const runtimeConfig = useRuntimeConfig();
      const realtimeBaseUrl = normalizeRealtimeBaseUrl(String(runtimeConfig.public.realtimeBaseUrl || ""));
      const hubUrl = realtimeBaseUrl
        ? `${realtimeBaseUrl}${options.hubPath}`
        : options.hubPath;

      connection = new HubConnectionBuilder()
        .withUrl(hubUrl, {
          withCredentials: true,
        })
        .withAutomaticReconnect()
        .configureLogging(import.meta.dev ? LogLevel.Information : LogLevel.Warning)
        .build();

      connection.on(eventName, (payload: TPayload) => {
        void handler(payload);
      });
      connection.onreconnecting(() => {
        status.value = "reconnecting";
      });
      connection.onreconnected(() => {
        status.value = "connected";
      });
      connection.onclose(() => {
        status.value = "disconnected";
        connection = null;
      });

      await connection.start();
      status.value = "connected";
    } catch (caught) {
      error.value = caught;
      status.value = "failed";
      connection = null;
    }
  };

  const disconnect = async () => {
    const current = connection;
    connection = null;
    if (!current) {
      return;
    }

    await current.stop();
    status.value = "disconnected";
  };

  onMounted(() => {
    void connect();
  });

  onBeforeUnmount(() => {
    void disconnect();
  });

  watch(enabled, (nextEnabled) => {
    if (nextEnabled) {
      void connect();
      return;
    }

    void disconnect();
  });

  return {
    status,
    error,
    connect,
    disconnect,
  };
};
