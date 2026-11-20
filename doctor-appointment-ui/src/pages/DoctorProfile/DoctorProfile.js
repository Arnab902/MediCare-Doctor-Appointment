
import { apiFetch } from "../../services/authservice.js";

// =========================
// Read Response Data Safely
// =========================

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


// =========================
// Fetch Logged-in Doctor Profile
// =========================

export async function fetchMyDoctorProfile() {
  const response = await apiFetch(
    "http://localhost:8082/doctors/me",
    {
      method: "GET",
    }
  );

  const data = await readResponseData(response);

  if (!response.ok) {
    throw new Error(
      data?.message ||
        `Failed to fetch doctor profile (${response.status})`
    );
  }

  if (!data) {
    throw new Error(
      "Doctor service returned an empty profile response."
    );
  }

  return data;
}


// =========================
// Fetch All Locations of Doctor
// =========================

export async function fetchDoctorLocations(
  doctorId,
  accessToken
) {
  const response = await fetch(
    `http://localhost:8082/doctors/${doctorId}/locations`,
    {
      method: "GET",

      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );

  const data = await readResponseData(response);

  if (!response.ok) {
    throw new Error(
      data?.message ||
        `Failed to fetch doctor locations (${response.status})`
    );
  }

  if (!data) {
    throw new Error(
      "Doctor service returned an empty locations response."
    );
  }

  return data;
}


// =========================
// Update Doctor Profile
// =========================

export async function updateDoctorProfile(
  doctorId,
  profileData,
  accessToken
) {
  const response = await fetch(
    `http://localhost:8082/doctors/${doctorId}`,
    {
      method: "PATCH",

      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },

      body: JSON.stringify(profileData),
    }
  );

  const data = await readResponseData(response);

  if (!response.ok) {
    throw new Error(
      data?.message ||
        `Failed to update doctor profile (${response.status})`
    );
  }

  if (!data) {
    throw new Error(
      "Doctor service returned an empty update response."
    );
  }

  return data;
}


// =========================
// Update Doctor Availability
// =========================

export async function updateDoctorAvailability(
  doctorId,
  availability,
  accessToken
) {
  const response = await fetch(
    `http://localhost:8082/doctors/${doctorId}/availability?availability=${availability}`,
    {
      method: "PATCH",

      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );

  const data = await readResponseData(response);

  if (!response.ok) {
    throw new Error(
      data?.message ||
        `Failed to update availability (${response.status})`
    );
  }

  if (!data) {
    throw new Error(
      "Doctor service returned an empty availability response."
    );
  }

  return data;
}


// =========================
// Add New Consultation / Location
// =========================

export async function addDoctorLocation(
  doctorId,
  locationData,
  accessToken
) {
  const response = await fetch(
    `http://localhost:8082/doctors/${doctorId}/locations`,
    {
      method: "POST",

      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },

      body: JSON.stringify(locationData),
    }
  );

  const data = await readResponseData(response);

  if (!response.ok) {
    throw new Error(
      data?.message ||
        `Failed to add consultation (${response.status})`
    );
  }

  if (!data) {
    throw new Error(
      "Doctor service returned an empty consultation response."
    );
  }

  return data;
}


// =========================
// Update Existing Consultation / Location
// =========================

export async function updateDoctorLocation(
  doctorId,
  locationId,
  locationData,
  accessToken
) {
  const response = await fetch(
    `http://localhost:8082/doctors/${doctorId}/locations/${locationId}`,
    {
      method: "PUT",

      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },

      body: JSON.stringify(locationData),
    }
  );

  const data = await readResponseData(response);

  if (!response.ok) {
    throw new Error(
      data?.message ||
        `Failed to update consultation (${response.status})`
    );
  }

  if (!data) {
    throw new Error(
      "Doctor service returned an empty consultation update response."
    );
  }

  return data;
}


// =========================
// Delete Consultation / Location
// =========================

export async function deleteDoctorLocation(
  doctorId,
  locationId,
  accessToken
) {
  const response = await fetch(
    `http://localhost:8082/doctors/${doctorId}/locations/${locationId}`,
    {
      method: "DELETE",

      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );

  if (!response.ok) {
    const data = await readResponseData(response);

    throw new Error(
      data?.message ||
        `Failed to delete consultation (${response.status})`
    );
  }

  return true;
}


// =========================
// Activate Consultation / Location
// =========================

export async function activateDoctorLocation(
  doctorId,
  locationId,
  accessToken
) {
  const response = await fetch(
    `http://localhost:8082/doctors/${doctorId}/locations/${locationId}/activate`,
    {
      method: "PATCH",

      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );

  const data = await readResponseData(response);

  if (!response.ok) {
    throw new Error(
      data?.message ||
        `Failed to activate consultation (${response.status})`
    );
  }

  if (!data) {
    throw new Error(
      "Doctor service returned an empty activation response."
    );
  }

  return data;
}


// =========================
// Deactivate Consultation / Location
// =========================

export async function deactivateDoctorLocation(
  doctorId,
  locationId,
  accessToken
) {
  const response = await fetch(
    `http://localhost:8082/doctors/${doctorId}/locations/${locationId}/deactivate`,
    {
      method: "PATCH",

      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );

  const data = await readResponseData(response);

  if (!response.ok) {
    throw new Error(
      data?.message ||
        `Failed to deactivate consultation (${response.status})`
    );
  }

  if (!data) {
    throw new Error(
      "Doctor service returned an empty deactivation response."
    );
  }

  return data;
}
