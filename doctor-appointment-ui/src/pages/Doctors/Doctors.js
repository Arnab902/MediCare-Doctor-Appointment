import { apiFetch } from "../../services/authservice.js";

const DOCTOR_SERVICE_URL =
  "http://localhost:8082";

// Fetch all doctors
export async function fetchDoctors() {
  try {
    const response = await apiFetch(
      `${DOCTOR_SERVICE_URL}/doctors`,
      {
        method: "GET",
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(
        data.message ||
          "Unable to load doctors. Please try again."
      );
    }

    return data;

  } catch (error) {
    if (error instanceof TypeError) {
      throw new Error(
        "Doctor Service is currently unavailable. Please try again later."
      );
    }

    throw error;
  }
}

// Search form handler
export function handleSearch(event) {
  event.preventDefault();

  console.log(
    "Doctor search submitted"
  );
}

// Navigate to doctor profile
export function handleViewProfile(
  navigate,
  doctorId
) {
  navigate(
    `/doctor-details/${doctorId}`
  );
}

// Navigate to booking page
export function handleBookAppointment(
  navigate,
  doctorId
) {
  const accessToken =
    sessionStorage.getItem("accessToken");

  // User is not logged in
  if (!accessToken) {
    const redirectPath =
      `/booking?doctorId=${doctorId}`;

    navigate(
      `/login?redirect=${encodeURIComponent(
        redirectPath
      )}`
    );

    return;
  }

  // User is already logged in
  navigate(
    `/booking?doctorId=${doctorId}`
  );
}