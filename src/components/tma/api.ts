export const API_BASE = "https://api.iguard.one";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const apiCall = async (endpoint: string, method: "GET" | "POST" = "GET", body?: unknown): Promise<any> => {
  const token =
    typeof window !== "undefined" ? localStorage.getItem("iguard_jwt_token") : null;
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
