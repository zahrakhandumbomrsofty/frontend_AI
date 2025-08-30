// src/components/Transcription.js - CORRECTED FOR LAST CHUNK SAVE BUG

import React, { useState, useRef, useEffect } from 'react';
import { FaMicrophone, FaStopCircle, FaEdit, FaSave, FaPlayCircle } from 'react-icons/fa';
import { createTranscription } from '../services/api'; // saveTranscript is no longer needed here
import './Transcription.css';

const CHUNK_INTERVAL = 20000;

const Transcription = ({ 
    patientId, 
    isLiveRecording, 
    onRecordingStateChange, 
    onNewChunk, 
    transcriptToDisplay, 
    onSaveRequest, // This is now a signal to the parent to save
    isEditing,
    onToggleEdit,
    onSaveChanges,
    onContentChange
}) => {
    const [status, setStatus] = useState("Press 'Start Transcription' to begin...");

    const chunkCounterRef = useRef(0);
    const stopFlagRef = useRef(false);
    const streamRef = useRef(null);
    const mediaRecorderRef = useRef(null); // Keep a ref to the recorder instance

    useEffect(() => {
        if (isLiveRecording) {
            setStatus(`Listening... (chunk ${chunkCounterRef.current + 1})`);
        } else if (isEditing) {
            setStatus("Editing mode: Make your changes and click 'Save Changes'.");
        } else {
            if (transcriptToDisplay) {
                setStatus("Viewing a past transcription. You can 'Continue' this session, 'Start New', or 'Edit'.");
            } else {
                setStatus("Press 'Start Transcription' to begin...");
            }
        }
    }, [isLiveRecording, isEditing, transcriptToDisplay]);

    const recordAndTranscribeChunk = async () => {
        try {
            const localChunks = [];
            const recorder = new MediaRecorder(streamRef.current, { mimeType: 'audio/webm' });
            mediaRecorderRef.current = recorder; // Store the instance

            recorder.ondataavailable = (e) => {
                if (e.data.size > 0) localChunks.push(e.data);
            };

            recorder.onstop = async () => {
                // This is the only place we should nullify the recorder ref
                mediaRecorderRef.current = null;
                chunkCounterRef.current += 1;
                const blob = new Blob(localChunks, { type: 'audio/webm' });

                // If the blob is empty (e.g., immediate stop), don't process
                if (blob.size === 0) {
                    if (stopFlagRef.current) {
                        onRecordingStateChange(false); // Ensure parent state is updated
                    }
                    return;
                }

                setStatus(`Transcribing chunk ${chunkCounterRef.current}...`);

                const reader = new FileReader();
                reader.readAsDataURL(blob);
                reader.onloadend = async () => {
                    const dataUrl = reader.result;
                    if (!dataUrl) return;

                    try {
                        const response = await createTranscription(dataUrl, "");
                        const newText = response.data.new_transcript;
                        if (newText) onNewChunk(newText);
                        
                        if (!stopFlagRef.current) {
                            setStatus(`Listening... (chunk ${chunkCounterRef.current + 1})`);
                            startNextChunk();
                        } else {
                            // This was the final chunk, now we can tell the parent we are done.
                            onRecordingStateChange(false);
                            setStatus("Session stopped. Transcript ready.");
                        }
                    } catch (err) {
                        console.error("Transcription API error:", err);
                        let detail = "An unknown error occurred.";
                        if (err.response?.data?.details) detail = err.response.data.details;
                        const errorText = `\n\n--- CRITICAL ERROR ON CHUNK ${chunkCounterRef.current} ---\n${detail}\n`;
                        onNewChunk(errorText);
                        setStatus("Fatal error. See transcript above.");
                        handleStop(false); // Use internal stop without saving
                    }
                };
            };

            recorder.start();
            setTimeout(() => {
                // Only stop if this specific recorder is still active
                if (mediaRecorderRef.current === recorder && recorder.state === "recording") {
                    recorder.stop();
                }
            }, CHUNK_INTERVAL);
        } catch (e) {
            console.error("Recording chunk failed:", e);
            setStatus("Error recording audio chunk.");
            handleStop(false);
        }
    };

    const startNextChunk = () => {
        if (!stopFlagRef.current) recordAndTranscribeChunk();
    };

    const startRecording = async (isContinuation = false) => {
        setStatus(isContinuation ? "Continuing transcription..." : "Initializing new session...");
        chunkCounterRef.current = 0;
        stopFlagRef.current = false;

        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            streamRef.current = stream;
            // Tell parent to start recording, clearing content only if it's not a continuation
            onRecordingStateChange(true, !isContinuation); 
            recordAndTranscribeChunk();
        } catch (error) {
            console.error("Error accessing microphone:", error);
            setStatus("Could not access microphone.");
            onRecordingStateChange(false);
        }
    };

    // --- RENAMED AND SIMPLIFIED STOP LOGIC ---
    const handleStop = (shouldRequestSave) => {
        stopFlagRef.current = true;
        if (shouldRequestSave) {
            onSaveRequest(); // Signal to the parent that a save is needed
            setStatus("Finalizing and saving...");
        } else {
            setStatus("Stopping session...");
        }

        // If a recorder is active, stop it. This will trigger the `onstop` logic.
        if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
            mediaRecorderRef.current.stop();
        } else {
            // If no recorder is active, the recording process is already over.
            // We just need to ensure the parent's state is correct.
            onRecordingStateChange(false);
        }
        
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop());
            streamRef.current = null;
        }
    };
    
    // --- END OF RENAMED LOGIC ---

    useEffect(() => {
        // Cleanup function for when the component unmounts
        return () => {
            if (isLiveRecording) {
                handleStop(false); // Stop without saving on unmount
            }
        };
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const editButtonDisabled = isLiveRecording || !transcriptToDisplay;
    const continueButtonDisabled = isLiveRecording || isEditing || !transcriptToDisplay;

    return (
        <div className="transcription-container">
            <div className="transcription-header">
                <h2>Consultation Transcript</h2>
                <div className="button-group">
                    {isEditing ? (
                        <button onClick={onSaveChanges} className="control-btn save-edit-btn" disabled={editButtonDisabled}>
                            <FaSave /> Save Changes
                        </button>
                    ) : (
                        <button onClick={onToggleEdit} className="control-btn edit-btn" disabled={editButtonDisabled}>
                            <FaEdit /> Edit
                        </button>
                    )}

                    {!isLiveRecording ? (
                        <>
                            <button onClick={() => startRecording(true)} className="control-btn continue-btn" disabled={continueButtonDisabled}>
                                <FaPlayCircle /> Continue
                            </button>
                            <button onClick={() => startRecording(false)} className="control-btn start-btn">
                                <FaMicrophone /> Start New
                            </button>
                        </>
                    ) : (
                        <button onClick={() => handleStop(true)} className="control-btn stop-btn">
                            <FaStopCircle /> Stop & Save
                        </button>
                    )}
                </div>
            </div>
            <p className="transcription-status">{status}</p>
            
            {isEditing ? (
                <textarea
                    className="transcript-display-editor"
                    value={transcriptToDisplay}
                    onChange={(e) => onContentChange(e.target.value)}
                    disabled={isLiveRecording}
                />
            ) : (
                <div className="transcript-display">
                    {transcriptToDisplay || "Transcription will appear here..."}
                </div>
            )}
        </div>
    );
};

export default Transcription;