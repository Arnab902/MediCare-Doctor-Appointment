import { useEffect, useState } from "react";
import { BrowserRouter, Routes, Route, useNavigate } from "react-router-dom";

import Navbar from "./components/Navbar/Navbar.jsx";
import Footer from "./components/Footer/Footer.jsx";
import ScrollToTop from "./components/ScrollToTop/ScrollToTop.jsx";

import Home from "./pages/Home/Home.jsx";
import Login from "./pages/Login/Login.jsx";
import Register from "./pages/Register/Register.jsx";
import DoctorRegister from "./pages/DoctorRegister/DoctorRegister.jsx";
import Profile from "./pages/Profile/Profile.jsx";
import DoctorProfile from "./pages/DoctorProfile/DoctorProfile.jsx";

import Doctors from "./pages/Doctors/Doctors.jsx";
import DoctorsDetails from "./pages/DoctorsDetails/DoctorsDetails.jsx";
import Booking from "./pages/Booking/Booking.jsx";
import Appointments from "./pages/Appointments/Appointments.jsx";
import AppointmentDetails from "./pages/AppointmentDetails/AppointmentDetails.jsx";
import Reschedule from "./pages/Reschedule/Reschedule.jsx";
import Payment from "./pages/Payment/Payment.jsx";
import VideoCall from "./pages/VideoCall/VideoCall.jsx";

import DoctorDashboard from "./pages/DoctorDashboard/DoctorDashboard.jsx";
import DoctorAvailability from "./pages/DoctorDashboard/DoctorAvailability/DoctorAvailability.jsx";

import AdminDashboard from "./pages/AdminDashboard/AdminDashboard.jsx";

import { restoreSession } from "./services/authService.js";

import "./App.css";

function DoctorAvailabilityRoute() {
  const navigate = useNavigate();

  return <DoctorAvailability onClose={() => navigate("/doctor-dashboard")} />;
}

// Restore login before showing the application
function SessionInitializer({ children }) {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let mounted = true;

    async function initializeSession() {
      await restoreSession();

      if (mounted) {
        setReady(true);
      }
    }

    initializeSession();

    return () => {
      mounted = false;
    };
  }, []);

  if (!ready) {
    return <div className="app-loading">Loading...</div>;
  }

  return children;
}

function App() {
  return (
    <BrowserRouter>
      <SessionInitializer>
        <ScrollToTop />

        <Navbar />

        <Routes>
          <Route path="/" element={<Home />} />

          <Route path="/login" element={<Login />} />

          <Route path="/register" element={<Register />} />

          <Route path="/doctor-register" element={<DoctorRegister />} />

          <Route path="/profile" element={<Profile />} />

          <Route path="/doctor-profile" element={<DoctorProfile />} />

          <Route path="/doctors" element={<Doctors />} />

          <Route path="/doctor-details/:id" element={<DoctorsDetails />} />

          <Route path="/booking" element={<Booking />} />

          <Route path="/appointments" element={<Appointments />} />

          <Route path="/appointment-details" element={<AppointmentDetails />} />

          <Route path="/reschedule" element={<Reschedule />} />

          <Route path="/payment" element={<Payment />} />

          <Route path="/video-call" element={<VideoCall />} />

          <Route path="/doctor-dashboard" element={<DoctorDashboard />} />

          <Route
            path="/doctor-dashboard/availability"
            element={<DoctorAvailabilityRoute />}
          />

          <Route path="/admin-dashboard" element={<AdminDashboard />} />
        </Routes>

        <Footer />
      </SessionInitializer>
    </BrowserRouter>
  );
}

export default App;
