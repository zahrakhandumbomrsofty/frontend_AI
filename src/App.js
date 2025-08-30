// src/App.js - Complete File

import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import PatientDetailPage from './pages/PatientDetailPage'; // <-- 1. IMPORT THE NEW PAGE
import './App.css';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import VerifyMFA from './pages/VerifyMFA';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          {/* Public auth routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/verify-mfa" element={<VerifyMFA />} />

          {/* Protected routes */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          
          {/* --- 2. ADD THE NEW ROUTE FOR THE DETAIL PAGE --- */}
          {/* The :patientId part is a URL parameter */}
          <Route
            path="/patient/:patientId"
            element={
              <ProtectedRoute>
                <PatientDetailPage />
              </ProtectedRoute>
            }
          />

        </Routes>
      </div>
    </Router>
  );
}

export default App;