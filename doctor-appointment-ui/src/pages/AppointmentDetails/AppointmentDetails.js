const APPOINTMENT_SERVICE_URL = "http://localhost:8083";
const DOCTOR_SERVICE_URL = "http://localhost:8082";

function getAccessToken() {
  return sessionStorage.getItem("accessToken");
}

function getAuthHeaders() {
  const token = getAccessToken();

  return {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };
}

// Fetch appointment by ID
export async function fetchAppointmentById(id) {
  const response = await fetch(
    `${APPOINTMENT_SERVICE_URL}/appointments/findId/${id}`,
    {
      method: "GET",
      headers: getAuthHeaders(),
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.message ||
        "Failed to fetch appointment details"
    );
  }

  return data;
}

// Fetch doctor details by ID
export async function fetchDoctorById(id) {
  const response = await fetch(
    `${DOCTOR_SERVICE_URL}/doctors/${id}/details`,
    {
      method: "GET",
      headers: getAuthHeaders(),
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.message ||
        "Failed to fetch doctor details"
    );
  }

  return data;
}

// Fetch appointment details
export async function fetchAppointmentDetails(appointmentId) {
  const appointment = await fetchAppointmentById(
    appointmentId
  );

  const doctor = await fetchDoctorById(
    appointment.doctorId
  );

  return {
    appointment,
    doctor,

    // Patient information is already
    // provided by appointment-service
    patient: {
      fullName: appointment.patientName || "Patient",
    },
  };
}

// Format appointment date
export function formatAppointmentDate(date) {
  if (!date) {
    return "";
  }

  return new Date(date).toLocaleDateString(
    "en-IN",
    {
      day: "2-digit",
      month: "long",
      year: "numeric",
    }
  );
}

// Format appointment time
export function formatAppointmentTime(time) {
  if (!time) {
    return "";
  }

  const [hours, minutes] = time.split(":");

  const date = new Date();

  date.setHours(
    Number(hours),
    Number(minutes),
    0,
    0
  );

  return date.toLocaleTimeString(
    "en-IN",
    {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    }
  );
}

// Convert appointment status into a readable label
export function getStatusLabel(
  status,
  rescheduleRequestStatus
) {
  // Patient requested a reschedule
  // and the doctor has not responded yet.
  if (
    status === "BOOKED" &&
    rescheduleRequestStatus === "PENDING"
  ) {
    return "Reschedule Requested";
  }

  // Doctor accepted the reschedule request.
  if (
    status === "BOOKED" &&
    rescheduleRequestStatus === "ACCEPTED"
  ) {
    return "Reschedule Accepted";
  }

  // Doctor rejected the reschedule request.
  if (
    status === "BOOKED" &&
    rescheduleRequestStatus === "REJECTED"
  ) {
    return "Reschedule Rejected";
  }

  if (status === "BOOKED") {
    return "Upcoming";
  }

  if (status === "COMPLETED") {
    return "Completed";
  }

  if (status === "CANCELLED") {
    return "Cancelled";
  }

  return status || "";
}