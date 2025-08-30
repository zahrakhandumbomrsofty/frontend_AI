// src/components/AIAnalysis.js - CORRECTED

import React from 'react';
import { FaBrain } from 'react-icons/fa';
import LoadingSpinner from './LoadingSpinner';
import ErrorMessage from './ErrorMessage';
import './AIAnalysis.css';

// Accept 'className' as a prop
const AIAnalysis = ({ isAnalyzing, analysisResult, className }) => {
  // Combine the default class with any additional class names passed via props
  const rootClasses = `ai-analysis-container ${className || ''}`.trim();

  // Don't render anything if we are not analyzing and there's no result
  if (!isAnalyzing && !analysisResult) {
    return null;
  }

  return (
    // Apply the combined class names here
    <div className={rootClasses}>
      <h3><FaBrain /> AI Analysis</h3>
      
      {isAnalyzing && (
        <div className="analysis-loading">
          Generating analysis... <LoadingSpinner />
        </div>
      )}
      
      {analysisResult && analysisResult.error && (
        <ErrorMessage message={analysisResult.error} />
      )}
      
      {analysisResult && !analysisResult.error && (
        <div className="analysis-content">
          <h4>
            Candidate Disease: <span>{analysisResult.candidate_disease}</span>
          </h4>
          <p>
            <strong>Reasoning:</strong> {analysisResult.reasoning}
          </p>
          <h5>Follow-up Questions:</h5>
          <ul className="analysis-questions">
            {analysisResult.follow_up_questions.map((q, index) => (
              <li key={index}>{q}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default AIAnalysis;