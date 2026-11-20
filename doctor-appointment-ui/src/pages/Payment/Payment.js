import { apiFetch } from "../../services/authservice.js";

const APPOINTMENT_SERVICE_URL =
  "http://localhost:8083";

const DOCTOR_SERVICE_URL =
  "http://localhost:8082";

/*
 * Safely read the response.
 *
 * Some backend errors may return an empty body.
 * Calling response.json() directly on an empty
 * response causes:
 *
 * Unexpected end of JSON input
 *
 * So we first read the response as text.
 */

async function readResponse(response) {
  const text = await response.text();

  if (!text) {
    return null;
  }

  try {
    return JSON.parse(text);
  } catch (error) {
    return text;
  }
}

/*
 * Fetch appointment
 */

export async function fetchAppointmentById(id) {
  const response = await apiFetch(
    `${APPOINTMENT_SERVICE_URL}/appointments/findId/${id}`,
    {
      method: "GET",
    }
  );

  const data = await readResponse(response);

  if (!response.ok) {
    if (
      data &&
      typeof data === "object" &&
      data.message
    ) {
      throw new Error(data.message);
    }

    if (typeof data === "string" && data) {
      throw new Error(data);
    }

    throw new Error(
      `Failed to fetch appointment. Server returned ${response.status}.`
    );
  }

  if (!data) {
    throw new Error(
      "Appointment service returned an empty response."
    );
  }

  return data;
}

/*
 * Fetch doctor details
 */

export async function fetchDoctorById(id) {
  const response = await apiFetch(
    `${DOCTOR_SERVICE_URL}/doctors/${id}/details`,
    {
      method: "GET",
    }
  );

  const data = await readResponse(response);

  if (!response.ok) {
    if (
      data &&
      typeof data === "object" &&
      data.message
    ) {
      throw new Error(data.message);
    }

    if (typeof data === "string" && data) {
      throw new Error(data);
    }

    throw new Error(
      `Failed to fetch doctor details. Server returned ${response.status}.`
    );
  }

  if (!data) {
    throw new Error(
      "Doctor service returned an empty response."
    );
  }

  return data;
}

/*
 * Payment method
 */

export function handlePaymentMethod(
  setPaymentMethod,
  method
) {
  setPaymentMethod(method);
}

/*
 * UPI verification
 */

export function handleVerifyUPI(
  paymentInput,
  setUpiVerified,
  setPaymentError
) {
  setPaymentError("");

  const upiId = paymentInput.trim();

  if (!upiId) {
    setUpiVerified(false);

    setPaymentError(
      "Please enter your UPI ID."
    );

    return;
  }

  if (
    !/^[a-zA-Z0-9.*-]+@[a-zA-Z0-9.*-]+$/.test(
      upiId
    )
  ) {
    setUpiVerified(false);

    setPaymentError(
      "Please enter a valid UPI ID."
    );

    return;
  }

  setUpiVerified(true);

  console.log(
    "UPI ID verified:",
    upiId
  );
}

/*
 * Mock payment processing
 */

export function handlePayment(
  navigate,
  appointmentId,
  paymentMethod,
  paymentInput,
  upiVerified,
  setPaymentLoading,
  setPaymentSuccess,
  setPaymentError
) {
  setPaymentError("");

  /*
   * UPI validation
   */

  if (paymentMethod === "UPI") {
    if (!paymentInput.trim()) {
      setPaymentError(
        "Please enter your UPI ID."
      );

      return;
    }

    if (!upiVerified) {
      setPaymentError(
        "Please verify your UPI ID first."
      );

      return;
    }
  }

  /*
   * Card validation
   */

  if (paymentMethod === "Card") {
    const cardNumber =
      paymentInput.replace(/\s/g, "");

    if (!cardNumber) {
      setPaymentError(
        "Please enter your card number."
      );

      return;
    }

    if (!/^\d{16}$/.test(cardNumber)) {
      setPaymentError(
        "Please enter a valid 16-digit card number."
      );

      return;
    }
  }

  /*
   * Net Banking validation
   */

  if (paymentMethod === "Net Banking") {
    if (!paymentInput) {
      setPaymentError(
        "Please select your bank."
      );

      return;
    }
  }

  setPaymentLoading(true);

  /*
   * Mock payment processing.
   *
   * No real payment gateway is connected yet.
   *
   * Later this can be replaced with
   * Razorpay / Stripe.
   */

  setTimeout(() => {
    try {
      setPaymentLoading(false);

      setPaymentSuccess(true);

      console.log(
        "Payment successful:",
        {
          appointmentId,
          paymentMethod,
        }
      );
    } catch (error) {
      console.error(
        "Payment failed:",
        error
      );

      setPaymentLoading(false);

      setPaymentError(
        "Payment failed. Please try again."
      );
    }
  }, 1500);
}

/*
 * View appointments
 */

export function handleViewAppointments(
  navigate
) {
  navigate("/appointments");
}