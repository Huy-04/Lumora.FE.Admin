const OTP_RESEND_COOLDOWN_SECONDS = 60;

interface ProblemErrorDetail {
  field: string;
  errorCode: string;
  parameter?: Record<string, unknown> | null;
}

interface ProblemDetails {
  status?: number;
  errors?: ProblemErrorDetail[] | Record<string, string[] | string>;
}

interface UseOtpResendCooldownOptions {
  storageKey?: string;
  statePrefix?: string;
}

const toNumericCooldown = (value: unknown) => {
  if (typeof value === "number" && Number.isFinite(value) && value > 0) {
    return Math.ceil(value);
  }

  if (typeof value === "string") {
    const parsed = Number(value);
    if (Number.isFinite(parsed) && parsed > 0) {
      return Math.ceil(parsed);
    }
  }

  return null;
};

const getProblemErrorEntries = (problem: ProblemDetails | null): ProblemErrorDetail[] => {
  if (!problem?.errors || !Array.isArray(problem.errors)) {
    return [];
  }

  return problem.errors;
};

export const useOtpResendCooldown = (options: UseOtpResendCooldownOptions = {}) => {
  const { storageKey = "lumora:otp-resend-cooldowns", statePrefix = "auth" } = options;

  const cooldowns = useState<Record<string, number>>(`${statePrefix}:otp-resend-cooldowns`, () => ({}));
  const tick = useState<number>(`${statePrefix}:otp-resend-tick`, () => Date.now());
  const hydrated = useState<boolean>(`${statePrefix}:otp-resend-hydrated`, () => false);

  const persist = () => {
    if (!import.meta.client) {
      return;
    }

    localStorage.setItem(storageKey, JSON.stringify(cooldowns.value));
  };

  const pruneExpired = () => {
    const now = Date.now();
    const nextEntries = Object.entries(cooldowns.value).filter(([, expiresAt]) => expiresAt > now);
    const changed = nextEntries.length !== Object.keys(cooldowns.value).length;

    if (changed) {
      cooldowns.value = Object.fromEntries(nextEntries);
    }

    return changed;
  };

  if (import.meta.client && !hydrated.value) {
    hydrated.value = true;

    const raw = localStorage.getItem(storageKey);
    if (raw) {
      try {
        const parsed = JSON.parse(raw) as Record<string, number>;
        if (parsed && typeof parsed === "object") {
          cooldowns.value = parsed;
        }
      } catch {
        cooldowns.value = {};
      }
    }

    if (pruneExpired()) {
      persist();
    }
  }

  // Global interval (only one across all instances)
  let otpResendInterval: ReturnType<typeof setInterval> | null = null;

  if (import.meta.client && !otpResendInterval) {
    otpResendInterval = setInterval(() => {
      tick.value = Date.now();
      if (pruneExpired()) {
        persist();
      }
    }, 1000);
  }

  const getRemainingSeconds = (key?: string | null) => {
    tick.value;

    const normalizedKey = key?.trim();
    if (!normalizedKey) {
      return 0;
    }

    const expiresAt = cooldowns.value[normalizedKey] ?? 0;
    const remainingMs = expiresAt - Date.now();

    return remainingMs > 0 ? Math.ceil(remainingMs / 1000) : 0;
  };

  const startCooldown = (key?: string | null, seconds = OTP_RESEND_COOLDOWN_SECONDS) => {
    const normalizedKey = key?.trim();
    if (!normalizedKey) {
      return 0;
    }

    const normalizedSeconds = Math.max(1, Math.ceil(seconds));
    cooldowns.value = {
      ...cooldowns.value,
      [normalizedKey]: Date.now() + (normalizedSeconds * 1000),
    };
    tick.value = Date.now();
    persist();

    return normalizedSeconds;
  };

  const syncFromError = (key: string | null | undefined, error: unknown) => {
    const normalizedKey = key?.trim();
    if (!normalizedKey) {
      return 0;
    }

    const problem = getProblemDetails(error);
    const status = problem?.status ?? (error as { response?: { status?: number } } | null)?.response?.status ?? null;
    const errorEntries = getProblemErrorEntries(problem);
    const matchedEntry = errorEntries.find((entry) => entry.errorCode === "RateLimitExceeded");

    const cooldownSeconds = toNumericCooldown(matchedEntry?.parameter?.Value)
      ?? toNumericCooldown(matchedEntry?.parameter?.value)
      ?? toNumericCooldown(matchedEntry?.parameter?.CooldownSeconds)
      ?? toNumericCooldown(matchedEntry?.parameter?.cooldownSeconds);

    if (cooldownSeconds !== null) {
      return startCooldown(normalizedKey, cooldownSeconds);
    }

    if (status === 429) {
      return startCooldown(normalizedKey);
    }

    return 0;
  };

  return {
    defaultCooldownSeconds: OTP_RESEND_COOLDOWN_SECONDS,
    getRemainingSeconds,
    startCooldown,
    syncFromError,
  };
};
