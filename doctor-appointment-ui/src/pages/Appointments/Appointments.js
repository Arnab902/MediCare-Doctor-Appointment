import { apiFetch } from "../../services/authservice.js";

const APPOINTMENT_SERVICE_URL =
  "http://localhost:8083";

const DOCTOR_SERVICE_URL =
  "http://localhost:8082";

export function getUserRole() {
  const accessToken =
    sessionStorage.getItem("accessToken");

  if (!accessToken) {
    return null;
  }

  try {
    const tokenParts =
      accessToken.split(".");

    const payload = JSON.parse(
      atob(tokenParts[1])
    );

    return payload.role;

  } catch (error) {

    console.error(
      "Failed to read user role:",
      error
    );

    return null;
  }
}

export async function fetchPatientAppointments() {

  const response = await apiFetch(
    `${APPOINTMENT_SERVICE_URL}/appointments/my`,
    {
      method: "GET",
    }
  );

  if (!response.ok) {

    const errorMessage =
      await response.text();

    throw new Error(
      errorMessage ||
        "Unable to load appointments."
    );
  }

  return await response.json();
}

export async function fetchDoctorAppointments() {

  const response = await apiFetch(
    `${APPOINTMENT_SERVICE_URL}/appointments/doctor/my`,
    {
      method: "GET",
    }
  );

  if (!response.ok) {

    const errorMessage =
      await response.text();

    throw new Error(
      errorMessage ||
        "Unable to load doctor appointments."
    );
  }

  return await response.json();
}

export async function fetchDoctorById(
  doctorId
) {

  const response = await apiFetch(
    `${DOCTOR_SERVICE_URL}/doctors/${doctorId}`,
    {
      method: "GET",
    }
  );

  if (!response.ok) {

    const errorMessage =
      await response.text();

    throw new Error(
      errorMessage ||
        "Unable to load doctor details."
    );
  }

  return await response.json();
}

export async function fetchAppointmentsWithDoctors() {

  const userRole =
    getUserRole();

  let appointments;

  /*
   * DOCTOR
   * Doctor gets only their own appointments.
   */
  if (userRole === "DOCTOR") {

    appointments =
      await fetchDoctorAppointments();

    return appointments;
  }

  /*
   * PATIENT
   * Patient gets only their own appointments.
   */
  if (userRole === "PATIENT") {

    appointments =
      await fetchPatientAppointments();

  } else {

    return [];
  }

  /*
   * Patient needs doctor details.
   */
  const appointmentsWithDoctors =
    await Promise.all(
      appointments.map(
        async (appointment) => {

          try {

            const doctor =
              await fetchDoctorById(
                appointment.doctorId
              );

            return {
              ...appointment,
              doctor: doctor,
            };

          } catch (error) {

            console.error(
              `Failed to load doctor ${appointment.doctorId}:`,
              error
            );

            return {
              ...appointment,
              doctor: null,
            };
          }
        }
      )
    );

  return appointmentsWithDoctors;
}

export function filterAppointments(
  appointments,
  activeTab
) {

  const today =
    new Date();

  today.setHours(
    0,
    0,
    0,
    0
  );

  /*
   * Cancelled appointments
   */
  if (activeTab === "Cancelled") {

    return appointments.filter(
      (appointment) =>
        appointment.status ===
        "CANCELLED"
    );
  }

  /*
   * Past appointments
   */
  if (activeTab === "Past") {

    return appointments.filter(
      (appointment) => {

        if (
          appointment.status !==
          "COMPLETED"
        ) {
          return false;
        }

        if (
          !appointment.appointmentDate
        ) {
          return false;
        }

        const appointmentDate =
          new Date(
            appointment.appointmentDate
          );

        appointmentDate.setHours(
          0,
          0,
          0,
          0
        );

        return appointmentDate < today;
      }
    );
  }

  /*
   * Upcoming appointments
   */
  if (activeTab === "Upcoming") {

    return appointments.filter(
      (appointment) => {

        if (
          appointment.status !==
          "BOOKED"
        ) {
          return false;
        }

        if (
          !appointment.appointmentDate
        ) {
          return false;
        }

        const appointmentDate =
          new Date(
            appointment.appointmentDate
          );

        appointmentDate.setHours(
          0,
          0,
          0,
          0
        );

        return appointmentDate >= today;
      }
    );
  }

  return appointments;
}

export function formatAppointmentDate(
  date
) {

  if (!date) {
    return "";
  }

  const appointmentDate =
    new Date(date);

  return appointmentDate.toLocaleDateString(
    "en-IN",
    {
      day: "numeric",
      month: "short",
      year: "numeric",
    }
  );
}

export function formatAppointmentTime(
  time
) {

  if (!time) {
    return "";
  }

  const [
    hours,
    minutes,
  ] = time.split(":");

  const date =
    new Date();

  date.setHours(
    Number(hours),
    Number(minutes),
    0,
    0
  );

  return date.toLocaleTimeString(
    "en-IN",
    {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    }
  );
}

/*
 * Appointment Status Label
 *
 * If a booked appointment has a pending
 * reschedule request, display:
 * "Reschedule Requested"
 *
 * Otherwise, display the original status.
 */
export function getStatusLabel(
  status,
  rescheduleRequestStatus
) {

  if (
    status === "BOOKED" &&
    rescheduleRequestStatus === "PENDING"
  ) {
    return "Reschedule Requested";
  }

  if (!status) {
    return "";
  }

  switch (status) {

    case "BOOKED":
      return "Booked";

    case "CANCELLED":
      return "Cancelled";

    case "COMPLETED":
      return "Completed";

    default:
      return status;
  }
}

export function handleViewDetails(
  navigate,
  appointment
) {

  navigate(
    `/appointment-details?appointmentId=${appointment.id}`
  );
}

export function handleReschedule(
  navigate,
  appointment
) {

  navigate(
    `/reschedule?appointmentId=${appointment.id}`
  );
}

/*
 * Checks whether a doctor can complete
 * an appointment based on its scheduled
 * date and time.
 */
export function canCompleteAppointment(
  appointmentDate,
  appointmentTime,
  now = Date.now()
) {

  if (
    !appointmentDate ||
    !appointmentTime
  ) {
    return false;
  }

  const appointmentDateTime =
    new Date(
      `${appointmentDate}T${appointmentTime}`
    );

  if (
    Number.isNaN(
      appointmentDateTime.getTime()
    )
  ) {
    return false;
  }

  return (
    now >=
    appointmentDateTime.getTime()
  );
}

export async function handleCancel(
  appointmentId,
  loadAppointments,
  setActionLoading,
  setActionError,
  setSuccessMessage
) {

  try {

    setActionLoading(
      appointmentId
    );

    setActionError("");

    setSuccessMessage("");

    const response =
      await apiFetch(
        `${APPOINTMENT_SERVICE_URL}/appointments/cancel/${appointmentId}`,
        {
          method: "PATCH",
        }
      );

    if (!response.ok) {

      const errorMessage =
        await response.text();

      throw new Error(
        errorMessage ||
          "Unable to cancel appointment."
      );
    }

    setSuccessMessage(
      "Your appointment is cancelled."
    );

    await loadAppointments(
      false
    );

  } catch (error) {

    console.error(
      "Failed to cancel appointment:",
      error
    );

    setActionError(
      error.message ||
        "Unable to cancel appointment."
    );

  } finally {

    setActionLoading(null);
  }
}

export async function handleComplete(
  appointmentId,
  loadAppointments,
  setActionLoading,
  setActionError,
  setSuccessMessage
) {

  try {

    setActionLoading(
      appointmentId
    );

    setActionError("");

    setSuccessMessage("");

    const response =
      await apiFetch(
        `${APPOINTMENT_SERVICE_URL}/appointments/complete/${appointmentId}`,
        {
          method: "PATCH",
        }
      );

    if (!response.ok) {

      const errorMessage =
        await response.text();

      throw new Error(
        errorMessage ||
          "Unable to complete appointment."
      );
    }

    setSuccessMessage(
      "Appointment completed successfully."
    );

    await loadAppointments(
      false
    );

  } catch (error) {

    console.error(
      "Failed to complete appointment:",
      error
    );

    setActionError(
      error.message ||
        "Unable to complete appointment."
    );

  } finally {

    setActionLoading(null);
  }
}

export async function handleAcceptReschedule(
  appointmentId,
  loadAppointments,
  setActionLoading,
  setActionError,
  setSuccessMessage
) {

  try {

    setActionLoading(
      appointmentId
    );

    setActionError("");

    setSuccessMessage("");

    const response =
      await apiFetch(
        `${APPOINTMENT_SERVICE_URL}/appointments/reschedule/accept/${appointmentId}`,
        {
          method: "PATCH",
        }
      );

    if (!response.ok) {

      const errorMessage =
        await response.text();

      throw new Error(
        errorMessage ||
          "Unable to accept reschedule."
      );
    }

    setSuccessMessage(
      "Reschedule request accepted."
    );

    await loadAppointments(
      false
    );

  } catch (error) {

    console.error(
      "Failed to accept reschedule:",
      error
    );

    setActionError(
      error.message ||
        "Unable to accept reschedule."
    );

  } finally {

    setActionLoading(null);
  }
}

export async function handleRejectReschedule(
  appointmentId,
  loadAppointments,
  setActionLoading,
  setActionError,
  setSuccessMessage
) {

  try {

    setActionLoading(
      appointmentId
    );

    setActionError("");

    setSuccessMessage("");

    const response =
      await apiFetch(
        `${APPOINTMENT_SERVICE_URL}/appointments/reschedule/reject/${appointmentId}`,
        {
          method: "PATCH",
        }
      );

    if (!response.ok) {

      const errorMessage =
        await response.text();

      throw new Error(
        errorMessage ||
          "Unable to reject reschedule."
      );
    }

    setSuccessMessage(
      "Reschedule request rejected."
    );

    await loadAppointments(
      false
    );

  } catch (error) {

    console.error(
      "Failed to reject reschedule:",
      error
    );

    setActionError(
      error.message ||
        "Unable to reject reschedule."
    );

  } finally {

    setActionLoading(null);
  }
}

export function handleJoinVideo(
  navigate
) {
  navigate("/video-call");
}