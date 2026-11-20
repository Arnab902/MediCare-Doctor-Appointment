
const DOCTOR_API = "http://localhost:8082";
const PATIENT_API = "http://localhost:8081";
const AUTH_API = "http://localhost:8084";
const APPOINTMENT_API = "http://localhost:8083";

function getAuthHeaders() {
  const token = sessionStorage.getItem("accessToken");

  if (!token) {
    throw new Error("Your session has expired. Please log in again.");
  }

  return {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };
}

async function handleResponse(response) {
  const text = await response.text();

  if (!response.ok) {
    throw new Error(text || `Request failed: ${response.status}`);
  }

  if (!text) {
    return null;
  }

  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

// Doctor APIs

export async function fetchDoctors() {
  const response = await fetch(`${DOCTOR_API}/doctors`, {
    headers: getAuthHeaders(),
  });

  return handleResponse(response);
}

export async function fetchDoctorDetails(doctorId) {
  const response = await fetch(
    `${DOCTOR_API}/doctors/${doctorId}/details`,
    {
      headers: getAuthHeaders(),
    },
  );

  return handleResponse(response);
}

export async function approveDoctor(doctorId) {
  const response = await fetch(
    `${DOCTOR_API}/doctors/${doctorId}/approve`,
    {
      method: "PATCH",
      headers: getAuthHeaders(),
    },
  );

  return handleResponse(response);
}

export async function rejectDoctor(doctorId) {
  const response = await fetch(
    `${DOCTOR_API}/doctors/${doctorId}/reject`,
    {
      method: "PATCH",
      headers: getAuthHeaders(),
    },
  );

  return handleResponse(response);
}

// Patient APIs

export async function fetchPatients() {
  const response = await fetch(`${PATIENT_API}/patients`, {
    headers: getAuthHeaders(),
  });

  return handleResponse(response);
}

// Auth APIs

export async function fetchAdminUsers() {
  const response = await fetch(`${AUTH_API}/admin/users`, {
    headers: getAuthHeaders(),
  });

  return handleResponse(response);
}

export async function blockDoctor(authUserId) {
  const response = await fetch(
    `${AUTH_API}/admin/users/${authUserId}/block`,
    {
      method: "PATCH",
      headers: getAuthHeaders(),
    },
  );

  return handleResponse(response);
}

export async function unblockDoctor(authUserId) {
  const response = await fetch(
    `${AUTH_API}/admin/users/${authUserId}/unblock`,
    {
      method: "PATCH",
      headers: getAuthHeaders(),
    },
  );

  return handleResponse(response);
}

// Appointment APIs

export async function fetchAppointments() {
  const response = await fetch(
    `${APPOINTMENT_API}/appointments/findAll`,
    {
      headers: getAuthHeaders(),
    },
  );

  return handleResponse(response);
}
