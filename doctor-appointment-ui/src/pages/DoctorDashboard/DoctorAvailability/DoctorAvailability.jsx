import { useCallback, useEffect, useState } from "react";
import "./DoctorAvailability.css";

import {
  fetchDoctorProfile,
  fetchDoctorLocations,
} from "../DoctorDashboard.js";

import {
  fetchSchedules,
  createSchedule,
  updateSchedule,
  deleteSchedule,
} from "./DoctorAvailability.js";

const DAYS_OF_WEEK = [
  "MONDAY",
  "TUESDAY",
  "WEDNESDAY",
  "THURSDAY",
  "FRIDAY",
  "SATURDAY",
  "SUNDAY",
];

const EMPTY_FORM = {
  dayOfWeek: "MONDAY",
  startTime: "09:00",
  endTime: "17:00",
};

function formatDay(day) {
  if (!day) return "Unknown day";
  return day.charAt(0) + day.slice(1).toLowerCase();
}

function formatTime(time) {
  if (!time) return "Not specified";

  const [hours, minutes] = String(time).split(":");
  const date = new Date();

  date.setHours(Number(hours), Number(minutes), 0, 0);

  return date.toLocaleTimeString("en-IN", {
    hour: "numeric",
    minute: "2-digit",
  });
}

function getLocationType(location) {
  const type =
    location?.consultationType ||
    location?.locationType ||
    location?.type ||
    "";

  if (type === "VIDEO") return "Video consultation";
  if (type === "IN_PERSON") return "In-person consultation";

  return type || "Consultation location";
}

function formatAddress(address) {
  if (!address) return "";

  if (typeof address === "string") return address;

  if (typeof address === "object") {
    return [
      address.addressLine,
      address.city,
      address.state,
      address.pinCode,
      address.country,
    ]
      .filter(Boolean)
      .join(", ");
  }

  return "";
}

function getLocationAddress(location) {
  return (
    formatAddress(location?.address) ||
    [
      location?.addressLine,
      location?.city,
      location?.state,
      location?.pinCode,
      location?.country,
    ]
      .filter(Boolean)
      .join(", ")
  );
}

function getLocationLabel(location) {
  if (!location) return "Select a consultation location";

  return [getLocationType(location), getLocationAddress(location)]
    .filter(Boolean)
    .join(" — ");
}

function DoctorAvailability({ onClose }) {
  const [doctor, setDoctor] = useState(null);
  const [locations, setLocations] = useState([]);
  const [selectedLocationId, setSelectedLocationId] = useState("");
  const [schedules, setSchedules] = useState([]);

  // Form used only for adding a new schedule.
  const [form, setForm] = useState(EMPTY_FORM);

  // Separate form used for inline schedule editing.
  const [editingForm, setEditingForm] = useState(EMPTY_FORM);
  const [editingScheduleId, setEditingScheduleId] = useState(null);

  const [loading, setLoading] = useState(true);
  const [loadingSchedules, setLoadingSchedules] = useState(false);
  const [saving, setSaving] = useState(false);
  const [updatingScheduleId, setUpdatingScheduleId] = useState(null);
  const [deletingScheduleId, setDeletingScheduleId] = useState(null);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const isBusy =
    saving || updatingScheduleId !== null || deletingScheduleId !== null;

  useEffect(() => {
    if (!success && !error) return;

    const timeoutId = setTimeout(() => {
      setSuccess("");
      setError("");
    }, 5000);

    return () => clearTimeout(timeoutId);
  }, [success, error]);

  const loadSchedules = useCallback(async (doctorId, locationId) => {
    if (!doctorId || !locationId) {
      setSchedules([]);
      return;
    }

    try {
      setLoadingSchedules(true);
      setError("");

      const data = await fetchSchedules(doctorId, locationId);
      setSchedules(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Error loading doctor schedules:", err);
      setSchedules([]);
      setError(err.message || "Unable to load schedules.");
    } finally {
      setLoadingSchedules(false);
    }
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function initialize() {
      try {
        setLoading(true);
        setError("");

        const profile = await fetchDoctorProfile();

        if (!profile?.id) {
          throw new Error(
            "Your doctor profile could not be identified. Please log in again.",
          );
        }

        const doctorLocations = await fetchDoctorLocations(profile.id);

        if (cancelled) return;

        setDoctor(profile);

        const locationList = Array.isArray(doctorLocations)
          ? doctorLocations
          : [];

        setLocations(locationList);

        if (locationList.length > 0) {
          setSelectedLocationId(String(locationList[0].id));
        }
      } catch (err) {
        if (!cancelled) {
          console.error("Error initializing availability:", err);
          setError(
            err.message || "Unable to load your doctor profile and locations.",
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    initialize();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (doctor?.id && selectedLocationId) {
      loadSchedules(doctor.id, selectedLocationId);
    } else {
      setSchedules([]);
    }
  }, [doctor?.id, selectedLocationId, loadSchedules]);

  function handleFormChange(event) {
    const { name, value } = event.target;

    setForm((current) => ({
      ...current,
      [name]: value,
    }));
  }

  function handleEditingFormChange(event) {
    const { name, value } = event.target;

    setEditingForm((current) => ({
      ...current,
      [name]: value,
    }));
  }

  function resetForm() {
    setForm(EMPTY_FORM);
  }

  function cancelEditing() {
    if (isBusy) return;

    setEditingScheduleId(null);
    setEditingForm(EMPTY_FORM);
  }

  function startEditing(schedule) {
    if (isBusy) return;

    setEditingScheduleId(schedule.id);

    setEditingForm({
      dayOfWeek: schedule.dayOfWeek || "MONDAY",
      startTime: String(schedule.startTime || "09:00:00").slice(0, 5),
      endTime: String(schedule.endTime || "17:00:00").slice(0, 5),
    });

    setError("");
    setSuccess("");
  }

  async function handleSubmit(event) {
    event.preventDefault();

    if (isBusy) return;

    if (!doctor?.id || !selectedLocationId) {
      setError("Please select a consultation location first.");
      return;
    }

    if (form.startTime >= form.endTime) {
      setError("End time must be later than start time.");
      return;
    }

    const payload = {
      dayOfWeek: form.dayOfWeek,
      startTime: `${form.startTime}:00`,
      endTime: `${form.endTime}:00`,
    };

    try {
      setSaving(true);
      setError("");
      setSuccess("");

      await createSchedule(doctor.id, selectedLocationId, payload);

      setSuccess("Schedule added successfully.");
      resetForm();

      await loadSchedules(doctor.id, selectedLocationId);
    } catch (err) {
      console.error("Error adding schedule:", err);
      setError(err.message || "Unable to add the schedule.");
    } finally {
      setSaving(false);
    }
  }

  async function handleUpdateSchedule(scheduleId) {
    if (isBusy) return;

    if (!doctor?.id || !selectedLocationId) {
      setError("Please select a consultation location first.");
      return;
    }

    if (editingForm.startTime >= editingForm.endTime) {
      setError("End time must be later than start time.");
      return;
    }

    const payload = {
      dayOfWeek: editingForm.dayOfWeek,
      startTime: `${editingForm.startTime}:00`,
      endTime: `${editingForm.endTime}:00`,
    };

    try {
      setUpdatingScheduleId(scheduleId);
      setError("");
      setSuccess("");

      await updateSchedule(doctor.id, selectedLocationId, scheduleId, payload);

      setEditingScheduleId(null);
      setEditingForm(EMPTY_FORM);
      setSuccess("Schedule updated successfully.");

      await loadSchedules(doctor.id, selectedLocationId);
    } catch (err) {
      console.error("Error updating schedule:", err);
      setError(err.message || "Unable to update the schedule.");
    } finally {
      setUpdatingScheduleId(null);
    }
  }

  async function handleDelete(scheduleId) {
    if (isBusy) return;

    const confirmed = window.confirm(
      "Are you sure you want to delete this schedule?",
    );

    if (!confirmed) return;

    try {
      setDeletingScheduleId(scheduleId);
      setError("");
      setSuccess("");

      await deleteSchedule(doctor.id, selectedLocationId, scheduleId);

      setSchedules((current) =>
        current.filter(
          (schedule) => String(schedule.id) !== String(scheduleId),
        ),
      );

      if (String(editingScheduleId) === String(scheduleId)) {
        setEditingScheduleId(null);
        setEditingForm(EMPTY_FORM);
      }

      setSuccess("Schedule deleted successfully.");
    } catch (err) {
      console.error("Error deleting schedule:", err);
      setError(err.message || "Unable to delete the schedule.");
    } finally {
      setDeletingScheduleId(null);
    }
  }

  function handleLocationChange(event) {
    if (isBusy) return;

    setSelectedLocationId(event.target.value);
    setSchedules([]);
    setEditingScheduleId(null);
    setEditingForm(EMPTY_FORM);
    resetForm();
    setError("");
    setSuccess("");
  }

  function selectLocation(location) {
    if (isBusy) return;

    setSelectedLocationId(String(location.id));
    setSchedules([]);
    setEditingScheduleId(null);
    setEditingForm(EMPTY_FORM);
    resetForm();
    setError("");
    setSuccess("");
  }

  const selectedLocation = locations.find(
    (location) => String(location.id) === String(selectedLocationId),
  );

  const sortedSchedules = [...schedules].sort(
    (a, b) =>
      DAYS_OF_WEEK.indexOf(a.dayOfWeek) - DAYS_OF_WEEK.indexOf(b.dayOfWeek),
  );

  if (loading) {
    return (
      <main className="availability-page">
        <div className="availability-loading">
          <span className="availability-spinner" />
          <h2>Preparing your workspace</h2>
          <p>Loading your profile and consultation schedules...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="availability-page">
      <div className="availability-container">
        <header className="availability-header">
          <div className="availability-heading-content">
            <div className="availability-breadcrumb">
              <span className="availability-breadcrumb-dot" />
              MEDICARE <span>/</span> DOCTOR WORKSPACE
            </div>

            <h1>Manage availability</h1>

            <p>
              Create your weekly working hours so patients know when they can
              book an appointment with you.
            </p>
          </div>

          <button
            type="button"
            className="availability-back-btn"
            onClick={onClose}
            disabled={isBusy}
          >
            <span aria-hidden="true">←</span>
            Back to dashboard
          </button>
        </header>

        {error && (
          <div
            className="availability-alert availability-alert-error"
            role="alert"
          >
            <span className="availability-alert-icon" aria-hidden="true">
              !
            </span>

            <span className="availability-alert-message">{error}</span>

            <button
              type="button"
              onClick={() => setError("")}
              aria-label="Dismiss error"
            >
              ×
            </button>
          </div>
        )}

        {success && (
          <div
            className="availability-alert availability-alert-success"
            role="status"
          >
            <span className="availability-alert-icon" aria-hidden="true">
              ✓
            </span>

            <span className="availability-alert-message">{success}</span>

            <button
              type="button"
              onClick={() => setSuccess("")}
              aria-label="Dismiss success message"
            >
              ×
            </button>
          </div>
        )}

        {!doctor && !error && (
          <section className="availability-empty">
            <div className="availability-empty-icon">!</div>
            <h2>Doctor profile unavailable</h2>
            <p>Please log in again and reopen Manage Availability.</p>
          </section>
        )}

        {doctor && (
          <>
            <section className="availability-profile-card">
              <div className="availability-profile-main">
                <div className="availability-profile-avatar">
                  {doctor.fullName?.trim()?.charAt(0)?.toUpperCase() || "D"}
                </div>

                <div className="availability-profile-info">
                  <span className="availability-small-label">
                    YOUR PROFESSIONAL PROFILE
                  </span>

                  <h2>{doctor.fullName || "Doctor profile"}</h2>

                  <p>
                    {doctor.specialization || "Medical professional"}
                    {doctor.qualification ? ` · ${doctor.qualification}` : ""}
                  </p>
                </div>
              </div>

              {doctor.profileStatus && (
                <span
                  className={`availability-profile-status availability-status-${String(
                    doctor.profileStatus,
                  ).toLowerCase()}`}
                >
                  <span />
                  {formatDay(String(doctor.profileStatus))}
                </span>
              )}
            </section>

            <section className="availability-stats">
              <article className="availability-stat-card">
                <div className="availability-stat-icon availability-stat-icon-teal">
                  <span aria-hidden="true">⌂</span>
                </div>
                <div>
                  <span>Consultation locations</span>
                  <strong>{locations.length}</strong>
                </div>
              </article>

              <article className="availability-stat-card">
                <div className="availability-stat-icon availability-stat-icon-blue">
                  <span aria-hidden="true">▦</span>
                </div>
                <div>
                  <span>Working-hour schedules</span>
                  <strong>{schedules.length}</strong>
                </div>
              </article>

              <article className="availability-stat-card">
                <div className="availability-stat-icon availability-stat-icon-purple">
                  <span aria-hidden="true">◷</span>
                </div>
                <div>
                  <span>Selected consultation</span>
                  <strong className="availability-stat-location">
                    {selectedLocation
                      ? getLocationType(selectedLocation)
                      : "Not selected"}
                  </strong>
                </div>
              </article>
            </section>

            {locations.length > 0 && (
              <section className="availability-locations-section">
                <div className="availability-locations-heading">
                  <div>
                    <span className="availability-small-label">
                      YOUR CONSULTATION OPTIONS
                    </span>
                    <h2>Consultation locations</h2>
                    <p>Select a location to manage its working hours.</p>
                  </div>

                  <span className="availability-count">{locations.length}</span>
                </div>

                <div className="availability-location-cards">
                  {locations.map((location, index) => {
                    const isSelected =
                      String(location.id) === String(selectedLocationId);

                    const address = getLocationAddress(location);
                    const type = getLocationType(location);

                    return (
                      <button
                        type="button"
                        key={location.id}
                        className={`availability-location-card ${
                          isSelected
                            ? "availability-location-card-selected"
                            : ""
                        }`}
                        onClick={() => selectLocation(location)}
                        disabled={isBusy}
                        aria-pressed={isSelected}
                      >
                        <span className="availability-location-card-icon">
                          {type === "Video consultation" ? "▣" : "⌂"}
                        </span>

                        <span className="availability-location-card-content">
                          <span className="availability-location-card-topline">
                            <strong>{type}</strong>
                            {isSelected && (
                              <span className="availability-location-selected-badge">
                                Selected
                              </span>
                            )}
                          </span>

                          <span className="availability-location-card-address">
                            {address || `Location ${index + 1}`}
                          </span>

                          {location.fee != null && (
                            <span className="availability-location-card-fee">
                              Consultation fee: ₹{location.fee}
                            </span>
                          )}
                        </span>

                        <span
                          className="availability-location-card-arrow"
                          aria-hidden="true"
                        >
                          →
                        </span>
                      </button>
                    );
                  })}
                </div>
              </section>
            )}

            {locations.length === 0 ? (
              <section className="availability-empty">
                <div className="availability-empty-icon">⌂</div>
                <h2>No consultation locations yet</h2>
                <p>
                  Add a consultation location to your doctor profile before
                  setting its working hours.
                </p>
              </section>
            ) : (
              <div className="availability-layout">
                <section className="availability-panel availability-form-panel">
                  <div className="availability-panel-heading">
                    <div>
                      <span className="availability-small-label">
                        SET YOUR HOURS
                      </span>

                      <h2>Add working hours</h2>

                      <p className="availability-panel-subtitle">
                        Choose a location, day and time range.
                      </p>
                    </div>

                    <div className="availability-heading-icon">+</div>
                  </div>

                  <form onSubmit={handleSubmit} className="availability-form">
                    <div className="availability-field">
                      <label htmlFor="availability-location">
                        Consultation location
                      </label>

                      <select
                        id="availability-location"
                        value={selectedLocationId}
                        onChange={handleLocationChange}
                        required
                        disabled={isBusy}
                      >
                        {locations.map((location, index) => (
                          <option key={location.id} value={location.id}>
                            {getLocationLabel(location) ||
                              `Location ${index + 1}`}
                          </option>
                        ))}
                      </select>

                      <p className="availability-field-help">
                        Working hours are saved separately for each location.
                      </p>
                    </div>

                    {selectedLocation && (
                      <div className="availability-selected-location">
                        <div className="availability-selected-location-icon">
                          {getLocationType(selectedLocation) ===
                          "Video consultation"
                            ? "▣"
                            : "⌂"}
                        </div>

                        <div>
                          <span>Selected location</span>
                          <strong>{getLocationType(selectedLocation)}</strong>

                          {getLocationAddress(selectedLocation) && (
                            <p>{getLocationAddress(selectedLocation)}</p>
                          )}
                        </div>
                      </div>
                    )}

                    <div className="availability-field">
                      <label htmlFor="availability-day">Day of the week</label>

                      <select
                        id="availability-day"
                        name="dayOfWeek"
                        value={form.dayOfWeek}
                        onChange={handleFormChange}
                        required
                        disabled={isBusy}
                      >
                        {DAYS_OF_WEEK.map((day) => (
                          <option key={day} value={day}>
                            {formatDay(day)}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="availability-time-section">
                      <div className="availability-time-section-heading">
                        <label>Consultation hours</label>
                        <span>24-hour time input</span>
                      </div>

                      <div className="availability-time-fields">
                        <div className="availability-field">
                          <label htmlFor="availability-start">Start time</label>

                          <input
                            id="availability-start"
                            type="time"
                            name="startTime"
                            value={form.startTime}
                            onChange={handleFormChange}
                            required
                            disabled={isBusy}
                          />
                        </div>

                        <div className="availability-field">
                          <label htmlFor="availability-end">End time</label>

                          <input
                            id="availability-end"
                            type="time"
                            name="endTime"
                            value={form.endTime}
                            onChange={handleFormChange}
                            required
                            disabled={isBusy}
                          />
                        </div>
                      </div>

                      <p className="availability-form-hint">
                        The end time must be later than the start time.
                      </p>
                    </div>

                    <button
                      type="submit"
                      className="availability-save-btn"
                      disabled={isBusy || !selectedLocationId}
                    >
                      {saving ? (
                        <>
                          <span className="availability-button-spinner" />
                          Adding schedule...
                        </>
                      ) : (
                        <>
                          <span aria-hidden="true">+</span>
                          Add working hours
                        </>
                      )}
                    </button>
                  </form>

                  <div className="availability-form-footer">
                    <span aria-hidden="true">ⓘ</span>
                    Only add the hours when you are available for appointments.
                  </div>
                </section>

                <section className="availability-panel availability-schedules-panel">
                  <div className="availability-panel-heading">
                    <div>
                      <span className="availability-small-label">
                        YOUR WEEKLY PLAN
                      </span>

                      <h2>Working schedules</h2>

                      <p className="availability-panel-subtitle">
                        Review and manage your available hours.
                      </p>
                    </div>

                    <span className="availability-count">
                      {schedules.length}
                    </span>
                  </div>

                  <div className="availability-current-location">
                    <div className="availability-current-location-icon">
                      {getLocationType(selectedLocation) ===
                      "Video consultation"
                        ? "▣"
                        : "⌂"}
                    </div>

                    <div>
                      <span>Showing schedules for</span>
                      <strong>
                        {selectedLocation
                          ? getLocationType(selectedLocation)
                          : "Selected location"}
                      </strong>

                      <p>
                        {getLocationAddress(selectedLocation) ||
                          "Manage the working hours for this location."}
                      </p>
                    </div>
                  </div>

                  {loadingSchedules ? (
                    <div className="availability-inline-loading">
                      <span className="availability-spinner" />
                      <span>Loading your schedules...</span>
                    </div>
                  ) : schedules.length === 0 ? (
                    <div className="availability-schedules-empty">
                      <div className="availability-empty-calendar">
                        <span aria-hidden="true">▦</span>
                      </div>

                      <h3>No working hours added</h3>

                      <p>
                        This location doesn't have a schedule yet. Use the form
                        to add your first available day and time.
                      </p>
                    </div>
                  ) : (
                    <div className="availability-schedule-list">
                      {sortedSchedules.map((schedule) => {
                        const isEditing =
                          String(editingScheduleId) === String(schedule.id);

                        const isUpdating =
                          String(updatingScheduleId) === String(schedule.id);

                        const isDeleting =
                          String(deletingScheduleId) === String(schedule.id);

                        return (
                          <article
                            className={`availability-schedule-card ${
                              isEditing
                                ? "availability-schedule-card-editing"
                                : ""
                            }`}
                            key={schedule.id}
                          >
                            <div className="availability-day-icon">
                              <span aria-hidden="true">▦</span>
                            </div>

                            {isEditing ? (
                              <div className="availability-inline-edit-fields">
                                <div className="availability-inline-edit-field">
                                  <label htmlFor={`edit-day-${schedule.id}`}>
                                    Day
                                  </label>

                                  <select
                                    id={`edit-day-${schedule.id}`}
                                    name="dayOfWeek"
                                    value={editingForm.dayOfWeek}
                                    onChange={handleEditingFormChange}
                                    disabled={isBusy}
                                  >
                                    {DAYS_OF_WEEK.map((day) => (
                                      <option key={day} value={day}>
                                        {formatDay(day)}
                                      </option>
                                    ))}
                                  </select>
                                </div>

                                <div className="availability-inline-edit-times">
                                  <div className="availability-inline-edit-field">
                                    <label
                                      htmlFor={`edit-start-${schedule.id}`}
                                    >
                                      Start time
                                    </label>

                                    <input
                                      id={`edit-start-${schedule.id}`}
                                      type="time"
                                      name="startTime"
                                      value={editingForm.startTime}
                                      onChange={handleEditingFormChange}
                                      disabled={isBusy}
                                    />
                                  </div>

                                  <div className="availability-inline-edit-field">
                                    <label htmlFor={`edit-end-${schedule.id}`}>
                                      End time
                                    </label>

                                    <input
                                      id={`edit-end-${schedule.id}`}
                                      type="time"
                                      name="endTime"
                                      value={editingForm.endTime}
                                      onChange={handleEditingFormChange}
                                      disabled={isBusy}
                                    />
                                  </div>
                                </div>
                              </div>
                            ) : (
                              <div className="availability-schedule-details">
                                <div className="availability-schedule-title-row">
                                  <h3>{formatDay(schedule.dayOfWeek)}</h3>
                                  <span className="availability-schedule-badge">
                                    Scheduled
                                  </span>
                                </div>

                                <p className="availability-schedule-time">
                                  <span className="availability-clock-icon">
                                    ◷
                                  </span>
                                  {formatTime(schedule.startTime)}
                                  <span className="availability-time-separator">
                                    to
                                  </span>
                                  {formatTime(schedule.endTime)}
                                </p>
                              </div>
                            )}

                            <div className="availability-schedule-actions">
                              {isEditing ? (
                                <>
                                  <button
                                    type="button"
                                    className="availability-save-btn"
                                    onClick={() =>
                                      handleUpdateSchedule(schedule.id)
                                    }
                                    disabled={isBusy}
                                  >
                                    {isUpdating ? (
                                      <>
                                        <span className="availability-button-spinner" />
                                        Saving...
                                      </>
                                    ) : (
                                      "Save"
                                    )}
                                  </button>

                                  <button
                                    type="button"
                                    className="availability-cancel-edit-btn"
                                    onClick={cancelEditing}
                                    disabled={isBusy}
                                  >
                                    Cancel
                                  </button>
                                </>
                              ) : (
                                <>
                                  <button
                                    type="button"
                                    className="availability-edit-btn"
                                    onClick={() => startEditing(schedule)}
                                    disabled={isBusy}
                                  >
                                    Edit
                                  </button>

                                  <button
                                    type="button"
                                    className="availability-delete-btn"
                                    onClick={() => handleDelete(schedule.id)}
                                    disabled={isBusy}
                                  >
                                    {isDeleting ? "Deleting..." : "Delete"}
                                  </button>
                                </>
                              )}
                            </div>
                          </article>
                        );
                      })}
                    </div>
                  )}

                  {!loadingSchedules && schedules.length > 0 && (
                    <div className="availability-schedule-footer">
                      <span aria-hidden="true">✓</span>
                      <p>
                        You have {schedules.length}{" "}
                        {schedules.length === 1 ? "schedule" : "schedules"}{" "}
                        configured for this location.
                      </p>
                    </div>
                  )}
                </section>
              </div>
            )}
          </>
        )}
      </div>
    </main>
  );
}

export default DoctorAvailability;
