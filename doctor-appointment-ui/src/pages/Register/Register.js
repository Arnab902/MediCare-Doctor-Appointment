export async function handleRegister(event) {
  event.preventDefault();

  const formData = new FormData(event.target);

  const fullName = formData.get("fullName");
  const email = formData.get("email");
  const phone = formData.get("phone");
  const password = formData.get("password");
  const confirmPassword = formData.get("confirmPassword");

  console.log("Patient registration submitted");

  // Patient registration always uses PATIENT role
  const role = "PATIENT";

  // Check password confirmation
  if (password !== confirmPassword) {
    alert("Passwords do not match.");
    return;
  }

  try {

    // --------------------------------------------------
    // STEP 1: Register user in Auth Service
    // --------------------------------------------------

    const registerResponse = await fetch(
      "http://localhost:8084/auth/register",
      {
        method: "POST",

        headers: {
          "Content-Type": "application/json"
        },

        body: JSON.stringify({
          email: email,
          password: password,
          role: role
        })
      }
    );

    const registerData = await registerResponse.json();

    if (!registerResponse.ok) {
      console.error(
        "Registration failed:",
        registerData
      );

      alert(
        registerData.message ||
        "Registration failed. Please try again."
      );

      return;
    }

    console.log(
      "Auth registration successful:",
      registerData
    );


    // --------------------------------------------------
    // STEP 2: Login automatically
    // --------------------------------------------------

    const loginResponse = await fetch(
      "http://localhost:8084/auth/login",
      {
        method: "POST",

        headers: {
          "Content-Type": "application/json"
        },

        credentials: "include",

        body: JSON.stringify({
          email: email,
          password: password
        })
      }
    );

    const loginData = await loginResponse.json();

    if (!loginResponse.ok) {
      console.error(
        "Automatic login failed:",
        loginData
      );

      alert(
        "Registration successful, but automatic login failed. Please login manually."
      );

      window.location.href = "/login";

      return;
    }

    console.log(
      "Automatic login successful"
    );


    // --------------------------------------------------
    // Store Access JWT
    // --------------------------------------------------

    sessionStorage.setItem(
      "accessToken",
      loginData.jwtToken
    );


    // --------------------------------------------------
    // STEP 3: Create Patient Profile
    // --------------------------------------------------

    const patientResponse = await fetch(
      "http://localhost:8081/save",
      {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${loginData.jwtToken}`
        },

        body: JSON.stringify({
          fullName: fullName,
          email: email,
          phone: phone
        })
      }
    );

    const patientData = await patientResponse.json();

    if (!patientResponse.ok) {
      console.error(
        "Patient profile creation failed:",
        patientData
      );

      alert(
        "Account created, but patient profile creation failed."
      );

      return;
    }

    console.log(
      "Patient profile created successfully:",
      patientData
    );


    // --------------------------------------------------
    // STEP 4: Registration Completed
    // --------------------------------------------------

    alert(
      "Registration successful!"
    );

    window.location.href = "/";

  } catch (error) {

    console.error(
      "Registration error:",
      error
    );

    alert(
      "Unable to connect to the server."
    );
  }
}