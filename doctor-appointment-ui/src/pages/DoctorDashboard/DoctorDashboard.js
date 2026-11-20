
const DOCTOR_SERVICE_URL = "http://localhost:8082";
const APPOINTMENT_SERVICE_URL = "http://localhost:8083";

function getAuthHeaders() {
  const token = sessionStorage.getItem("accessToken");

  if (!token) {
    throw new Error("Please log in again to continue.");
  }

  return {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };
}

async function parseResponse(response, fallbackMessage) {
  if (!response.ok) {
    let message = fallbackMessage;

    try {
      const data = await response.json();
      message = data.message || data.detail || data.error || message;
    } catch {
      // Keep the fallback message for non-JSON responses.
    }

    throw new Error(message);
  }

  if (response.status === 204) return null;

  const contentType = response.headers.get("content-type") || "";

  return contentType.includes("application/json")
    ? response.json()
    : null;
}

// =========================
// APPOINTMENTS
// =========================

export async function fetchDoctorAppointments() {
  const response = await fetch(
    `${APPOINTMENT_SERVICE_URL}/appointments/doctor/my`,
    {
      method: "GET",
      headers: getAuthHeaders(),
    }
  );

  return parseResponse(response, "Failed to fetch doctor appointments.");
}

export function handleViewAppointment(appointment) {
  if (!appointment?.id) {
    console.error("Appointment ID is missing:", appointment);
    return;
  }

  window.location.assign(
    `/appointment-details?appointmentId=${encodeURIComponent(appointment.id)}`
  );
}

export async function handleCompleteAppointment(appointment) {
  if (!appointment?.id) {
    throw new Error("Appointment ID is missing.");
  }

  const response = await fetch(
    `${APPOINTMENT_SERVICE_URL}/appointments/complete/${appointment.id}`,
    {
      method: "PATCH",
      headers: getAuthHeaders(),
    }
  );

  await parseResponse(response, "Unable to complete the appointment.");
  return true;
}

// Accept patient's reschedule request
export async function handleAcceptReschedule(appointment) {
  if (!appointment?.id) {
    throw new Error("Appointment ID is missing.");
  }

  const response = await fetch(
    `${APPOINTMENT_SERVICE_URL}/appointments/reschedule/accept/${appointment.id}`,
    {
      method: "PATCH",
      headers: getAuthHeaders(),
    }
  );

  await parseResponse(
    response,
    "Unable to accept the reschedule request."
  );

  return true;
}

// Reject patient's reschedule request
export async function handleRejectReschedule(appointment) {
  if (!appointment?.id) {
    throw new Error("Appointment ID is missing.");
  }

  const response = await fetch(
    `${APPOINTMENT_SERVICE_URL}/appointments/reschedule/reject/${appointment.id}`,
    {
      method: "PATCH",
      headers: getAuthHeaders(),
    }
  );

  await parseResponse(
    response,
    "Unable to reject the reschedule request."
  );

  return true;
}

export function handleCancelAppointment(appointment) {
  console.log("Cancel appointment clicked:", appointment);
}

// =========================
// DOCTOR PROFILE
// =========================

export async function fetchDoctorProfile() {
  const response = await fetch(`${DOCTOR_SERVICE_URL}/doctors/me`, {
    method: "GET",
    headers: getAuthHeaders(),
  });

  return parseResponse(response, "Unable to load your doctor profile.");
}

// =========================
// CONSULTATION LOCATIONS
// =========================

export async function fetchDoctorLocations(doctorId) {
  const response = await fetch(
    `${DOCTOR_SERVICE_URL}/doctors/${doctorId}/locations`,
    {
      method: "GET",
      headers: getAuthHeaders(),
    }
  );

  return parseResponse(response, "Unable to load consultation options.");
}

export async function addDoctorLocation(doctorId, locationData) {
  const response = await fetch(
    `${DOCTOR_SERVICE_URL}/doctors/${doctorId}/locations`,
    {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(locationData),
    }
  );

  return parseResponse(response, "Unable to add the consultation option.");
}

export async function updateDoctorLocation(
  doctorId,
  locationId,
  locationData
) {
  const response = await fetch(
    `${DOCTOR_SERVICE_URL}/doctors/${doctorId}/locations/${locationId}`,
    {
      method: "PUT",
      headers: getAuthHeaders(),
      body: JSON.stringify(locationData),
    }
  );

  return parseResponse(response, "Unable to update the consultation option.");
}

export async function activateDoctorLocation(doctorId, locationId) {
  const response = await fetch(
    `${DOCTOR_SERVICE_URL}/doctors/${doctorId}/locations/${locationId}/activate`,
    {
      method: "PATCH",
      headers: getAuthHeaders(),
    }
  );

  return parseResponse(response, "Unable to activate the consultation option.");
}

export async function deactivateDoctorLocation(doctorId, locationId) {
  const response = await fetch(
    `${DOCTOR_SERVICE_URL}/doctors/${doctorId}/locations/${locationId}/deactivate`,
    {
      method: "PATCH",
      headers: getAuthHeaders(),
    }
  );

  return parseResponse(response, "Unable to deactivate the consultation option.");
}

export async function deleteDoctorLocation(doctorId, locationId) {
  const response = await fetch(
    `${DOCTOR_SERVICE_URL}/doctors/${doctorId}/locations/${locationId}`,
    {
      method: "DELETE",
      headers: getAuthHeaders(),
    }
  );

  await parseResponse(response, "Unable to delete the consultation option.");
  return true;
}

// Retained temporarily for compatibility with existing imports.
export function handleSaveAvailability() {
  console.log("Use the Manage Availability panel.");
}

export function handleEditProfile() {
  console.log("Edit profile clicked");
}
