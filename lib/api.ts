export const API_URL = process.env.NEXT_PUBLIC_API_URL || "/api";

export const fetchAPI = async (endpoint: string, options: RequestInit = {}) => {
  const token = localStorage.getItem("token");
  
  const headers = new Headers(options.headers);
  
  if (!headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    let message = "";
    try {
      const data = await response.json();
      message =
        data.detail ||
        data.message ||
        data.error ||
        (Array.isArray(data.errors) && data.errors[0]?.message) ||
        (Array.isArray(data) && data[0]?.message) ||
        "";
    } catch {
      const text = await response.text().catch(() => "");
      message = text || "";
    }
    const prefix = `${response.status} ${response.statusText}`;
    throw new Error(message ? `${prefix}: ${message}` : `${prefix}`);
  }

  return response.json();
};

