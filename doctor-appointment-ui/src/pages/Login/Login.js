
export async function handleLogin(event, setLoginMessage) {
  event.preventDefault();
  setLoginMessage("");

  const formData = new FormData(event.target);

  const email = formData.get("email");
  const password = formData.get("password");
  const rememberMe = formData.get("rememberMe") === "true";

  try {
    const response = await fetch(
      "http://localhost:8084/auth/login",
      {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          password,
          rememberMe,
        }),
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));

      const backendMessage =
        errorData.message || errorData.detail || "";

      if (
        response.status === 403 ||
        backendMessage.toLowerCase().includes("block")
      ) {
        setLoginMessage(
          backendMessage ||
          "Your account has been blocked. Please contact support."
        );
      } else {
        setLoginMessage(
          "Invalid email or password. Please try again."
        );
      }

      return;
    }

    const data = await response.json();

    if (!data.jwtToken || !data.role) {
      setLoginMessage("Login failed. Invalid server response.");
      return;
    }

    const role = data.role.toUpperCase();

    if (!["ADMIN", "DOCTOR", "PATIENT"].includes(role)) {
      setLoginMessage("Login failed. Invalid user role.");
      return;
    }

    // Store only access token and role.
    // Refresh token is stored in an HttpOnly cookie.
    sessionStorage.setItem("accessToken", data.jwtToken);
    sessionStorage.setItem("role", role);

    window.dispatchEvent(new Event("authChanged"));

    const params = new URLSearchParams(window.location.search);
    const redirectPath = params.get("redirect");

    if (
      redirectPath &&
      redirectPath.startsWith("/") &&
      !redirectPath.startsWith("//")
    ) {
      window.location.href = redirectPath;
      return;
    }

    switch (role) {
      case "ADMIN":
        window.location.href = "/admin-dashboard";
        break;

      case "DOCTOR":
        window.location.href = "/doctor-dashboard";
        break;

      case "PATIENT":
        window.location.href = "/";
        break;

      default:
        window.location.href = "/login";
    }

  } catch (error) {
    console.error("Login error:", error);

    setLoginMessage(
      "Unable to connect to the server. Please try again later."
    );
  }
}
