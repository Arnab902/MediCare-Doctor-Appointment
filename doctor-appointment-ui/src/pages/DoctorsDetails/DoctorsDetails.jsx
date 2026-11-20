import "./DoctorsDetails.css";

import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import {
  fetchDoctorById,
  handleBookAppointment,
  handleBackToDoctors,
} from "./DoctorsDetails.js";

function DoctorsDetails() {
  const navigate = useNavigate();
  const { id } = useParams();

  const [doctor, setDoctor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadDoctor();
  }, [id]);

  async function loadDoctor() {
    try {
      setLoading(true);
      setError("");

      const data = await fetchDoctorById(id);

      setDoctor(data);
    } catch (error) {
      console.error(error);

      setError(
        error.message ||
          "Unable to load doctor details. Please try again later.",
      );
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="doctor-details-page">
        <div className="doctor-details-top">
          <button
            className="back-doctors-btn"
            onClick={() => handleBackToDoctors(navigate)}
          >
            ← Back to Doctors
          </button>
        </div>

        <div className="doctor-details-loading">Loading doctor details...</div>
      </div>
    );
  }

  if (error || !doctor) {
    return (
      <div className="doctor-details-page">
        <div className="doctor-details-top">
          <button
            className="back-doctors-btn"
            onClick={() => handleBackToDoctors(navigate)}
          >
            ← Back to Doctors
          </button>
        </div>

        <div className="doctor-details-error">
          {error || "Doctor not found."}
        </div>
      </div>
    );
  }

  const activeLocations = (doctor.locations || []).filter(
    (location) => location.active,
  );

  const formatTime = (time) => {
    if (!time) {
      return "";
    }

    const [hours, minutes] = time.split(":");

    const date = new Date();
    date.setHours(Number(hours), Number(minutes), 0, 0);

    return date.toLocaleTimeString("en-IN", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  const getDayName = (date) => {
    return date.toLocaleDateString("en-IN", {
      weekday: "long",
    });
  };

  const formatDate = (date) => {
    return date.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
    });
  };

  const formatDateWithYear = (date) => {
    return date.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const getDayOfWeek = (date) => {
    const days = [
      "SUNDAY",
      "MONDAY",
      "TUESDAY",
      "WEDNESDAY",
      "THURSDAY",
      "FRIDAY",
      "SATURDAY",
    ];

    return days[date.getDay()];
  };

  const getNextSevenDays = () => {
    const days = [];
    const today = new Date();

    today.setHours(0, 0, 0, 0);

    for (let i = 0; i < 7; i++) {
      const date = new Date(today);

      date.setDate(today.getDate() + i);

      days.push(date);
    }

    return days;
  };

  const getSchedulesForDate = (location, date) => {
    const dayOfWeek = getDayOfWeek(date);

    return (location.schedules || []).filter(
      (schedule) => schedule.dayOfWeek === dayOfWeek,
    );
  };

  const nextSevenDays = getNextSevenDays();

  return (
    <div className="doctor-details-page">
      {/* =========================
          BACK
      ========================= */}

      <div className="doctor-details-top">
        <button
          className="back-doctors-btn"
          onClick={() => handleBackToDoctors(navigate)}
        >
          ← Back to Doctors
        </button>
      </div>

      {/* =========================
          DOCTOR PROFILE
      ========================= */}

      <section className="doctor-details-main">
        <div className="doctor-details-image">
          {doctor.profileImage ? (
            <img src={doctor.profileImage} alt={doctor.fullName} />
          ) : (
            <span>👨‍⚕️</span>
          )}
        </div>

        <div className="doctor-details-info">
          <div className="doctor-title-row">
            <div>
              <div className="doctor-name-line">
                <h1>{doctor.fullName}</h1>

                <span className="doctor-verified">✓ Verified</span>
              </div>

              <p className="doctor-details-specialty">
                {doctor.specialization}
              </p>
            </div>
          </div>

          <div className="doctor-details-meta">
            <div className="doctor-meta-item">
              <span>💼</span>

              <div>
                <small>Experience</small>
                <strong>{doctor.exp || 0} Years</strong>
              </div>
            </div>

            <div className="doctor-meta-item">
              <span>🗣️</span>

              <div>
                <small>Languages</small>
                <strong>{doctor.language || "Not available"}</strong>
              </div>
            </div>

            <div className="doctor-meta-item">
              <span>📞</span>

              <div>
                <small>Phone</small>
                <strong>{doctor.phoneNumber || "Not available"}</strong>
              </div>
            </div>
          </div>

          <div className="doctor-qualification">
            <h3>Qualifications</h3>

            <p>{doctor.qualification || "Not available"}</p>
          </div>

          {activeLocations.length > 0 && (
            <div className="doctor-consultation">
              <div>
                <span>Consultation Options</span>

                <strong>{activeLocations.length} Available</strong>
              </div>

              <button
                onClick={() => handleBookAppointment(navigate, doctor.id)}
                disabled={!doctor.availability}
              >
                {doctor.availability
                  ? "Book Appointment"
                  : "Doctor Not Available"}
              </button>
            </div>
          )}
        </div>
      </section>

      {/* =========================
          CONSULTATION LOCATIONS
      ========================= */}

      {activeLocations.length > 0 && (
        <section className="doctor-details-section">
          <div className="doctor-about">
            <div className="section-title-row">
              <div>
                <p className="section-label-details">WHERE TO CONSULT</p>

                <h2>Consultation Options</h2>
              </div>

              <span className="location-count">
                {activeLocations.length} options
              </span>
            </div>

            <div className="consultation-location-list">
              {activeLocations.map((location) => (
                <div key={location.id} className="consultation-location-card">
                  {/* Location Header */}

                  <div className="location-card-header">
                    <div className="location-type">
                      <div className="location-icon">
                        {location.consultationType === "VIDEO" ? "📹" : "🏥"}
                      </div>

                      <div>
                        <span className="location-type-label">
                          {location.consultationType === "VIDEO"
                            ? "Video Consultation"
                            : "In-person Consultation"}
                        </span>

                        <h3>
                          {location.consultationType === "VIDEO"
                            ? "Online Consultation"
                            : location.locationName}
                        </h3>
                      </div>
                    </div>

                    <div className="location-fee">
                      <small>Consultation Fee</small>

                      <strong>₹{location.consultationFee}</strong>
                    </div>
                  </div>

                  {/* Address */}

                  {location.consultationType === "IN_PERSON" &&
                    location.address && (
                      <div className="location-address">
                        <span>📍</span>

                        <div>
                          <strong>Clinic Address</strong>

                          <p>
                            {location.address.addressLine},{" "}
                            {location.address.city}, {location.address.state},{" "}
                            {location.address.country} -{" "}
                            {location.address.pinCode}
                          </p>
                        </div>
                      </div>
                    )}

                  {/* Online Information */}

                  {location.consultationType === "VIDEO" && (
                    <div className="location-online">
                      <span>💻</span>

                      <div>
                        <strong>Online Consultation</strong>

                        <p>
                          Consult with the doctor securely through video
                          consultation.
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Next 7 Days Availability */}

                  <div className="location-schedule">
                    <div className="schedule-heading">
                      <span>🗓️</span>

                      <strong>Next 7 Days Availability</strong>
                    </div>

                    {location.schedules && location.schedules.length > 0 ? (
                      <div className="weekly-availability-list">
                        {nextSevenDays.map((date) => {
                          const schedulesForDate = getSchedulesForDate(
                            location,
                            date,
                          );

                          const hasSchedule = schedulesForDate.length > 0;

                          return (
                            <div
                              key={date.toISOString()}
                              className={`weekly-availability-row ${
                                hasSchedule
                                  ? "available-day"
                                  : "unavailable-day"
                              }`}
                            >
                              <div className="availability-date">
                                <strong>{getDayName(date)}</strong>

                                <span>{formatDate(date)}</span>
                              </div>

                              <div className="availability-slots">
                                {hasSchedule ? (
                                  schedulesForDate.map((schedule) => (
                                    <span
                                      key={schedule.id}
                                      className="availability-time-slot"
                                    >
                                      🕐 {formatTime(schedule.startTime)} -{" "}
                                      {formatTime(schedule.endTime)}
                                    </span>
                                  ))
                                ) : (
                                  <span className="availability-not-available">
                                    Not available
                                  </span>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <p className="no-schedule">Schedule not available yet.</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* =========================
              AVAILABILITY
          ========================= */}

          <div className="doctor-availability">
            <p className="section-label-details">DOCTOR INFORMATION</p>

            <h2>Availability</h2>

            <div className="availability-status">
              <span
                className={
                  doctor.availability
                    ? "status-dot active"
                    : "status-dot inactive"
                }
              />

              <strong>
                {doctor.availability
                  ? "Currently Available"
                  : "Currently Not Available"}
              </strong>
            </div>

            <div className="availability-list">
              <div className="availability-item">
                <span>Languages</span>
                <strong>{doctor.language || "Not available"}</strong>
              </div>

              <div className="availability-item">
                <span>Phone</span>
                <strong>{doctor.phoneNumber || "Not available"}</strong>
              </div>

              <div className="availability-item">
                <span>Experience</span>
                <strong>{doctor.exp || 0} Years</strong>
              </div>

              <div className="availability-item">
                <span>Specialization</span>
                <strong>{doctor.specialization || "Not available"}</strong>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* =========================
          SERVICES
      ========================= */}

      {activeLocations.length > 0 && (
        <section className="doctor-services">
          <div className="section-heading-details">
            <p>CONSULTATION OPTIONS</p>

            <h2>Services provided</h2>
          </div>

          <div className="services-grid">
            {activeLocations.map((location) => (
              <div className="service-card" key={location.id}>
                <div className="service-icon">
                  {location.consultationType === "VIDEO" ? "📹" : "🏥"}
                </div>

                <h3>
                  {location.consultationType === "VIDEO"
                    ? "Video Consultation"
                    : "In-person Consultation"}
                </h3>

                <p>
                  {location.consultationType === "VIDEO"
                    ? "Consult with the doctor online through secure video consultation."
                    : `Visit ${location.locationName} for an in-person medical consultation.`}
                </p>

                <div className="service-footer">
                  <span>Consultation Fee</span>

                  <strong>₹{location.consultationFee}</strong>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* =========================
          BOTTOM CTA
      ========================= */}

      <section className="doctor-details-cta">
        <div>
          <span className="cta-label">BOOK YOUR CONSULTATION</span>

          <h2>Ready to consult {doctor.fullName}?</h2>

          <p>Choose a convenient date and time for your appointment.</p>
        </div>

        <button
          onClick={() => handleBookAppointment(navigate, doctor.id)}
          disabled={!doctor.availability}
        >
          {doctor.availability ? "Book Appointment" : "Doctor Not Available"}
        </button>
      </section>
    </div>
  );
}

export default DoctorsDetails;
