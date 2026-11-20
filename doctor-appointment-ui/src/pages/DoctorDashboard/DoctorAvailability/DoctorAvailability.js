
const DOCTOR_SERVICE_URL = "http://localhost:8082";

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

async function parseResponse(response, fallbackMessage) {
  if (!response.ok) {
    let message = fallbackMessage;

    try {
      const data = await response.json();

      message =
        data.message ||
        data.detail ||
        data.error ||
        fallbackMessage;
    } catch {
      // Keep the fallback message if the response has no JSON body.
    }

    throw new Error(message);
  }

  if (response.status === 204) {
    return null;
  }

  const contentType = response.headers.get("content-type") || "";

  if (contentType.includes("application/json")) {
    return response.json();
  }

  return null;
}

function getSchedulesUrl(doctorId, locationId) {
  if (!doctorId || !locationId) {
    throw new Error("Doctor and consultation location are required.");
  }

  return (
    `${DOCTOR_SERVICE_URL}/doctors/${encodeURIComponent(doctorId)}` +
    `/locations/${encodeURIComponent(locationId)}/schedules`
  );
}

export async function fetchSchedules(doctorId, locationId) {
  const response = await fetch(getSchedulesUrl(doctorId, locationId), {
    method: "GET",
    headers: getAuthHeaders(),
  });

  return parseResponse(response, "Unable to load schedules.");
}

export async function createSchedule(doctorId, locationId, scheduleData) {
  const response = await fetch(getSchedulesUrl(doctorId, locationId), {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(scheduleData),
  });

  return parseResponse(response, "Unable to add the schedule.");
}

export async function updateSchedule(
  doctorId,
  locationId,
  scheduleId,
  scheduleData,
) {
  const url =
    `${getSchedulesUrl(doctorId, locationId)}/` +
    encodeURIComponent(scheduleId);

  const response = await fetch(url, {
    method: "PUT",
    headers: getAuthHeaders(),
    body: JSON.stringify(scheduleData),
  });

  return parseResponse(response, "Unable to update the schedule.");
}

export async function deleteSchedule(doctorId, locationId, scheduleId) {
  const url =
    `${getSchedulesUrl(doctorId, locationId)}/` +
    encodeURIComponent(scheduleId);

  const response = await fetch(url, {
    method: "DELETE",
    headers: getAuthHeaders(),
  });

  return parseResponse(response, "Unable to delete the schedule.");
}
