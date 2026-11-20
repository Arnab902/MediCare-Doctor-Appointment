import "./Reschedule.css";

import { useEffect, useState } from "react";

import { useNavigate, useSearchParams } from "react-router-dom";

import {
  fetchAppointmentById,
  fetchDoctorById,
  generateAvailableDates,
  handleDateSelect,
  handleTimeSelect,
  formatTimeForBackend,
  requestReschedule,
} from "./Reschedule.js";

// Check whether a date and time are in the past
function isPastDateTime(date, time) {
  if (!date || !time) {
    return false;
  }

  const [year, month, day] = date.split("-").map(Number);

  const [timePart, meridiem] = time.split(" ");

  let [hours, minutes] = timePart.split(":").map(Number);

  if (meridiem === "PM" && hours !== 12) {
    hours += 12;
  }

  if (meridiem === "AM" && hours === 12) {
    hours = 0;
  }

  const selectedDateTime = new Date(year, month - 1, day, hours, minutes, 0);

  return selectedDateTime <= new Date();
}

function Reschedule() {
  const [searchParams] = useSearchParams();

  const navigate = useNavigate();

  const appointmentId = searchParams.get("appointmentId");

  const [appointment, setAppointment] = useState(null);

  const [doctor, setDoctor] = useState(null);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  const [selectedDate, setSelectedDate] = useState("");

  const [selectedTime, setSelectedTime] = useState("");

  const [rescheduleLoading, setRescheduleLoading] = useState(false);

  const [rescheduleError, setRescheduleError] = useState("");

  const [success, setSuccess] = useState(false);

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

  const availableDates = generateAvailableDates();

  const availableTimes = [
    "09:00 AM",
    "10:00 AM",
    "11:00 AM",
    "12:00 PM",
    "02:00 PM",
    "03:00 PM",
    "04:00 PM",
    "05:00 PM",
  ];

  // Hide past time slots for the selected date
  const filteredAvailableTimes = selectedDate
    ? availableTimes.filter((time) => !isPastDateTime(selectedDate, time))
    : availableTimes;

  useEffect(() => {
    async function loadAppointment() {
      try {
        setLoading(true);

        setError("");

        const appointmentData = await fetchAppointmentById(appointmentId);

        setAppointment(appointmentData);

        const doctorData = await fetchDoctorById(appointmentData.doctorId);

        setDoctor(doctorData);
      } catch (error) {
        console.error("Failed to load reschedule data:", error);

        setError(error.message || "Unable to load appointment details.");
      } finally {
        setLoading(false);
      }
    }

    if (appointmentId) {
      loadAppointment();
    } else {
      setLoading(false);

      setError("Appointment ID is missing.");
    }
  }, [appointmentId]);

  // Handle date selection
  function handleNewDateSelect(date) {
    handleDateSelect(setSelectedDate, date);

    // Clear previously selected time
    setSelectedTime("");

    setRescheduleError("");
  }

  async function handleContinue() {
    setRescheduleError("");

    setSuccess(false);

    if (!selectedDate) {
      setRescheduleError("Please select a new appointment date.");

      return;
    }

    if (!selectedTime) {
      setRescheduleError("Please select a new appointment time.");

      return;
    }

    // Prevent selecting past dates or times
    if (isPastDateTime(selectedDate, selectedTime)) {
      setRescheduleError(
        "This time has already passed. Please select a future time.",
      );

      setSelectedTime("");

      return;
    }

    if (
      selectedDate === appointment.appointmentDate &&
      formatTimeForBackend(selectedTime) === appointment.appointmentTime
    ) {
      setRescheduleError("Please select a different date or time.");

      return;
    }

    try {
      setRescheduleLoading(true);

      const appointmentTime = formatTimeForBackend(selectedTime);

      const updatedAppointment = await requestReschedule(
        appointmentId,
        selectedDate,
        appointmentTime,
      );

      console.log("Reschedule request submitted:", updatedAppointment);

      setAppointment(updatedAppointment);

      setSuccess(true);
    } catch (error) {
      console.error("Reschedule request failed:", error);

      setRescheduleError(error.message || "Unable to request reschedule.");
    } finally {
      setRescheduleLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="reschedule-page">
        <div className="reschedule-header">
          <p>MY HEALTHCARE</p>

          <h1>Reschedule Appointment</h1>

          <span>Loading appointment details...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="reschedule-page">
        <div className="reschedule-header">
          <p>MY HEALTHCARE</p>

          <h1>Unable to Load Appointment</h1>

          <span>{error}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="reschedule-page">
      <div className="reschedule-header">
        <p>MY HEALTHCARE</p>

        <h1>Reschedule Appointment</h1>

        <span>Choose a new date and time for your consultation</span>
      </div>

      <div className="reschedule-container">
        {appointment && (
          <>
            {/* CURRENT APPOINTMENT */}

            <div className="current-appointment-card">
              <div className="current-title">Current Appointment</div>

              <div className="reschedule-doctor-info">
                {isPatient && (
                  <div className="reschedule-doctor-image">
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
                )}

                {isDoctor && (
                  <div className="reschedule-doctor-image">
                    <span>👤</span>
                  </div>
                )}

                <div className="doctor-info">
                  <h2>
                    {isDoctor
                      ? appointment.patientName || "Patient"
                      : doctor?.fullName || "Doctor information unavailable"}
                  </h2>

                  <p>
                    {isDoctor
                      ? "Patient"
                      : doctor?.specialization || "Specialization unavailable"}
                  </p>
                </div>
              </div>

              <div className="current-details">
                <div>
                  <small>Date</small>

                  <strong>{appointment.appointmentDate}</strong>
                </div>

                <div>
                  <small>Time</small>

                  <strong>{appointment.appointmentTime}</strong>
                </div>

                <div>
                  <small>Reason</small>

                  <strong>{appointment.reason || "No reason provided"}</strong>
                </div>
              </div>
            </div>

            {/* RESCHEDULE FORM */}

            {!success && (
              <div className="reschedule-card">
                <h2>Select New Date</h2>

                <p className="section-description">
                  Choose your preferred appointment date.
                </p>

                <div className="date-selection">
                  {availableDates.map((date) => (
                    <button
                      key={date.fullDate}
                      type="button"
                      className={
                        selectedDate === date.fullDate
                          ? "date-option selected"
                          : "date-option"
                      }
                      onClick={() => handleNewDateSelect(date.fullDate)}
                    >
                      <span>{date.day}</span>

                      <strong>{date.date}</strong>

                      <small>{date.month}</small>
                    </button>
                  ))}
                </div>

                <h2 className="time-title">Select New Time</h2>

                <p className="section-description">
                  Choose your preferred consultation time.
                </p>

                <div className="time-selection">
                  {filteredAvailableTimes.length > 0 ? (
                    filteredAvailableTimes.map((time) => (
                      <button
                        key={time}
                        type="button"
                        className={
                          selectedTime === time
                            ? "time-option selected"
                            : "time-option"
                        }
                        onClick={() => {
                          handleTimeSelect(setSelectedTime, time);
                          setRescheduleError("");
                        }}
                      >
                        {time}
                      </button>
                    ))
                  ) : (
                    <p>
                      No future time slots available for this date. Please
                      select another date.
                    </p>
                  )}
                </div>

                {rescheduleError && (
                  <div className="reschedule-error">{rescheduleError}</div>
                )}

                <button
                  type="button"
                  className="continue-reschedule-btn"
                  disabled={rescheduleLoading}
                  onClick={handleContinue}
                >
                  {rescheduleLoading ? "Submitting..." : "Request Reschedule"}
                </button>
              </div>
            )}

            {/* SUCCESS */}

            {success && (
              <div className="reschedule-success-card">
                <div className="success-icon">✓</div>

                <h2>Reschedule Request Submitted</h2>

                <p>
                  Your reschedule request has been submitted successfully. The
                  other party must approve the requested date and time.
                </p>

                <div className="updated-appointment">
                  <div>
                    <small>Requested Date</small>

                    <strong>
                      {appointment.requestedAppointmentDate || selectedDate}
                    </strong>
                  </div>

                  <div>
                    <small>Requested Time</small>

                    <strong>
                      {appointment.requestedAppointmentTime ||
                        formatTimeForBackend(selectedTime)}
                    </strong>
                  </div>
                </div>

                <button
                  type="button"
                  className="view-appointments-btn"
                  onClick={() => navigate("/appointments")}
                >
                  View My Appointments
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default Reschedule;
