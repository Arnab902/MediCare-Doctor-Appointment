import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  fetchAppointmentsWithDoctors,
  filterAppointments,
  formatAppointmentDate,
  formatAppointmentTime,
  getStatusLabel,
  handleViewDetails,
  handleReschedule,
  handleCancel,
  handleJoinVideo,
  handleComplete,
  handleAcceptReschedule,
  handleRejectReschedule,
  canCompleteAppointment,
} from "./Appointments.js";

import "./Appointments.css";

function Appointments() {
  const navigate = useNavigate();

  const [appointments, setAppointments] = useState([]);
  const [activeTab, setActiveTab] = useState("Upcoming");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionLoading, setActionLoading] = useState(null);
  const [actionError, setActionError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const [currentTime, setCurrentTime] = useState(Date.now());

  const accessToken = sessionStorage.getItem("accessToken");

  let userRole = null;

  if (accessToken) {
    try {
      const tokenParts = accessToken.split(".");
      const payload = JSON.parse(atob(tokenParts[1]));
      userRole = payload.role;
    } catch (error) {
      console.error("Failed to read user role:", error);
    }
  }

  const isPatient = userRole === "PATIENT";
  const isDoctor = userRole === "DOCTOR";

  async function loadAppointments(showLoading = true) {
    try {
      if (showLoading) {
        setLoading(true);
      }

      setError("");

      const data = await fetchAppointmentsWithDoctors();

      setAppointments(data);
    } catch (error) {
      console.error("Failed to load appointments:", error);
      setError(error.message || "Unable to load appointments.");
    } finally {
      if (showLoading) {
        setLoading(false);
      }
    }
  }

  useEffect(() => {
    loadAppointments();
  }, []);

  // Update current time every second.
  useEffect(() => {
    const intervalId = setInterval(() => {
      setCurrentTime(Date.now());
    }, 1000);

    return () => clearInterval(intervalId);
  }, []);

  // Automatically hide success message after 3 seconds.
  useEffect(() => {
    if (!successMessage) {
      return;
    }

    const timeoutId = setTimeout(() => {
      setSuccessMessage("");
    }, 3000);

    return () => clearTimeout(timeoutId);
  }, [successMessage]);

  const filteredAppointments = filterAppointments(appointments, activeTab);

  async function cancelAppointment(appointmentId) {
    await handleCancel(
      appointmentId,
      loadAppointments,
      setActionLoading,
      setActionError,
      setSuccessMessage,
    );
  }

  async function completeAppointment(appointmentId) {
    await handleComplete(
      appointmentId,
      loadAppointments,
      setActionLoading,
      setActionError,
      setSuccessMessage,
    );
  }

  async function acceptReschedule(appointmentId) {
    await handleAcceptReschedule(
      appointmentId,
      loadAppointments,
      setActionLoading,
      setActionError,
      setSuccessMessage,
    );
  }

  async function rejectReschedule(appointmentId) {
    await handleRejectReschedule(
      appointmentId,
      loadAppointments,
      setActionLoading,
      setActionError,
      setSuccessMessage,
    );
  }

  if (loading) {
    return (
      <div className="appointments-page">
        <div className="appointments-loading">Loading your appointments...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="appointments-page">
        <div className="appointments-error">
          <h2>Unable to Load Appointments</h2>
          <p>{error}</p>
          <button onClick={() => loadAppointments()}>Try Again</button>
        </div>
      </div>
    );
  }

  return (
    <div className="appointments-page">
      {/* Header */}

      <div className="appointments-header">
        <p>{isDoctor ? "DOCTOR APPOINTMENTS" : "MY APPOINTMENTS"}</p>

        <h1>{isDoctor ? "Patient Appointments" : "Your Appointments"}</h1>

        <span>
          {isDoctor
            ? "Manage and track appointments with your patients."
            : "Manage and track all your doctor appointments."}
        </span>
      </div>

      {/* Tabs */}

      <div className="appointment-tabs">
        <button
          className={activeTab === "Upcoming" ? "active" : ""}
          onClick={() => {
            setActiveTab("Upcoming");
            setSuccessMessage("");
            setActionError("");
          }}
        >
          Upcoming
        </button>

        <button
          className={activeTab === "Past" ? "active" : ""}
          onClick={() => {
            setActiveTab("Past");
            setSuccessMessage("");
            setActionError("");
          }}
        >
          Past
        </button>

        <button
          className={activeTab === "Cancelled" ? "active" : ""}
          onClick={() => {
            setActiveTab("Cancelled");
            setActionError("");
            setSuccessMessage("");
          }}
        >
          Cancelled
        </button>
      </div>

      {/* Success Message */}

      {successMessage && (
        <div className="appointment-success-message">✓ {successMessage}</div>
      )}

      {/* Action Error */}

      {actionError && (
        <div className="appointment-action-error">{actionError}</div>
      )}

      {/* Empty State */}

      {filteredAppointments.length === 0 && (
        <div className="appointments-empty">
          <div className="appointments-empty-icon">📅</div>

          <h2>No {activeTab.toLowerCase()} appointments</h2>

          <p>
            {isDoctor
              ? `You don't have any ${activeTab.toLowerCase()} patient appointments.`
              : `You don't have any ${activeTab.toLowerCase()} appointments.`}
          </p>
        </div>
      )}

      {/* Appointment List */}

      <div className="appointments-list">
        {filteredAppointments.map((appointment) => {
          const hasPendingReschedule =
            isDoctor &&
            appointment.status === "BOOKED" &&
            appointment.rescheduleRequestStatus === "PENDING";

          const isRescheduleRequested =
            appointment.status === "BOOKED" &&
            appointment.rescheduleRequestStatus === "PENDING";

          return (
            <div className="appointment-card" key={appointment.id}>
              {/* PATIENT VIEW */}

              {isPatient && (
                <div className="appointment-doctor">
                  <div className="appointment-doctor-avatar">
                    {appointment.doctor?.profileImage ? (
                      <img
                        src={`http://localhost:8082/images/${appointment.doctor.profileImage}`}
                        alt={appointment.doctor.fullName}
                      />
                    ) : (
                      <span>👨‍⚕️</span>
                    )}
                  </div>

                  <div className="appointment-doctor-info">
                    <h2>{appointment.doctor?.fullName || "Doctor"}</h2>

                    <p>
                      {appointment.doctor?.specialization ||
                        "Specialization not available"}
                    </p>
                  </div>
                </div>
              )}

              {/* DOCTOR VIEW */}

              {isDoctor && (
                <div className="appointment-doctor">
                  <div className="appointment-doctor-avatar">
                    <span>👤</span>
                  </div>

                  <div className="appointment-doctor-info">
                    <h2>{appointment.patientName || "Patient"}</h2>
                  </div>
                </div>
              )}

              {/* Appointment Information */}

              <div className="appointment-card-info">
                <div>
                  <small>Date</small>

                  <strong>
                    {formatAppointmentDate(appointment.appointmentDate)}
                  </strong>
                </div>

                <div>
                  <small>Time</small>

                  <strong>
                    {formatAppointmentTime(appointment.appointmentTime)}
                  </strong>
                </div>

                {/* STATUS DISPLAY */}

                <div>
                  <small>Status</small>

                  <strong
                    className={`appointment-status ${
                      isRescheduleRequested
                        ? "reschedule-requested"
                        : appointment.status
                          ? appointment.status.toLowerCase()
                          : ""
                    }`}
                  >
                    {getStatusLabel(
                      appointment.status,
                      appointment.rescheduleRequestStatus,
                    )}
                  </strong>
                </div>
              </div>

              {/* Consultation Type */}

              <div className="appointment-reason">
                <small>Consultation</small>

                <p>
                  {appointment.consultationType === "VIDEO"
                    ? "Video Consultation"
                    : "In-Person Consultation"}
                </p>
              </div>

              {/* Reason */}

              <div className="appointment-reason">
                <small>Reason</small>

                <p>{appointment.reason || "No reason provided"}</p>
              </div>

              {/* DOCTOR RESCHEDULE REQUEST */}

              {hasPendingReschedule && (
                <div className="reschedule-request-box">
                  <div className="reschedule-request-header">
                    <span className="reschedule-request-icon">🔄</span>

                    <div>
                      <h3>Reschedule Request</h3>

                      <span>Patient has requested a new appointment time</span>
                    </div>
                  </div>

                  <div className="reschedule-request-details">
                    <div className="reschedule-time-block">
                      <small>Current Appointment</small>

                      <strong>
                        {formatAppointmentDate(appointment.appointmentDate)}
                      </strong>

                      <span>
                        {formatAppointmentTime(appointment.appointmentTime)}
                      </span>
                    </div>

                    <div className="reschedule-arrow">→</div>

                    <div className="reschedule-time-block requested">
                      <small>Requested Appointment</small>

                      <strong>
                        {formatAppointmentDate(
                          appointment.requestedAppointmentDate,
                        )}
                      </strong>

                      <span>
                        {formatAppointmentTime(
                          appointment.requestedAppointmentTime,
                        )}
                      </span>
                    </div>
                  </div>

                  <div className="reschedule-request-actions">
                    <button
                      className="accept-reschedule-btn"
                      disabled={actionLoading === appointment.id}
                      onClick={() => acceptReschedule(appointment.id)}
                    >
                      {actionLoading === appointment.id
                        ? "Updating..."
                        : "✓ Accept Reschedule"}
                    </button>

                    <button
                      className="reject-reschedule-btn"
                      disabled={actionLoading === appointment.id}
                      onClick={() => rejectReschedule(appointment.id)}
                    >
                      {actionLoading === appointment.id
                        ? "Updating..."
                        : "✕ Reject"}
                    </button>
                  </div>
                </div>
              )}

              {/* Actions */}

              <div className="appointment-actions">
                <button
                  className="view-details-btn"
                  onClick={() => handleViewDetails(navigate, appointment)}
                >
                  View Details
                </button>

                {/* PATIENT ACTIONS */}

                {isPatient &&
                  appointment.status === "BOOKED" &&
                  appointment.rescheduleRequestStatus !== "PENDING" && (
                    <button
                      className="reschedule-btn"
                      onClick={() => handleReschedule(navigate, appointment)}
                    >
                      Reschedule
                    </button>
                  )}

                {isPatient && appointment.status === "BOOKED" && (
                  <button
                    className="cancel-btn"
                    disabled={actionLoading === appointment.id}
                    onClick={() => cancelAppointment(appointment.id)}
                  >
                    {actionLoading === appointment.id
                      ? "Cancelling..."
                      : "Cancel"}
                  </button>
                )}

                {isPatient &&
                  appointment.status === "BOOKED" &&
                  appointment.consultationType === "VIDEO" && (
                    <button
                      className="join-video-btn"
                      onClick={() => handleJoinVideo(navigate)}
                    >
                      Join Consultation
                    </button>
                  )}

                {/* DOCTOR ACTIONS */}

                {isDoctor &&
                  appointment.status === "BOOKED" &&
                  !hasPendingReschedule &&
                  (() => {
                    const canComplete = canCompleteAppointment(
                      appointment.appointmentDate,
                      appointment.appointmentTime,
                      currentTime,
                    );

                    return (
                      <>
                        <button
                          className="complete-btn"
                          disabled={
                            actionLoading === appointment.id || !canComplete
                          }
                          onClick={() => completeAppointment(appointment.id)}
                        >
                          {actionLoading === appointment.id
                            ? "Updating..."
                            : !canComplete
                              ? "Not Yet Available"
                              : "Complete"}
                        </button>

                        {!canComplete && (
                          <p className="complete-appointment-hint">
                            You can complete this appointment when its scheduled
                            date and time arrive.
                          </p>
                        )}
                      </>
                    );
                  })()}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default Appointments;
