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
export const apiCall = async (endpoint: string, method: "GET" | "POST" | "PATCH" = "GET", body?: unknown): Promise<any> => {
  const token = safeStorage.getItem("iguard_jwt_token");
  const headers: HeadersInit = { "Content-Type": "application/json" };
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
