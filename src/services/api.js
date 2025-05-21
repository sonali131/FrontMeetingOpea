// import axios from "axios";

// const API_BASE_URL = "/api/meetings"; // Vite will proxy this

// export const createNewMeeting = async (title, topic, participants) => {
//   const response = await axios.post(API_BASE_URL, {
//     title,
//     topic,
//     participants,
//   });
//   return response.data;
// };

// export const getMeetingDetails = async (meetingId) => {
//   const response = await axios.get(`${API_BASE_URL}/${meetingId}`);
//   return response.data;
// };

// export const generateAgendaForMeeting = async (meetingId) => {
//   const response = await axios.post(
//     `${API_BASE_URL}/${meetingId}/generate-agenda`
//   );
//   return response.data;
// };

// export const processTranscriptForMeeting = async (meetingId) => {
//   const response = await axios.post(
//     `${API_BASE_URL}/${meetingId}/process-transcript`
//   );
//   return response.data;
// };
// frontend/src/services/api.js
import axios from "axios";

// Get the full backend URL from environment variables
// For local dev, if VITE_API_FULL_BACKEND_URL is not set, it will use the relative path for the Vite proxy.
// For production, VITE_API_FULL_BACKEND_URL MUST be set.
const API_URL = import.meta.env.VITE_API_FULL_BACKEND_URL || "/api/meetings";

export const createNewMeeting = async (title, topic, participants) => {
  // If API_URL is relative (for local dev with proxy), it resolves correctly.
  // If API_URL is absolute (for production), it uses that.
  const response = await axios.post(`${API_URL}`, {
    // Note: No extra /api/meetings if API_URL already contains it
    title,
    topic,
    participants,
  });
  return response.data;
};

export const getMeetingDetails = async (meetingId) => {
  const response = await axios.get(`${API_URL}/${meetingId}`);
  return response.data;
};

export const generateAgendaForMeeting = async (meetingId) => {
  const response = await axios.post(`${API_URL}/${meetingId}/generate-agenda`);
  return response.data;
};

export const processTranscriptForMeeting = async (meetingId) => {
  const response = await axios.post(
    `${API_URL}/${meetingId}/process-transcript`
  );
  return response.data;
};
