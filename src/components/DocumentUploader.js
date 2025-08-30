// src/components/DocumentUploader.js - NEW FILE

import React, { useState, useRef } from 'react';
import { FaFileUpload, FaPaperclip, FaSpinner, FaCheckCircle, FaTimesCircle } from 'react-icons/fa';
import { attachDocument } from '../services/api';
import './DocumentUploader.css';

const DocumentUploader = ({ patientId, activeFilename, onDocumentAttached, onUploadError }) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [status, setStatus] = useState('idle'); // idle, uploading, success, error
  const fileInputRef = useRef(null);

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedFile(file);
      setStatus('idle');
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    setStatus('uploading');
    try {
      const response = await attachDocument(patientId, activeFilename, selectedFile);
      onDocumentAttached(response.data.appended_text);
      setStatus('success');
    } catch (err) {
      console.error("Document upload error:", err);
      const errorMessage = err.response?.data?.error || "Failed to upload document.";
      onUploadError(errorMessage);
      setStatus('error');
    } finally {
      // Reset the input so the same file can be selected again if needed
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      setSelectedFile(null);
    }
  };

  const isButtonDisabled = !activeFilename || !selectedFile || status === 'uploading';
  let statusMessage;
  switch (status) {
    case 'uploading':
      statusMessage = <><FaSpinner className="spinner" /> Uploading...</>;
      break;
    case 'success':
      statusMessage = <><FaCheckCircle className="success-icon" /> Upload successful!</>;
      break;
    case 'error':
      statusMessage = <><FaTimesCircle className="error-icon" /> Upload failed.</>;
      break;
    default:
      statusMessage = selectedFile ? `Ready to upload: ${selectedFile.name}` : "Select a document to attach.";
  }

  return (
    <div className="info-card document-uploader-container">
      <h3><FaPaperclip /> Attach Document to Transcript</h3>
      {!activeFilename ? (
        <p className="uploader-prompt">Please select a transcript from the history list first.</p>
      ) : (
        <>
          <div className="uploader-controls">
            <input
              type="file"
              accept="image/jpeg, image/png, image/webp"
              onChange={handleFileChange}
              ref={fileInputRef}
              style={{ display: 'none' }}
              id="document-upload-input"
            />
            <label htmlFor="document-upload-input" className="select-file-btn">
              {selectedFile ? 'Change File' : 'Select File'}
            </label>
            <button onClick={handleUpload} className="upload-btn" disabled={isButtonDisabled}>
              <FaFileUpload /> Upload
            </button>
          </div>
          <p className="uploader-status">{statusMessage}</p>
        </>
      )}
    </div>
  );
};

export default DocumentUploader;