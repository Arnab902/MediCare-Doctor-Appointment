import "./Footer.css";

function Footer() {
  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-brand">
          <h2>🩺 MediCare</h2>
          <p>
            Your trusted platform for finding doctors and booking appointments
            easily.
          </p>
        </div>

        <div className="footer-section">
          <h3>Quick Links</h3>
          <a href="/">Home</a>
          <a href="/doctors">Doctors</a>
          <a href="/appointments">Appointments</a>
        </div>

        <div className="footer-section">
          <h3>Support</h3>
          <a href="/contact">Contact Us</a>
          <a href="/help">Help Center</a>
          <a href="/privacy">Privacy Policy</a>
        </div>

        <div className="footer-section">
          <h3>Contact</h3>
          <p>📧 support@medicare.com</p>
          <p>📞 +91 98765 43210</p>
          <p>📍 Kolkata, India</p>
        </div>
      </div>

      <div className="footer-bottom">
        <p>© 2026 MediCare. All rights reserved.</p>
      </div>
    </footer>
  );
}

export default Footer;
