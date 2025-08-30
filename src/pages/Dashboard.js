import React, { useState, useEffect } from 'react';
import { FaUserMd } from 'react-icons/fa';
// --- 1. IMPORT THE NEW API FUNCTION ---
import { getDoctorById, getPatientsByDoctorId, createPatient } from '../services/api'; 
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import PatientTable from '../components/PatientTable';

const Dashboard = () => {
  const [doctor, setDoctor] = useState(null);
  const [patients, setPatients] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const doctorId = 'jdoe456';

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        // Using Promise.all is slightly more efficient as it runs requests in parallel
        const [doctorResponse, patientsResponse] = await Promise.all([
            getDoctorById(doctorId),
            getPatientsByDoctorId(doctorId)
        ]);
        setDoctor(doctorResponse.data);
        setPatients(patientsResponse.data.patients);
      } catch (err) {
        console.error("Failed to load dashboard data:", err);
        setError("Could not retrieve required data. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    };

    loadDashboardData();
  }, [doctorId]);

  // --- 2. ADD THE HANDLER FUNCTION TO SAVE A NEW PATIENT ---
  const handlePatientAdded = async (newPatientData) => {
    try {
      // Add the doctor's ID to the data before sending to the API
      const patientPayload = {
        ...newPatientData,
        primary_doctor_id: doctorId,
      };
      
      const response = await createPatient(patientPayload);
      const newlyCreatedPatient = response.data;

      // Add the new patient to the state to instantly update the UI
      setPatients(currentPatients => [...currentPatients, newlyCreatedPatient]);
      return true; // Return true to signal success
    } catch (err) {
      console.error("Failed to create patient:", err);
      setError("Could not save the new patient. Please check the data and try again.");
      return false; // Return false to signal failure
    }
  };

  if (isLoading) {
    return <div className="dashboard-container"><LoadingSpinner /></div>;
  }

  if (error) {
    // Also display the error message within the dashboard container for consistent layout
    return (
        <div className="dashboard-container">
            <ErrorMessage message={error} />
        </div>
    );
  }

  return (
    <div className="dashboard-container">
      {doctor && (
        <header className="doctor-header">
          <div className="doctor-icon-wrapper">
            <FaUserMd />
          </div>
          <div className="doctor-details">
            <h1>{doctor.name}'s Dashboard</h1>
            <p>Affiliation: {doctor.affiliation}</p>
          </div>
        </header>
      )}

      <main className="patients-section">
        {/* --- 3. PASS THE NEW HANDLER DOWN TO THE TABLE --- */}
        <PatientTable
          patients={patients}
          onPatientAdded={handlePatientAdded}
        />
      </main>
    </div>
  );
};

export default Dashboard;