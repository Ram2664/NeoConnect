const STORAGE_KEY = "neo-connect-auth";

export function saveAuthData(data) {
  if (typeof window === "undefined") {
    return;
  }

  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

export function getAuthData() {
  if (typeof window === "undefined") {
    return null;
  }

  const savedValue = localStorage.getItem(STORAGE_KEY);

  if (!savedValue) {
    return null;
  }

  try {
    return JSON.parse(savedValue);
  } catch (error) {
    return null;
  }
}

export function getToken() {
  const authData = getAuthData();
  return authData?.token || "";
}

export function clearAuthData() {
  if (typeof window === "undefined") {
    return;
  }

  localStorage.removeItem(STORAGE_KEY);
}
