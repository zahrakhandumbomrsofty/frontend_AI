// src/pages/PatientDetailPage.js - MODIFIED TO INCLUDE DOCUMENT UPLOADER

import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getPatientById, getPatientTranscriptions, getTranscriptionContent, updateTranscript, analyzeTranscript, saveTranscript } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import Transcription from '../components/Transcription';
import AIAnalysis from '../components/AIAnalysis';
import ChatHistory from '../components/ChatHistory';
import DocumentUploader from '../components/DocumentUploader'; // <-- 1. Import new component
import { FaUserCircle, FaArrowLeft, FaIdCard, FaBirthdayCake, FaVenusMars, FaPhone, FaNotesMedical, FaCommentMedical, FaHistory } from 'react-icons/fa';
import './PatientDetailPage.css';

const PatientDetailPage = () => {
  const { patientId } = useParams();

  const [patient, setPatient] = useState(null);
  const [pastTranscriptions, setPastTranscriptions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isLiveRecording, setIsLiveRecording] = useState(false);
  const [transcriptContent, setTranscriptContent] = useState('');
  const [activeFilename, setActiveFilename] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isSavePending, setIsSavePending] = useState(false);

  useEffect(() => {
    if (isSavePending && !isLiveRecording) {
      const contentToSave = transcriptContent;
      if (contentToSave.trim()) {
        const dateStampRegex = /\[\d{2}-\d{2}-\d{4}\]/;
        let finalContent = contentToSave;
        const hasDateStamp = dateStampRegex.test(finalContent.substring(0, 20));

        if (!hasDateStamp) {
          const now = new Date();
          const day = String(now.getDate()).padStart(2, '0');
          const month = String(now.getMonth() + 1).padStart(2, '0');
          const year = now.getFullYear();
          const formattedDate = `[${day}-${month}-${year}]\n\n`;
          finalContent = formattedDate + finalContent;
        }

        saveTranscript(patientId, finalContent)
          .then(async (response) => {
            await fetchHistory();
            setActiveFilename(response.data.filename);
            runAnalysis(finalContent);
          })
          .catch(() => { setError("Error: Could not save the new transcript.") });
      }
      setIsSavePending(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLiveRecording, isSavePending]);

  const fetchHistory = useCallback(async () => {
    try {
      const response = await getPatientTranscriptions(patientId);
      setPastTranscriptions(response.data.transcriptions);
    } catch (err) {
      console.error("Could not refresh transcription history", err);
    }
  }, [patientId]);

  const runAnalysis = async (textToAnalyze) => {
    if (!textToAnalyze.trim()) return;
    setIsAnalyzing(true);
    setAnalysisResult(null);
    try {
      const response = await analyzeTranscript(textToAnalyze);
      setAnalysisResult(response.data);
    } catch (err) {
      setAnalysisResult({ error: "Failed to get AI analysis.", details: err.message });
    } finally {
      setIsAnalyzing(false);
    }
  };

  useEffect(() => {
    const loadPatientData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const [patientResponse, transcriptionsResponse] = await Promise.all([
          getPatientById(patientId),
          getPatientTranscriptions(patientId)
        ]);
        setPatient(patientResponse.data);
        setPastTranscriptions(transcriptionsResponse.data.transcriptions);
      } catch (err) {
        setError("Could not find or retrieve patient data.");
      } finally {
        setIsLoading(false);
      }
    };
    loadPatientData();
  }, [patientId]);

  const handleLoadTranscript = async (filename) => {
    if (isLiveRecording) {
      alert("Cannot load a past transcript while a live session is in progress.");
      return;
    }
    try {
      setError(null);
      setIsEditing(false);
      setAnalysisResult(null);
      setTranscriptContent('Loading transcript...');
      const response = await getTranscriptionContent(patientId, filename);
      const content = response.data.content;
      setTranscriptContent(content);
      setActiveFilename(filename);
      runAnalysis(content);
    } catch (err) {
      setError("Could not load the selected transcript.");
      setTranscriptContent('');
    }
  };

  const handleRecordingStateChange = (isRecording, shouldClearContent = true) => {
    setIsLiveRecording(isRecording);
    if (isRecording) {
      if (shouldClearContent) {
        setTranscriptContent('');
        setActiveFilename('');
        setAnalysisResult(null);
      }
      setIsEditing(false);
    }
  };

  const handleNewTranscriptChunk = (chunk) => {
    setTranscriptContent(prev => prev + chunk);
  };

  const handleContentChange = (newContent) => {
    setTranscriptContent(newContent);
  };

  const handleToggleEdit = () => {
    setIsEditing(prev => !prev);
  };
  
  const handleSaveChanges = async () => {
    if (!activeFilename) {
      setError("No active transcript selected to save.");
      return;
    }
    try {
      await updateTranscript(patientId, activeFilename, transcriptContent);
      setIsEditing(false);
      fetchHistory();
      runAnalysis(transcriptContent);
      alert("Transcript saved successfully!");
    } catch (err) {
      setError("An error occurred while saving the transcript.");
    }
  };

  const handleSaveRequest = () => {
    setIsSavePending(true);
  };

  // --- 2. ADD HANDLERS FOR THE NEW COMPONENT ---
  const handleDocumentAttached = (appendedText) => {
    // Append the new text to the current display for instant UI feedback
    setTranscriptContent(prev => prev + appendedText);
    // Optionally, re-run analysis automatically
    // runAnalysis(transcriptContent + appendedText);
  };

  const handleDocumentUploadError = (errorMessage) => {
    setError(`Document Upload Failed: ${errorMessage}`);
  };

  if (isLoading) return <div className="detail-container"><LoadingSpinner /></div>;
  if (error && !patient) return <div className="detail-container"><ErrorMessage message={error} /></div>;
  if (!patient) return <div className="detail-container">No patient data available.</div>;

  return (
    <div className="detail-container">
      <header className="detail-page-header">
        {/* ... header content ... */}
      </header>

      {error && <ErrorMessage message={error} />}

      <div className="patient-info-grid">
        {/* ... patient info cards ... */}
      </div>

      <div className="analysis-chat-grid">
        <AIAnalysis isAnalyzing={isAnalyzing} analysisResult={analysisResult} className="info-card"/>
        <ChatHistory patientId={patientId} className="info-card"/>
      </div>
      
      {/* --- 3. ADD THE NEW COMPONENT TO THE LAYOUT --- */}
      <DocumentUploader
        patientId={patientId}
        activeFilename={activeFilename}
        onDocumentAttached={handleDocumentAttached}
        onUploadError={handleDocumentUploadError}
      />

      <div className="transcription-layout-grid">
        <div className="info-card">
          <h3><FaHistory /> Transcription History</h3>
          {pastTranscriptions.length > 0 ? (
            <ul className="transcription-history-list">
              {pastTranscriptions.map((t) => {
                const isActive = activeFilename === t.filename && !isLiveRecording;
                return (
                  <li 
                    key={t.filename} 
                    className={`transcription-history-item ${isActive ? 'active' : ''}`}
                    onClick={() => handleLoadTranscript(t.filename)}
                  >
                    <span>{t.filename}</span>
                    <span className="transcription-date">{new Date(t.time_created).toLocaleString()}</span>
                  </li>
                );
              })}
            </ul>
          ) : <p>No previous transcriptions found for this patient.</p>}
        </div>

        <Transcription
          patientId={patientId}
          isLiveRecording={isLiveRecording}
          onRecordingStateChange={handleRecordingStateChange}
          onNewChunk={handleNewTranscriptChunk}
          transcriptToDisplay={transcriptContent}
          onSaveRequest={handleSaveRequest}
          isEditing={isEditing}
          onToggleEdit={handleToggleEdit}
          onSaveChanges={handleSaveChanges}
          onContentChange={handleContentChange}
        />
      </div>
    </div>
  );
};

export default PatientDetailPage;