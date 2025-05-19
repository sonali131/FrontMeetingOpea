import React, { useState } from "react";
import MeetingRoom from "./components/MeetingRoom"; // Assuming this component exists
import { createNewMeeting } from "./services/api"; // Assuming this service exists
import { LogIn, PlusCircle, Zap } from "lucide-react";
import "./App.css"; // Import your new CSS file

function App() {
  const [meetingId, setMeetingId] = useState("");
  const [newMeetingTitle, setNewMeetingTitle] = useState("IntelliMeet Demo");
  const [newMeetingTopic, setNewMeetingTopic] = useState(
    "OPEA Features Showcase"
  );
  const [newMeetingParticipants, setNewMeetingParticipants] =
    useState("Team A, Team B");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [joinMeetingIdInput, setJoinMeetingIdInput] = useState("");

  const handleCreateMeeting = async (e) => {
    e.preventDefault();
    if (!newMeetingTitle.trim()) {
      setError("Meeting title cannot be empty.");
      return;
    }
    setIsLoading(true);
    setError("");
    try {
      const participantsArray = newMeetingParticipants
        .split(",")
        .map((p) => p.trim())
        .filter(Boolean);
      const newMeeting = await createNewMeeting(
        newMeetingTitle,
        newMeetingTopic,
        participantsArray
      );
      setMeetingId(newMeeting.id); // Make sure newMeeting.id is correct
    } catch (err) {
      setError(
        `Failed to create meeting: ${
          err.response?.data?.message || err.message
        }`
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleJoinMeeting = (e) => {
    e.preventDefault();
    if (joinMeetingIdInput.trim()) {
      setMeetingId(joinMeetingIdInput.trim());
      setError("");
    } else {
      setError("Please enter a Meeting ID to join.");
    }
  };

  const handleLeaveMeeting = () => {
    setMeetingId("");
    setJoinMeetingIdInput("");
  };

  if (meetingId) {
    return (
      <MeetingRoom meetingId={meetingId} onLeaveMeeting={handleLeaveMeeting} />
    );
  }

  return (
    <div className="app-container">
      <header className="app-header">
        <Zap size={64} className="app-logo-icon" />
        <h1 className="app-title">Intelligent Meeting Assistant</h1>
        <p className="app-subtitle">AI-Powered Meetings with OPEA</p>
      </header>

      {error && <div className="error-message">{error}</div>}

      <div className="forms-container">
        <form onSubmit={handleCreateMeeting} className="form-card">
          <h2 className="form-title">
            <PlusCircle size={24} className="form-title-icon" /> Create New
            Meeting
          </h2>
          <div className="form-group">
            <label htmlFor="title" className="form-label">
              Title
            </label>
            <input
              id="title"
              type="text"
              value={newMeetingTitle}
              onChange={(e) => setNewMeetingTitle(e.target.value)}
              placeholder="E.g., Q3 Planning"
              className="form-input"
            />
          </div>
          <div className="form-group">
            <label htmlFor="topic" className="form-label">
              Topic / Goal
            </label>
            <input
              id="topic"
              type="text"
              value={newMeetingTopic}
              onChange={(e) => setNewMeetingTopic(e.target.value)}
              placeholder="E.g., Discuss OPEA integration"
              className="form-input"
            />
          </div>
          <div className="form-group">
            <label htmlFor="participants" className="form-label">
              Participants (comma-separated)
            </label>
            <input
              id="participants"
              type="text"
              value={newMeetingParticipants}
              onChange={(e) => setNewMeetingParticipants(e.target.value)}
              placeholder="E.g., John Doe, Jane Smith"
              className="form-input"
            />
          </div>
          <button
            type="submit"
            disabled={isLoading}
            className="btn btn-primary form-button" // Uses your .btn and .btn-primary
          >
            {isLoading ? "Creating..." : "Create & Enter Room"}
          </button>
        </form>

        <form onSubmit={handleJoinMeeting} className="form-card">
          <h2 className="form-title">
            <LogIn size={24} className="form-title-icon" /> Join Existing
            Meeting
          </h2>
          <div className="form-group">
            <label htmlFor="meetingIdInput" className="form-label">
              Meeting ID
            </label>
            <input
              id="meetingIdInput"
              name="meetingIdInput"
              type="text"
              value={joinMeetingIdInput}
              onChange={(e) => setJoinMeetingIdInput(e.target.value)}
              placeholder="Enter Meeting ID"
              className="form-input"
            />
          </div>
          <button type="submit" className="btn btn-secondary form-button">
            {" "}
            {/* Uses your .btn and .btn-secondary */}
            Join Meeting
          </button>
        </form>
      </div>

      <footer className="app-footer">
        Powered by OPEA & Intel Architecture
      </footer>
    </div>
  );
}

export default App;
