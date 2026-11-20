import { apiFetch } from "../../services/authservice.js";

export async function fetchMyProfile(accessToken) {
  const response = await apiFetch(
    "http://localhost:8081/patients/me",
    {
      method: "GET",
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.message || "Failed to fetch profile"
    );
  }

  return data;
}

export async function updateMyProfile(
  profileId,
  profileData,
  accessToken
) {
  const response = await apiFetch(
    `http://localhost:8081/patients/${profileId}`,
    {
      method: "PATCH",
      body: JSON.stringify(profileData),
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.message || "Failed to update profile"
    );
  }

  return data;
}