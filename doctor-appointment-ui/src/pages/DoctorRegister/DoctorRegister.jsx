import "./DoctorRegister.css";
import { useState } from "react";
import { handleDoctorRegister } from "./DoctorRegister.js";

function DoctorRegister() {
  const [showPassword, setShowPassword] = useState(false);

  const [consultationType, setConsultationType] = useState("IN_PERSON");

  const consultationOptions = {
    inPerson: consultationType === "IN_PERSON" || consultationType === "BOTH",
    video: consultationType === "VIDEO" || consultationType === "BOTH",
  };

  return (
    <div className="doctor-register-page">
      <div className="doctor-register-container">
        {/* Left Side */}
        <div className="doctor-register-left">
          <div className="doctor-register-brand">🩺 MediCare</div>

          <h1>Join MediCare as a Doctor</h1>

          <p>
            Create your professional profile and connect with patients through
            MediCare.
          </p>

          <div className="doctor-register-benefits">
            <div>
              <span>✓</span>
              Create your professional profile
            </div>

            <div>
              <span>✓</span>
              Manage your availability
            </div>

            <div>
              <span>✓</span>
              Manage patient appointments
            </div>

            <div>
              <span>✓</span>
              Get approved by MediCare Admin
            </div>
          </div>
        </div>

        {/* Right Side */}
        <div className="doctor-register-card">
          <h2>Create Doctor Account</h2>

          <p className="doctor-register-subtitle">
            Enter your professional information
          </p>

          <form
            onSubmit={(event) =>
              handleDoctorRegister(event, consultationOptions)
            }
          >
            {/* Basic Information */}

            <div className="doctor-form-group">
              <label>Full Name</label>

              <input
                type="text"
                name="fullName"
                placeholder="Dr. John Doe"
                required
              />
            </div>

            <div className="doctor-form-group">
              <label>Email Address</label>

              <input
                type="email"
                name="email"
                placeholder="doctor@example.com"
                required
              />
            </div>

            <div className="doctor-form-group">
              <label>Phone Number</label>

              <input
                type="tel"
                name="phoneNumber"
                placeholder="10-digit phone number"
                pattern="[0-9]{10}"
                required
              />
            </div>

            <div className="doctor-form-group">
              <label>Specialization</label>

              <input
                type="text"
                name="specialization"
                placeholder="e.g. Cardiologist"
                required
              />
            </div>

            <div className="doctor-form-group">
              <label>Qualification</label>

              <input
                type="text"
                name="qualification"
                placeholder="e.g. MBBS, MD"
                required
              />
            </div>

            <div className="doctor-form-group">
              <label>Experience (Years)</label>

              <input
                type="number"
                name="exp"
                placeholder="e.g. 5"
                min="0"
                required
              />
            </div>

            <div className="doctor-form-group">
              <label>Languages</label>

              <input
                type="text"
                name="language"
                placeholder="English, Bengali, Hindi"
                required
              />
            </div>

            {/* Consultation Type */}

            <div className="doctor-form-group">
              <label htmlFor="consultationType">Consultation Type</label>

              <select
                id="consultationType"
                value={consultationType}
                onChange={(event) => setConsultationType(event.target.value)}
                className="consultation-select"
              >
                <option value="IN_PERSON">In-Person Consultation</option>

                <option value="VIDEO">Video Consultation</option>

                <option value="BOTH">In-Person + Video Consultation</option>
              </select>
            </div>

            {/* In-Person Details */}

            {consultationOptions.inPerson && (
              <div className="consultation-section">
                <h3>In-Person Consultation</h3>

                <div className="doctor-form-group">
                  <label>Consultation Fee</label>

                  <input
                    type="number"
                    name="inPersonFee"
                    placeholder="e.g. 800"
                    min="0"
                    required
                  />
                </div>

                <div className="doctor-form-group">
                  <label>Clinic / Location Name</label>

                  <input
                    type="text"
                    name="locationName"
                    placeholder="e.g. MediCare Clinic"
                    required
                  />
                </div>

                <div className="doctor-form-group">
                  <label>Address</label>

                  <input
                    type="text"
                    name="addressLine"
                    placeholder="Street / Area"
                    required
                  />
                </div>

                <div className="doctor-form-group">
                  <label>City</label>

                  <input
                    type="text"
                    name="city"
                    placeholder="Kolkata"
                    required
                  />
                </div>

                <div className="doctor-form-group">
                  <label>State</label>

                  <input
                    type="text"
                    name="state"
                    placeholder="West Bengal"
                    required
                  />
                </div>

                <div className="doctor-form-group">
                  <label>Country</label>

                  <input
                    type="text"
                    name="country"
                    placeholder="India"
                    defaultValue="India"
                    required
                  />
                </div>

                <div className="doctor-form-group">
                  <label>PIN Code</label>

                  <input
                    type="text"
                    name="pinCode"
                    placeholder="700001"
                    required
                  />
                </div>
              </div>
            )}

            {/* Video Details */}

            {consultationOptions.video && (
              <div className="consultation-section">
                <h3>Video Consultation</h3>

                <div className="doctor-form-group">
                  <label>Video Consultation Fee</label>

                  <input
                    type="number"
                    name="videoFee"
                    placeholder="e.g. 500"
                    min="0"
                    required
                  />
                </div>
              </div>
            )}

            {/* Password */}

            <div className="doctor-form-group">
              <label>Password</label>

              <input
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder="Create a password"
                required
              />
            </div>

            <div className="doctor-form-group">
              <label>Confirm Password</label>

              <input
                type={showPassword ? "text" : "password"}
                name="confirmPassword"
                placeholder="Confirm your password"
                required
              />
            </div>

            {/* Show Password */}

            <label className="doctor-show-password-checkbox">
              <input
                type="checkbox"
                checked={showPassword}
                onChange={(event) => setShowPassword(event.target.checked)}
              />

              <span>Show password</span>
            </label>

            {/* Terms */}

            <label className="doctor-terms-checkbox">
              <input type="checkbox" name="terms" required />

              <span>I agree to the Terms & Conditions</span>
            </label>

            {/* Submit */}

            <button type="submit" className="doctor-register-submit">
              Create Doctor Account
            </button>
          </form>

          {/* Login */}

          <p className="doctor-login-text">
            Already have an account?
            <a href="/login"> Login</a>
          </p>

          {/* Patient Registration */}

          <p className="patient-register-text">
            Are you a patient?
            <a href="/register"> Register here</a>
          </p>
        </div>
      </div>
    </div>
  );
}

export default DoctorRegister;
