import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

import {
  fetchAppointmentDetails,
  formatAppointmentDate,
  formatAppointmentTime,
  getStatusLabel,
} from "./AppointmentDetails.js";

import "./AppointmentDetails.css";

function AppointmentDetails() {
  const navigate = useNavigate();

  const [searchParams] = useSearchParams();

  const appointmentId = searchParams.get("appointmentId");

  const [appointment, setAppointment] = useState(null);
  const [doctor, setDoctor] = useState(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

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

  useEffect(() => {
    let isMounted = true;

    async function loadAppointmentDetails(showLoading = false) {
      try {
        if (showLoading) {
          setLoading(true);
          setError("");
        }

        if (!appointmentId) {
          throw new Error("Appointment ID is missing.");
        }

        const data = await fetchAppointmentDetails(appointmentId);

        if (!isMounted) {
          return;
        }

        setAppointment(data.appointment);
        setDoctor(data.doctor);
        setError("");
      } catch (error) {
        console.error("Failed to load appointment details:", error);

        if (!isMounted) {
          return;
        }

        if (showLoading) {
          setError(error.message || "Unable to load appointment details.");
        }
      } finally {
        if (isMounted && showLoading) {
          setLoading(false);
        }
      }
    }

    loadAppointmentDetails(true);

    const intervalId = setInterval(() => {
      loadAppointmentDetails(false);
    }, 5000);

    return () => {
      isMounted = false;
      clearInterval(intervalId);
    };
  }, [appointmentId]);

  // Navigate according to logged-in user's role
  function handleBack() {
    if (isDoctor) {
      navigate("/doctor-dashboard");
    } else if (isPatient) {
      navigate("/appointments");
    } else {
      navigate("/");
    }
  }

  function handleReschedule() {
    navigate(`/reschedule?appointmentId=${appointment.id}`);
  }

  if (loading) {
    return (
      <div className="appointment-details-page">
        <div className="appointment-details-loading">
          Loading appointment details...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="appointment-details-page">
        <div className="appointment-details-error">
          <h2>Unable to Load Appointment</h2>
          <p>{error}</p>
          <button onClick={handleBack}>Back to My Appointments</button>
        </div>
      </div>
    );
  }

  const activeLocations = (doctor?.locations || []).filter(
    (location) => location.active,
  );

  const selectedLocation = activeLocations.find(
    (location) => location.id === appointment?.doctorLocationId,
  );

  const consultationFee = selectedLocation?.consultationFee ?? "N/A";

  const consultationLocation =
    appointment?.consultationType === "VIDEO"
      ? "Online Consultation"
      : selectedLocation?.locationName || "N/A";

  const isReschedulePending =
    appointment?.rescheduleRequestStatus === "PENDING";

  return (
    <div className="appointment-details-page">
      <div className="appointment-details-header">
        <p>APPOINTMENT DETAILS</p>
        <h1>Your Appointment</h1>
        <span>View complete information about your appointment.</span>
      </div>

      <div className="appointment-details-container">
        {isPatient && (
          <div className="appointment-details-card">
            <div className="card-title">Doctor Information</div>

            <div className="doctor-details">
              <div className="doctor-avatar">
                {doctor?.profileImage ? (
                  <img
                    src={
                      doctor.profileImage.startsWith("http://") ||
                      doctor.profileImage.startsWith("https://")
                        ? doctor.profileImage
                        : `http://localhost:8082/images/${doctor.profileImage}`
                    }
                    alt={doctor.fullName}
                  />
                ) : (
                  <span>👨‍⚕️</span>
                )}
              </div>

              <div className="doctor-details-info">
                <h2>{doctor?.fullName}</h2>
                <p>{doctor?.specialization}</p>
              </div>
            </div>

            <div className="doctor-extra-details">
              <div>
                <small>Qualification</small>
                <strong>{doctor?.qualification || "Not available"}</strong>
              </div>

              <div>
                <small>Experience</small>
                <strong>{doctor?.exp ?? "N/A"} years</strong>
              </div>

              <div>
                <small>Phone</small>
                <strong>{doctor?.phoneNumber || "Not available"}</strong>
              </div>

              <div>
                <small>Consultation Type</small>
                <strong>
                  {appointment?.consultationType === "VIDEO"
                    ? "Video Consultation"
                    : appointment?.consultationType === "IN_PERSON"
                      ? "In-person Consultation"
                      : "N/A"}
                </strong>
              </div>

              <div>
                <small>Consultation Fee</small>
                <strong>₹{consultationFee}</strong>
              </div>

              <div>
                <small>Language</small>
                <strong>{doctor?.language || "Not available"}</strong>
              </div>

              <div>
                <small>Location</small>
                <strong>{consultationLocation}</strong>
              </div>
            </div>
          </div>
        )}

        {isDoctor && (
          <div className="appointment-details-card">
            <div className="card-title">Patient Information</div>

            <div className="doctor-details">
              <div className="doctor-avatar">
                <span>👤</span>
              </div>

              <div className="doctor-details-info">
                <h2>{appointment?.patientName || "Patient"}</h2>
                <p>Patient</p>
              </div>
            </div>
          </div>
        )}

        <div className="appointment-details-card">
          <div className="card-title">Appointment Information</div>

          <div className="appointment-info-grid">
            <div className="appointment-info-item">
              <small>Appointment ID</small>
              <strong>#{appointment?.id}</strong>
            </div>

            <div className="appointment-info-item">
              <small>Status</small>

              <strong
                className={`appointment-status ${
                  appointment?.rescheduleRequestStatus === "PENDING"
                    ? "reschedule-requested"
                    : appointment?.status?.toLowerCase()
                }`}
              >
                {getStatusLabel(
                  appointment?.status,
                  appointment?.rescheduleRequestStatus,
                )}
              </strong>
            </div>

            <div className="appointment-info-item">
              <small>Date</small>
              <strong>
                {formatAppointmentDate(appointment?.appointmentDate)}
              </strong>
            </div>

            <div className="appointment-info-item">
              <small>Time</small>
              <strong>
                {formatAppointmentTime(appointment?.appointmentTime)}
              </strong>
            </div>

            <div className="appointment-info-item">
              <small>Consultation Type</small>

              <strong>
                {appointment?.consultationType === "VIDEO"
                  ? "Video Consultation"
                  : appointment?.consultationType === "IN_PERSON"
                    ? "In-person Consultation"
                    : "N/A"}
              </strong>
            </div>
          </div>

          <div className="appointment-reason">
            <small>Reason for Visit</small>
            <p>{appointment?.reason || "No reason provided"}</p>
          </div>
        </div>

        <div className="appointment-details-actions">
          <button className="back-appointments-btn" onClick={handleBack}>
            Back to My Appointments
          </button>

          {(isPatient || isDoctor) &&
            appointment?.status === "BOOKED" &&
            !isReschedulePending && (
              <button
                className="reschedule-details-btn"
                onClick={handleReschedule}
              >
                Request Reschedule
              </button>
            )}
        </div>
      </div>
    </div>
  );
}

export default AppointmentDetails;
