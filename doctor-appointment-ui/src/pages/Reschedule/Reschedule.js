import { apiFetch } from "../../services/authservice.js";


const APPOINTMENT_SERVICE_URL =
  "http://localhost:8083";

const DOCTOR_SERVICE_URL =
  "http://localhost:8082";


// Safely read JSON response
async function readResponseData(response) {
  const text = await response.text();

  if (!text) {
    return null;
  }

  try {
    return JSON.parse(text);
  } catch (error) {
    return {
      message: text,
    };
  }
}


// Fetch appointment by ID
export async function fetchAppointmentById(id) {
  const response = await apiFetch(
    `${APPOINTMENT_SERVICE_URL}/appointments/findId/${id}`,
    {
      method: "GET",
    }
  );

  const data = await readResponseData(response);

  if (!response.ok) {
    throw new Error(
      data?.message ||
        "Failed to fetch appointment"
    );
  }

  if (!data) {
    throw new Error(
      "Appointment service returned an empty response."
    );
  }

  return data;
}


// Fetch doctor details by ID
export async function fetchDoctorById(id) {
  const response = await apiFetch(
    `${DOCTOR_SERVICE_URL}/doctors/${id}/details`,
    {
      method: "GET",
    }
  );

  const data = await readResponseData(response);

  if (!response.ok) {
    throw new Error(
      data?.message ||
        "Failed to fetch doctor details"
    );
  }

  if (!data) {
    throw new Error(
      "Doctor service returned an empty response."
    );
  }

  return data;
}


// Generate available dates
export function generateAvailableDates() {
  const dates = [];

  const today = new Date();

  for (let i = 0; i < 7; i++) {
    const date = new Date(today);

    date.setDate(
      today.getDate() + i
    );

    dates.push({
      day: date.toLocaleDateString(
        "en-US",
        {
          weekday: "short",
        }
      ),

      date: date.getDate(),

      month: date.toLocaleDateString(
        "en-US",
        {
          month: "short",
        }
      ),

      // Use local date to avoid UTC date shifting
      fullDate:
        `${date.getFullYear()}-${String(
          date.getMonth() + 1
        ).padStart(2, "0")}-${String(
          date.getDate()
        ).padStart(2, "0")}`,
    });
  }

  return dates;
}


// Handle date selection
export function handleDateSelect(
  setSelectedDate,
  date
) {
  setSelectedDate(date);
}


// Handle time selection
export function handleTimeSelect(
  setSelectedTime,
  time
) {
  setSelectedTime(time);
}


// Convert AM/PM time into backend format
export function formatTimeForBackend(
  time
) {
  const [
    timePart,
    modifier,
  ] = time.split(" ");

  let [
    hours,
    minutes,
  ] = timePart.split(":");

  hours = parseInt(hours);

  if (
    modifier === "PM" &&
    hours !== 12
  ) {
    hours += 12;
  }

  if (
    modifier === "AM" &&
    hours === 12
  ) {
    hours = 0;
  }

  return `${hours
    .toString()
    .padStart(2, "0")}:${minutes}:00`;
}


// Request appointment reschedule
export async function requestReschedule(
  appointmentId,
  appointmentDate,
  appointmentTime
) {
  const response = await apiFetch(
    `${APPOINTMENT_SERVICE_URL}/appointments/reschedule/${appointmentId}`,
    {
      method: "PATCH",

      body: JSON.stringify({
        appointmentDate:
          appointmentDate,

        appointmentTime:
          appointmentTime,
      }),
    }
  );

  const data =
    await readResponseData(response);

  if (!response.ok) {
    throw new Error(
      data?.message ||
        "Failed to request appointment reschedule"
    );
  }

  if (!data) {
    throw new Error(
      "Appointment service returned an empty response."
    );
  }

  return data;
}