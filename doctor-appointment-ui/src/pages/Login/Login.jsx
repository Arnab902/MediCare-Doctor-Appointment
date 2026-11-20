import { useState } from "react";
import "./Login.css";
import { handleLogin } from "./Login.js";

function Login() {
  const [loginMessage, setLoginMessage] = useState("");

  const isBlocked = loginMessage.toLowerCase().includes("block");

  return (
    <div className="login-page">
      <div className="login-container">
        <div className="login-left">
          <div className="login-brand">🩺 MediCare</div>
          <h1>Welcome back</h1>
          <p>
            Login to manage your appointments and continue your healthcare
            journey.
          </p>

          <div className="login-benefits">
            <div>
              <span>✓</span> Find and book trusted doctors
            </div>
            <div>
              <span>✓</span> Manage your appointments
            </div>
            <div>
              <span>✓</span> Access online consultations
            </div>
          </div>
        </div>

        <div className="login-card">
          <h2>Login to your account</h2>
          <p className="login-subtitle">Enter your details to continue</p>

          <form onSubmit={(event) => handleLogin(event, setLoginMessage)}>
            <div className="form-group">
              <label>Email Address</label>
              <input
                type="email"
                name="email"
                placeholder="Enter your email"
                required
              />
            </div>

            <div className="form-group">
              <label>Password</label>
              <input
                type="password"
                name="password"
                placeholder="Enter your password"
                required
              />
            </div>

            <div className="login-options">
              <label className="remember-me">
                <input type="checkbox" name="rememberMe" value="true" />
                Remember me
              </label>

              <a href="/forgot-password">Forgot password?</a>
            </div>

            <button type="submit" className="login-submit">
              Login
            </button>
          </form>

          <div className="login-divider">
            <span>OR</span>
          </div>

          <button className="google-login">
            <span>G</span>
            Continue with Google
          </button>

          <p className="register-text">
            Don't have an account?
            <a href="/register"> Register</a>
          </p>
        </div>
      </div>

      {loginMessage && (
        <div
          className="login-modal-overlay"
          onClick={() => setLoginMessage("")}
        >
          <div
            className="login-modal"
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="login-modal-title"
            onClick={(event) => event.stopPropagation()}
          >
            <div className={`login-modal-icon ${isBlocked ? "blocked" : ""}`}>
              {isBlocked ? "!" : "×"}
            </div>

            <h2 id="login-modal-title">
              {isBlocked ? "Account Blocked" : "Login Failed"}
            </h2>

            <p>{loginMessage}</p>

            {isBlocked && (
              <div className="login-modal-help">
                Please contact support if you believe this is a mistake.
              </div>
            )}

            <button
              className="login-modal-button"
              onClick={() => setLoginMessage("")}
            >
              OK
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default Login;
