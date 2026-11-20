
const AUTH_SERVICE_URL = "http://localhost:8084";

// Store the ongoing refresh request.
// Multiple calls will share the same Promise.
let refreshPromise = null;

// Clear the current tab's authentication session
function clearAuthSession() {
  sessionStorage.removeItem("accessToken");
  sessionStorage.removeItem("refreshToken");
  sessionStorage.removeItem("role");

  window.dispatchEvent(new Event("authChanged"));
}

// Refresh Access JWT using the HttpOnly cookie
export function refreshAccessToken() {

  // Prevent multiple simultaneous refresh requests
  if (refreshPromise) {
    console.log("Refresh already in progress. Reusing existing request.");
    return refreshPromise;
  }

  refreshPromise = (async () => {
    try {
      const response = await fetch(
        `${AUTH_SERVICE_URL}/auth/refresh`,
        {
          method: "POST",
          credentials: "include",
        }
      );

      if (!response.ok) {
        console.error("Refresh failed:", response.status);
        clearAuthSession();
        return false;
      }

      const data = await response.json();

      if (!data.jwtToken) {
        clearAuthSession();
        return false;
      }

      sessionStorage.setItem("accessToken", data.jwtToken);

      if (data.role) {
        sessionStorage.setItem("role", data.role.toUpperCase());
      }

      window.dispatchEvent(new Event("authChanged"));

      console.log("Access token refreshed successfully.");

      return true;

    } catch (error) {
      console.error("Token refresh failed:", error);
      return false;

    } finally {
      // Allow a new refresh request after completion
      refreshPromise = null;
    }
  })();

  return refreshPromise;
}

// Restore session when the application starts
export async function restoreSession() {
  const accessToken = sessionStorage.getItem("accessToken");

  if (accessToken) {
    return true;
  }

  return await refreshAccessToken();
}

// Common API Fetch Function
export async function apiFetch(url, options = {}) {
  let accessToken = sessionStorage.getItem("accessToken");

  const createHeaders = (token) => {
    const headers = {
      ...(options.headers || {}),
      "Content-Type": "application/json",
    };

    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    return headers;
  };

  let response = await fetch(url, {
    ...options,
    headers: createHeaders(accessToken),
  });

  // Access token expired
  if (response.status === 401 && accessToken) {
    console.log("Access token expired. Trying to refresh...");

    const refreshed = await refreshAccessToken();

    if (!refreshed) {
      console.log("Session expired. Please login again.");

      clearAuthSession();

      window.location.href = "/login";

      return response;
    }

    accessToken = sessionStorage.getItem("accessToken");

    // Retry the original request
    response = await fetch(url, {
      ...options,
      headers: createHeaders(accessToken),
    });
  }

  return response;
}

// Logout current session
export async function logoutUser() {
  try {
    await fetch(
      `${AUTH_SERVICE_URL}/auth/logout`,
      {
        method: "POST",
        credentials: "include",
      }
    );

  } catch (error) {
    console.error("Logout request failed:", error);

  } finally {
    clearAuthSession();
  }
}
  