
import { apiFetch } from "../../services/authservice.js";

const DOCTOR_SERVICE_URL = "http://localhost:8082";
const PATIENT_SERVICE_URL = "http://localhost:8081";
const APPOINTMENT_SERVICE_URL = "http://localhost:8083";

export const BOOKING_TIME_SLOTS = [
  "10:00 AM",
  "11:00 AM",
  "12:00 PM",
  "2:00 PM",
  "3:00 PM",
  "4:00 PM",
];

// Fetch doctor details
export async function fetchDoctorById(id) {
  try {
    const response = await apiFetch(
      `${DOCTOR_SERVICE_URL}/doctors/${id}/details`,
      { method: "GET" },
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Failed to fetch doctor details");
    }

    return data;
  } catch (error) {
    if (error instanceof TypeError) {
      throw new Error(
        "Doctor Service is currently unavailable. Please try again later.",
      );
    }

    throw error;
  }
}

// Fetch patient profiles belonging to the logged-in user
export async function fetchMyProfiles() {
  try {
    const response = await apiFetch(
      `${PATIENT_SERVICE_URL}/patients/my-profiles`,
      { method: "GET" },
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Failed to load patient profiles");
    }

    return data;
  } catch (error) {
    if (error instanceof TypeError) {
      throw new Error(
        "Patient Service is currently unavailable. Please try again later.",
      );
    }

    throw error;
  }
}

// Update existing patient profile
export async function updatePatientProfile(
  patientId,
  patientName,
  patientPhone,
  address,
  city,
  state,
  pincode,
) {
  try {
    const response = await apiFetch(
      `${PATIENT_SERVICE_URL}/patients/${patientId}`,
      {
        method: "PATCH",
        body: JSON.stringify({
          fullName: patientName,
          phone: patientPhone,
          address,
          city,
          state,
          pincode,
        }),
      },
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Failed to update patient profile");
    }

    return data;
  } catch (error) {
    if (error instanceof TypeError) {
      throw new Error(
        "Patient Service is currently unavailable. Please try again later.",
      );
    }

    throw error;
  }
}

// Create a family/other patient profile
export async function createFamilyPatient(
  patientName,
  patientEmail,
  patientPhone,
  relationship,
  address,
  city,
  state,
  pincode,
) {
  try {
    const response = await apiFetch(
      `${PATIENT_SERVICE_URL}/patients/family`,
      {
        method: "POST",
        body: JSON.stringify({
          fullName: patientName,
          email: patientEmail,
          phone: patientPhone,
          relationship,
          address,
          city,
          state,
          pincode,
        }),
      },
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Failed to create patient profile");
    }

    return data;
  } catch (error) {
    if (error instanceof TypeError) {
      throw new Error(
        "Patient Service is currently unavailable. Please try again later.",
      );
    }

    throw error;
  }
}

// Handle consultation location selection
export function handleLocationSelect(
  setSelectedLocationId,
  setConsultationType,
  location,
) {
  setSelectedLocationId(location.id);

  setConsultationType(
    location.consultationType === "VIDEO" ? "Video" : "In-person",
  );
}

// Handle date selection and clear the previous time
export function handleDateSelect(
  setSelectedDate,
  date,
  setSelectedTime,
) {
  setSelectedDate(date);

  if (setSelectedTime) {
    setSelectedTime("");
  }
}

// Handle time selection
export function handleTimeSelect(setSelectedTime, time) {
  setSelectedTime(time);
}

// Convert the selected date and time into a local Date object
function getAppointmentDateTime(date, time) {
  if (!date || !time) {
    return null;
  }

  const match = time.match(/^(\d{1,2}):(\d{2})\s(AM|PM)$/i);

  if (!match) {
    return null;
  }

  const [, hourText, minuteText, modifier] = match;

  let hours = Number(hourText);
  const minutes = Number(minuteText);

  if (
    hours < 1 ||
    hours > 12 ||
    minutes < 0 ||
    minutes > 59
  ) {
    return null;
  }

  if (modifier.toUpperCase() === "PM" && hours !== 12) {
    hours += 12;
  }

  if (modifier.toUpperCase() === "AM" && hours === 12) {
    hours = 0;
  }

  const [year, month, day] = date.split("-").map(Number);

  if (!year || !month || !day) {
    return null;
  }

  const appointmentDate = new Date(
    year,
    month - 1,
    day,
    hours,
    minutes,
    0,
    0,
  );

  // Reject invalid calendar dates
  if (
    appointmentDate.getFullYear() !== year ||
    appointmentDate.getMonth() !== month - 1 ||
    appointmentDate.getDate() !== day
  ) {
    return null;
  }

  return appointmentDate;
}

// Check whether the selected appointment is still in the future
export function isAppointmentTimeInFuture(
  date,
  time,
  now = new Date(),
) {
  const appointmentDateTime = getAppointmentDateTime(date, time);

  return (
    appointmentDateTime !== null &&
    appointmentDateTime.getTime() > now.getTime()
  );
}

// Return only time slots that have not passed
export function getAvailableTimeSlots(
  date,
  timeSlots = BOOKING_TIME_SLOTS,
  now = new Date(),
) {
  if (!date) {
    return [];
  }

  return timeSlots.filter((time) =>
    isAppointmentTimeInFuture(date, time, now),
  );
}

// Generate available dates
export function generateAvailableDates() {
  const dates = [];
  const today = new Date();

  const lastAppointmentHour = 16;
  const lastAppointmentMinute = 0;

  const currentHour = today.getHours();
  const currentMinute = today.getMinutes();

  const isTodayFinished =
    currentHour > lastAppointmentHour ||
    (currentHour === lastAppointmentHour &&
      currentMinute >= lastAppointmentMinute);

  const startDay = isTodayFinished ? 1 : 0;

  for (let i = startDay; i < startDay + 5; i++) {
    const date = new Date(today);

    date.setDate(today.getDate() + i);

    dates.push({
      day: date.toLocaleDateString("en-US", {
        weekday: "short",
      }),

      date: date.getDate(),

      month: date.toLocaleDateString("en-US", {
        month: "short",
      }),

      fullDate: `${date.getFullYear()}-${String(
        date.getMonth() + 1,
      ).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`,
    });
  }

  return dates;
}

// Convert AM/PM to backend time
export function formatTimeForBackend(time) {
  const [timePart, modifier] = time.split(" ");

  let [hours, minutes] = timePart.split(":").map(Number);

  if (modifier === "PM" && hours !== 12) {
    hours += 12;
  }

  if (modifier === "AM" && hours === 12) {
    hours = 0;
  }

  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(
    2,
    "0",
  )}:00`;
}

// Create appointment
export async function createAppointment(
  patientId,
  doctorId,
  doctorLocationId,
  appointmentDate,
  appointmentTime,
  consultationType,
  reason,
) {
  try {
    const response = await apiFetch(
      `${APPOINTMENT_SERVICE_URL}/appointments/save`,
      {
        method: "POST",
        body: JSON.stringify({
          patientId,
          doctorId: Number(doctorId),
          doctorLocationId: Number(doctorLocationId),
          appointmentDate,
          appointmentTime,
          consultationType:
            consultationType === "Video" ? "VIDEO" : "IN_PERSON",
          reason,
        }),
      },
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Failed to create appointment");
    }

    return data;
  } catch (error) {
    if (error instanceof TypeError) {
      throw new Error(
        "Appointment Service is currently unavailable. Please try again later.",
      );
    }

    throw error;
  }
}

// Handle complete booking process
export async function handleBooking(
  navigate,
  patientId,
  doctorId,
  selectedLocationId,
  selectedDate,
  selectedTime,
  reason,
  consultationType,
  bookingFor,
  patientName,
  patientEmail,
  patientPhone,
  relationship,
  address,
  city,
  state,
  pincode,
  createFamilyPatientFunction,
  setSelectedPatientId,
  setBookingLoading,
  setBookingError,
) {
  try {
    setBookingError("");

    if (!selectedLocationId) {
      setBookingError("Please select a consultation location.");
      return;
    }

    if (!selectedDate) {
      setBookingError("Please select a date.");
      return;
    }

    if (!selectedTime) {
      setBookingError("Please select a time.");
      return;
    }

    // Validate before creating any patient profile
    if (!isAppointmentTimeInFuture(selectedDate, selectedTime)) {
      setBookingError(
        "This appointment time has passed. Please select a future time slot.",
      );
      return;
    }

    if (!consultationType) {
      setBookingError("Please select a consultation type.");
      return;
    }

    if (!bookingFor) {
      setBookingError(
        "Please select who you are booking this appointment for.",
      );
      return;
    }

    if (!patientName.trim()) {
      setBookingError("Please enter the patient's full name.");
      return;
    }

    if (!patientEmail.trim()) {
      setBookingError("Please enter the patient's email.");
      return;
    }

    if (!patientPhone.trim()) {
      setBookingError("Please enter the patient's phone number.");
      return;
    }

    if (bookingFor === "OTHER" && !relationship.trim()) {
      setBookingError("Please enter the patient's relationship.");
      return;
    }

    if (!reason.trim()) {
      setBookingError("Please enter the reason for consultation.");
      return;
    }

    setBookingLoading(true);

    let finalPatientId = patientId;

    // Create a patient profile only when needed
    if (!finalPatientId) {
      if (bookingFor === "SELF") {
        const response = await apiFetch(
          `${PATIENT_SERVICE_URL}/save`,
          {
            method: "POST",
            body: JSON.stringify({
              fullName: patientName,
              email: patientEmail,
              phone: patientPhone,
              address,
              city,
              state,
              pincode,
            }),
          },
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.message || "Failed to create your patient profile.",
          );
        }

        finalPatientId = data.id;
      } else {
        const newPatient = await createFamilyPatientFunction(
          patientName,
          patientEmail,
          patientPhone,
          relationship,
          address,
          city,
          state,
          pincode,
        );

        finalPatientId = newPatient.id;
      }

      setSelectedPatientId(finalPatientId);
    }

    if (!finalPatientId) {
      throw new Error("Unable to identify the patient.");
    }

    // Validate again immediately before creating the appointment
    if (!isAppointmentTimeInFuture(selectedDate, selectedTime)) {
      throw new Error(
        "This appointment time has passed. Please select a future time slot.",
      );
    }

    const appointmentTime = formatTimeForBackend(selectedTime);

    const appointment = await createAppointment(
      finalPatientId,
      doctorId,
      selectedLocationId,
      selectedDate,
      appointmentTime,
      consultationType,
      reason,
    );

    console.log("Appointment created successfully:", appointment);

    navigate(
      `/payment?appointmentId=${appointment.id}&consultationType=${encodeURIComponent(
        consultationType,
      )}`,
    );
  } catch (error) {
    console.error("Booking failed:", error);

    setBookingError(error.message || "Failed to book appointment.");
  } finally {
    setBookingLoading(false);
  }
}
