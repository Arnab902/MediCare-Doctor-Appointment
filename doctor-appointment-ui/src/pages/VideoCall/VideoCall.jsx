import "./VideoCall.css";
import {
  handleMute,
  handleCamera,
  handleSpeaker,
  handleChat,
  handleEndCall,
} from "./VideoCall.js";

function VideoCall() {
  return (
    <div className="video-call-page">
      {/* Top Bar */}
      <div className="video-call-header">
        <div className="video-call-doctor">
          <div className="doctor-small-image">👨‍⚕️</div>

          <div>
            <h2>Dr. John Smith</h2>
            <p>Cardiologist</p>
          </div>
        </div>

        <div className="call-status">
          <span className="status-dot"></span>
          Connected
        </div>

        <div className="call-duration">12:35</div>
      </div>

      {/* Main Video Area */}
      <div className="video-main-area">
        {/* Doctor Video */}
        <div className="doctor-video">
          <div className="doctor-video-placeholder">
            👨‍⚕️
            <h2>Dr. John Smith</h2>
          </div>

          <div className="doctor-video-label">Dr. John Smith</div>
        </div>

        {/* Patient Small Video */}
        <div className="patient-video">
          <div className="patient-placeholder">👤</div>

          <span>You</span>
        </div>
      </div>

      {/* Controls */}
      <div className="video-controls">
        <button className="video-control-btn" onClick={handleMute}>
          🎤
          <span>Mute</span>
        </button>

        <button className="video-control-btn" onClick={handleCamera}>
          📹
          <span>Camera</span>
        </button>

        <button className="video-control-btn" onClick={handleSpeaker}>
          🔊
          <span>Speaker</span>
        </button>

        <button className="video-control-btn" onClick={handleChat}>
          💬
          <span>Chat</span>
        </button>

        <button className="end-call-btn" onClick={handleEndCall}>
          📞
          <span>End Call</span>
        </button>
      </div>

      {/* Appointment Information */}
      <div className="video-appointment-info">
        <div>
          <small>Appointment</small>
          <strong>Cardiology Consultation</strong>
        </div>

        <div>
          <small>Date</small>
          <strong>10 September 2026</strong>
        </div>

        <div>
          <small>Time</small>
          <strong>10:00 AM</strong>
        </div>

        <div>
          <small>Patient</small>
          <strong>Arnab</strong>
        </div>
      </div>
    </div>
  );
}

export default VideoCall;
