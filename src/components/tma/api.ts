export const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "https://fglove.online";

const memoryStore: Record<string, string> = {};

export const safeStorage = {
  getItem(key: string): string | null {
    try {
      if (typeof window !== "undefined" && typeof window.localStorage !== "undefined") {
        return window.localStorage.getItem(key);
      }
    } catch (e) {
      console.warn("[SafeStorage] localStorage.getItem failed:", e);
    }
    return memoryStore[key] || null;
  },
  setItem(key: string, value: string): void {
    try {
      if (typeof window !== "undefined" && typeof window.localStorage !== "undefined") {
        window.localStorage.setItem(key, value);
        return;
      }
    } catch (e) {
      console.warn("[SafeStorage] localStorage.setItem failed:", e);
    }
    memoryStore[key] = value;
  },
  removeItem(key: string): void {
    try {
      if (typeof window !== "undefined" && typeof window.localStorage !== "undefined") {
        window.localStorage.removeItem(key);
        return;
      }
    } catch (e) {
      console.warn("[SafeStorage] localStorage.removeItem failed:", e);
    }
    delete memoryStore[key];
  }
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const apiCall = async (endpoint: string, method: "GET" | "POST" | "PATCH" = "GET", body?: unknown, extraHeaders?: Record<string, string>): Promise<any> => {
  const token = safeStorage.getItem("iguard_jwt_token");
  const headers: HeadersInit = { "Content-Type": "application/json", ...(extraHeaders || {}) };
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const response = await fetch(`${API_BASE}${endpoint}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!response.ok) throw new Error(`${response.status} ${response.statusText}`);
  return response.json();
};

// Records a push-campaign button click. Fire-and-forget, no auth - used to
// track engagement with `p-<campaignId>_<action>` deep links from push-service.
export const recordPushClick = (campaignId: number, action: string, telegramId: number | string): void => {
  fetch(`${API_BASE}/public/clicks`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ campaign_id: campaignId, action, telegram_id: String(telegramId) }),
  }).catch((err) => {
    console.error("[IGuard] Failed to record push click:", err);
  });
};

// GET /ip/status — whether the current connection exits through iGuard servers.
// Mirrors the landing's IpStatusBar: the IP is shown transiently, never stored.
export interface IpStatusLocation {
  country_code: string;
  country: string;
  city?: string;
  flag: string;
}

export interface IpStatus {
  ip: string;
  protected: boolean;
  location: IpStatusLocation | null;
  server?: { region: string; region_ru?: string };
}

const IP_STATUS_TIMEOUT_MS = 8000;

export const fetchIpStatus = async (signal?: AbortSignal): Promise<IpStatus> => {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), IP_STATUS_TIMEOUT_MS);
  signal?.addEventListener("abort", () => controller.abort());
  try {
    const response = await fetch(`${API_BASE}/ip/status`, {
      headers: { "X-Product": "Iguard" },
      cache: "no-store",
      signal: controller.signal,
    });
    if (!response.ok) throw new Error(`ip status: ${response.status}`);
    const data = (await response.json()) as Partial<IpStatus>;
    if (typeof data.ip !== "string" || typeof data.protected !== "boolean") {
      throw new Error("ip status: malformed response");
    }
    return { ip: data.ip, protected: data.protected, location: data.location ?? null, server: data.server };
  } finally {
    clearTimeout(timer);
  }
};
