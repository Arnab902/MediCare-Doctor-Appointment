import "./Navbar.css";
import { useEffect, useState, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { handleLogin, handleRegister, handleLogout } from "./Navbar.js";
import { apiFetch } from "../../services/authService.js";

function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();

  const [fullName, setFullName] = useState(null);
  const [role, setRole] = useState(null);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  // Keep authentication state updated
  const [accessToken, setAccessToken] = useState(() =>
    sessionStorage.getItem("accessToken"),
  );

  const profileMenuRef = useRef(null);

  function getJwtPayload(token) {
    try {
      const payload = token.split(".")[1];

      return JSON.parse(atob(payload.replace(/-/g, "+").replace(/_/g, "/")));
    } catch (error) {
      console.error("Failed to decode access token:", error);
      return null;
    }
  }

  // Listen for login, logout and token refresh events
  useEffect(() => {
    function updateAuthState() {
      setAccessToken(sessionStorage.getItem("accessToken"));
    }

    window.addEventListener("authChanged", updateAuthState);

    return () => {
      window.removeEventListener("authChanged", updateAuthState);
    };
  }, []);

  // Load logged-in user
  useEffect(() => {
    let mounted = true;

    async function fetchMyProfile() {
      if (!accessToken) {
        setFullName(null);
        setRole(null);
        return;
      }

      try {
        const jwtPayload = getJwtPayload(accessToken);

        if (!jwtPayload) {
          setFullName(null);
          setRole(null);
          return;
        }

        const userRole = jwtPayload.role;

        if (mounted) {
          setRole(userRole);
        }

        if (userRole === "PATIENT") {
          const response = await apiFetch("http://localhost:8081/patients/me", {
            method: "GET",
          });

          const data = await response.json();

          if (!response.ok) {
            throw new Error(data.message || "Failed to fetch patient profile");
          }

          if (mounted) {
            setFullName(data.fullName || null);
          }
        } else if (userRole === "DOCTOR") {
          const response = await apiFetch("http://localhost:8082/doctors/me", {
            method: "GET",
          });

          const data = await response.json();

          if (!response.ok) {
            throw new Error(data.message || "Failed to fetch doctor profile");
          }

          if (mounted) {
            setFullName(data.fullName || null);
          }
        } else if (userRole === "ADMIN") {
          if (mounted) {
            setFullName("Admin");
          }
        }
      } catch (error) {
        console.error("Failed to load user profile:", error);

        if (mounted) {
          setFullName(null);
        }
      }
    }

    fetchMyProfile();

    return () => {
      mounted = false;
    };
  }, [accessToken]);

  // Handle admin section navigation after route changes
  useEffect(() => {
    if (location.pathname !== "/admin-dashboard") return;

    const section = location.hash.replace("#", "");

    if (!section) return;

    const scrollToTarget = () => {
      document.getElementById(section)?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    };

    requestAnimationFrame(() => {
      requestAnimationFrame(scrollToTarget);
    });
  }, [location.pathname, location.hash]);

  // Close profile dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (
        profileMenuRef.current &&
        !profileMenuRef.current.contains(event.target)
      ) {
        setShowProfileMenu(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  function handleNavigation(path) {
    setShowProfileMenu(false);
    navigate(path);
  }

  // Admin section navigation
  function handleAdminNavigation(section) {
    setShowProfileMenu(false);
    navigate(`/admin-dashboard#${section}`);
  }

  function handleViewProfile() {
    setShowProfileMenu(false);

    if (role === "DOCTOR") {
      navigate("/doctor-profile");
      return;
    }

    if (role === "ADMIN") {
      handleAdminNavigation("admin-dashboard");
      return;
    }

    navigate("/profile");
  }

  return (
    <nav className={`navbar ${role === "ADMIN" ? "admin-navbar" : ""}`}>
      {/* Logo */}
      <div
        className="navbar-logo"
        onClick={() =>
          role === "ADMIN"
            ? handleAdminNavigation("admin-dashboard")
            : handleNavigation("/")
        }
        role="button"
        tabIndex={0}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ") {
            role === "ADMIN"
              ? handleAdminNavigation("admin-dashboard")
              : handleNavigation("/");
          }
        }}
      >
        <span className="logo-icon">🩺</span>
        <span>MediCare</span>

        {role === "ADMIN" && <span className="admin-logo-label">ADMIN</span>}
      </div>

      {/* Navigation Links */}
      <div className="navbar-links">
        {role === "ADMIN" && (
          <>
            <button
              className="admin-nav-link"
              onClick={() => handleAdminNavigation("admin-dashboard")}
            >
              Dashboard
            </button>

            <button
              className="admin-nav-link"
              onClick={() => handleAdminNavigation("doctor-management")}
            >
              Manage Doctors
            </button>

            <button
              className="admin-nav-link"
              onClick={() => handleAdminNavigation("patient-management")}
            >
              Manage Patients
            </button>

            <button
              className="admin-nav-link"
              onClick={() => handleAdminNavigation("appointment-management")}
            >
              Manage Appointments
            </button>
          </>
        )}

        {/* PATIENT NAVIGATION */}
        {role === "PATIENT" && (
          <>
            <button onClick={() => handleNavigation("/")}>Home</button>

            <button onClick={() => handleNavigation("/doctors")}>
              Find Doctors
            </button>

            <button onClick={() => handleNavigation("/appointments")}>
              My Appointments
            </button>
          </>
        )}

        {/* DOCTOR NAVIGATION */}
        {role === "DOCTOR" && (
          <>
            <button onClick={() => handleNavigation("/")}>Home</button>

            <button onClick={() => handleNavigation("/doctor-dashboard")}>
              Doctor Dashboard
            </button>
          </>
        )}

        {/* GUEST NAVIGATION */}
        {!accessToken && (
          <>
            <button onClick={() => handleNavigation("/")}>Home</button>

            <button onClick={() => handleNavigation("/doctors")}>
              Find Doctors
            </button>
          </>
        )}
      </div>

      {/* Right Side */}
      <div className="navbar-actions">
        {accessToken ? (
          <div className="profile-menu-container" ref={profileMenuRef}>
            <button
              className="navbar-user"
              onClick={() => setShowProfileMenu((current) => !current)}
            >
              {fullName || "User"}
              <span className="profile-arrow">▾</span>
            </button>

            {showProfileMenu && (
              <div className="profile-dropdown">
                <button
                  className="profile-dropdown-item"
                  onClick={handleViewProfile}
                >
                  {role === "DOCTOR"
                    ? "Doctor Profile"
                    : role === "ADMIN"
                      ? "Admin Dashboard"
                      : "View Profile"}
                </button>

                <div className="profile-dropdown-divider" />

                <button
                  className="profile-dropdown-item logout-item"
                  onClick={() => handleLogout(navigate)}
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        ) : (
          <>
            <button className="login-btn" onClick={() => handleLogin(navigate)}>
              Login
            </button>

            <button
              className="register-btn"
              onClick={() => handleRegister(navigate)}
            >
              Register
            </button>
          </>
        )}
      </div>
    </nav>
  );
}

export default Navbar;
