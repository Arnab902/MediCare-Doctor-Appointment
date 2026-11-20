import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./DoctorDashboard.css";

import {
  fetchDoctorAppointments,
  fetchDoctorProfile,
  handleViewAppointment,
  handleCompleteAppointment,
  handleAcceptReschedule,
  handleRejectReschedule,
} from "./DoctorDashboard.js";

function DoctorDashboard() {
  const navigate = useNavigate();

  const [appointments, setAppointments] = useState([]);
  const [doctorProfile, setDoctorProfile] = useState(null);

  const [loadingAppointments, setLoadingAppointments] = useState(true);
  const [appointmentError, setAppointmentError] = useState("");
  const [accountBlocked, setAccountBlocked] = useState(false);

  const [completingAppointmentId, setCompletingAppointmentId] = useState(null);
  const [rescheduleActionId, setRescheduleActionId] = useState(null);
  const [actionError, setActionError] = useState("");
  const [actionSuccess, setActionSuccess] = useState("");

  const [currentTime, setCurrentTime] = useState(() => new Date());

  // Detect the blocked-account response from the backend.
  function isBlockedError(error) {
    return error?.message?.toLowerCase().includes("account has been blocked");
  }

  useEffect(() => {
    loadAppointments();
  }, []);

  // Load the logged-in doctor's profile.
  useEffect(() => {
    async function loadDoctorProfile() {
      try {
        const data = await fetchDoctorProfile();
        setDoctorProfile(data?.doctor || data?.data || data);
      } catch (error) {
        console.error("Error loading doctor profile:", error);

        if (isBlockedError(error)) {
          setAccountBlocked(true);
        }
      }
    }

    loadDoctorProfile();
  }, []);

  useEffect(() => {
    const intervalId = setInterval(() => {
      setCurrentTime(new Date());
    }, 15000);

    return () => clearInterval(intervalId);
  }, []);

  async function loadAppointments() {
    try {
      setLoadingAppointments(true);
      setAppointmentError("");

      const data = await fetchDoctorAppointments();
      setAppointments(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error loading appointments:", error);

      if (isBlockedError(error)) {
        setAccountBlocked(true);
        setAppointments([]);
        setAppointmentError("");
      } else {
        setAppointmentError(
          error.message || "Unable to load appointments. Please try again.",
        );
      }
    } finally {
      setLoadingAppointments(false);
    }
  }

  // Appointment dates and times from the backend use Indian local time.
  function getAppointmentDateTime(appointment) {
    if (!appointment?.appointmentDate || !appointment?.appointmentTime) {
      return null;
    }

    const date = String(appointment.appointmentDate).split("T")[0];
    const time = String(appointment.appointmentTime);

    const parsed = new Date(`${date}T${time}+05:30`);

    return Number.isNaN(parsed.getTime()) ? null : parsed;
  }

  function isAppointmentTimeReached(appointment) {
    const scheduledTime = getAppointmentDateTime(appointment);

    return scheduledTime !== null && currentTime >= scheduledTime;
  }

  async function completeAppointment(appointment) {
    if (
      completingAppointmentId !== null ||
      appointment.status !== "BOOKED" ||
      !isAppointmentTimeReached(appointment)
    ) {
      return;
    }

    try {
      setCompletingAppointmentId(appointment.id);
      setActionError("");
      setActionSuccess("");

      await handleCompleteAppointment(appointment);

      setAppointments((currentAppointments) =>
        currentAppointments.map((item) =>
          item.id === appointment.id ? { ...item, status: "COMPLETED" } : item,
        ),
      );

      setActionSuccess(
        `Appointment #${appointment.id} completed successfully.`,
      );
    } catch (error) {
      console.error("Error completing appointment:", error);

      if (isBlockedError(error)) {
        setAccountBlocked(true);
      } else {
        setActionError(
          error.message ||
            "Unable to complete the appointment. Please try again.",
        );
      }
    } finally {
      setCompletingAppointmentId(null);
    }
  }

  // Accept a patient's reschedule request.
  async function acceptReschedule(appointment) {
    if (rescheduleActionId !== null) return;

    try {
      setRescheduleActionId(appointment.id);
      setActionError("");
      setActionSuccess("");

      await handleAcceptReschedule(appointment);

      await loadAppointments();

      setActionSuccess(
        `Reschedule request for appointment #${appointment.id} accepted successfully.`,
      );
    } catch (error) {
      console.error("Error accepting reschedule:", error);

      if (isBlockedError(error)) {
        setAccountBlocked(true);
      } else {
        setActionError(
          error.message || "Unable to accept the reschedule request.",
        );
      }
    } finally {
      setRescheduleActionId(null);
    }
  }

  // Reject a patient's reschedule request.
  async function rejectReschedule(appointment) {
    if (rescheduleActionId !== null) return;

    try {
      setRescheduleActionId(appointment.id);
      setActionError("");
      setActionSuccess("");

      await handleRejectReschedule(appointment);

      await loadAppointments();

      setActionSuccess(
        `Reschedule request for appointment #${appointment.id} rejected.`,
      );
    } catch (error) {
      console.error("Error rejecting reschedule:", error);

      if (isBlockedError(error)) {
        setAccountBlocked(true);
      } else {
        setActionError(
          error.message || "Unable to reject the reschedule request.",
        );
      }
    } finally {
      setRescheduleActionId(null);
    }
  }

  function formatTime(time) {
    if (!time) return "Time not specified";

    const [hours, minutes] = String(time).split(":");
    const date = new Date();

    date.setHours(Number(hours), Number(minutes), 0, 0);

    return date.toLocaleTimeString("en-IN", {
      hour: "numeric",
      minute: "2-digit",
    });
  }

  function formatDate(dateValue) {
    if (!dateValue) return "Date not specified";

    const date = new Date(`${String(dateValue).split("T")[0]}T00:00:00`);

    if (Number.isNaN(date.getTime())) return String(dateValue);

    return date.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  }

  function formatConsultationType(type) {
    if (type === "VIDEO") return "Video consultation";
    if (type === "IN_PERSON") return "In-person consultation";

    return type || "Consultation";
  }

  function formatStatus(status) {
    if (!status) return "Unknown";

    return status
      .toLowerCase()
      .replace(/_/g, " ")
      .replace(/\b\w/g, (letter) => letter.toUpperCase());
  }

  function getStatusClass(status) {
    return `appointment-status ${String(status || "unknown")
      .toLowerCase()
      .replace(/_/g, "-")}`;
  }

  const stats = useMemo(() => {
    const booked = appointments.filter(
      (appointment) => appointment.status === "BOOKED",
    ).length;

    const completed = appointments.filter(
      (appointment) => appointment.status === "COMPLETED",
    ).length;

    const cancelled = appointments.filter(
      (appointment) => appointment.status === "CANCELLED",
    ).length;

    const upcoming = appointments.filter((appointment) => {
      if (appointment.status !== "BOOKED") return false;

      const scheduledTime = getAppointmentDateTime(appointment);

      return scheduledTime !== null && scheduledTime >= currentTime;
    }).length;

    return {
      total: appointments.length,
      booked,
      completed,
      upcoming,
      cancelled,
    };
  }, [appointments, currentTime]);

  function scrollToAppointments() {
    document.getElementById("doctor-appointments")?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  }

  const doctorName =
    doctorProfile?.fullName ||
    doctorProfile?.name ||
    doctorProfile?.doctorName ||
    "Doctor";

  // Show a dedicated screen when the account is blocked.
  if (accountBlocked) {
    return (
      <main
        style={{
          minHeight: "70vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "40px 20px",
          background: "#f7f9fc",
        }}
      >
        <section
          role="alert"
          style={{
            width: "100%",
            maxWidth: "520px",
            padding: "40px 30px",
            background: "#ffffff",
            borderRadius: "16px",
            textAlign: "center",
            boxShadow: "0 8px 30px rgba(0,0,0,0.08)",
            border: "1px solid #f2d5d5",
          }}
        >
          <div
            style={{
              width: "70px",
              height: "70px",
              margin: "0 auto 20px",
              borderRadius: "50%",
              background: "#fff0f0",
              color: "#d93636",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "34px",
              fontWeight: "700",
            }}
          >
            !
          </div>

          <h2
            style={{
              color: "#c62828",
              fontSize: "26px",
              marginBottom: "14px",
            }}
          >
            Account Blocked
          </h2>

          <p
            style={{
              color: "#555",
              fontSize: "15px",
              lineHeight: "1.7",
              marginBottom: "12px",
            }}
          >
            Your account has been blocked by the administrator.
          </p>

          <p
            style={{
              color: "#777",
              fontSize: "14px",
              lineHeight: "1.7",
              marginBottom: "24px",
            }}
          >
            You cannot access your appointments or manage your consultation
            availability. Please contact the administrator for assistance.
          </p>

          <button
            type="button"
            onClick={() => navigate("/")}
            style={{
              padding: "11px 25px",
              border: "none",
              borderRadius: "8px",
              background: "#167d8d",
              color: "#fff",
              fontSize: "14px",
              fontWeight: "600",
              cursor: "pointer",
            }}
          >
            Go to Home
          </button>
        </section>
      </main>
    );
  }

  return (
    <main className="doctor-dashboard">
      <div className="dashboard-container">
        {/* Welcome section */}
        <section className="dashboard-welcome">
          <div className="welcome-content">
            <span className="welcome-eyebrow">
              <span className="welcome-dot" />
              MEDICARE PROFESSIONAL PORTAL
            </span>

            <h1>
              Welcome back,
              <br />
              <span>{doctorName}</span>
            </h1>

            <p>
              Manage your appointments and consultation availability —
              everything you need to organize your day in one place.
            </p>

            <button
              type="button"
              className="welcome-primary-btn"
              onClick={scrollToAppointments}
            >
              View appointments
              <span aria-hidden="true">→</span>
            </button>
          </div>

          <div className="welcome-illustration" aria-hidden="true">
            <div className="illustration-circle illustration-circle-one" />
            <div className="illustration-circle illustration-circle-two" />

            <div className="doctor-illustration-card">
              <div className="doctor-illustration-icon">✚</div>
              <div className="illustration-heart">♡</div>
              <div className="illustration-line illustration-line-one" />
              <div className="illustration-line illustration-line-two" />
              <div className="illustration-line illustration-line-three" />
              <div className="illustration-status">
                <span />
                Your practice, connected
              </div>
            </div>
          </div>
        </section>

        {/* Appointment statistics */}
        <section className="dashboard-stats" aria-label="Appointment summary">
          <article className="stat-card stat-total">
            <div className="stat-card-top">
              <div className="stat-icon">▤</div>
              <span className="stat-label">ALL RECORDS</span>
            </div>
            <p className="stat-title">Total appointments</p>
            <h2>{loadingAppointments ? "—" : stats.total}</h2>
            <p className="stat-caption">Appointments in your list</p>
          </article>

          <article className="stat-card stat-booked">
            <div className="stat-card-top">
              <div className="stat-icon">◷</div>
              <span className="stat-label">BOOKED</span>
            </div>
            <p className="stat-title">Booked appointments</p>
            <h2>{loadingAppointments ? "—" : stats.booked}</h2>
            <p className="stat-caption">Awaiting consultation</p>
          </article>

          <article className="stat-card stat-upcoming">
            <div className="stat-card-top">
              <div className="stat-icon">↗</div>
              <span className="stat-label">UP NEXT</span>
            </div>
            <p className="stat-title">Upcoming</p>
            <h2>{loadingAppointments ? "—" : stats.upcoming}</h2>
            <p className="stat-caption">Future booked appointments</p>
          </article>

          <article className="stat-card stat-completed">
            <div className="stat-card-top">
              <div className="stat-icon">✓</div>
              <span className="stat-label">FINISHED</span>
            </div>
            <p className="stat-title">Completed</p>
            <h2>{loadingAppointments ? "—" : stats.completed}</h2>
            <p className="stat-caption">Completed consultations</p>
          </article>
        </section>

        {/* Main dashboard content */}
        <section className="dashboard-content">
          <div className="appointments-panel" id="doctor-appointments">
            <div className="panel-header">
              <div>
                <span className="section-eyebrow">YOUR SCHEDULE</span>
                <h2>Appointments</h2>
                <p>Review and manage your patient consultations.</p>
              </div>

              <button
                type="button"
                className="panel-refresh-btn"
                onClick={loadAppointments}
                disabled={loadingAppointments}
                aria-label="Refresh appointments"
              >
                <span aria-hidden="true">↻</span>
                Refresh
              </button>
            </div>

            {actionError && (
              <div className="appointment-action-feedback error" role="alert">
                {actionError}
                <button
                  type="button"
                  onClick={() => setActionError("")}
                  aria-label="Dismiss error"
                >
                  ×
                </button>
              </div>
            )}

            {actionSuccess && (
              <div
                className="appointment-action-feedback success"
                role="status"
              >
                {actionSuccess}
                <button
                  type="button"
                  onClick={() => setActionSuccess("")}
                  aria-label="Dismiss message"
                >
                  ×
                </button>
              </div>
            )}

            {loadingAppointments && (
              <div className="dashboard-message">
                <span className="loading-spinner" />
                <p>Loading your appointments...</p>
              </div>
            )}

            {!loadingAppointments && appointmentError && (
              <div className="dashboard-message dashboard-error">
                <div className="message-icon">!</div>
                <h3>Could not load appointments</h3>
                <p>{appointmentError}</p>
                <button type="button" onClick={loadAppointments}>
                  Try again
                </button>
              </div>
            )}

            {!loadingAppointments &&
              !appointmentError &&
              appointments.length === 0 && (
                <div className="dashboard-message">
                  <div className="empty-appointment-icon">▤</div>
                  <h3>No appointments yet</h3>
                  <p>
                    When patients book consultations, their appointments will
                    appear here.
                  </p>
                </div>
              )}

            {!loadingAppointments &&
              !appointmentError &&
              appointments.length > 0 && (
                <div className="appointment-list">
                  {appointments.map((appointment) => {
                    const isBooked = appointment.status === "BOOKED";

                    const timeReached =
                      isBooked && isAppointmentTimeReached(appointment);

                    const isCompleting =
                      completingAppointmentId === appointment.id;

                    const scheduledTime = getAppointmentDateTime(appointment);

                    const missingDateTime =
                      !appointment.appointmentDate ||
                      !appointment.appointmentTime ||
                      scheduledTime === null;

                    const completeDisabled =
                      !timeReached ||
                      missingDateTime ||
                      completingAppointmentId !== null;

                    const hasPendingReschedule =
                      appointment.rescheduleRequestStatus === "PENDING";

                    const isHandlingReschedule =
                      rescheduleActionId === appointment.id;

                    return (
                      <article
                        className="doctor-appointment-card"
                        key={appointment.id}
                      >
                        <div className="patient-avatar" aria-hidden="true">
                          {String(appointment.patientName || "P")
                            .trim()
                            .charAt(0)
                            .toUpperCase()}
                        </div>

                        <div className="appointment-details">
                          <h3>{appointment.patientName || "Patient"}</h3>

                          <p className="appointment-reference">
                            Appointment #{appointment.id}
                          </p>

                          <div className="appointment-meta">
                            <span>
                              <span aria-hidden="true">▦</span>
                              {formatDate(appointment.appointmentDate)}
                            </span>

                            <span>
                              <span aria-hidden="true">◷</span>
                              {formatTime(appointment.appointmentTime)}
                            </span>
                          </div>

                          <div className="consultation-type">
                            <span aria-hidden="true">
                              {appointment.consultationType === "VIDEO"
                                ? "▣"
                                : "⌂"}
                            </span>

                            {formatConsultationType(
                              appointment.consultationType,
                            )}
                          </div>

                          {/* Pending reschedule request */}
                          {hasPendingReschedule && (
                            <div
                              className="reschedule-request-box"
                              style={{
                                marginTop: "16px",
                                padding: "16px",
                                border: "1px solid #f0c36d",
                                borderRadius: "10px",
                                backgroundColor: "#fffaf0",
                                width: "100%",
                              }}
                            >
                              <h4
                                style={{
                                  margin: "0 0 10px",
                                  color: "#9a6700",
                                  fontSize: "15px",
                                }}
                              >
                                Reschedule Request Pending
                              </h4>

                              <p style={{ margin: "5px 0", fontSize: "14px" }}>
                                <strong>Requested date:</strong>{" "}
                                {formatDate(
                                  appointment.requestedAppointmentDate,
                                )}
                              </p>

                              <p style={{ margin: "5px 0", fontSize: "14px" }}>
                                <strong>Requested time:</strong>{" "}
                                {formatTime(
                                  appointment.requestedAppointmentTime,
                                )}
                              </p>

                              <div
                                style={{
                                  display: "flex",
                                  gap: "10px",
                                  flexWrap: "wrap",
                                  marginTop: "14px",
                                }}
                              >
                                <button
                                  type="button"
                                  disabled={rescheduleActionId !== null}
                                  onClick={() => acceptReschedule(appointment)}
                                  style={{
                                    padding: "9px 16px",
                                    border: "none",
                                    borderRadius: "6px",
                                    backgroundColor: "#16845b",
                                    color: "#fff",
                                    cursor:
                                      rescheduleActionId !== null
                                        ? "not-allowed"
                                        : "pointer",
                                    opacity:
                                      rescheduleActionId !== null ? 0.6 : 1,
                                  }}
                                >
                                  {isHandlingReschedule
                                    ? "Processing..."
                                    : "Accept"}
                                </button>

                                <button
                                  type="button"
                                  disabled={rescheduleActionId !== null}
                                  onClick={() => rejectReschedule(appointment)}
                                  style={{
                                    padding: "9px 16px",
                                    border: "1px solid #dc5555",
                                    borderRadius: "6px",
                                    backgroundColor: "#fff",
                                    color: "#c0392b",
                                    cursor:
                                      rescheduleActionId !== null
                                        ? "not-allowed"
                                        : "pointer",
                                    opacity:
                                      rescheduleActionId !== null ? 0.6 : 1,
                                  }}
                                >
                                  {isHandlingReschedule
                                    ? "Processing..."
                                    : "Reject"}
                                </button>
                              </div>
                            </div>
                          )}

                          {isBooked && !timeReached && !missingDateTime && (
                            <p className="appointment-time-note">
                              Available to complete on{" "}
                              {formatDate(appointment.appointmentDate)} at{" "}
                              {formatTime(appointment.appointmentTime)}.
                            </p>
                          )}

                          {isBooked && missingDateTime && (
                            <p className="appointment-time-note">
                              Completion is unavailable because the appointment
                              date or time is missing.
                            </p>
                          )}
                        </div>

                        <div className="appointment-card-actions">
                          <span className={getStatusClass(appointment.status)}>
                            <span className="status-dot" />
                            {formatStatus(appointment.status)}
                          </span>

                          <div className="appointment-actions">
                            <button
                              type="button"
                              className="appointment-view-btn"
                              onClick={() => handleViewAppointment(appointment)}
                            >
                              View details
                            </button>

                            {isBooked && (
                              <button
                                type="button"
                                className="appointment-complete-btn"
                                disabled={completeDisabled}
                                title={
                                  missingDateTime
                                    ? "Appointment date or time is unavailable"
                                    : !timeReached
                                      ? "Available when the scheduled appointment time arrives"
                                      : "Complete appointment"
                                }
                                onClick={() => completeAppointment(appointment)}
                              >
                                {isCompleting
                                  ? "Completing..."
                                  : !timeReached
                                    ? "Not started"
                                    : "Complete"}
                              </button>
                            )}
                          </div>
                        </div>
                      </article>
                    );
                  })}
                </div>
              )}
          </div>

          {/* Sidebar */}
          <aside className="dashboard-sidebar">
            <section className="dashboard-panel availability-panel">
              <div className="sidebar-panel-heading">
                <div className="sidebar-panel-icon availability-icon">◷</div>

                <div>
                  <span className="section-eyebrow">YOUR SCHEDULE</span>
                  <h2>Availability</h2>
                </div>
              </div>

              <div className="sidebar-description">
                <div className="availability-decoration" aria-hidden="true">
                  ✓
                </div>

                <p>
                  Keep your consultation hours and available locations up to
                  date so patients can plan their visits.
                </p>
              </div>

              <button
                type="button"
                className="sidebar-primary-btn"
                onClick={() => navigate("/doctor-dashboard/availability")}
              >
                Manage availability <span>→</span>
              </button>
            </section>

            <section className="dashboard-help-card">
              <div className="help-icon" aria-hidden="true">
                ?
              </div>

              <div>
                <h3>Need a hand?</h3>
                <p>
                  Manage your consultation availability and keep appointment
                  information up to date.
                </p>
              </div>
            </section>
          </aside>
        </section>

        {/* Footer */}
        <footer className="dashboard-footer">
          <span>MediCare</span>
          <span>Healthcare management, made simpler.</span>
        </footer>
      </div>
    </main>
  );
}

export default DoctorDashboard;
