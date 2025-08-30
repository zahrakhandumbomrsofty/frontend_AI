// src/services/api.js - API layer using shared axios instance

import http from './http';
import httpAuth from './httpAuth';

// Base URL is configured in src/services/http.js

export const getDoctorById = (doctorId) => {
  return http.get(`/doctors/${doctorId}`);
};

export const getPatientsByDoctorId = (doctorId) => {
  return http.get(`/doctors/${doctorId}/patients`);
};

export const createPatient = (patientData) => {
  return http.post(`/patients`, patientData);
};

export const getPatientById = (patientId) => {
  return http.get(`/patients/${patientId}`);
};

export const getPatientTranscriptions = (patientId) => {
  return http.get(`/transcriptions/${patientId}`);
};

export const getTranscriptionContent = (patientId, filename) => {
  return http.get(`/transcriptions/${patientId}/${filename}`);
};

export const updateTranscript = (patientId, filename, fullTranscript) => {
    return http.put(`/transcriptions/${patientId}/${filename}`, {
      full_transcript: fullTranscript
    });
};

export const analyzeTranscript = (fullTranscript) => {
  return http.post(`/analyze`, {
    full_transcript: fullTranscript
  });
};

export const createTranscription = (audioChunkDataUrl, previousTranscript) => {
  return http.post(`/transcribe`, {
    audio_chunk: audioChunkDataUrl,
    previous_transcript: previousTranscript,
  });
};

export const saveTranscript = (patientId, fullTranscript) => {
  return http.post(`/patient/${patientId}/transcript`, {
    full_transcript: fullTranscript
  });
};

export const chatWithHistory = (patientId, question, chatHistory) => {
  return http.post(`/chat/${patientId}`, {
    question: question,
    chat_history: chatHistory
  });
};

/**
 * Uploads a document to be attached to a specific transcript.
 * @param {string} patientId The ID of the patient.
 * @param {string} filename The filename of the transcript to attach to.
 * @param {File} documentFile The image file to upload.
 * @returns {Promise}
 */
export const attachDocument = (patientId, filename, documentFile) => {
  const formData = new FormData();
  formData.append('document', documentFile);

  return http.post(
    `/transcriptions/${patientId}/${filename}/attach`,
    formData
  );
};

// ==========================
// AUTH API HELPERS
// ==========================

/**
 * POST /api/auth/login
 * Body: { email, password }
 * Response: { user_id, mfa_required: true, code: 'MFA_REQUIRED' }
 */
export const authLogin = (email, password) => {
  return httpAuth.post(`/auth/login`, { email, password });
};

/**
 * POST /api/auth/verify-mfa
 * Body: { user_id, mfa_code }
 * Response: { access_token, session_token, user, expires_at }
 */
export const authVerifyMfa = (userId, mfaCode) => {
  return httpAuth.post(`/auth/verify-mfa`, { user_id: userId, mfa_code: mfaCode });
};

/**
 * POST /api/auth/resend-mfa
 * Body: { user_id }
 */
export const authResendMfa = (userId) => {
  return httpAuth.post(`/auth/resend-mfa`, { user_id: userId });
};

/**
 * POST /api/auth/logout (JWT required)
 * Headers: Authorization: Bearer <access_token>, X-Session-Token: <session_token>
 */
export const authLogout = (accessToken, sessionToken) => {
  return httpAuth.post(`/auth/logout`, {});
};

/**
 * POST /api/auth/logout-all (JWT required)
 */
export const authLogoutAll = (accessToken) => {
  return httpAuth.post(`/auth/logout-all`, {});
};

/**
 * POST /api/auth/refresh-session (JWT required)
 * Headers: Authorization + X-Session-Token
 */
export const authRefreshSession = (accessToken, sessionToken) => {
  return httpAuth.post(`/auth/refresh-session`, {});
};

/**
 * GET /api/auth/profile (JWT required)
 */
export const authGetProfile = (accessToken) => {
  return httpAuth.get(`/auth/profile`);
};