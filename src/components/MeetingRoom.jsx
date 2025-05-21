import React, { useState, useEffect, useRef, useCallback } from "react";
import io from "socket.io-client";
import {
  getMeetingDetails,
  processTranscriptForMeeting,
  generateAgendaForMeeting,
} from "../services/api"; // Assuming these exist
import {
  Mic,
  MicOff,
  Send,
  FileText,
  ListChecks,
  BotMessageSquare,
  CalendarPlus,
  LogOut,
  Brain,
} from "lucide-react";
import "./MeetingRoom.css"; // Import the CSS file

//const SOCKET_SERVER_URL = "http://localhost:3001";
const SOCKET_SERVER_URL =
  import.meta.env.VITE_SOCKET_SERVER_URL || "http://localhost:3001";

const MeetingRoom = ({ meetingId, onLeaveMeeting }) => {
  const [meeting, setMeeting] = useState(null);
  const [transcript, setTranscript] = useState([]);
  const [summary, setSummary] = useState("");
  const [actionItems, setActionItems] = useState([]);
  const [isRecording, setIsRecording] = useState(false);
  const [isLoading, setIsLoading] = useState({
    details: true,
    agenda: false,
    processing: false,
  });
  const [error, setError] = useState("");
  const [agenda, setAgenda] = useState("");

  const socketRef = useRef(null);
  const audioActivityIntervalRef = useRef(null);
  const transcriptEndRef = useRef(null);

  const scrollToBottom = () => {
    transcriptEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [transcript]);

  const loadMeetingDetails = useCallback(async () => {
    if (!meetingId) return;
    setIsLoading((prev) => ({ ...prev, details: true }));
    setError("");
    try {
      const data = await getMeetingDetails(meetingId);
      setMeeting(data);
      setTranscript(data.transcript || []);
      setSummary(data.summary || "");
      setActionItems(data.actionItems || []);
      setAgenda(data.agenda || "");
    } catch (err) {
      setError(`Failed to load meeting: ${err.message}`);
    } finally {
      setIsLoading((prev) => ({ ...prev, details: false }));
    }
  }, [meetingId]);

  useEffect(() => {
    loadMeetingDetails();

    socketRef.current = io(SOCKET_SERVER_URL);
    socketRef.current.emit("joinMeeting", meetingId);

    socketRef.current.on("transcriptUpdate", (newChunks) => {
      setTranscript((prev) => [...prev, ...newChunks]);
    });

    socketRef.current.on("meetingState", (initialMeetingState) => {
      if (initialMeetingState) {
        setMeeting(initialMeetingState);
        setTranscript(initialMeetingState.transcript || []);
        setSummary(initialMeetingState.summary || "");
        setActionItems(initialMeetingState.actionItems || []);
        setAgenda(initialMeetingState.agenda || "");
      }
    });

    socketRef.current.on("opeaError", (err) =>
      setError(`OPEA Error: ${err.message}`)
    );

    return () => {
      socketRef.current.disconnect();
      if (audioActivityIntervalRef.current)
        clearInterval(audioActivityIntervalRef.current);
    };
  }, [meetingId, loadMeetingDetails]);

  const handleStartRecording = () => {
    setIsRecording(true);
    setError("");
    audioActivityIntervalRef.current = setInterval(() => {
      if (socketRef.current) {
        socketRef.current.emit("audioActivity", {
          meetingId,
          audioDataReference: `sim_chunk_${Date.now()}`,
        });
      }
    }, 3500);
  };

  const handleStopRecording = () => {
    setIsRecording(false);
    if (audioActivityIntervalRef.current)
      clearInterval(audioActivityIntervalRef.current);
  };

  const handleProcessTranscript = async () => {
    setIsLoading((prev) => ({ ...prev, processing: true }));
    setError("");
    try {
      const result = await processTranscriptForMeeting(meetingId);
      setSummary(result.summary);
      setActionItems(result.actionItems);
    } catch (err) {
      setError(`Failed to process transcript: ${err.message}`);
    } finally {
      setIsLoading((prev) => ({ ...prev, processing: false }));
    }
  };

  const handleGenerateAgenda = async () => {
    setIsLoading((prev) => ({ ...prev, agenda: true }));
    setError("");
    try {
      const result = await generateAgendaForMeeting(meetingId);
      setAgenda(result.agenda);
    } catch (err) {
      setError(`Failed to generate agenda: ${err.message}`);
    } finally {
      setIsLoading((prev) => ({ ...prev, agenda: false }));
    }
  };

  if (isLoading.details) {
    return (
      <div className="loading-container">
        <div className="loading-text">Loading Meeting Details...</div>
      </div>
    );
  }

  if (!meeting) {
    return (
      <div className="error-not-found-container">
        <h2>Meeting not found or failed to load.</h2>
        <button className="btn btn-secondary" onClick={onLeaveMeeting}>
          Go Back
        </button>
      </div>
    );
  }

  return (
    <div className="meeting-room-container">
      <header className="meeting-header">
        <div>
          <h1 className="meeting-title">{meeting.title}</h1>
          <p className="meeting-id-text">Meeting ID: {meetingId}</p>
        </div>
        <button className="btn btn-secondary" onClick={onLeaveMeeting}>
          <LogOut size={18} /> Leave Meeting
        </button>
      </header>

      {error && <div className="error-banner">{error}</div>}

      <div className="main-grid-container">
        {/* Column 1: Agenda & Controls */}
        <div className="grid-column-1">
          <div className="card agenda-card">
            <h2 className="card-title">
              <CalendarPlus size={20} className="card-title-icon" /> Agenda
            </h2>
            {!agenda && (
              <button
                className="btn btn-primary btn-full-width"
                onClick={handleGenerateAgenda}
                disabled={isLoading.agenda}
              >
                {isLoading.agenda ? (
                  "Generating..."
                ) : (
                  <>
                    <Brain size={18} /> Generate Agenda (OPEA)
                  </>
                )}
              </button>
            )}
            {agenda && <pre className="agenda-content">{agenda}</pre>}
          </div>

          <div className="card live-controls-card">
            <h2 className="card-title">Live Controls</h2>
            {!isRecording ? (
              <button
                className="btn btn-primary btn-full-width"
                onClick={handleStartRecording}
                disabled={isLoading.details} // Should probably be something else if we always have meeting details here
              >
                <Mic size={18} /> Start Recording (Simulated)
              </button>
            ) : (
              <button
                className="btn btn-danger btn-full-width"
                onClick={handleStopRecording}
              >
                <MicOff size={18} /> Stop Recording
              </button>
            )}
            {isRecording && (
              <p className="recording-status">
                Live transcription in progress...
              </p>
            )}
          </div>
        </div>

        {/* Column 2: Live Transcript */}
        <div className="card transcript-card">
          <h2 className="card-title">
            <BotMessageSquare size={20} className="card-title-icon" /> Live
            Transcript
          </h2>
          <div className="transcript-box">
            {transcript.length === 0 && (
              <p className="transcript-placeholder">
                No transcript yet. Start recording to see live updates.
              </p>
            )}
            {transcript.map((entry, index) => (
              <div
                key={index}
                className={`transcript-entry ${
                  entry.speaker === "Alice" ? "speaker-alice" : "speaker-other" // Example speaker differentiation
                }`}
              >
                <div className="transcript-bubble">
                  <p className="transcript-speaker-info">
                    {entry.speaker || "System"}
                    <span className="transcript-timestamp">
                      ({new Date(entry.timestamp).toLocaleTimeString()}){" "}
                      {/* Formatted timestamp */}
                    </span>
                  </p>
                  <p className="transcript-text">{entry.text}</p>
                </div>
              </div>
            ))}
            <div ref={transcriptEndRef} />
          </div>
        </div>

        {/* Post-Meeting Insights - Full Width Below */}
        <div className="card insights-card">
          <h2 className="card-title">Post-Meeting Insights</h2>
          <button
            className="btn btn-primary btn-block-mobile" // btn-block-mobile for specific styling
            onClick={handleProcessTranscript}
            disabled={isLoading.processing || transcript.length === 0}
          >
            {isLoading.processing ? (
              "Processing..."
            ) : (
              <>
                <Send size={18} /> Generate Summary & Actions (OPEA)
              </>
            )}
          </button>
          <div className="insights-grid">
            {summary && (
              <div className="insights-section">
                <h3 className="insights-section-title">
                  <FileText size={18} className="card-title-icon" /> Summary
                </h3>
                <div className="insights-content-box">{summary}</div>
              </div>
            )}
            {actionItems.length > 0 && (
              <div className="insights-section">
                <h3 className="insights-section-title">
                  <ListChecks size={18} className="card-title-icon" /> Action
                  Items
                </h3>
                <ul className="insights-content-box insights-list">
                  {actionItems.map((item, index) => (
                    <li key={item.id || index} className="insights-list-item">
                      {" "}
                      {/* Added fallback key */}
                      <strong>{item.task}</strong>
                      {item.assignedTo && (
                        <span className="assigned-to-text">
                          (Assigned: {item.assignedTo})
                        </span>
                      )}
                      <span
                        className={`status-pill status-${
                          item.status || "pending"
                        }`}
                      >
                        {item.status || "Pending"}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
          {!(summary || actionItems.length > 0) &&
            !isLoading.processing &&
            transcript.length > 0 && (
              <p className="transcript-placeholder insights-placeholder">
                Click "Generate Summary & Actions" to see OPEA insights.
              </p>
            )}
        </div>
      </div>
    </div>
  );
};
