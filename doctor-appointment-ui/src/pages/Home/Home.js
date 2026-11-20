
// =========================
// FETCH ALL DOCTORS
// =========================

export async function fetchDoctors() {
  const response = await fetch(
    "http://localhost:8082/doctors"
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.message || "Failed to fetch doctors"
    );
  }

  return Array.isArray(data) ? data : [];
}


// =========================
// FETCH DOCTOR DETAILS
// =========================

export async function fetchDoctorDetails(id) {
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
}


// =========================
// SEARCH DOCTORS
// =========================

export async function searchDoctors(
  searchText,
  location
) {
  const searchValue = searchText.trim();
  const locationValue = location.trim();

  if (!searchValue && !locationValue) {
    return fetchDoctors();
  }

  let url = "";

  // =========================
  // SPECIALIZATION + CITY
  // =========================

  if (searchValue && locationValue) {
    url =
      `http://localhost:8082/doctors/search/specialization/` +
      `${encodeURIComponent(searchValue)}/city/` +
      `${encodeURIComponent(locationValue)}`;
  }

  // =========================
  // SPECIALIZATION ONLY
  // =========================

  else if (searchValue) {
    url =
      `http://localhost:8082/doctors/specialization/` +
      `${encodeURIComponent(searchValue)}`;
  }

  // =========================
  // CITY ONLY
  // =========================

  else if (locationValue) {
    url =
      `http://localhost:8082/doctors/city/` +
      `${encodeURIComponent(locationValue)}`;
  }

  const response = await fetch(url);

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.message || "Failed to search doctors"
    );
  }

  return Array.isArray(data) ? data : [];
}


// =========================
// GET DOCTOR IMAGE URL
// =========================

export function getDoctorImageUrl(profileImage) {
  if (!profileImage) {
    return "";
  }

  // If backend already provides a complete URL
  if (
    profileImage.startsWith("http://") ||
    profileImage.startsWith("https://")
  ) {
    return profileImage;
  }

  // If backend provides only an image filename
  return `http://localhost:8082/images/${profileImage}`;
}
