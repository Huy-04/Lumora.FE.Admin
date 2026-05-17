const DEVICE_ID_PATTERN = /^(web-[a-f0-9]{8}|[a-zA-Z0-9\-_]{3,32})$/;
const DEVICE_NAME_MAX_LENGTH = 128;

interface UseDeviceIdentityOptions {
  appName?: string;
  deviceIdCookieName?: string;
  deviceNameCookieName?: string;
  statePrefix?: string;
}

const randomHex = (length: number) => {
  const alphabet = "abcdef0123456789";
  let value = "";

  for (let index = 0; index < length; index += 1) {
    value += alphabet[Math.floor(Math.random() * alphabet.length)];
  }

  return value;
};

const generateDeviceId = () => `web-${randomHex(8)}`;

const normalizeDeviceId = (value?: string | null) => {
  const nextValue = value?.trim() ?? "";
  return DEVICE_ID_PATTERN.test(nextValue) ? nextValue : generateDeviceId();
};

const normalizeDeviceName = (value?: string | null, defaultName = "Lumora") => {
  const nextValue = value?.trim() ?? "";

  if (!nextValue) {
    return defaultName;
  }

  return nextValue.slice(0, DEVICE_NAME_MAX_LENGTH);
};

/**
 * Builds a sanitized device name from the current platform/user-agent.
 * Trims leading/trailing whitespace and truncates to 128 characters
 * to satisfy the BE DeviceName value-object constraints.
 * If the result is blank, the BE defaults to "Unknown Browser".
 */
const buildDeviceName = (appName: string): string => {
  let raw: string;

  if (import.meta.server) {
    raw = appName;
  } else {
    const platform = navigator.platform || "";
    const agent = navigator.userAgent;

    if (agent.includes("iPhone") || agent.includes("iPad")) {
      raw = `${appName} on iOS`;
    } else if (agent.includes("Android")) {
      raw = `${appName} on Android`;
    } else if (agent.includes("Mac")) {
      raw = `${appName} on Mac`;
    } else if (agent.includes("Windows")) {
      raw = `${appName} on Windows`;
    } else if (platform) {
      raw = `${appName} on ${platform}`;
    } else {
      raw = appName;
    }
  }

  const trimmed = raw.trim();
  return trimmed.length > DEVICE_NAME_MAX_LENGTH
    ? trimmed.substring(0, DEVICE_NAME_MAX_LENGTH)
    : trimmed;
};

export const useDeviceIdentity = (options: UseDeviceIdentityOptions = {}) => {
  const {
    appName = "Lumora Admin",
    deviceIdCookieName = "lumora_device_id",
    deviceNameCookieName = "lumora_device_name",
    statePrefix = "auth",
  } = options;

  const deviceIdCookie = useCookie<string | null>(deviceIdCookieName, {
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30, // 30 days
    default: () => null,
  });

  const deviceNameCookie = useCookie<string | null>(deviceNameCookieName, {
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
    default: () => null,
  });

  const deviceId = useState<string>(`${statePrefix}:device-id`, () => normalizeDeviceId(deviceIdCookie.value));
  const deviceName = useState<string>(`${statePrefix}:device-name`, () => {
    const cookieValue = deviceNameCookie.value;
    return normalizeDeviceName(cookieValue || buildDeviceName(appName), appName);
  });

  const syncCookies = () => {
    if (deviceIdCookie.value !== deviceId.value) {
      deviceIdCookie.value = deviceId.value;
    }

    if (deviceNameCookie.value !== deviceName.value) {
      deviceNameCookie.value = deviceName.value;
    }
  };

  syncCookies();

  const apply = (nextDeviceId?: string, nextDeviceName?: string) => {
    const normalizedDeviceId = normalizeDeviceId(nextDeviceId || deviceId.value);
    const normalizedDeviceName = normalizeDeviceName(nextDeviceName || deviceName.value, appName);

    if (deviceId.value !== normalizedDeviceId) {
      deviceId.value = normalizedDeviceId;
    }

    if (deviceName.value !== normalizedDeviceName) {
      deviceName.value = normalizedDeviceName;
    }

    syncCookies();
  };

  return {
    deviceId,
    deviceName,
    apply,
    headers: computed(() => ({
      "X-Device-Id": deviceId.value,
      "X-Device-Name": deviceName.value,
    })),
  };
};
