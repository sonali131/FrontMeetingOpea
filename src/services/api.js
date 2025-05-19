import axios from "axios";

const API_BASE_URL = "/api/meetings"; // Vite will proxy this

export const createNewMeeting = async (title, topic, participants) => {
  const response = await axios.post(API_BASE_URL, {
    title,
    topic,
    participants,
  });
  return response.data;
};

export const getMeetingDetails = async (meetingId) => {
  const response = await axios.get(`${API_BASE_URL}/${meetingId}`);
  return response.data;
};

export const generateAgendaForMeeting = async (meetingId) => {
  const response = await axios.post(
    `${API_BASE_URL}/${meetingId}/generate-agenda`
  );
  return response.data;
};

export const processTranscriptForMeeting = async (meetingId) => {
  const response = await axios.post(
    `${API_BASE_URL}/${meetingId}/process-transcript`
  );
  return response.data;
};
