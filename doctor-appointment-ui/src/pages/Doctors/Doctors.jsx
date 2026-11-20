import "./Doctors.css";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  fetchDoctors,
  handleSearch,
  handleViewProfile,
  handleBookAppointment,
} from "./Doctors.js";

function Doctors() {
  const navigate = useNavigate();

  const [doctors, setDoctors] = useState([]);
  const [filteredDoctors, setFilteredDoctors] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [sortOption, setSortOption] = useState("recommended");

  const [searchText, setSearchText] = useState("");
  const [location, setLocation] = useState("");
  const [specialty, setSpecialty] = useState("");

  const [searchMessage, setSearchMessage] = useState("");

  useEffect(() => {
    loadDoctors();
  }, []);

  async function loadDoctors() {
    try {
      setLoading(true);
      setError("");

      const data = await fetchDoctors();

      setDoctors(data);
      setFilteredDoctors(data);
    } catch (error) {
      console.error(error);

      setError(
        error.message || "Unable to load doctors. Please try again later.",
      );
    } finally {
      setLoading(false);
    }
  }

  function searchDoctors(event) {
    event.preventDefault();

    setSearchMessage("");

    const searchValue = searchText.trim().toLowerCase();
    const locationValue = location.trim().toLowerCase();

    let results = [...doctors];

    // Doctor name or specialty search
    if (searchValue) {
      results = results.filter((doctor) => {
        const doctorName = doctor.fullName?.toLowerCase() || "";

        const doctorSpecialization = doctor.specialization?.toLowerCase() || "";

        return (
          doctorName.includes(searchValue) ||
          doctorSpecialization.includes(searchValue)
        );
      });
    }

    // Specialty dropdown search
    if (specialty) {
      results = results.filter((doctor) => {
        const doctorSpecialization = doctor.specialization?.toLowerCase() || "";

        return doctorSpecialization === specialty.toLowerCase();
      });
    }

    // Location search
    if (locationValue) {
      results = results.filter((doctor) => {
        return doctor.locations?.some((doctorLocation) => {
          const locationText = [
            doctorLocation?.city,
            doctorLocation?.state,
            doctorLocation?.address,
            doctorLocation?.location,
          ]
            .filter(Boolean)
            .join(" ")
            .toLowerCase();

          return locationText.includes(locationValue);
        });
      });

      if (results.length === 0) {
        setSearchMessage("Sorry, doctor is not available in the location.");
      }
    }

    if (!locationValue && results.length === 0) {
      setSearchMessage("Sorry, no doctors found for your search.");
    }

    setFilteredDoctors(results);
  }

  function clearSearch() {
    setSearchText("");
    setLocation("");
    setSpecialty("");

    setSearchMessage("");

    setFilteredDoctors(doctors);
  }

  const sortedDoctors = [...filteredDoctors].sort((a, b) => {
    if (sortOption === "recommended") {
      return 0;
    }

    if (sortOption === "experience") {
      return (b.exp || 0) - (a.exp || 0);
    }

    return 0;
  });

  /*
   * Create specialty list dynamically
   * from doctors received from backend.
   */
  const specialties = [
    ...new Set(doctors.map((doctor) => doctor.specialization).filter(Boolean)),
  ];

  return (
    <div className="doctors-page">
      {/* HEADER */}

      <section className="doctors-header">
        <p>FIND YOUR DOCTOR</p>

        <h1>Find the right doctor for you</h1>

        <span>
          Search from our network of trusted healthcare professionals.
        </span>
      </section>

      {/* SEARCH */}

      <section className="doctor-search-section">
        <form className="doctor-search" onSubmit={searchDoctors}>
          <div className="search-field">
            <label>Doctor or Specialty</label>

            <input
              type="text"
              placeholder="e.g. Cardiologist"
              value={searchText}
              onChange={(event) => setSearchText(event.target.value)}
            />
          </div>

          <div className="search-field">
            <label>Location</label>

            <input
              type="text"
              placeholder="e.g. Kolkata"
              value={location}
              onChange={(event) => setLocation(event.target.value)}
            />
          </div>

          <div className="search-field">
            <label>Specialty</label>

            <select
              value={specialty}
              onChange={(event) => setSpecialty(event.target.value)}
            >
              <option value="">All Specialties</option>

              {specialties.map((specialtyName) => (
                <option key={specialtyName} value={specialtyName}>
                  {specialtyName}
                </option>
              ))}
            </select>
          </div>

          <button type="submit">Search</button>
        </form>

        {/* CLEAR SEARCH */}

        {(searchText || location || specialty) && (
          <div
            style={{
              maxWidth: "1200px",
              margin: "12px auto 0",
              textAlign: "right",
            }}
          >
            <button
              type="button"
              onClick={clearSearch}
              style={{
                border: "none",
                background: "transparent",
                color: "#2563eb",
                cursor: "pointer",
                fontSize: "13px",
                fontWeight: "600",
              }}
            >
              Clear Search
            </button>
          </div>
        )}
      </section>

      {/* DOCTOR LIST */}

      <section className="doctors-list-section">
        <div className="doctors-list-header">
          <div>
            <p>OUR DOCTORS</p>

            <h2>Available doctors</h2>
          </div>

          <select
            className="sort-doctors"
            value={sortOption}
            onChange={(event) => setSortOption(event.target.value)}
          >
            <option value="recommended">Sort by: Recommended</option>

            <option value="experience">Most Experienced</option>
          </select>
        </div>

        {/* SEARCH MESSAGE */}

        {!loading && !error && searchMessage && (
          <div className="doctors-error">{searchMessage}</div>
        )}

        {/* LOADING */}

        {loading && <div className="doctors-loading">Loading doctors...</div>}

        {/* ERROR */}

        {!loading && error && <div className="doctors-error">{error}</div>}

        {/* DOCTORS */}

        {!loading && !error && sortedDoctors.length > 0 && (
          <div className="doctors-list">
            {sortedDoctors.map((doctor) => (
              <div className="doctor-list-card" key={doctor.id}>
                {/* PHOTO */}

                <div className="doctor-photo">
                  {doctor.profileImage ? (
                    <img
                      src={`http://localhost:8082/images/${doctor.profileImage}`}
                      alt={doctor.fullName}
                    />
                  ) : (
                    <span>👨‍⚕️</span>
                  )}
                </div>

                {/* DETAILS */}

                <div className="doctor-details">
                  <div className="doctor-name-column">
                    <h3>{doctor.fullName}</h3>
                  </div>

                  <div className="doctor-verified-column">
                    <span className="verified">✓ Verified</span>
                  </div>

                  <div className="doctor-specialty-column">
                    <p className="doctor-specialty">{doctor.specialization}</p>
                  </div>

                  <div className="doctor-experience-column">
                    <p className="doctor-experience">
                      {doctor.exp} years experience
                    </p>
                  </div>

                  <div className="doctor-language-column">
                    <span>🗣️ {doctor.language}</span>
                  </div>

                  <div className="doctor-availability-column">
                    <span>
                      {doctor.availability
                        ? "🟢 Available"
                        : "🔴 Not Available"}
                    </span>
                  </div>
                </div>

                {/* ACTIONS */}

                <div className="doctor-actions">
                  <button
                    className="profile-btn"
                    onClick={() => handleViewProfile(navigate, doctor.id)}
                  >
                    View Profile
                  </button>

                  <button
                    className="book-btn"
                    onClick={() => handleBookAppointment(navigate, doctor.id)}
                  >
                    Book Appointment
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

export default Doctors;
