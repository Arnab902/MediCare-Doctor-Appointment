import "./Profile.css";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { fetchMyProfile, updateMyProfile } from "./Profile.js";

function Profile() {
  const navigate = useNavigate();

  const [profile, setProfile] = useState(null);

  const [editMode, setEditMode] = useState(false);

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    pincode: "",
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const accessToken = sessionStorage.getItem("accessToken");

  useEffect(() => {
    async function loadProfile() {
      try {
        setError("");

        const data = await fetchMyProfile(accessToken);

        setProfile(data);

        setFormData({
          fullName: data.fullName || "",
          email: data.email || "",
          phone: data.phone || "",
          address: data.address || "",
          city: data.city || "",
          state: data.state || "",
          pincode: data.pincode || "",
        });
      } catch (error) {
        console.error("Failed to load profile:", error);

        setError("Unable to load your profile.");
      } finally {
        setLoading(false);
      }
    }

    if (accessToken) {
      loadProfile();
    } else {
      setLoading(false);
    }
  }, [accessToken]);

  function handleChange(event) {
    const { name, value } = event.target;

    setFormData((previousData) => ({
      ...previousData,
      [name]: value,
    }));
  }

  function handleEdit() {
    setSuccess("");
    setError("");

    setEditMode(true);
  }

  function handleCancel() {
    setFormData({
      fullName: profile.fullName || "",
      email: profile.email || "",
      phone: profile.phone || "",
      address: profile.address || "",
      city: profile.city || "",
      state: profile.state || "",
      pincode: profile.pincode || "",
    });

    setError("");
    setSuccess("");

    setEditMode(false);
  }

  async function handleSave() {
    try {
      setSaving(true);

      setError("");
      setSuccess("");

      const updatedProfile = await updateMyProfile(
        profile.id,
        formData,
        accessToken,
      );

      setProfile(updatedProfile);

      setFormData({
        fullName: updatedProfile.fullName || "",
        email: updatedProfile.email || "",
        phone: updatedProfile.phone || "",
        address: updatedProfile.address || "",
        city: updatedProfile.city || "",
        state: updatedProfile.state || "",
        pincode: updatedProfile.pincode || "",
      });

      setEditMode(false);

      setSuccess("Profile updated successfully.");
    } catch (error) {
      console.error("Failed to update profile:", error);

      setError(error.message || "Unable to update your profile.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="profile-page">
        <div className="profile-loading">Loading profile...</div>
      </div>
    );
  }

  if (!accessToken) {
    return (
      <div className="profile-page">
        <div className="profile-message-card">
          <h2>Please login</h2>

          <p>You need to login to view your profile.</p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="profile-page">
        <div className="profile-message-card">
          <h2>Profile unavailable</h2>

          <p>{error || "Unable to load your profile."}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="profile-page">
      <div className="profile-container">
        {/* Page Header */}
        <div className="profile-page-header">
          <h1>My Profile</h1>

          <p>Manage your personal information</p>
        </div>

        {/* Profile Card */}
        <div className="profile-card">
          {/* Profile Header */}
          <div className="profile-card-header">
            <div className="profile-avatar">
              {profile.fullName
                ? profile.fullName.charAt(0).toUpperCase()
                : "U"}
            </div>

            <div className="profile-identity">
              <h2>{profile.fullName}</h2>

              <p>{profile.email}</p>
            </div>
          </div>

          {/* Messages */}
          {error && <div className="profile-error">{error}</div>}

          {success && <div className="profile-success">{success}</div>}

          {/* Personal Information */}
          <div className="profile-section">
            <h3>Personal Information</h3>

            <div className="profile-grid">
              {/* Full Name */}
              <div className="profile-field">
                <label>Full Name</label>

                {editMode ? (
                  <input
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleChange}
                  />
                ) : (
                  <div className="profile-value">
                    {profile.fullName || "Not provided"}
                  </div>
                )}
              </div>

              {/* Email */}
              <div className="profile-field">
                <label>Email</label>

                {editMode ? (
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                  />
                ) : (
                  <div className="profile-value">
                    {profile.email || "Not provided"}
                  </div>
                )}
              </div>

              {/* Phone */}
              <div className="profile-field">
                <label>Phone</label>

                {editMode ? (
                  <input
                    type="text"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                  />
                ) : (
                  <div className="profile-value">
                    {profile.phone || "Not provided"}
                  </div>
                )}
              </div>

              {/* Pincode */}
              <div className="profile-field">
                <label>Pincode</label>

                {editMode ? (
                  <input
                    type="text"
                    name="pincode"
                    value={formData.pincode}
                    onChange={handleChange}
                  />
                ) : (
                  <div className="profile-value">
                    {profile.pincode || "Not provided"}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Address Information */}
          <div className="profile-section">
            <h3>Address Information</h3>

            <div className="profile-grid">
              {/* Address */}
              <div className="profile-field profile-field-full">
                <label>Address</label>

                {editMode ? (
                  <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                  />
                ) : (
                  <div className="profile-value">
                    {profile.address || "Not provided"}
                  </div>
                )}
              </div>

              {/* City */}
              <div className="profile-field">
                <label>City</label>

                {editMode ? (
                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                  />
                ) : (
                  <div className="profile-value">
                    {profile.city || "Not provided"}
                  </div>
                )}
              </div>

              {/* State */}
              <div className="profile-field">
                <label>State</label>

                {editMode ? (
                  <input
                    type="text"
                    name="state"
                    value={formData.state}
                    onChange={handleChange}
                  />
                ) : (
                  <div className="profile-value">
                    {profile.state || "Not provided"}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Bottom Actions */}
          <div className="profile-actions">
            {editMode ? (
              <>
                <button
                  className="back-btn"
                  onClick={handleCancel}
                  disabled={saving}
                >
                  Cancel
                </button>

                <button
                  className="save-btn"
                  onClick={handleSave}
                  disabled={saving}
                >
                  {saving ? "Saving..." : "Save Changes"}
                </button>
              </>
            ) : (
              <>
                <button className="back-btn" onClick={() => navigate(-1)}>
                  Back
                </button>

                <button className="edit-profile-btn" onClick={handleEdit}>
                  Edit Profile
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Profile;
