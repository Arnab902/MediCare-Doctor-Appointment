
import { logoutUser } from "../../services/authService.js";

export function handleLogin(navigate) {
  navigate("/login");
}

export function handleRegister(navigate) {
  navigate("/register");
}

export async function handleLogout(navigate) {
  try {
    await logoutUser();

    // Return to Home after clearing this tab's session.
    window.location.replace("/");
  } catch (error) {
    console.error("Logout error:", error);
    alert("Unable to logout. Please try again.");
  }
}
