// src/components/ChatHistory.js - CORRECTED FOR AUDIO STOP BUG

import React, { useState, useRef, useEffect } from 'react';
import { FaComments, FaPaperPlane, FaMicrophone, FaStop } from 'react-icons/fa';
import { chatWithHistory, createTranscription } from '../services/api';
import LoadingSpinner from './LoadingSpinner';
import ErrorMessage from './ErrorMessage';
import './ChatHistory.css';

const ChatHistory = ({ patientId, className }) => {
  const [question, setQuestion] = useState('');
  const [conversation, setConversation] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const streamRef = useRef(null);
  
  const chatAreaRef = useRef(null);

  useEffect(() => {
    if (chatAreaRef.current) {
        chatAreaRef.current.scrollTop = chatAreaRef.current.scrollHeight;
    }
  }, [conversation, isLoading]);


  const rootClasses = `chat-history-container ${className || ''}`.trim();

  const fetchChatAnswer = async (questionText) => {
    if (!questionText.trim()) return;

    setError(null);
    const newConversationTurn = { role: 'user', content: questionText };
    setConversation(prev => [...prev, newConversationTurn]);
    setQuestion('');
    setIsLoading(true);

    try {
      const response = await chatWithHistory(patientId, questionText, conversation);
      const assistantResponse = { role: 'model', content: response.data.answer };
      setConversation(prev => [...prev, assistantResponse]);
    } catch (err) {
      console.error("Error chatting with history:", err);
      setError("Failed to get an answer. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleTextSubmit = async (e) => {
    e.preventDefault();
    await fetchChatAnswer(question);
  };

  const handleAudioRecording = async () => {
    if (isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      setIsRecording(true);
      setError(null);
      audioChunksRef.current = [];
      const recorder = new MediaRecorder(stream, { mimeType: 'audio/webm' });
      mediaRecorderRef.current = recorder;
      recorder.ondataavailable = (event) => audioChunksRef.current.push(event.data);
      recorder.onstop = async () => {
        if (streamRef.current) streamRef.current.getTracks().forEach(track => track.stop());
        setIsTranscribing(true);
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const reader = new FileReader();
        reader.readAsDataURL(audioBlob);
        reader.onloadend = async () => {
          try {
            const transcriptionResponse = await createTranscription(reader.result, "");
            const transcribedText = transcriptionResponse.data.new_transcript;
            if (transcribedText) {
              await fetchChatAnswer(transcribedText);
            } else {
              setError("Audio was unclear or contained no speech.");
            }
          } catch (err) {
            setError("Could not process the audio question.");
          } finally {
            setIsTranscribing(false);
          }
        };
      };
      recorder.start();
    } catch (err) {
      setError("Microphone access was denied or is unavailable.");
      setIsRecording(false);
    }
  };

  useEffect(() => {
    return () => {
      if (streamRef.current) streamRef.current.getTracks().forEach(track => track.stop());
    };
  }, []);

  const getPlaceholderText = () => {
    if (isRecording) return "Recording... Click the mic to stop.";
    if (isTranscribing) return "Transcribing your question...";
    if (isLoading) return "Getting answer...";
    return "Ask a follow-up or a new question...";
  };

  // --- THIS IS THE FIX ---
  // We now have separate disabled conditions for each element.
  const isTextInputDisabled = isRecording || isTranscribing || isLoading;
  const isMicButtonDisabled = isTranscribing || isLoading; // Does NOT include isRecording
  const isSendButtonDisabled = isRecording || isTranscribing || isLoading;
  // --- END OF FIX ---

  return (
    <div className={rootClasses}>
      <h3><FaComments /> Chat with History</h3>
      
      <div className="chat-area" ref={chatAreaRef}>
        {conversation.length === 0 && !isLoading && (
            <p className="no-answer-prompt">Ask a question about the patient's history.</p>
        )}
        {conversation.map((turn, index) => (
          <div key={index} className={`conversation-turn ${turn.role === 'user' ? 'user-turn' : 'model-turn'}`}>
            <p>{turn.content}</p>
          </div>
        ))}
        {isLoading && (
          <div className="model-turn loading-turn">
             <LoadingSpinner />
          </div>
        )}
        {error && <ErrorMessage message={error} />}
      </div>

      <form onSubmit={handleTextSubmit} className="chat-input-form">
        <input
          type="text"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder={getPlaceholderText()}
          disabled={isTextInputDisabled} // <-- Uses specific disabled state
        />
        <button
          type="button"
          onClick={handleAudioRecording}
          className={`mic-btn ${isRecording ? 'recording' : ''}`}
          disabled={isMicButtonDisabled} // <-- FIX: Uses its own specific disabled state
        >
          {isRecording ? <FaStop /> : <FaMicrophone />}
        </button>
        <button 
          type="submit" 
          disabled={isSendButtonDisabled || !question.trim()} // <-- Uses specific disabled state
        >
          <FaPaperPlane />
        </button>
      </form>
    </div>
  );
};

export default ChatHistory;