import "./DoctorProfile.css";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  fetchMyDoctorProfile,
  fetchDoctorLocations,
  updateDoctorAvailability,
  updateDoctorProfile,
  addDoctorLocation,
  updateDoctorLocation,
  deleteDoctorLocation,
  activateDoctorLocation,
  deactivateDoctorLocation,
} from "./DoctorProfile.js";

function DoctorProfile() {
  const navigate = useNavigate();

  const [profile, setProfile] = useState(null);
  const [locations, setLocations] = useState([]);

  const [loading, setLoading] = useState(true);
  const [savingAvailability, setSavingAvailability] = useState(false);

  // =========================
  // Edit Profile
  // =========================

  const [showEditProfile, setShowEditProfile] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);

  const [profileForm, setProfileForm] = useState({
    fullName: "",
    phoneNumber: "",
    specialization: "",
    qualification: "",
    exp: "",
    language: "",
  });

  // =========================
  // Consultation
  // =========================

  const [showAddConsultation, setShowAddConsultation] = useState(false);
  const [savingConsultation, setSavingConsultation] = useState(false);
  const [updatingLocationId, setUpdatingLocationId] = useState(null);
  const [editingLocationId, setEditingLocationId] = useState(null);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [consultationForm, setConsultationForm] = useState({
    locationName: "",
    consultationType: "IN_PERSON",
    consultationFee: "",
    active: true,
    addressLine: "",
    city: "",
    state: "",
    country: "",
    pinCode: "",
  });

  const accessToken = sessionStorage.getItem("accessToken");

  // =========================
  // Load Doctor Profile
  // =========================

  useEffect(() => {
    async function loadDoctorProfile() {
      try {
        setError("");

        const doctorData = await fetchMyDoctorProfile();

        setProfile(doctorData);

        const locationData = await fetchDoctorLocations(
          doctorData.id,
          accessToken,
        );

        setLocations(locationData);
      } catch (error) {
        console.error("Failed to load doctor profile:", error);

        setError(error.message || "Unable to load doctor profile.");
      } finally {
        setLoading(false);
      }
    }

    if (accessToken) {
      loadDoctorProfile();
    } else {
      setLoading(false);
    }
  }, [accessToken]);

  // =========================
  // Open Edit Profile
  // =========================

  function handleOpenEditProfile() {
    setProfileForm({
      fullName: profile.fullName || "",
      phoneNumber: profile.phoneNumber || "",
      specialization: profile.specialization || "",
      qualification: profile.qualification || "",
      exp:
        profile.exp !== null && profile.exp !== undefined
          ? String(profile.exp)
          : "",
      language: profile.language || "",
    });

    setShowEditProfile(true);
    setError("");
    setSuccess("");
  }

  // =========================
  // Profile Form Change
  // =========================

  function handleProfileFormChange(event) {
    const { name, value } = event.target;

    setProfileForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  }

  // =========================
  // Update Doctor Profile
  // =========================

  async function handleUpdateProfile(event) {
    event.preventDefault();

    if (!profile) {
      return;
    }

    const experience = Number(profileForm.exp);

    if (profileForm.exp.trim() === "") {
      setError("Please enter your years of experience.");
      return;
    }

    if (!Number.isInteger(experience) || experience < 0) {
      setError("Experience must be a non-negative whole number.");
      return;
    }

    if (!profileForm.fullName.trim()) {
      setError("Please enter your full name.");
      return;
    }

    if (!profileForm.phoneNumber.trim()) {
      setError("Please enter your phone number.");
      return;
    }

    if (!profileForm.specialization.trim()) {
      setError("Please enter your specialization.");
      return;
    }

    if (!profileForm.qualification.trim()) {
      setError("Please enter your qualification.");
      return;
    }

    if (!profileForm.language.trim()) {
      setError("Please enter at least one language.");
      return;
    }

    try {
      setSavingProfile(true);

      setError("");
      setSuccess("");

      const profileData = {
        fullName: profileForm.fullName.trim(),
        phoneNumber: profileForm.phoneNumber.trim(),
        specialization: profileForm.specialization.trim(),
        qualification: profileForm.qualification.trim(),
        exp: experience,
        language: profileForm.language.trim(),
      };

      const updatedDoctor = await updateDoctorProfile(
        profile.id,
        profileData,
        accessToken,
      );

      setProfile((previous) => ({
        ...previous,
        ...updatedDoctor,
      }));

      setShowEditProfile(false);

      setSuccess("Your profile has been updated successfully.");
    } catch (error) {
      console.error("Failed to update doctor profile:", error);

      setError(error.message || "Unable to update your profile.");
    } finally {
      setSavingProfile(false);
    }
  }

  // =========================
  // Update Availability
  // =========================

  async function handleAvailabilityChange() {
    if (!profile) {
      return;
    }

    try {
      setSavingAvailability(true);

      setError("");
      setSuccess("");

      const newAvailability = !profile.availability;

      const updatedDoctor = await updateDoctorAvailability(
        profile.id,
        newAvailability,
        accessToken,
      );

      setProfile(updatedDoctor);

      setSuccess(
        newAvailability
          ? "You are now available for appointments."
          : "You are now unavailable for appointments.",
      );
    } catch (error) {
      console.error("Failed to update availability:", error);

      setError(error.message || "Unable to update availability.");
    } finally {
      setSavingAvailability(false);
    }
  }

  // =========================
  // Consultation Form Change
  // =========================

  function handleConsultationFormChange(event) {
    const { name, value, type, checked } = event.target;

    setConsultationForm((previous) => ({
      ...previous,
      [name]: type === "checkbox" ? checked : value,
    }));
  }

  // =========================
  // Reset Consultation Form
  // =========================

  function resetConsultationForm() {
    setConsultationForm({
      locationName: "",
      consultationType: "IN_PERSON",
      consultationFee: "",
      active: true,
      addressLine: "",
      city: "",
      state: "",
      country: "",
      pinCode: "",
    });

    setEditingLocationId(null);
  }

  // =========================
  // Add Consultation
  // =========================

  async function handleAddConsultation(event) {
    event.preventDefault();

    if (!profile) {
      return;
    }

    try {
      setSavingConsultation(true);

      setError("");
      setSuccess("");

      const isInPerson = consultationForm.consultationType === "IN_PERSON";

      const locationData = {
        locationName: isInPerson
          ? consultationForm.locationName.trim()
          : "Online Consultation",

        consultationType: consultationForm.consultationType,

        consultationFee: Number(consultationForm.consultationFee),

        active: consultationForm.active,

        address: isInPerson
          ? {
              addressLine: consultationForm.addressLine.trim(),
              city: consultationForm.city.trim(),
              state: consultationForm.state.trim(),
              country: consultationForm.country.trim(),
              pinCode: consultationForm.pinCode.trim(),
            }
          : null,
      };

      const newLocation = await addDoctorLocation(
        profile.id,
        locationData,
        accessToken,
      );

      setLocations((previous) => [...previous, newLocation]);

      resetConsultationForm();

      setShowAddConsultation(false);

      setSuccess("Consultation option added successfully.");
    } catch (error) {
      console.error("Failed to add consultation:", error);

      setError(error.message || "Unable to add consultation.");
    } finally {
      setSavingConsultation(false);
    }
  }

  // =========================
  // Open Edit Consultation
  // =========================

  function handleEditLocation(location) {
    const address = location.address || {};

    setConsultationForm({
      locationName: location.locationName || "",

      consultationType: location.consultationType || "IN_PERSON",

      consultationFee:
        location.consultationFee !== null &&
        location.consultationFee !== undefined
          ? String(location.consultationFee)
          : "",

      active: Boolean(location.active),

      addressLine: address.addressLine || "",
      city: address.city || "",
      state: address.state || "",
      country: address.country || "",
      pinCode: address.pinCode || "",
    });

    setEditingLocationId(location.id);

    setShowAddConsultation(true);

    setError("");
    setSuccess("");
  }

  // =========================
  // Update Consultation
  // =========================

  async function handleUpdateConsultation(event) {
    event.preventDefault();

    if (!profile || editingLocationId === null) {
      return;
    }

    try {
      setSavingConsultation(true);

      setError("");
      setSuccess("");

      const isInPerson = consultationForm.consultationType === "IN_PERSON";

      const locationData = {
        locationName: isInPerson
          ? consultationForm.locationName.trim()
          : "Online Consultation",

        consultationType: consultationForm.consultationType,

        consultationFee: Number(consultationForm.consultationFee),

        active: consultationForm.active,

        address: isInPerson
          ? {
              addressLine: consultationForm.addressLine.trim(),
              city: consultationForm.city.trim(),
              state: consultationForm.state.trim(),
              country: consultationForm.country.trim(),
              pinCode: consultationForm.pinCode.trim(),
            }
          : null,
      };

      const updatedLocation = await updateDoctorLocation(
        profile.id,
        editingLocationId,
        locationData,
        accessToken,
      );

      setLocations((previous) =>
        previous.map((location) =>
          location.id === editingLocationId ? updatedLocation : location,
        ),
      );

      resetConsultationForm();

      setShowAddConsultation(false);

      setSuccess("Consultation updated successfully.");
    } catch (error) {
      console.error("Failed to update consultation:", error);

      setError(error.message || "Unable to update consultation.");
    } finally {
      setSavingConsultation(false);
    }
  }

  // =========================
  // Delete Consultation
  // =========================

  async function handleDeleteLocation(location) {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${location.locationName}"?`,
    );

    if (!confirmed) {
      return;
    }

    try {
      setUpdatingLocationId(location.id);

      setError("");
      setSuccess("");

      await deleteDoctorLocation(profile.id, location.id, accessToken);

      setLocations((previous) =>
        previous.filter((item) => item.id !== location.id),
      );

      if (editingLocationId === location.id) {
        resetConsultationForm();
        setShowAddConsultation(false);
      }

      setSuccess("Consultation deleted successfully.");
    } catch (error) {
      console.error("Failed to delete consultation:", error);

      setError(error.message || "Unable to delete consultation.");
    } finally {
      setUpdatingLocationId(null);
    }
  }

  // =========================
  // Activate / Deactivate
  // =========================

  async function handleToggleLocation(location) {
    if (!profile) {
      return;
    }

    try {
      setUpdatingLocationId(location.id);

      setError("");
      setSuccess("");

      let updatedLocation;

      if (location.active) {
        updatedLocation = await deactivateDoctorLocation(
          profile.id,
          location.id,
          accessToken,
        );
      } else {
        updatedLocation = await activateDoctorLocation(
          profile.id,
          location.id,
          accessToken,
        );
      }

      setLocations((previous) =>
        previous.map((item) =>
          item.id === location.id ? updatedLocation : item,
        ),
      );

      setSuccess(
        location.active
          ? "Consultation deactivated successfully."
          : "Consultation activated successfully.",
      );
    } catch (error) {
      console.error("Failed to update consultation status:", error);

      setError(error.message || "Unable to update consultation status.");
    } finally {
      setUpdatingLocationId(null);
    }
  }

  // =========================
  // Loading
  // =========================

  if (loading) {
    return (
      <div className="doctor-profile-page">
        <div className="doctor-profile-loading">Loading doctor profile...</div>
      </div>
    );
  }

  // =========================
  // Not Logged In
  // =========================

  if (!accessToken) {
    return (
      <div className="doctor-profile-page">
        <div className="doctor-profile-message-card">
          <h2>Please login</h2>

          <p>You need to login to view your doctor profile.</p>
        </div>
      </div>
    );
  }

  // =========================
  // Profile Unavailable
  // =========================

  if (!profile) {
    return (
      <div className="doctor-profile-page">
        <div className="doctor-profile-message-card">
          <h2>Profile unavailable</h2>

          <p>{error || "Unable to load your doctor profile."}</p>
        </div>
      </div>
    );
  }

  // =========================
  // Doctor Profile
  // =========================

  return (
    <div className="doctor-profile-page">
      <div className="doctor-profile-container">
        {/* =========================
            Page Header
        ========================= */}

        <div className="doctor-profile-page-header">
          <div>
            <h1>My Doctor Profile</h1>

            <p>
              Manage your professional information, consultations and
              availability.
            </p>
          </div>

          <button
            className="doctor-profile-back-btn"
            onClick={() => navigate(-1)}
          >
            Back
          </button>
        </div>

        {/* =========================
            Messages
        ========================= */}

        {error && <div className="doctor-profile-error">{error}</div>}

        {success && <div className="doctor-profile-success">{success}</div>}

        {/* =========================
            Profile Card
        ========================= */}

        <div className="doctor-profile-card">
          {/* =========================
              Doctor Identity
          ========================= */}

          <div className="doctor-profile-card-header">
            <div className="doctor-profile-avatar">
              {profile.fullName
                ? profile.fullName.charAt(0).toUpperCase()
                : "D"}
            </div>

            <div className="doctor-profile-identity">
              <h2>{profile.fullName}</h2>

              <p>{profile.email}</p>

              <span className="doctor-profile-role">Doctor</span>
            </div>
          </div>

          {/* =========================
              Professional Information
          ========================= */}

          <div className="doctor-profile-section">
            <div className="doctor-section-heading">
              <div>
                <h3>Professional Information</h3>

                <p>View and update your professional details.</p>
              </div>

              <button
                type="button"
                className="location-edit-btn"
                onClick={
                  showEditProfile
                    ? () => {
                        setShowEditProfile(false);
                        setError("");
                      }
                    : handleOpenEditProfile
                }
                disabled={savingProfile}
              >
                {showEditProfile ? "Cancel Editing" : "Edit Profile"}
              </button>
            </div>

            {/* =========================
                Edit Profile Form
            ========================= */}

            {showEditProfile && (
              <form
                className="doctor-consultation-form"
                onSubmit={handleUpdateProfile}
              >
                <div className="doctor-profile-grid">
                  <div className="doctor-profile-field">
                    <label htmlFor="edit-fullName">Full Name</label>

                    <input
                      id="edit-fullName"
                      type="text"
                      name="fullName"
                      value={profileForm.fullName}
                      onChange={handleProfileFormChange}
                      required
                    />
                  </div>

                  <div className="doctor-profile-field">
                    <label htmlFor="edit-email">
                      Email (Cannot be changed)
                    </label>

                    <input
                      id="edit-email"
                      type="email"
                      value={profile.email || ""}
                      readOnly
                      disabled
                    />
                  </div>

                  <div className="doctor-profile-field">
                    <label htmlFor="edit-phoneNumber">Phone Number</label>

                    <input
                      id="edit-phoneNumber"
                      type="tel"
                      name="phoneNumber"
                      value={profileForm.phoneNumber}
                      onChange={handleProfileFormChange}
                      required
                    />
                  </div>

                  <div className="doctor-profile-field">
                    <label htmlFor="edit-specialization">Specialization</label>

                    <input
                      id="edit-specialization"
                      type="text"
                      name="specialization"
                      value={profileForm.specialization}
                      onChange={handleProfileFormChange}
                      required
                    />
                  </div>

                  <div className="doctor-profile-field">
                    <label htmlFor="edit-qualification">Qualification</label>

                    <input
                      id="edit-qualification"
                      type="text"
                      name="qualification"
                      value={profileForm.qualification}
                      onChange={handleProfileFormChange}
                      required
                    />
                  </div>

                  <div className="doctor-profile-field">
                    <label htmlFor="edit-exp">Years of Experience</label>

                    <input
                      id="edit-exp"
                      type="number"
                      name="exp"
                      value={profileForm.exp}
                      onChange={handleProfileFormChange}
                      min="0"
                      step="1"
                      required
                    />
                  </div>

                  <div className="doctor-profile-field">
                    <label htmlFor="edit-language">Languages</label>

                    <input
                      id="edit-language"
                      type="text"
                      name="language"
                      value={profileForm.language}
                      onChange={handleProfileFormChange}
                      placeholder="e.g. English, Bengali, Hindi"
                      required
                    />
                  </div>
                </div>

                <div className="doctor-consultation-form-actions">
                  <button
                    type="button"
                    className="location-edit-btn"
                    onClick={() => {
                      setShowEditProfile(false);
                      setError("");
                    }}
                    disabled={savingProfile}
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    className="add-consultation-btn"
                    disabled={savingProfile}
                  >
                    {savingProfile ? "Saving..." : "Save Changes"}
                  </button>
                </div>
              </form>
            )}

            {/* =========================
                Profile Information
            ========================= */}

            <div className="doctor-profile-grid">
              <div className="doctor-profile-field">
                <label>Full Name</label>

                <div className="doctor-profile-value">
                  {profile.fullName || "Not provided"}
                </div>
              </div>

              <div className="doctor-profile-field">
                <label>Email</label>

                <div className="doctor-profile-value">
                  {profile.email || "Not provided"}
                </div>
              </div>

              <div className="doctor-profile-field">
                <label>Phone</label>

                <div className="doctor-profile-value">
                  {profile.phoneNumber || "Not provided"}
                </div>
              </div>

              <div className="doctor-profile-field">
                <label>Specialization</label>

                <div className="doctor-profile-value">
                  {profile.specialization || "Not provided"}
                </div>
              </div>

              <div className="doctor-profile-field">
                <label>Qualification</label>

                <div className="doctor-profile-value">
                  {profile.qualification || "Not provided"}
                </div>
              </div>

              <div className="doctor-profile-field">
                <label>Experience</label>

                <div className="doctor-profile-value">
                  {profile.exp !== null && profile.exp !== undefined
                    ? `${profile.exp} years`
                    : "Not provided"}
                </div>
              </div>

              <div className="doctor-profile-field">
                <label>Languages</label>

                <div className="doctor-profile-value">
                  {profile.language || "Not provided"}
                </div>
              </div>

              <div className="doctor-profile-field">
                <label>Profile Status</label>

                <div
                  className={`doctor-status-badge ${
                    profile.profileStatus
                      ? profile.profileStatus.toLowerCase()
                      : ""
                  }`}
                >
                  {profile.profileStatus || "PENDING"}
                </div>
              </div>
            </div>
          </div>

          {/* =========================
              Availability
          ========================= */}

          <div className="doctor-profile-section">
            <h3>Availability</h3>

            <div className="doctor-availability-card">
              <div>
                <span className="doctor-availability-label">
                  Appointment Availability
                </span>

                <p>
                  {profile.availability
                    ? "You are currently available for appointments."
                    : "You are currently unavailable for appointments."}
                </p>
              </div>

              <button
                className={
                  profile.availability
                    ? "availability-disable-btn"
                    : "availability-enable-btn"
                }
                onClick={handleAvailabilityChange}
                disabled={savingAvailability}
              >
                {savingAvailability
                  ? "Updating..."
                  : profile.availability
                    ? "Set Unavailable"
                    : "Set Available"}
              </button>
            </div>
          </div>

          {/* =========================
              Consultation & Locations
          ========================= */}

          <div className="doctor-profile-section">
            <div className="doctor-section-heading">
              <div>
                <h3>Consultation & Locations</h3>

                <p>Manage where and how you provide consultations.</p>
              </div>

              <button
                className="add-consultation-btn"
                onClick={() => {
                  if (showAddConsultation) {
                    setShowAddConsultation(false);
                    resetConsultationForm();
                  } else {
                    resetConsultationForm();
                    setShowAddConsultation(true);
                  }

                  setError("");
                  setSuccess("");
                }}
              >
                {showAddConsultation ? "Cancel" : "+ Add Consultation"}
              </button>
            </div>

            {/* =========================
                Add / Edit Consultation Form
            ========================= */}

            {showAddConsultation && (
              <form
                className="doctor-consultation-form"
                onSubmit={
                  editingLocationId !== null
                    ? handleUpdateConsultation
                    : handleAddConsultation
                }
              >
                <div className="doctor-profile-grid">
                  {/* Consultation Type */}

                  <div className="doctor-profile-field">
                    <label>Consultation Type</label>

                    <select
                      name="consultationType"
                      value={consultationForm.consultationType}
                      onChange={handleConsultationFormChange}
                    >
                      <option value="IN_PERSON">In-Person</option>

                      <option value="VIDEO">Video Consultation</option>
                    </select>
                  </div>

                  {/* Consultation Fee */}

                  <div className="doctor-profile-field">
                    <label>Consultation Fee</label>

                    <input
                      type="number"
                      name="consultationFee"
                      value={consultationForm.consultationFee}
                      onChange={handleConsultationFormChange}
                      min="0"
                      step="0.01"
                      placeholder="e.g. 500"
                      required
                    />
                  </div>

                  {/* In-Person Fields */}

                  {consultationForm.consultationType === "IN_PERSON" && (
                    <>
                      <div className="doctor-profile-field">
                        <label>Location Name</label>

                        <input
                          type="text"
                          name="locationName"
                          value={consultationForm.locationName}
                          onChange={handleConsultationFormChange}
                          placeholder="e.g. Apollo Hospital"
                          required
                        />
                      </div>

                      <div className="doctor-profile-field">
                        <label>Address Line</label>

                        <input
                          type="text"
                          name="addressLine"
                          value={consultationForm.addressLine}
                          onChange={handleConsultationFormChange}
                          placeholder="Enter address"
                          required
                        />
                      </div>

                      <div className="doctor-profile-field">
                        <label>City</label>

                        <input
                          type="text"
                          name="city"
                          value={consultationForm.city}
                          onChange={handleConsultationFormChange}
                          placeholder="e.g. Kolkata"
                          required
                        />
                      </div>

                      <div className="doctor-profile-field">
                        <label>State</label>

                        <input
                          type="text"
                          name="state"
                          value={consultationForm.state}
                          onChange={handleConsultationFormChange}
                          placeholder="e.g. West Bengal"
                          required
                        />
                      </div>

                      <div className="doctor-profile-field">
                        <label>Country</label>

                        <input
                          type="text"
                          name="country"
                          value={consultationForm.country}
                          onChange={handleConsultationFormChange}
                          placeholder="e.g. India"
                          required
                        />
                      </div>

                      <div className="doctor-profile-field">
                        <label>Pin Code</label>

                        <input
                          type="text"
                          name="pinCode"
                          value={consultationForm.pinCode}
                          onChange={handleConsultationFormChange}
                          placeholder="e.g. 700001"
                          required
                        />
                      </div>
                    </>
                  )}
                </div>

                {/* Active Consultation */}

                <div className="doctor-consultation-active">
                  <label>
                    <input
                      type="checkbox"
                      name="active"
                      checked={consultationForm.active}
                      onChange={handleConsultationFormChange}
                    />
                    Active consultation
                  </label>
                </div>

                {/* Form Actions */}

                <div className="doctor-consultation-form-actions">
                  <button
                    type="button"
                    className="location-edit-btn"
                    onClick={() => {
                      setShowAddConsultation(false);
                      resetConsultationForm();
                    }}
                    disabled={savingConsultation}
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    className="add-consultation-btn"
                    disabled={savingConsultation}
                  >
                    {savingConsultation
                      ? "Saving..."
                      : editingLocationId !== null
                        ? "Update Consultation"
                        : "Save Consultation"}
                  </button>
                </div>
              </form>
            )}

            {/* =========================
                Locations List
            ========================= */}

            {locations.length === 0 ? (
              <div className="no-locations">
                <p>No consultation options added yet.</p>
              </div>
            ) : (
              <div className="doctor-locations-list">
                {locations.map((location) => (
                  <div className="doctor-location-card" key={location.id}>
                    {/* Location Header */}

                    <div className="doctor-location-header">
                      <div>
                        <h4>{location.locationName}</h4>

                        <span
                          className={`consultation-type-badge ${
                            location.consultationType
                              ? location.consultationType.toLowerCase()
                              : ""
                          }`}
                        >
                          {location.consultationType === "IN_PERSON"
                            ? "In-Person"
                            : "Video Consultation"}
                        </span>
                      </div>

                      <span
                        className={
                          location.active
                            ? "location-active"
                            : "location-inactive"
                        }
                      >
                        {location.active ? "Active" : "Inactive"}
                      </span>
                    </div>

                    {/* Location Information */}

                    <div className="doctor-location-info">
                      <div>
                        <span>Consultation Fee</span>

                        <strong>₹{location.consultationFee}</strong>
                      </div>

                      {/* Address only for In-Person */}

                      {location.consultationType === "IN_PERSON" &&
                        location.address && (
                          <div>
                            <span>Address</span>

                            <strong>
                              {location.address.addressLine}
                              {", "}
                              {location.address.city}
                              {", "}
                              {location.address.state}
                              {", "}
                              {location.address.country}
                              {" - "}
                              {location.address.pinCode}
                            </strong>
                          </div>
                        )}
                    </div>

                    {/* Location Actions */}

                    <div className="doctor-location-actions">
                      {/* Edit */}

                      <button
                        className="location-edit-btn"
                        onClick={() => handleEditLocation(location)}
                        disabled={updatingLocationId === location.id}
                      >
                        Edit
                      </button>

                      {/* Activate / Deactivate */}

                      <button
                        className={
                          location.active
                            ? "location-deactivate-btn"
                            : "location-activate-btn"
                        }
                        onClick={() => handleToggleLocation(location)}
                        disabled={updatingLocationId === location.id}
                      >
                        {updatingLocationId === location.id
                          ? "Updating..."
                          : location.active
                            ? "Deactivate"
                            : "Activate"}
                      </button>

                      {/* Delete */}

                      <button
                        className="location-delete-btn"
                        onClick={() => handleDeleteLocation(location)}
                        disabled={updatingLocationId === location.id}
                      >
                        {updatingLocationId === location.id
                          ? "Deleting..."
                          : "Delete"}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default DoctorProfile;
