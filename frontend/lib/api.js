import { getToken } from "@/lib/auth";

export const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

async function request(path, options = {}, includeAuth = true) {
  const headers = new Headers(options.headers || {});
  const token = includeAuth ? getToken() : "";
  const isFormData = typeof FormData !== "undefined" && options.body instanceof FormData;

  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  if (!isFormData && options.body) {
    headers.set("Content-Type", "application/json");
  }

  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers,
    cache: "no-store"
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.message || "Something went wrong.");
  }

  return data;
}

export function apiRequest(path, options = {}) {
  return request(path, options, true);
}

export function publicRequest(path, options = {}) {
  return request(path, options, false);
}
