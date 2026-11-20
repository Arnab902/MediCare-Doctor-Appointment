
// =========================
// FETCH DOCTOR BY ID
// =========================

export async function fetchDoctorById(id) {
  try {
    const response = await fetch(
      `http://localhost:8082/doctors/${id}/details`
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(
        data.message || "Failed to fetch doctor details"
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


// =========================
// BOOK APPOINTMENT
// =========================

export function handleBookAppointment(
  navigate,
  doctorId
) {
  const accessToken = sessionStorage.getItem("accessToken");

  if (!accessToken) {
    navigate(
      `/login?redirect=/booking?doctorId=${doctorId}`
    );

    return;
  }

  navigate(
    `/booking?doctorId=${doctorId}`
  );
}


// =========================
// BACK TO DOCTORS
// =========================

export function handleBackToDoctors(
  navigate
) {
  navigate("/doctors");
}
