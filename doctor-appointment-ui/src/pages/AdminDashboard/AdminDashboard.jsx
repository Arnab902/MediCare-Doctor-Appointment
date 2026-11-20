import { useEffect, useState } from "react";
import "./AdminDashboard.css";

import {
  fetchDoctors,
  fetchAdminUsers,
  fetchDoctorDetails,
  fetchPatients,
  fetchAppointments,
  approveDoctor,
  rejectDoctor,
  blockDoctor,
  unblockDoctor,
} from "./AdminDashboard.js";

function AdminDashboard() {
  const [doctors, setDoctors] = useState([]);
  const [users, setUsers] = useState([]);
  const [patients, setPatients] = useState([]);
  const [appointments, setAppointments] = useState([]);

  const [loadingDoctors, setLoadingDoctors] = useState(true);
  const [loadingPatients, setLoadingPatients] = useState(true);
  const [loadingAppointments, setLoadingAppointments] = useState(true);

  const [doctorError, setDoctorError] = useState("");
  const [patientError, setPatientError] = useState("");
  const [appointmentError, setAppointmentError] = useState("");

  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [selectedAppointment, setSelectedAppointment] = useState(null);

  const [showAllAppointments, setShowAllAppointments] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  async function loadDashboardData() {
    setLoadingDoctors(true);
    setLoadingPatients(true);
    setLoadingAppointments(true);

    setDoctorError("");
    setPatientError("");
    setAppointmentError("");

    const results = await Promise.allSettled([
      fetchDoctors(),
      fetchAdminUsers(),
      fetchPatients(),
      fetchAppointments(),
    ]);

    if (results[0].status === "fulfilled") {
      setDoctors(Array.isArray(results[0].value) ? results[0].value : []);
    } else {
      setDoctorError(results[0].reason?.message || "Unable to load doctors.");
    }

    if (results[1].status === "fulfilled") {
      setUsers(Array.isArray(results[1].value) ? results[1].value : []);
    } else {
      setDoctorError((previous) =>
        previous
          ? `${previous} Account information could not be loaded.`
          : results[1].reason?.message || "Unable to load account information.",
      );
    }

    if (results[2].status === "fulfilled") {
      setPatients(Array.isArray(results[2].value) ? results[2].value : []);
    } else {
      setPatientError(results[2].reason?.message || "Unable to load patients.");
    }

    if (results[3].status === "fulfilled") {
      setAppointments(Array.isArray(results[3].value) ? results[3].value : []);
    } else {
      setAppointmentError(
        results[3].reason?.message || "Unable to load appointments.",
      );
    }

    setLoadingDoctors(false);
    setLoadingPatients(false);
    setLoadingAppointments(false);
  }

  useEffect(() => {
    if (sessionStorage.getItem("role") !== "ADMIN") {
      window.location.href = "/login";
      return;
    }

    loadDashboardData();
  }, []);

  function scrollToSection(sectionId) {
    const section = document.getElementById(sectionId);

    if (section) {
      section.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  }

  function getDoctorAccountStatus(doctor) {
    const user = users.find(
      (item) => Number(item.id) === Number(doctor.authUserId),
    );

    return user?.accountStatus || "UNKNOWN";
  }

  function getPatientAccountStatus(patient) {
    const user = users.find(
      (item) => Number(item.id) === Number(patient.authUserId),
    );

    return user?.accountStatus || "UNKNOWN";
  }

  const registeredPatients = patients.filter(
    (patient) => String(patient.relationship || "").toUpperCase() === "SELF",
  );

  async function handleDoctorAction(action, doctor) {
    try {
      if (
        action === "reject" &&
        !window.confirm("Are you sure you want to reject this doctor?")
      ) {
        return;
      }

      if (
        action === "block" &&
        !window.confirm("Are you sure you want to block this doctor?")
      ) {
        return;
      }

      setActionLoading(true);

      switch (action) {
        case "approve":
          await approveDoctor(doctor.id);
          break;
        case "reject":
          await rejectDoctor(doctor.id);
          break;
        case "block":
          await blockDoctor(doctor.authUserId);
          break;
        case "unblock":
          await unblockDoctor(doctor.authUserId);
          break;
        default:
          return;
      }

      await loadDashboardData();
    } catch (error) {
      alert(error.message);
    } finally {
      setActionLoading(false);
    }
  }

  async function handlePatientAction(action, patient) {
    try {
      if (!patient.authUserId) {
        alert("Account ID is missing for this patient.");
        return;
      }

      if (
        action === "block" &&
        !window.confirm(
          `Are you sure you want to block ${patient.fullName}'s account?`,
        )
      ) {
        return;
      }

      if (
        action === "unblock" &&
        !window.confirm(
          `Are you sure you want to unblock ${patient.fullName}'s account?`,
        )
      ) {
        return;
      }

      setActionLoading(true);

      if (action === "block") {
        await blockDoctor(patient.authUserId);
      } else if (action === "unblock") {
        await unblockDoctor(patient.authUserId);
      }

      await loadDashboardData();
    } catch (error) {
      alert(error.message);
    } finally {
      setActionLoading(false);
    }
  }

  async function handleDoctorView(doctorId) {
    try {
      const details = await fetchDoctorDetails(doctorId);
      setSelectedDoctor(details);
    } catch (error) {
      alert(error.message);
    }
  }

  function formatLanguages(language) {
    if (Array.isArray(language)) {
      return language.join(", ");
    }

    return language || "Not specified";
  }

  function getProfileStatusClass(status) {
    switch (status) {
      case "APPROVED":
        return "approved-status";
      case "REJECTED":
        return "blocked-status";
      default:
        return "pending-status";
    }
  }

  function getAccountStatusClass(status) {
    if (status === "ACTIVE") return "active-status";
    if (status === "BLOCKED") return "blocked-status";
    return "pending-status";
  }

  function formatAppointmentDate(date) {
    if (!date) return "Date unavailable";

    const parts = String(date).split("-");

    if (parts.length !== 3) return date;

    const [year, month, day] = parts;
    const parsedDate = new Date(Number(year), Number(month) - 1, Number(day));

    if (Number.isNaN(parsedDate.getTime())) return date;

    return parsedDate.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  }

  function formatAppointmentTime(time) {
    if (!time) return "Time unavailable";

    const [hours, minutes] = String(time).split(":");

    const parsedHours = Number(hours);
    const parsedMinutes = Number(minutes);

    if (Number.isNaN(parsedHours) || Number.isNaN(parsedMinutes)) {
      return time;
    }

    const formatted = new Date();
    formatted.setHours(parsedHours, parsedMinutes, 0, 0);

    return formatted.toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  }

  function getAppointmentStatus(status) {
    switch (String(status || "").toUpperCase()) {
      case "BOOKED":
        return {
          label: "Confirmed",
          className: "confirmed-status",
        };

      case "COMPLETED":
        return {
          label: "Completed",
          className: "completed-status",
        };

      case "CANCELLED":
        return {
          label: "Cancelled",
          className: "cancelled-status",
        };

      case "PENDING":
        return {
          label: "Pending",
          className: "pending-status",
        };

      default:
        return {
          label: status || "Unknown",
          className: "pending-status",
        };
    }
  }

  const sortedAppointments = [...appointments].sort((a, b) => {
    const dateA = `${a.appointmentDate || ""} ${a.appointmentTime || ""}`;
    const dateB = `${b.appointmentDate || ""} ${b.appointmentTime || ""}`;

    return dateB.localeCompare(dateA);
  });

  const displayedAppointments = showAllAppointments
    ? sortedAppointments
    : sortedAppointments.slice(0, 3);

  return (
    <div className="admin-dashboard">
      {/* Header */}
      <section className="admin-header">
        <div>
          <p>ADMIN DASHBOARD</p>
          <h1>Welcome back, Admin</h1>
          <span>Manage doctors, patients and appointments from one place.</span>
        </div>

        <div className="admin-profile">
          <div className="admin-avatar">👨‍💼</div>
          <div>
            <h3>Administrator</h3>
            <p>System Admin</p>
          </div>
        </div>
      </section>

      {/* Statistics */}
      <section className="admin-stats">
        <div className="admin-stat-card">
          <div className="admin-stat-icon">👨‍⚕️</div>
          <div>
            <span>Total Doctors</span>
            <h2>{doctors.length}</h2>
            <small>Registered doctors</small>
          </div>
        </div>

        <div className="admin-stat-card">
          <div className="admin-stat-icon">👤</div>
          <div>
            <span>Total Patients</span>
            <h2>{registeredPatients.length}</h2>
            <small>Registered patient accounts</small>
          </div>
        </div>

        <div className="admin-stat-card">
          <div className="admin-stat-icon">📅</div>
          <div>
            <span>Total Appointments</span>
            <h2>{appointments.length}</h2>
            <small>Appointments in the system</small>
          </div>
        </div>

        <div className="admin-stat-card">
          <div className="admin-stat-icon">⏳</div>
          <div>
            <span>Pending Approvals</span>
            <h2>
              {
                doctors.filter((doctor) => doctor.profileStatus === "PENDING")
                  .length
              }
            </h2>
            <small>Requires attention</small>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="admin-content">
        <div className="admin-panel" id="doctor-management">
          <div className="admin-panel-header">
            <div>
              <p>DOCTOR MANAGEMENT</p>
              <h2>Doctor Registrations</h2>
            </div>

            <button
              className="admin-view-all-btn"
              onClick={loadDashboardData}
              disabled={loadingDoctors || loadingPatients}
            >
              {loadingDoctors ? "Loading..." : "Refresh"}
            </button>
          </div>

          {loadingDoctors && <p>Loading doctors...</p>}
          {doctorError && <p className="doctor-error">{doctorError}</p>}

          {!loadingDoctors && !doctorError && doctors.length === 0 && (
            <p>No doctors found.</p>
          )}

          {!loadingDoctors &&
            doctors.map((doctor) => {
              const profileStatus = doctor.profileStatus || "UNKNOWN";
              const accountStatus = getDoctorAccountStatus(doctor);

              return (
                <div className="admin-doctor-row" key={doctor.id}>
                  <div className="admin-doctor-avatar">👨‍⚕️</div>

                  <div className="admin-doctor-info">
                    <h3>{doctor.fullName}</h3>
                    <p>{doctor.specialization}</p>
                    <span>{doctor.email}</span>
                    <p>
                      Profile: {profileStatus} | Account: {accountStatus}
                    </p>
                  </div>

                  <div className="doctor-action-group">
                    <span
                      className={`admin-status ${getProfileStatusClass(
                        profileStatus,
                      )}`}
                    >
                      {profileStatus}
                    </span>

                    <span
                      className={`admin-status ${getAccountStatusClass(
                        accountStatus,
                      )}`}
                    >
                      {accountStatus}
                    </span>
                  </div>

                  <div className="admin-actions">
                    <button
                      className="admin-view-btn"
                      onClick={() => handleDoctorView(doctor.id)}
                    >
                      View
                    </button>

                    {profileStatus === "PENDING" && (
                      <>
                        <button
                          className="admin-approve-btn"
                          disabled={actionLoading}
                          onClick={() => handleDoctorAction("approve", doctor)}
                        >
                          Approve
                        </button>

                        <button
                          className="admin-block-btn"
                          disabled={actionLoading}
                          onClick={() => handleDoctorAction("reject", doctor)}
                        >
                          Reject
                        </button>
                      </>
                    )}

                    {accountStatus === "ACTIVE" && (
                      <button
                        className="admin-block-btn"
                        disabled={actionLoading}
                        onClick={() => handleDoctorAction("block", doctor)}
                      >
                        Block
                      </button>
                    )}

                    {accountStatus === "BLOCKED" && (
                      <button
                        className="admin-approve-btn"
                        disabled={actionLoading}
                        onClick={() => handleDoctorAction("unblock", doctor)}
                      >
                        Unblock
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
        </div>

        {/* Right Side */}
        <div className="admin-sidebar">
          <div className="admin-side-panel">
            <div className="admin-panel-header">
              <div>
                <p>QUICK ACTIONS</p>
                <h2>Management</h2>
              </div>
            </div>

            <button
              type="button"
              className="quick-action-btn"
              onClick={() => scrollToSection("doctor-management")}
            >
              👨‍⚕️ Manage Doctors
            </button>

            <button
              type="button"
              className="quick-action-btn"
              onClick={() => scrollToSection("patient-management")}
            >
              👤 Manage Patients
            </button>

            <button
              type="button"
              className="quick-action-btn"
              onClick={() => scrollToSection("appointment-management")}
            >
              📅 Manage Appointments
            </button>
          </div>
        </div>
      </section>

      {/* Patient & Appointment Section */}
      <section className="admin-bottom-grid">
        {/* Patient Management */}
        <div className="admin-panel" id="patient-management">
          <div className="admin-panel-header">
            <div>
              <p>PATIENT MANAGEMENT</p>
              <h2>Registered Patients</h2>
            </div>

            <button
              className="admin-view-all-btn"
              onClick={loadDashboardData}
              disabled={loadingPatients}
            >
              {loadingPatients ? "Loading..." : "Refresh"}
            </button>
          </div>

          {loadingPatients && <p>Loading patients...</p>}
          {patientError && <p className="doctor-error">{patientError}</p>}

          {!loadingPatients &&
            !patientError &&
            registeredPatients.length === 0 && (
              <p>No registered patients found.</p>
            )}

          {!loadingPatients &&
            registeredPatients.map((patient) => {
              const accountStatus = getPatientAccountStatus(patient);

              return (
                <div className="patient-row" key={patient.id}>
                  <div className="patient-avatar">👤</div>

                  <div className="patient-info">
                    <h3>{patient.fullName || "Unnamed Patient"}</h3>
                    <p>{patient.email || "No email available"}</p>
                  </div>

                  <span
                    className={`admin-status ${getAccountStatusClass(
                      accountStatus,
                    )}`}
                  >
                    {accountStatus}
                  </span>

                  <div className="admin-actions">
                    <button
                      className="admin-view-btn"
                      onClick={() => setSelectedPatient(patient)}
                    >
                      View
                    </button>

                    {accountStatus === "ACTIVE" && (
                      <button
                        className="admin-block-btn"
                        disabled={actionLoading}
                        onClick={() => handlePatientAction("block", patient)}
                      >
                        Block
                      </button>
                    )}

                    {accountStatus === "BLOCKED" && (
                      <button
                        className="admin-approve-btn"
                        disabled={actionLoading}
                        onClick={() => handlePatientAction("unblock", patient)}
                      >
                        Unblock
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
        </div>

        {/* Appointment Management */}
        <div className="admin-panel" id="appointment-management">
          <div className="admin-panel-header">
            <div>
              <p>APPOINTMENT MANAGEMENT</p>
              <h2>Recent Appointments</h2>
            </div>

            <button
              className="admin-view-all-btn"
              onClick={() => setShowAllAppointments((previous) => !previous)}
              disabled={loadingAppointments || appointments.length <= 3}
            >
              {showAllAppointments ? "Show Recent" : "View All"}
            </button>
          </div>

          {loadingAppointments && <p>Loading appointments...</p>}

          {appointmentError && (
            <p className="doctor-error">{appointmentError}</p>
          )}

          {!loadingAppointments &&
            !appointmentError &&
            appointments.length === 0 && <p>No appointments found.</p>}

          {!loadingAppointments &&
            !appointmentError &&
            displayedAppointments.map((appointment) => {
              const status = getAppointmentStatus(appointment.status);

              return (
                <div className="appointment-admin-row" key={appointment.id}>
                  <div>
                    <h3>
                      {appointment.patientName ||
                        "Patient information unavailable"}
                    </h3>
                    <p>
                      {appointment.doctorName ||
                        "Doctor information unavailable"}
                    </p>
                  </div>

                  <div>
                    <span>
                      {formatAppointmentDate(appointment.appointmentDate)}
                    </span>
                    <small>
                      {formatAppointmentTime(appointment.appointmentTime)}
                    </small>
                  </div>

                  <div className={`admin-status ${status.className}`}>
                    {status.label}
                  </div>

                  <button
                    className="admin-view-btn"
                    onClick={() => setSelectedAppointment(appointment)}
                  >
                    View
                  </button>
                </div>
              );
            })}
        </div>
      </section>

      {/* Doctor Details Modal */}
      {selectedDoctor && (
        <div className="doctor-modal-overlay">
          <div
            className="doctor-modal doctor-details-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="doctor-modal-title"
          >
            <div className="doctor-modal-header">
              <div>
                <p>DOCTOR MANAGEMENT</p>
                <h2 id="doctor-modal-title">Doctor Profile</h2>
              </div>

              <button
                className="doctor-modal-close"
                onClick={() => setSelectedDoctor(null)}
                aria-label="Close doctor details"
              >
                ✕
              </button>
            </div>

            <div className="doctor-profile-card">
              <div className="doctor-profile-avatar">👨‍⚕️</div>

              <div className="doctor-profile-info">
                <h2>{selectedDoctor.fullName}</h2>
                <p>{selectedDoctor.specialization}</p>
                <span>Medical Professional</span>
              </div>

              <span
                className={`admin-status doctor-profile-status ${getProfileStatusClass(
                  selectedDoctor.profileStatus,
                )}`}
              >
                {selectedDoctor.profileStatus || "UNKNOWN"}
              </span>
            </div>

            <div className="doctor-details-section">
              <h3>
                <span>👤</span> Personal Information
              </h3>

              <div className="doctor-details-grid">
                <div className="doctor-detail-item">
                  <label>Email Address</label>
                  <p>{selectedDoctor.email || "Not specified"}</p>
                </div>

                <div className="doctor-detail-item">
                  <label>Phone Number</label>
                  <p>{selectedDoctor.phoneNumber || "Not specified"}</p>
                </div>
              </div>
            </div>

            <div className="doctor-details-section">
              <h3>
                <span>🩺</span> Professional Information
              </h3>

              <div className="doctor-professional-row">
                <div className="doctor-professional-item">
                  <label>Specialization</label>
                  <p>{selectedDoctor.specialization || "Not specified"}</p>
                </div>

                <div className="doctor-professional-item">
                  <label>Qualification</label>
                  <p>{selectedDoctor.qualification || "Not specified"}</p>
                </div>

                <div className="doctor-professional-item">
                  <label>Experience</label>
                  <p>
                    {selectedDoctor.exp != null
                      ? `${selectedDoctor.exp} years`
                      : "Not specified"}
                  </p>
                </div>

                <div className="doctor-professional-item">
                  <label>Languages</label>
                  <p>{formatLanguages(selectedDoctor.language)}</p>
                </div>
              </div>
            </div>

            <div className="doctor-modal-footer">
              <button
                className="doctor-modal-done-btn"
                onClick={() => setSelectedDoctor(null)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Patient Details Modal */}
      {selectedPatient && (
        <div className="doctor-modal-overlay">
          <div
            className="doctor-modal doctor-details-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="patient-modal-title"
          >
            <div className="doctor-modal-header">
              <div>
                <p>PATIENT MANAGEMENT</p>
                <h2 id="patient-modal-title">Patient Profile</h2>
              </div>

              <button
                className="doctor-modal-close"
                onClick={() => setSelectedPatient(null)}
                aria-label="Close patient details"
              >
                ✕
              </button>
            </div>

            <div className="doctor-profile-card">
              <div className="doctor-profile-avatar">👤</div>

              <div className="doctor-profile-info">
                <h2>{selectedPatient.fullName || "Unnamed Patient"}</h2>
                <p>{selectedPatient.email || "No email available"}</p>
                <span>Registered Patient</span>
              </div>

              <span
                className={`admin-status doctor-profile-status ${getAccountStatusClass(
                  getPatientAccountStatus(selectedPatient),
                )}`}
              >
                {getPatientAccountStatus(selectedPatient)}
              </span>
            </div>

            <div className="doctor-details-section">
              <h3>
                <span>👤</span> Personal Information
              </h3>

              <div className="doctor-details-grid">
                <div className="doctor-detail-item">
                  <label>Full Name</label>
                  <p>{selectedPatient.fullName || "Not specified"}</p>
                </div>

                <div className="doctor-detail-item">
                  <label>Email Address</label>
                  <p>{selectedPatient.email || "Not specified"}</p>
                </div>

                <div className="doctor-detail-item">
                  <label>Phone Number</label>
                  <p>{selectedPatient.phone || "Not specified"}</p>
                </div>

                <div className="doctor-detail-item">
                  <label>Relationship</label>
                  <p>{selectedPatient.relationship || "Not specified"}</p>
                </div>

                <div className="doctor-detail-item">
                  <label>City</label>
                  <p>{selectedPatient.city || "Not specified"}</p>
                </div>

                <div className="doctor-detail-item">
                  <label>State</label>
                  <p>{selectedPatient.state || "Not specified"}</p>
                </div>

                <div className="doctor-detail-item">
                  <label>Address</label>
                  <p>{selectedPatient.address || "Not specified"}</p>
                </div>

                <div className="doctor-detail-item">
                  <label>Pincode</label>
                  <p>{selectedPatient.pincode || "Not specified"}</p>
                </div>
              </div>
            </div>

            <div className="doctor-modal-footer">
              <button
                className="doctor-modal-done-btn"
                onClick={() => setSelectedPatient(null)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Appointment Details Modal */}
      {selectedAppointment && (
        <div
          className="doctor-modal-overlay"
          onClick={(event) => {
            if (event.target === event.currentTarget) {
              setSelectedAppointment(null);
            }
          }}
        >
          <div
            className="doctor-modal doctor-details-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="appointment-modal-title"
          >
            <div className="doctor-modal-header">
              <div>
                <p>APPOINTMENT MANAGEMENT</p>
                <h2 id="appointment-modal-title">Appointment Details</h2>
              </div>

              <button
                className="doctor-modal-close"
                onClick={() => setSelectedAppointment(null)}
                aria-label="Close appointment details"
              >
                ✕
              </button>
            </div>

            <div className="doctor-profile-card">
              <div className="doctor-profile-avatar">📅</div>

              <div className="doctor-profile-info">
                <h2>Appointment #{selectedAppointment.id}</h2>
                <p>
                  {selectedAppointment.patientName ||
                    "Patient information unavailable"}
                </p>
                <span>Appointment Record</span>
              </div>

              <span
                className={`admin-status doctor-profile-status ${
                  getAppointmentStatus(selectedAppointment.status).className
                }`}
              >
                {getAppointmentStatus(selectedAppointment.status).label}
              </span>
            </div>

            <div className="doctor-details-section">
              <h3>
                <span>👤</span> People
              </h3>

              <div className="doctor-details-grid">
                <div className="doctor-detail-item">
                  <label>Patient Name</label>
                  <p>{selectedAppointment.patientName || "Not available"}</p>
                </div>

                <div className="doctor-detail-item">
                  <label>Doctor Name</label>
                  <p>{selectedAppointment.doctorName || "Not available"}</p>
                </div>

                <div className="doctor-detail-item">
                  <label>Patient ID</label>
                  <p>{selectedAppointment.patientId ?? "Not available"}</p>
                </div>

                <div className="doctor-detail-item">
                  <label>Doctor ID</label>
                  <p>{selectedAppointment.doctorId ?? "Not available"}</p>
                </div>
              </div>
            </div>

            <div className="doctor-details-section">
              <h3>
                <span>🗓️</span> Appointment Information
              </h3>

              <div className="doctor-details-grid">
                <div className="doctor-detail-item">
                  <label>Appointment Date</label>
                  <p>
                    {formatAppointmentDate(selectedAppointment.appointmentDate)}
                  </p>
                </div>

                <div className="doctor-detail-item">
                  <label>Appointment Time</label>
                  <p>
                    {formatAppointmentTime(selectedAppointment.appointmentTime)}
                  </p>
                </div>

                <div className="doctor-detail-item">
                  <label>Consultation Type</label>
                  <p>
                    {selectedAppointment.consultationType || "Not specified"}
                  </p>
                </div>

                <div className="doctor-detail-item">
                  <label>Appointment Status</label>
                  <p>
                    {getAppointmentStatus(selectedAppointment.status).label}
                  </p>
                </div>

                <div className="doctor-detail-item">
                  <label>Doctor Location ID</label>
                  <p>
                    {selectedAppointment.doctorLocationId ?? "Not specified"}
                  </p>
                </div>

                <div className="doctor-detail-item">
                  <label>Reschedule Request</label>
                  <p>
                    {selectedAppointment.rescheduleRequestStatus ||
                      "No request"}
                  </p>
                </div>

                <div className="doctor-detail-item">
                  <label>Requested Date</label>
                  <p>
                    {selectedAppointment.requestedAppointmentDate
                      ? formatAppointmentDate(
                          selectedAppointment.requestedAppointmentDate,
                        )
                      : "Not requested"}
                  </p>
                </div>

                <div className="doctor-detail-item">
                  <label>Requested Time</label>
                  <p>
                    {selectedAppointment.requestedAppointmentTime
                      ? formatAppointmentTime(
                          selectedAppointment.requestedAppointmentTime,
                        )
                      : "Not requested"}
                  </p>
                </div>
              </div>
            </div>

            <div className="doctor-details-section">
              <h3>
                <span>📝</span> Reason
              </h3>

              <div className="doctor-detail-item">
                <label>Appointment Reason</label>
                <p>{selectedAppointment.reason || "Not specified"}</p>
              </div>
            </div>

            <div className="doctor-modal-footer">
              <button
                className="doctor-modal-done-btn"
                onClick={() => setSelectedAppointment(null)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminDashboard;
