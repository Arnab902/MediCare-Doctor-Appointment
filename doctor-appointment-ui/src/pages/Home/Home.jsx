import "./Home.css";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  fetchDoctors,
  fetchDoctorDetails,
  searchDoctors,
  getDoctorImageUrl,
} from "./Home.js";

import { apiFetch } from "../../services/authservice.js";

function Home() {
  const navigate = useNavigate();

  const [role, setRole] = useState(null);
  const [doctorName, setDoctorName] = useState("");
  const [doctorProfileStatus, setDoctorProfileStatus] = useState("");

  const [doctors, setDoctors] = useState([]);
  const [allDoctors, setAllDoctors] = useState([]);
  const [doctorDetails, setDoctorDetails] = useState({});

  const [loadingDoctors, setLoadingDoctors] = useState(true);
  const [doctorError, setDoctorError] = useState("");

  const [searchText, setSearchText] = useState("");
  const [location, setLocation] = useState("");

  // Decode JWT payload
  function getJwtPayload(token) {
    try {
      const payload = token.split(".")[1];

      return JSON.parse(atob(payload.replace(/-/g, "+").replace(/_/g, "/")));
    } catch (error) {
      console.error("Failed to decode access token:", error);
      return null;
    }
  }

  // Load logged-in user's role and doctor profile
  useEffect(() => {
    async function loadUser() {
      const accessToken = sessionStorage.getItem("accessToken");

      if (!accessToken) {
        setRole(null);
        return;
      }

      const jwtPayload = getJwtPayload(accessToken);

      if (!jwtPayload) {
        setRole(null);
        return;
      }

      const userRole = jwtPayload.role;

      setRole(userRole);

      if (userRole === "DOCTOR") {
        try {
          const response = await apiFetch("http://localhost:8082/doctors/me", {
            method: "GET",
          });

          if (!response.ok) {
            throw new Error("Failed to fetch doctor profile");
          }

          const data = await response.json();

          setDoctorName(data.fullName || "Doctor");
          setDoctorProfileStatus(data.profileStatus || "PENDING");
        } catch (error) {
          console.error("Failed to load doctor profile:", error);
        }
      }
    }

    loadUser();
  }, []);

  // Load detailed information for doctors displayed to patients
  async function loadDoctorDetails(doctorList) {
    try {
      const details = await Promise.all(
        doctorList.map(async (doctor) => {
          try {
            const details = await fetchDoctorDetails(doctor.id);

            return {
              id: doctor.id,
              details,
            };
          } catch (error) {
            console.error(
              `Failed to load details for doctor ${doctor.id}`,
              error,
            );

            return {
              id: doctor.id,
              details: null,
            };
          }
        }),
      );

      const detailsMap = {};

      details.forEach((item) => {
        detailsMap[item.id] = item.details;
      });

      setDoctorDetails(detailsMap);
    } catch (error) {
      console.error(error);
    }
  }

  // Load public doctor listing only for non-doctor users
  useEffect(() => {
    if (role === "DOCTOR") {
      setLoadingDoctors(false);
      return;
    }

    async function loadDoctors() {
      try {
        setLoadingDoctors(true);
        setDoctorError("");

        const data = await fetchDoctors();

        setAllDoctors(data);
        setDoctors(data.slice(0, 3));

        await loadDoctorDetails(data.slice(0, 3));
      } catch (error) {
        console.error(error);

        setDoctorError(
          error.message || "Unable to load doctors. Please try again later.",
        );
      } finally {
        setLoadingDoctors(false);
      }
    }

    loadDoctors();
  }, [role]);

  // Refresh doctor details when the displayed list changes
  useEffect(() => {
    if (role !== "DOCTOR" && doctors.length > 0) {
      loadDoctorDetails(doctors);
    } else if (role !== "DOCTOR") {
      setDoctorDetails({});
    }
  }, [doctors, role]);

  // Available specialties
  const specialties = [
    ...new Set(
      allDoctors.map((doctor) => doctor.specialization).filter(Boolean),
    ),
  ];

  // Search doctors by name, specialty, or location
  async function handleDoctorSearch(event) {
    event.preventDefault();

    const searchValue = searchText.trim();
    const locationValue = location.trim();

    if (!searchValue && !locationValue) {
      setDoctors(allDoctors.slice(0, 3));
      setDoctorError("");

      document.getElementById("doctors-section")?.scrollIntoView({
        behavior: "smooth",
      });

      return;
    }

    try {
      setLoadingDoctors(true);
      setDoctorError("");

      const data = await searchDoctors(searchValue, locationValue);

      setDoctors(data);

      document.getElementById("doctors-section")?.scrollIntoView({
        behavior: "smooth",
      });
    } catch (error) {
      console.error(error);

      setDoctorError(
        error.message || "Unable to search doctors. Please try again later.",
      );
    } finally {
      setLoadingDoctors(false);
    }
  }

  // Search by specialty
  async function handleSpecialtySearch(specialty) {
    setSearchText(specialty);
    setLocation("");

    try {
      setLoadingDoctors(true);
      setDoctorError("");

      const data = await searchDoctors(specialty, "");

      setDoctors(data);

      document.getElementById("doctors-section")?.scrollIntoView({
        behavior: "smooth",
      });
    } catch (error) {
      console.error(error);

      setDoctorError(
        error.message || "Unable to search doctors. Please try again later.",
      );
    } finally {
      setLoadingDoctors(false);
    }
  }

  // Clear search filters
  function handleClearSearch() {
    setSearchText("");
    setLocation("");
    setDoctorError("");

    setDoctors(allDoctors.slice(0, 3));
  }

  // Open a doctor's public profile
  function handleDoctorProfile(doctorId) {
    navigate(`/doctor-details/${doctorId}`);
  }

  // Scroll to the doctor listing
  function handleFindDoctor() {
    document.getElementById("doctors-section")?.scrollIntoView({
      behavior: "smooth",
    });
  }

  // ============================================================
  // DOCTOR HOME
  // ============================================================

  if (role === "DOCTOR") {
    const profileStatus = doctorProfileStatus || "PENDING";

    const statusDetails = {
      APPROVED: {
        label: "Approved",
        description: "Your profile is approved and available to patients.",
        icon: "✓",
        className: "approved",
      },
      PENDING: {
        label: "Pending approval",
        description: "Your profile is awaiting administrator approval.",
        icon: "◷",
        className: "pending",
      },
      REJECTED: {
        label: "Action required",
        description:
          "Your profile was rejected. Review your details or contact the administrator.",
        icon: "!",
        className: "rejected",
      },
    };

    const status = statusDetails[profileStatus] || statusDetails.PENDING;

    return (
      <div className="home medicare-doctor-home">
        {/* WELCOME BANNER */}
        <section className="doctor-welcome">
          <div className="doctor-welcome-content">
            <span className="doctor-eyebrow">MEDICARE · DOCTOR PORTAL</span>

            <h1>
              Welcome back,
              <br />
              <span>{doctorName || "Doctor"}</span>
            </h1>

            <p>
              Manage your professional profile, review appointments, and keep
              your consultation information up to date.
            </p>

            <div className="doctor-welcome-actions">
              <button
                type="button"
                className="doctor-primary-button"
                onClick={() => navigate("/doctor-dashboard")}
              >
                Open Dashboard <span aria-hidden="true">→</span>
              </button>

              <button
                type="button"
                className="doctor-secondary-button"
                onClick={() => navigate("/doctor-dashboard")}
              >
                View Appointments
              </button>
            </div>
          </div>

          <div className="doctor-welcome-visual" aria-hidden="true">
            <div className="doctor-visual-circle">
              <span className="doctor-visual-icon">+</span>
              <span className="doctor-visual-symbol">✚</span>
            </div>

            <div className="doctor-visual-note">
              <span className="doctor-note-check">✓</span>

              <div>
                <strong>Your practice</strong>
                <small>All in one place</small>
              </div>
            </div>
          </div>
        </section>

        {/* PROFILE STATUS */}
        <section className="doctor-status-section">
          <div className="doctor-section-heading">
            <div>
              <span className="doctor-section-eyebrow">ACCOUNT OVERVIEW</span>

              <h2>Your profile status</h2>

              <p>Check your approval status before managing your practice.</p>
            </div>

            <button
              type="button"
              className="doctor-text-button"
              onClick={() => navigate("/doctor-profile")}
            >
              Manage profile <span aria-hidden="true">→</span>
            </button>
          </div>

          <div className={`doctor-status-card ${status.className}`}>
            <div className="doctor-status-icon">{status.icon}</div>

            <div className="doctor-status-copy">
              <span className="doctor-status-label">DOCTOR PROFILE</span>

              <h3>{status.label}</h3>

              <p>{status.description}</p>
            </div>

            <span className={`doctor-status-badge ${status.className}`}>
              {profileStatus}
            </span>
          </div>
        </section>

        {/* QUICK ACTIONS */}
        <section className="doctor-actions-section">
          <div className="doctor-section-heading">
            <div>
              <span className="doctor-section-eyebrow">YOUR WORKSPACE</span>

              <h2>Manage your practice</h2>

              <p>Choose what you would like to do next.</p>
            </div>
          </div>

          <div className="doctor-action-grid">
            <button
              type="button"
              className="doctor-action-card"
              onClick={() => navigate("/doctor-profile")}
            >
              <span className="doctor-action-icon profile-icon">◉</span>

              <span className="doctor-action-title">My Profile</span>

              <span className="doctor-action-description">
                Update your professional details, qualifications, languages, and
                consultation locations.
              </span>

              <span className="doctor-action-link">
                Manage profile <span aria-hidden="true">→</span>
              </span>
            </button>

            <button
              type="button"
              className="doctor-action-card"
              onClick={() => navigate("/doctor-dashboard")}
            >
              <span className="doctor-action-icon appointments-icon">▦</span>

              <span className="doctor-action-title">Appointments</span>

              <span className="doctor-action-description">
                Review patient bookings and manage appointment requests and
                scheduled consultations.
              </span>

              <span className="doctor-action-link">
                View appointments <span aria-hidden="true">→</span>
              </span>
            </button>

            <button
              type="button"
              className="doctor-action-card"
              onClick={() => navigate("/doctor-dashboard")}
            >
              <span className="doctor-action-icon dashboard-icon">▤</span>

              <span className="doctor-action-title">Doctor Dashboard</span>

              <span className="doctor-action-description">
                Access your doctor workspace and available management features.
              </span>

              <span className="doctor-action-link">
                Open dashboard <span aria-hidden="true">→</span>
              </span>
            </button>
          </div>
        </section>

        {/* BOTTOM INFORMATION */}
        <section className="doctor-home-footer">
          <div className="doctor-footer-icon" aria-hidden="true">
            ✓
          </div>

          <div className="doctor-footer-copy">
            <h3>Keep your professional profile updated</h3>

            <p>
              Accurate information helps patients understand your qualifications
              and available consultation options.
            </p>
          </div>

          <button type="button" onClick={() => navigate("/doctor-profile")}>
            Update profile <span aria-hidden="true">→</span>
          </button>
        </section>
      </div>
    );
  }

  // ============================================================
  // PUBLIC + PATIENT HOME
  // ============================================================

  return (
    <div className="home">
      {/* HERO */}
      <section className="hero">
        <div className="hero-content">
          <p className="hero-subtitle">YOUR HEALTH, OUR PRIORITY</p>

          <h1>
            Find the right doctor.
            <br />
            At the right time.
          </h1>

          <p className="hero-description">
            Connect with trusted healthcare professionals, explore specialties,
            and book appointments with ease.
          </p>

          <form className="search-box" onSubmit={handleDoctorSearch}>
            <input
              type="text"
              placeholder="Doctor or Specialty"
              value={searchText}
              onChange={(event) => setSearchText(event.target.value)}
            />

            <input
              type="text"
              placeholder="Location"
              value={location}
              onChange={(event) => setLocation(event.target.value)}
            />

            <button type="submit">Search</button>
          </form>
        </div>

        <div className="hero-image">
          <div className="doctor-placeholder">👨‍⚕️</div>
        </div>
      </section>

      {/* SPECIALTIES */}
      <section className="specialties">
        <div className="section-heading">
          <p>EXPLORE SPECIALTIES</p>
          <h2>Find doctors by specialty</h2>
        </div>

        <div className="specialty-grid">
          {specialties.slice(0, 8).map((specialty) => (
            <div
              className="specialty-card"
              key={specialty}
              onClick={() => handleSpecialtySearch(specialty)}
            >
              <span>🩺</span>
              <h3>{specialty}</h3>
              <p>Find experienced {specialty} doctors</p>
            </div>
          ))}
        </div>
      </section>

      {/* DOCTORS */}
      <section className="doctors-section" id="doctors-section">
        <div className="section-heading">
          <p>OUR DOCTORS</p>
          <h2>Available doctors</h2>
        </div>

        {(searchText || location) && (
          <div className="search-status">
            <div className="search-status-text">
              <div className="search-status-icon">🔍</div>

              <span>
                Showing results for{" "}
                {searchText && <strong>{searchText}</strong>}
                {searchText && location && " in "}
                {location && <strong>{location}</strong>}
              </span>
            </div>

            <button
              type="button"
              className="clear-search-button"
              onClick={handleClearSearch}
            >
              <span>×</span>
              Clear
            </button>
          </div>
        )}

        {loadingDoctors && (
          <div className="home-doctors-loading">Loading doctors...</div>
        )}

        {!loadingDoctors && doctorError && (
          <div className="home-doctors-error">{doctorError}</div>
        )}

        {!loadingDoctors && !doctorError && doctors.length === 0 && (
          <div className="home-doctors-empty">No doctors found.</div>
        )}

        {!loadingDoctors && !doctorError && doctors.length > 0 && (
          <div className="doctor-grid">
            {doctors.map((doctor) => {
              const details = doctorDetails[doctor.id];

              const activeLocations = (details?.locations || []).filter(
                (item) => item.active,
              );

              return (
                <div
                  className="doctor-card"
                  key={doctor.id}
                  onClick={() => handleDoctorProfile(doctor.id)}
                >
                  <div className="doctor-image">
                    {doctor.profileImage ? (
                      <img
                        src={getDoctorImageUrl(doctor.profileImage)}
                        alt={doctor.fullName}
                      />
                    ) : (
                      <span>👨‍⚕️</span>
                    )}
                  </div>

                  <div className="doctor-info">
                    <h3>{doctor.fullName}</h3>
                    <p>{doctor.specialization}</p>

                    <div className="doctor-experience">
                      {doctor.exp || 0} years experience
                    </div>

                    <div className="doctor-consultations">
                      {activeLocations.length > 0 ? (
                        activeLocations.map((item) => (
                          <div className="consultation-option" key={item.id}>
                            <div className="consultation-type">
                              <span>
                                {item.consultationType === "VIDEO"
                                  ? "📹"
                                  : "🏥"}
                              </span>

                              <strong>
                                {item.consultationType === "VIDEO"
                                  ? "Video Consultation"
                                  : "In-person Consultation"}
                              </strong>
                            </div>

                            <div className="consultation-details">
                              <span>
                                {item.consultationType === "VIDEO"
                                  ? "Online Consultation"
                                  : item.locationName}
                              </span>

                              <strong>₹{item.consultationFee}</strong>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="consultation-unavailable">
                          Consultation details not available
                        </div>
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={(event) => {
                        event.stopPropagation();
                        handleDoctorProfile(doctor.id);
                      }}
                    >
                      View Profile
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* WHY MEDICARE */}
      <section className="why-us">
        <div className="why-content">
          <p className="section-label">WHY MEDICARE</p>

          <h2>Healthcare made simple and accessible.</h2>

          <p>
            MediCare helps patients find trusted healthcare professionals and
            manage their appointments through one simple platform.
          </p>
        </div>

        <div className="why-features">
          <div className="feature">
            <span>✓</span>

            <div>
              <h3>Verified Doctors</h3>
              <p>
                Connect with healthcare professionals whose profiles have been
                reviewed.
              </p>
            </div>
          </div>

          <div className="feature">
            <span>📅</span>

            <div>
              <h3>Easy Appointment Booking</h3>
              <p>Find a suitable doctor and manage your appointment easily.</p>
            </div>
          </div>

          <div className="feature">
            <span>🔒</span>

            <div>
              <h3>Secure Platform</h3>
              <p>
                Your account and healthcare-related information are protected.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="how-it-works">
        <div className="section-heading">
          <p>HOW IT WORKS</p>
          <h2>Get started in three simple steps</h2>
        </div>

        <div className="steps">
          <div className="step">
            <div className="step-number">01</div>
            <h3>Find a Doctor</h3>
            <p>
              Search doctors by specialty or location and explore their
              profiles.
            </p>
          </div>

          <div className="step">
            <div className="step-number">02</div>
            <h3>Choose Your Appointment</h3>
            <p>
              Select an available consultation option and suitable appointment
              time.
            </p>
          </div>

          <div className="step">
            <div className="step-number">03</div>
            <h3>Meet Your Doctor</h3>
            <p>
              Attend your appointment either in person or through video
              consultation.
            </p>
          </div>
        </div>
      </section>

      {/* CALL TO ACTION */}
      <section className="home-cta">
        <div>
          <h2>Take care of your health today.</h2>
          <p>Find a doctor and book your appointment.</p>
        </div>

        <button type="button" onClick={handleFindDoctor}>
          Find a Doctor
        </button>
      </section>
    </div>
  );
}

export default Home;
