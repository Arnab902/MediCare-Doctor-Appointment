import "./Register.css";
import { useState } from "react";
import { handleRegister } from "./Register.js";

function Register() {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="register-page">
      <div className="register-container">
        {/* Left Side */}
        <div className="register-left">
          <div className="register-brand">🩺 MediCare</div>

          <h1>Create your account</h1>

          <p>
            Join MediCare and make managing your healthcare simple and
            convenient.
          </p>

          <div className="register-benefits">
            <div>
              <span>✓</span>
              Book appointments easily
            </div>

            <div>
              <span>✓</span>
              Find trusted doctors
            </div>

            <div>
              <span>✓</span>
              Manage your healthcare
            </div>

            <div>
              <span>✓</span>
              Keep track of your appointments
            </div>
          </div>
        </div>

        {/* Right Side */}
        <div className="register-card">
          <h2>Create Patient Account</h2>

          <p className="register-subtitle">
            Enter your information to get started
          </p>

          {/* Doctor Registration Link */}
          <p className="doctor-register-text">
            Are you a doctor?
            <a href="/doctor-register"> Register as a doctor</a>
          </p>

          <form onSubmit={handleRegister}>
            {/* Full Name */}
            <div className="register-form-group">
              <label>Full Name</label>

              <input
                type="text"
                name="fullName"
                placeholder="Enter your full name"
                required
              />
            </div>

            {/* Email */}
            <div className="register-form-group">
              <label>Email Address</label>

              <input
                type="email"
                name="email"
                placeholder="Enter your email"
                required
              />
            </div>

            {/* Phone */}
            <div className="register-form-group">
              <label>Phone Number</label>

              <input
                type="tel"
                name="phone"
                placeholder="10-digit phone number"
                pattern="[0-9]{10}"
                required
              />
            </div>

            {/* Password */}
            <div className="register-form-group">
              <label>Password</label>

              <input
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder="Create a password"
                required
              />
            </div>

            {/* Confirm Password */}
            <div className="register-form-group">
              <label>Confirm Password</label>

              <input
                type={showPassword ? "text" : "password"}
                name="confirmPassword"
                placeholder="Confirm your password"
                required
              />
            </div>

            {/* Show Password */}
            <label className="show-password-checkbox">
              <input
                type="checkbox"
                checked={showPassword}
                onChange={(event) => setShowPassword(event.target.checked)}
              />

              <span>Show password</span>
            </label>

            {/* Terms */}
            <label className="terms-checkbox">
              <input type="checkbox" name="terms" required />

              <span>I agree to the Terms & Conditions</span>
            </label>

            {/* Register Button */}
            <button type="submit" className="register-submit">
              Create Patient Account
            </button>
          </form>

          {/* Login */}
          <p className="login-text">
            Already have an account?
            <a href="/login"> Login</a>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Register;
