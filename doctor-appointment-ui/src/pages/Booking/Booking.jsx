import "./Booking.css";
import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

import {
  fetchDoctorById,
  fetchMyProfiles,
  updatePatientProfile,
  createFamilyPatient,
  handleLocationSelect,
  handleDateSelect,
  handleTimeSelect,
  handleBooking,
  generateAvailableDates,
  getAvailableTimeSlots,
} from "./Booking.js";

function Booking() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const doctorId = searchParams.get("doctorId");

  const [doctor, setDoctor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [selectedLocationId, setSelectedLocationId] = useState(null);
  const [consultationType, setConsultationType] = useState("");

  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");

  // Patient selection
  const [bookingFor, setBookingFor] = useState("");

  const [myProfiles, setMyProfiles] = useState([]);
  const [selectedPatientId, setSelectedPatientId] = useState(null);

  const [patientProfilesLoading, setPatientProfilesLoading] = useState(false);

  const [isNewPatient, setIsNewPatient] = useState(false);

  // Patient details
  const [patientName, setPatientName] = useState("");
  const [patientEmail, setPatientEmail] = useState("");
  const [patientPhone, setPatientPhone] = useState("");

  const [relationship, setRelationship] = useState("");

  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [pincode, setPincode] = useState("");

  const [reason, setReason] = useState("");

  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookingError, setBookingError] = useState("");

  // SELF patient profile editing
  const [isEditingSelfProfile, setIsEditingSelfProfile] = useState(false);

  const [patientUpdateLoading, setPatientUpdateLoading] = useState(false);

  const [selfProfileBackup, setSelfProfileBackup] = useState(null);

  const availableDates = generateAvailableDates();
  const availableTimeSlots = getAvailableTimeSlots(selectedDate);

  useEffect(() => {
    loadDoctor();
  }, [doctorId]);

  async function loadDoctor() {
    try {
      setLoading(true);
      setError("");

      if (!doctorId) {
        throw new Error("Doctor ID is missing");
      }

      const data = await fetchDoctorById(doctorId);

      setDoctor(data);

      const activeLocations = (data.locations || []).filter(
        (location) => location.active,
      );

      if (activeLocations.length > 0) {
        const firstLocation = activeLocations[0];

        setSelectedLocationId(firstLocation.id);

        setConsultationType(
          firstLocation.consultationType === "VIDEO" ? "Video" : "In-person",
        );
      }
    } catch (error) {
      console.error(error);
      setError(error.message || "Unable to load doctor information.");
    } finally {
      setLoading(false);
    }
  }

  function clearPatientDetails() {
    setSelectedPatientId(null);

    setPatientName("");
    setPatientEmail("");
    setPatientPhone("");

    setRelationship("");

    setAddress("");
    setCity("");
    setState("");
    setPincode("");

    setIsEditingSelfProfile(false);
    setSelfProfileBackup(null);
  }

  async function handleBookingForChange(value) {
    setBookingFor(value);
    setBookingError("");

    clearPatientDetails();
    setIsNewPatient(false);

    if (!value) {
      return;
    }

    try {
      setPatientProfilesLoading(true);

      const profiles = await fetchMyProfiles();

      setMyProfiles(profiles);

      if (value === "SELF") {
        const selfProfile = profiles.find(
          (profile) => profile.relationship?.toUpperCase() === "SELF",
        );

        if (selfProfile) {
          setSelectedPatientId(selfProfile.id);
          setIsNewPatient(false);

          setPatientName(selfProfile.fullName || "");
          setPatientEmail(selfProfile.email || "");
          setPatientPhone(selfProfile.phone || "");

          setAddress(selfProfile.address || "");
          setCity(selfProfile.city || "");
          setState(selfProfile.state || "");
          setPincode(selfProfile.pincode || "");
        } else {
          setIsNewPatient(true);
        }
      }
    } catch (error) {
      console.error("Failed to load patient profiles:", error);

      setBookingError(error.message || "Unable to load your patient profiles.");
    } finally {
      setPatientProfilesLoading(false);
    }
  }

  function handleEditSelfProfile() {
    setSelfProfileBackup({
      patientName,
      patientPhone,
      address,
      city,
      state,
      pincode,
    });

    setIsEditingSelfProfile(true);
    setBookingError("");
  }

  function handleCancelSelfProfileEdit() {
    if (selfProfileBackup) {
      setPatientName(selfProfileBackup.patientName);
      setPatientPhone(selfProfileBackup.patientPhone);
      setAddress(selfProfileBackup.address);
      setCity(selfProfileBackup.city);
      setState(selfProfileBackup.state);
      setPincode(selfProfileBackup.pincode);
    }

    setIsEditingSelfProfile(false);
    setSelfProfileBackup(null);
    setBookingError("");
  }

  async function handleSaveSelfProfile() {
    if (!selectedPatientId) {
      setBookingError("Unable to identify your patient profile.");
      return;
    }

    if (!patientName.trim()) {
      setBookingError("Please enter your full name.");
      return;
    }

    if (!patientPhone.trim()) {
      setBookingError("Please enter your phone number.");
      return;
    }

    try {
      setPatientUpdateLoading(true);
      setBookingError("");

      const updatedProfile = await updatePatientProfile(
        selectedPatientId,
        patientName,
        patientPhone,
        address,
        city,
        state,
        pincode,
      );

      setMyProfiles((previousProfiles) =>
        previousProfiles.map((profile) =>
          profile.id === selectedPatientId
            ? { ...profile, ...updatedProfile }
            : profile,
        ),
      );

      setPatientName(updatedProfile.fullName || patientName);
      setPatientEmail(updatedProfile.email || patientEmail);
      setPatientPhone(updatedProfile.phone || patientPhone);

      setAddress(updatedProfile.address || address);
      setCity(updatedProfile.city || city);
      setState(updatedProfile.state || state);
      setPincode(updatedProfile.pincode || pincode);

      setIsEditingSelfProfile(false);
      setSelfProfileBackup(null);
    } catch (error) {
      console.error("Failed to update patient profile:", error);

      setBookingError(
        error.message || "Unable to update your patient profile.",
      );
    } finally {
      setPatientUpdateLoading(false);
    }
  }

  function handleExistingPatientSelect(patientId) {
    const profile = myProfiles.find(
      (patient) => patient.id === Number(patientId),
    );

    if (!profile) {
      return;
    }

    setSelectedPatientId(profile.id);
    setIsNewPatient(false);

    setIsEditingSelfProfile(false);
    setSelfProfileBackup(null);

    setPatientName(profile.fullName || "");
    setPatientEmail(profile.email || "");
    setPatientPhone(profile.phone || "");

    setRelationship(profile.relationship || "");

    setAddress(profile.address || "");
    setCity(profile.city || "");
    setState(profile.state || "");
    setPincode(profile.pincode || "");

    setBookingError("");
  }

  function handleNewPatient() {
    clearPatientDetails();
    setIsNewPatient(true);
    setBookingError("");
  }

  async function submitBooking() {
    await handleBooking(
      navigate,
      selectedPatientId,
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
      createFamilyPatient,
      setSelectedPatientId,
      setBookingLoading,
      setBookingError,
    );
  }

  if (loading) {
    return (
      <div className="booking-page">
        <div className="booking-header">
          <p>APPOINTMENT BOOKING</p>
          <h1>Book Your Appointment</h1>
          <span>Loading doctor information...</span>
        </div>

        <div className="booking-loading-card">
          <div className="booking-loading-spinner"></div>
          <h2>Loading Doctor Information</h2>
          <p>Please wait while we load the doctor's details.</p>
        </div>
      </div>
    );
  }

  if (error || !doctor) {
    return (
      <div className="booking-page">
        <div className="booking-header">
          <p>APPOINTMENT BOOKING</p>
          <h1>Book Your Appointment</h1>
          <span>Choose your preferred consultation details</span>
        </div>

        <div className="booking-error-wrapper">
          <div className="booking-error-card">
            <div className="booking-error-icon">
              <span>!</span>
            </div>

            <h2>Unable to Load Doctor</h2>

            <p className="booking-error-message">
              {error || "Doctor not found."}
            </p>

            <p className="booking-error-description">
              We couldn't load the doctor's information right now. Please try
              again later or return to the doctors list.
            </p>

            <button
              type="button"
              className="booking-error-btn"
              onClick={() => navigate("/doctors")}
            >
              <span>←</span>
              Back to Doctors
            </button>
          </div>
        </div>
      </div>
    );
  }

  const activeLocations = (doctor.locations || []).filter(
    (location) => location.active,
  );

  const selectedLocation = activeLocations.find(
    (location) => location.id === selectedLocationId,
  );

  const consultationFee = selectedLocation
    ? selectedLocation.consultationFee
    : 0;

  const consultationLocation = selectedLocation
    ? selectedLocation.consultationType === "VIDEO"
      ? "Online Consultation"
      : selectedLocation.locationName
    : "Not available";

  const familyProfiles = myProfiles.filter(
    (profile) => profile.relationship?.toUpperCase() !== "SELF",
  );

  const selectedPatient = myProfiles.find(
    (profile) => profile.id === selectedPatientId,
  );

  return (
    <div className="booking-page">
      {bookingError && (
        <div className="booking-error-overlay">
          <div className="booking-submit-error">
            <div className="booking-submit-error-icon">
              <span>!</span>
            </div>

            <div className="booking-submit-error-content">
              <h3>Unable to Complete Booking</h3>
              <p>{bookingError}</p>
              <span>Please check the information and try again.</span>
            </div>

            <button
              type="button"
              className="booking-submit-error-close"
              onClick={() => setBookingError("")}
              aria-label="Close error"
            >
              ×
            </button>
          </div>
        </div>
      )}

      <div className="booking-header">
        <p>APPOINTMENT BOOKING</p>
        <h1>Book Your Appointment</h1>
        <span>Choose your preferred consultation details</span>
      </div>

      <div className="booking-container">
        <div className="booking-left">
          {/* Doctor Information */}
          <section className="booking-card doctor-summary">
            <h2>Doctor Information</h2>

            <div className="booking-doctor">
              <div className="booking-doctor-image">
                {doctor.profileImage ? (
                  <img
                    src={
                      doctor.profileImage.startsWith("http://") ||
                      doctor.profileImage.startsWith("https://")
                        ? doctor.profileImage
                        : `http://localhost:8082/images/${doctor.profileImage}`
                    }
                    alt={doctor.fullName}
                  />
                ) : (
                  <span>👨‍⚕️</span>
                )}
              </div>

              <div>
                <h3>{doctor.fullName}</h3>
                <p>{doctor.specialization}</p>
                <span>💼 {doctor.exp} years experience</span>
                <small>🗣️ {doctor.language}</small>
              </div>
            </div>
          </section>

          {/* Consultation Location */}
          <section className="booking-card">
            <h2>Consultation Location</h2>

            <div className="consultation-options">
              {activeLocations.map((location) => (
                <button
                  type="button"
                  key={location.id}
                  className={`consultation-option ${
                    selectedLocationId === location.id ? "selected" : ""
                  }`}
                  onClick={() =>
                    handleLocationSelect(
                      setSelectedLocationId,
                      setConsultationType,
                      location,
                    )
                  }
                >
                  <span>
                    {location.consultationType === "VIDEO" ? "📹" : "🏥"}
                  </span>

                  <div>
                    <strong>
                      {location.consultationType === "VIDEO"
                        ? "Video Consultation"
                        : "In-person Consultation"}
                    </strong>

                    <p>
                      {location.consultationType === "VIDEO"
                        ? `Online consultation • ₹${location.consultationFee}`
                        : `${location.locationName} • ₹${location.consultationFee}`}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          </section>

          {/* Date */}
          <section className="booking-card">
            <h2>Select Date</h2>

            <div className="date-options">
              {availableDates.map((date) => (
                <button
                  type="button"
                  key={date.fullDate}
                  className={selectedDate === date.fullDate ? "selected" : ""}
                  onClick={() =>
                    handleDateSelect(
                      setSelectedDate,
                      date.fullDate,
                      setSelectedTime,
                    )
                  }
                >
                  <span>{date.day}</span>
                  <strong>{date.date}</strong>
                  <small>{date.month}</small>
                </button>
              ))}
            </div>
          </section>

          {/* Time */}
          <section className="booking-card">
            <h2>Select Time</h2>

            {!selectedDate ? (
              <p>Please select a date first.</p>
            ) : availableTimeSlots.length === 0 ? (
              <p>No future time slots are available for this date.</p>
            ) : (
              <div className="time-slots">
                {availableTimeSlots.map((time) => (
                  <button
                    type="button"
                    key={time}
                    className={selectedTime === time ? "selected" : ""}
                    onClick={() => handleTimeSelect(setSelectedTime, time)}
                  >
                    {time}
                  </button>
                ))}
              </div>
            )}
          </section>

          {/* Patient Selection */}
          {selectedDate && selectedTime && (
            <section className="booking-card">
              <h2>Who is this appointment for?</h2>

              <div className="consultation-options">
                <button
                  type="button"
                  className={`consultation-option ${
                    bookingFor === "SELF" ? "selected" : ""
                  }`}
                  onClick={() => handleBookingForChange("SELF")}
                >
                  <span>👤</span>
                  <div>
                    <strong>Myself</strong>
                    <p>Book this appointment for yourself</p>
                  </div>
                </button>

                <button
                  type="button"
                  className={`consultation-option ${
                    bookingFor === "OTHER" ? "selected" : ""
                  }`}
                  onClick={() => handleBookingForChange("OTHER")}
                >
                  <span>👨‍👩‍👧</span>
                  <div>
                    <strong>Someone else</strong>
                    <p>Book this appointment for a family member</p>
                  </div>
                </button>
              </div>
            </section>
          )}

          {/* Patient Information */}
          {selectedDate && selectedTime && bookingFor && (
            <section className="booking-card">
              <h2>Patient Details</h2>

              {patientProfilesLoading ? (
                <p>Loading your patient profiles...</p>
              ) : (
                <div className="patient-form">
                  {bookingFor === "SELF" && (
                    <>
                      <div className="form-group">
                        <label>Your Details</label>
                        <p>
                          Your patient profile will be used for this
                          appointment.
                        </p>
                      </div>

                      {selectedPatientId && !isNewPatient && (
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "flex-end",
                            gap: "10px",
                            marginBottom: "20px",
                          }}
                        >
                          {!isEditingSelfProfile ? (
                            <button
                              type="button"
                              className="booking-error-btn"
                              onClick={handleEditSelfProfile}
                            >
                              Edit Details
                            </button>
                          ) : (
                            <>
                              <button
                                type="button"
                                className="booking-error-btn"
                                onClick={handleCancelSelfProfileEdit}
                                disabled={patientUpdateLoading}
                              >
                                Cancel
                              </button>

                              <button
                                type="button"
                                className="booking-error-btn"
                                onClick={handleSaveSelfProfile}
                                disabled={patientUpdateLoading}
                              >
                                {patientUpdateLoading
                                  ? "Saving..."
                                  : "Save Changes"}
                              </button>
                            </>
                          )}
                        </div>
                      )}

                      <div className="form-group">
                        <label>Full Name</label>
                        <input
                          type="text"
                          placeholder="Enter your full name"
                          value={patientName}
                          disabled={!isNewPatient && !isEditingSelfProfile}
                          onChange={(event) =>
                            setPatientName(event.target.value)
                          }
                        />
                      </div>

                      <div className="form-row">
                        <div className="form-group">
                          <label>Email</label>
                          <input
                            type="email"
                            placeholder="Enter your email"
                            value={patientEmail}
                            disabled
                            onChange={(event) =>
                              setPatientEmail(event.target.value)
                            }
                          />
                        </div>

                        <div className="form-group">
                          <label>Phone Number</label>
                          <input
                            type="tel"
                            placeholder="Enter phone number"
                            value={patientPhone}
                            disabled={!isNewPatient && !isEditingSelfProfile}
                            onChange={(event) =>
                              setPatientPhone(event.target.value)
                            }
                          />
                        </div>
                      </div>

                      <div className="form-group">
                        <label>Address</label>
                        <input
                          type="text"
                          placeholder="Enter address"
                          value={address}
                          disabled={!isNewPatient && !isEditingSelfProfile}
                          onChange={(event) => setAddress(event.target.value)}
                        />
                      </div>

                      <div className="form-row">
                        <div className="form-group">
                          <label>City</label>
                          <input
                            type="text"
                            placeholder="Enter city"
                            value={city}
                            disabled={!isNewPatient && !isEditingSelfProfile}
                            onChange={(event) => setCity(event.target.value)}
                          />
                        </div>

                        <div className="form-group">
                          <label>State</label>
                          <input
                            type="text"
                            placeholder="Enter state"
                            value={state}
                            disabled={!isNewPatient && !isEditingSelfProfile}
                            onChange={(event) => setState(event.target.value)}
                          />
                        </div>
                      </div>

                      <div className="form-group">
                        <label>Pincode</label>
                        <input
                          type="text"
                          placeholder="Enter pincode"
                          value={pincode}
                          disabled={!isNewPatient && !isEditingSelfProfile}
                          onChange={(event) => setPincode(event.target.value)}
                        />
                      </div>
                    </>
                  )}

                  {bookingFor === "OTHER" && (
                    <>
                      <div className="form-group">
                        <label>Select Patient</label>
                      </div>

                      {familyProfiles.length > 0 && (
                        <div className="consultation-options">
                          {familyProfiles.map((profile) => (
                            <button
                              type="button"
                              key={profile.id}
                              className={`consultation-option ${
                                selectedPatientId === profile.id &&
                                !isNewPatient
                                  ? "selected"
                                  : ""
                              }`}
                              onClick={() =>
                                handleExistingPatientSelect(profile.id)
                              }
                            >
                              <span>👤</span>
                              <div>
                                <strong>{profile.fullName}</strong>
                                <p>{profile.relationship}</p>
                              </div>
                            </button>
                          ))}
                        </div>
                      )}

                      <button
                        type="button"
                        className={`consultation-option ${
                          isNewPatient ? "selected" : ""
                        }`}
                        onClick={handleNewPatient}
                      >
                        <span>➕</span>
                        <div>
                          <strong>New Patient</strong>
                          <p>Add a new family member</p>
                        </div>
                      </button>

                      {selectedPatient && !isNewPatient && (
                        <>
                          <div className="form-group">
                            <label>Full Name</label>
                            <input type="text" value={patientName} disabled />
                          </div>

                          <div className="form-row">
                            <div className="form-group">
                              <label>Email</label>
                              <input
                                type="email"
                                value={patientEmail}
                                disabled
                              />
                            </div>

                            <div className="form-group">
                              <label>Phone Number</label>
                              <input type="tel" value={patientPhone} disabled />
                            </div>
                          </div>

                          <div className="form-group">
                            <label>Relationship with Patient</label>
                            <input type="text" value={relationship} disabled />
                          </div>

                          <div className="form-group">
                            <label>Address</label>
                            <input type="text" value={address} disabled />
                          </div>

                          <div className="form-row">
                            <div className="form-group">
                              <label>City</label>
                              <input type="text" value={city} disabled />
                            </div>

                            <div className="form-group">
                              <label>State</label>
                              <input type="text" value={state} disabled />
                            </div>
                          </div>

                          <div className="form-group">
                            <label>Pincode</label>
                            <input type="text" value={pincode} disabled />
                          </div>
                        </>
                      )}

                      {isNewPatient && (
                        <>
                          <div className="form-group">
                            <label>Full Name</label>
                            <input
                              type="text"
                              placeholder="Enter patient name"
                              value={patientName}
                              onChange={(event) =>
                                setPatientName(event.target.value)
                              }
                            />
                          </div>

                          <div className="form-row">
                            <div className="form-group">
                              <label>Email</label>
                              <input
                                type="email"
                                placeholder="Enter email"
                                value={patientEmail}
                                onChange={(event) =>
                                  setPatientEmail(event.target.value)
                                }
                              />
                            </div>

                            <div className="form-group">
                              <label>Phone Number</label>
                              <input
                                type="tel"
                                placeholder="Enter phone number"
                                value={patientPhone}
                                onChange={(event) =>
                                  setPatientPhone(event.target.value)
                                }
                              />
                            </div>
                          </div>

                          <div className="form-group">
                            <label>Relationship with Patient</label>
                            <input
                              type="text"
                              placeholder="e.g. Mother, Father, Uncle, Friend"
                              value={relationship}
                              onChange={(event) =>
                                setRelationship(event.target.value)
                              }
                            />
                          </div>

                          <div className="form-group">
                            <label>Address</label>
                            <input
                              type="text"
                              placeholder="Enter address"
                              value={address}
                              onChange={(event) =>
                                setAddress(event.target.value)
                              }
                            />
                          </div>

                          <div className="form-row">
                            <div className="form-group">
                              <label>City</label>
                              <input
                                type="text"
                                placeholder="Enter city"
                                value={city}
                                onChange={(event) =>
                                  setCity(event.target.value)
                                }
                              />
                            </div>

                            <div className="form-group">
                              <label>State</label>
                              <input
                                type="text"
                                placeholder="Enter state"
                                value={state}
                                onChange={(event) =>
                                  setState(event.target.value)
                                }
                              />
                            </div>
                          </div>

                          <div className="form-group">
                            <label>Pincode</label>
                            <input
                              type="text"
                              placeholder="Enter pincode"
                              value={pincode}
                              onChange={(event) =>
                                setPincode(event.target.value)
                              }
                            />
                          </div>
                        </>
                      )}
                    </>
                  )}

                  <div className="form-group">
                    <label>Reason for Visit</label>
                    <textarea
                      placeholder="Describe your symptoms or reason for consultation"
                      rows="4"
                      value={reason}
                      onChange={(event) => setReason(event.target.value)}
                    ></textarea>
                  </div>
                </div>
              )}
            </section>
          )}
        </div>

        {/* Right Side: Appointment Summary */}
        <div className="booking-right">
          <section className="booking-summary">
            <h2>Appointment Summary</h2>

            <div className="summary-doctor">
              <div className="summary-image">
                {doctor.profileImage ? (
                  <img
                    src={
                      doctor.profileImage.startsWith("http://") ||
                      doctor.profileImage.startsWith("https://")
                        ? doctor.profileImage
                        : `http://localhost:8082/images/${doctor.profileImage}`
                    }
                    alt={doctor.fullName}
                  />
                ) : (
                  <span>👨‍⚕️</span>
                )}
              </div>

              <div>
                <h3>{doctor.fullName}</h3>
                <p>{doctor.specialization}</p>
              </div>
            </div>

            <div className="summary-line">
              <span>Consultation</span>
              <strong>{consultationType || "Not selected"}</strong>
            </div>

            <div className="summary-line">
              <span>Location</span>
              <strong>{consultationLocation}</strong>
            </div>

            <div className="summary-line">
              <span>Date</span>
              <strong>
                {selectedDate
                  ? new Date(`${selectedDate}T00:00:00`).toLocaleDateString(
                      "en-US",
                      {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      },
                    )
                  : "Not selected"}
              </strong>
            </div>

            <div className="summary-line">
              <span>Time</span>
              <strong>{selectedTime || "Not selected"}</strong>
            </div>

            <div className="summary-line">
              <span>Patient</span>
              <strong>{patientName || "Not selected"}</strong>
            </div>

            <div className="summary-line">
              <span>Consultation Fee</span>
              <strong>₹{consultationFee}</strong>
            </div>

            <div className="summary-total">
              <span>Total</span>
              <strong>₹{consultationFee}</strong>
            </div>

            <button
              type="button"
              className="booking-submit-btn"
              onClick={submitBooking}
              disabled={bookingLoading || patientUpdateLoading}
            >
              {bookingLoading
                ? "Creating Appointment..."
                : "Continue to Payment →"}
            </button>

            <p className="secure-note">
              🔒 Your appointment information is secure
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}

export default Booking;
