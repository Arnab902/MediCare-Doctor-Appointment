export async function handleDoctorRegister(event, consultationOptions) {
  event.preventDefault();

  const formData = new FormData(event.target);

  const password = formData.get("password");
  const confirmPassword = formData.get("confirmPassword");

  if (password !== confirmPassword) {
    alert("Passwords do not match.");
    return;
  }

  if (!consultationOptions.inPerson && !consultationOptions.video) {
    alert("Please select at least one consultation option.");
    return;
  }

  const locations = [];

  // In-Person Consultation
  if (consultationOptions.inPerson) {
    locations.push({
      locationName: formData.get("locationName"),
      consultationType: "IN_PERSON",
      consultationFee: Number(formData.get("inPersonFee")),
      active: true,
      address: {
        addressLine: formData.get("addressLine"),
        city: formData.get("city"),
        state: formData.get("state"),
        country: formData.get("country"),
        pinCode: formData.get("pinCode")
      }
    });
  }

  // Video Consultation
  if (consultationOptions.video) {
    locations.push({
      locationName: "Online Consultation",
      consultationType: "VIDEO",
      consultationFee: Number(formData.get("videoFee")),
      active: true,
      address: null
    });
  }

  try {
    // Step 1: Register authentication account
    const registerResponse = await fetch(
      "http://localhost:8084/auth/register",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          email: formData.get("email"),
          password: password,
          role: "DOCTOR"
        })
      }
    );

    const registerData = await registerResponse.json();

    if (!registerResponse.ok) {
      alert(
        registerData.message ||
          "Registration failed. Please try again."
      );
      return;
    }

    console.log(
      "Doctor authentication account created:",
      registerData
    );

    // Step 2: Automatically login
    const loginResponse = await fetch(
      "http://localhost:8084/auth/login",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        credentials: "include",
        body: JSON.stringify({
          email: formData.get("email"),
          password: password
        })
      }
    );

    const loginData = await loginResponse.json();

    if (!loginResponse.ok) {
      alert(
        "Registration successful, but automatic login failed. Please login manually."
      );

      window.location.href = "/login";
      return;
    }

    console.log("Doctor automatic login successful.");

    // Step 3: Store access token
    sessionStorage.setItem(
      "accessToken",
      loginData.jwtToken
    );

    // Step 4: Create doctor profile
    const doctorResponse = await fetch(
      "http://localhost:8082/doctors/save",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${loginData.jwtToken}`
        },
        body: JSON.stringify({
          fullName: formData.get("fullName"),
          email: formData.get("email"),
          phoneNumber: formData.get("phoneNumber"),
          specialization: formData.get("specialization"),
          qualification: formData.get("qualification"),
          exp: Number(formData.get("exp")),
          language: formData.get("language"),
          profileImage: null,
          availability: true,
          locations: locations
        })
      }
    );

    const doctorData = await doctorResponse.json();

    if (!doctorResponse.ok) {
      console.error(
        "Doctor profile creation failed:",
        doctorData
      );

      alert(
        doctorData.message ||
          "Account created, but doctor profile creation failed."
      );

      return;
    }

    console.log(
      "Doctor profile created successfully:",
      doctorData
    );

    // Step 5: Registration completed
    alert(
      "Doctor registration successful! Your profile is waiting for Admin approval."
    );

    // Step 6: Redirect to Doctor Dashboard
    window.location.href = "/doctor-dashboard";

  } catch (error) {
    console.error(
      "Doctor registration error:",
      error
    );

    alert("Unable to connect to the server.");
  }
}