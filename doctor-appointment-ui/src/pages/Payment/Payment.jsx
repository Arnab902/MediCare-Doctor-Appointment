import "./Payment.css";

import { useEffect, useState } from "react";

import { useNavigate, useSearchParams } from "react-router-dom";

import {
  fetchAppointmentById,
  fetchDoctorById,
  handlePaymentMethod,
  handleVerifyUPI,
  handlePayment,
  handleViewAppointments,
} from "./Payment.js";

function Payment() {
  const navigate = useNavigate();

  const [searchParams] = useSearchParams();

  const appointmentId = searchParams.get("appointmentId");

  const [appointment, setAppointment] = useState(null);

  const [doctor, setDoctor] = useState(null);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  const [paymentMethod, setPaymentMethod] = useState("UPI");

  const [paymentInput, setPaymentInput] = useState("");

  const [upiVerified, setUpiVerified] = useState(false);

  const [paymentLoading, setPaymentLoading] = useState(false);

  const [paymentSuccess, setPaymentSuccess] = useState(false);

  const [paymentError, setPaymentError] = useState("");

  useEffect(() => {
    loadPaymentDetails();
  }, [appointmentId]);

  async function loadPaymentDetails() {
    try {
      setLoading(true);
      setError("");

      if (!appointmentId) {
        throw new Error("Appointment ID is missing");
      }

      const appointmentData = await fetchAppointmentById(appointmentId);

      setAppointment(appointmentData);

      const doctorData = await fetchDoctorById(appointmentData.doctorId);

      setDoctor(doctorData);
    } catch (error) {
      console.error(error);

      setError(error.message || "Unable to load payment details.");
    } finally {
      setLoading(false);
    }
  }

  function changePaymentMethod(method) {
    handlePaymentMethod(setPaymentMethod, method);

    setPaymentInput("");

    setUpiVerified(false);

    setPaymentError("");
  }

  function handlePaymentInputChange(value) {
    setPaymentInput(value);

    setUpiVerified(false);

    setPaymentError("");
  }

  function verifyUPI() {
    handleVerifyUPI(paymentInput, setUpiVerified, setPaymentError);
  }

  function submitPayment() {
    handlePayment(
      navigate,
      appointmentId,
      paymentMethod,
      paymentInput,
      upiVerified,
      setPaymentLoading,
      setPaymentSuccess,
      setPaymentError,
    );
  }

  if (loading) {
    return (
      <div className="payment-page">
        <div className="payment-header">
          <p>SECURE CHECKOUT</p>

          <h1>Complete Your Payment</h1>

          <span>Loading appointment details...</span>
        </div>
      </div>
    );
  }

  if (error || !appointment || !doctor) {
    return (
      <div className="payment-page">
        <div className="payment-header">
          <p>SECURE CHECKOUT</p>

          <h1>Complete Your Payment</h1>

          <span>{error || "Unable to load appointment details."}</span>
        </div>
      </div>
    );
  }

  /*
   * Doctor fees come from the exact DoctorLocation
   * stored in the appointment.
   */

  const locations = doctor.locations || [];

  const selectedLocation = locations.find(
    (location) => location.id === appointment.doctorLocationId,
  );

  const consultationFee = selectedLocation
    ? Number(selectedLocation.consultationFee)
    : 0;

  const consultationType = appointment.consultationType;

  const consultationLocation =
    consultationType === "VIDEO"
      ? "Online Consultation"
      : selectedLocation?.locationName || "N/A";

  const platformFee = 20;

  const gst = consultationFee * 0.05;

  const totalAmount = consultationFee + platformFee + gst;

  if (paymentSuccess) {
    return (
      <div className="payment-page">
        <div className="payment-success-card">
          <div className="success-icon">✓</div>

          <p className="success-label">PAYMENT SUCCESSFUL</p>

          <h1>Appointment Confirmed</h1>

          <p className="success-message">
            Your payment was successful and your appointment has been confirmed.
          </p>

          <div className="success-details">
            <div>
              <span>Appointment ID</span>

              <strong>#{appointment.id}</strong>
            </div>

            <div>
              <span>Doctor</span>

              <strong>{doctor.fullName}</strong>
            </div>

            <div>
              <span>Date</span>

              <strong>
                {new Date(appointment.appointmentDate).toLocaleDateString(
                  "en-US",
                  {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                  },
                )}
              </strong>
            </div>

            <div>
              <span>Time</span>

              <strong>{appointment.appointmentTime}</strong>
            </div>

            <div>
              <span>Consultation</span>

              <strong>
                {consultationType === "VIDEO"
                  ? "💻 Video Consultation"
                  : "🏥 In-person Consultation"}
              </strong>
            </div>

            <div>
              <span>Location</span>

              <strong>{consultationLocation}</strong>
            </div>

            <div>
              <span>Amount Paid</span>

              <strong>₹{totalAmount.toFixed(2)}</strong>
            </div>
          </div>

          <button
            className="view-appointments-btn"
            onClick={() => handleViewAppointments(navigate)}
          >
            View My Appointments
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="payment-page">
      <div className="payment-header">
        <p>SECURE CHECKOUT</p>

        <h1>Complete Your Payment</h1>

        <span>Securely pay for your doctor appointment</span>
      </div>

      <div className="payment-container">
        <div className="payment-left">
          {/* Appointment Details */}

          <section className="payment-card">
            <h2>Appointment Details</h2>

            <div className="payment-doctor">
              <div className="payment-doctor-image">
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
              </div>
            </div>

            <div className="payment-details-grid">
              <div>
                <small>Date</small>

                <strong>
                  {new Date(appointment.appointmentDate).toLocaleDateString(
                    "en-US",
                    {
                      day: "2-digit",
                      month: "long",
                      year: "numeric",
                    },
                  )}
                </strong>
              </div>

              <div>
                <small>Time</small>

                <strong>{appointment.appointmentTime}</strong>
              </div>

              <div>
                <small>Consultation</small>

                <strong>
                  {consultationType === "VIDEO" ? "💻 Video" : "🏥 In-person"}
                </strong>
              </div>

              <div>
                <small>Location</small>

                <strong>{consultationLocation}</strong>
              </div>

              <div>
                <small>Consultation Fee</small>

                <strong>₹{consultationFee.toFixed(2)}</strong>
              </div>

              <div>
                <small>Reason</small>

                <strong>{appointment.reason}</strong>
              </div>
            </div>
          </section>

          {/* Payment Method */}

          <section className="payment-card">
            <h2>Payment Method</h2>

            <div className="payment-methods">
              {/* UPI */}

              <button
                type="button"
                className={`payment-method ${
                  paymentMethod === "UPI" ? "selected" : ""
                }`}
                onClick={() => changePaymentMethod("UPI")}
              >
                <span>📱</span>

                <div>
                  <strong>UPI</strong>

                  <p>Google Pay, PhonePe, Paytm</p>
                </div>
              </button>

              {/* CARD */}

              <button
                type="button"
                className={`payment-method ${
                  paymentMethod === "Card" ? "selected" : ""
                }`}
                onClick={() => changePaymentMethod("Card")}
              >
                <span>💳</span>

                <div>
                  <strong>Credit / Debit Card</strong>

                  <p>Visa, Mastercard, RuPay</p>
                </div>
              </button>

              {/* NET BANKING */}

              <button
                type="button"
                className={`payment-method ${
                  paymentMethod === "Net Banking" ? "selected" : ""
                }`}
                onClick={() => changePaymentMethod("Net Banking")}
              >
                <span>🏦</span>

                <div>
                  <strong>Net Banking</strong>

                  <p>All major banks supported</p>
                </div>
              </button>
            </div>

            {/* UPI */}

            {paymentMethod === "UPI" && (
              <div className="upi-section">
                <label>UPI ID</label>

                <input
                  type="text"
                  placeholder="example@upi"
                  value={paymentInput}
                  onChange={(event) =>
                    handlePaymentInputChange(event.target.value)
                  }
                />

                <button
                  type="button"
                  className="verify-upi-btn"
                  onClick={verifyUPI}
                  disabled={upiVerified}
                >
                  {upiVerified ? "✓ UPI Verified" : "Verify UPI"}
                </button>

                {upiVerified && (
                  <p
                    style={{
                      color: "#16a34a",
                      marginTop: "8px",
                      fontSize: "14px",
                      fontWeight: "500",
                    }}
                  >
                    ✓ UPI ID verified successfully.
                  </p>
                )}
              </div>
            )}

            {/* Card */}

            {paymentMethod === "Card" && (
              <div className="upi-section">
                <label>Card Number</label>

                <input
                  type="text"
                  placeholder="1234 5678 9012 3456"
                  value={paymentInput}
                  onChange={(event) =>
                    handlePaymentInputChange(event.target.value)
                  }
                />

                <button type="button" className="verify-upi-btn">
                  Continue
                </button>
              </div>
            )}

            {/* Net Banking */}

            {paymentMethod === "Net Banking" && (
              <div className="upi-section">
                <label>Select Bank</label>

                <select
                  value={paymentInput}
                  onChange={(event) =>
                    handlePaymentInputChange(event.target.value)
                  }
                >
                  <option value="">Select your bank</option>

                  <option value="State Bank of India">
                    State Bank of India
                  </option>

                  <option value="HDFC Bank">HDFC Bank</option>

                  <option value="ICICI Bank">ICICI Bank</option>

                  <option value="Axis Bank">Axis Bank</option>
                </select>
              </div>
            )}
          </section>

          {paymentError && <div className="payment-error">{paymentError}</div>}
        </div>

        {/* Payment Summary */}

        <div className="payment-right">
          <section className="payment-summary">
            <h2>Payment Summary</h2>

            <div className="summary-row">
              <span>Consultation Fee</span>

              <strong>₹{consultationFee.toFixed(2)}</strong>
            </div>

            <div className="summary-row">
              <span>Platform Fee</span>

              <strong>₹{platformFee.toFixed(2)}</strong>
            </div>

            <div className="summary-row">
              <span>GST</span>

              <strong>₹{gst.toFixed(2)}</strong>
            </div>

            <div className="summary-divider"></div>

            <div className="payment-total">
              <span>Total Amount</span>

              <strong>₹{totalAmount.toFixed(2)}</strong>
            </div>

            <button
              type="button"
              className="pay-now-btn"
              onClick={submitPayment}
              disabled={paymentLoading || consultationFee <= 0}
            >
              {paymentLoading
                ? "Processing Payment..."
                : `Pay ₹${totalAmount.toFixed(2)}`}
            </button>

            <div className="secure-payment">
              🔒
              <div>
                <strong>Secure Payment</strong>

                <p>Your payment information is protected.</p>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

export default Payment;
