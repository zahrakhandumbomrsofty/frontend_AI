// src/components/PatientTable.js - Complete File

import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom'; // <-- 1. IMPORT useNavigate
import { 
  FaPlus, FaSearch, FaSort, FaSortUp, FaSortDown, 
  FaUser, FaHashtag, FaPhoneAlt 
} from 'react-icons/fa';
import './PatientTable.css';
import AddPatientModal from './AddPatientModal';

const PatientTable = ({ patients, onPatientAdded }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: 'name', direction: 'ascending' });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const navigate = useNavigate(); // <-- 2. INITIALIZE THE HOOK

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  // --- 3. CREATE A HANDLER FOR ROW CLICKS ---
  const handleRowClick = (patientId) => {
    navigate(`/patient/${patientId}`);
  };

  const sortedAndFilteredPatients = useMemo(() => {
    // ... (This logic remains exactly the same, no changes needed here)
    let filterablePatients = [...patients];
    if (searchTerm) {
      filterablePatients = filterablePatients.filter(patient =>
        patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        patient.mrn.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    if (sortConfig.key !== null) {
      filterablePatients.sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) return sortConfig.direction === 'ascending' ? -1 : 1;
        if (a[sortConfig.key] > b[sortConfig.key]) return sortConfig.direction === 'ascending' ? 1 : -1;
        return 0;
      });
    }
    return filterablePatients;
  }, [patients, searchTerm, sortConfig]);

  const requestSort = (key) => {
    // ... (This logic remains exactly the same)
    let direction = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };
  
  const getSortIcon = (key) => {
    // ... (This logic remains exactly the same)
    if (sortConfig.key !== key) return <FaSort className="sort-icon" />;
    if (sortConfig.direction === 'ascending') return <FaSortUp className="sort-icon active" />;
    return <FaSortDown className="sort-icon active" />;
  };

  return (
    <>
      <div className="table-container">
        {/* ... (The table controls div remains the same) ... */}
        <div className="table-controls">
          <div className="search-wrapper">
            <FaSearch className="search-icon" />
            <input type="text" placeholder="Search by name or MRN..." className="search-input" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
          </div>
          <button className="add-patient-btn" onClick={openModal}>
            <FaPlus style={{ marginRight: '8px' }} />
            Create New Patient
          </button>
        </div>

        <table className="patient-table">
          {/* ... (The table thead remains the same) ... */}
          <thead>
            <tr>
              <th onClick={() => requestSort('name')}>Name {getSortIcon('name')}</th>
              <th onClick={() => requestSort('mrn')}>MRN {getSortIcon('mrn')}</th>
              <th onClick={() => requestSort('dob')}>Date of Birth {getSortIcon('dob')}</th>
              <th>Gender</th>
              <th>Phone</th>
              <th>Allergies & Comorbidities</th>
            </tr>
          </thead>
          <tbody>
            {sortedAndFilteredPatients.length > 0 ? (
              sortedAndFilteredPatients.map((patient) => (
                // --- 4. ADD onClick HANDLER AND A CLASS FOR STYLING ---
                <tr key={patient.patient_id} onClick={() => handleRowClick(patient.patient_id)} className="clickable-row">
                  <td><div className="cell-with-icon"><FaUser className="cell-icon" />{patient.name}</div></td>
                  <td><div className="cell-with-icon"><FaHashtag className="cell-icon" />{patient.mrn}</div></td>
                  <td>{patient.dob}</td>
                  <td>{patient.gender}</td>
                  <td><div className="cell-with-icon"><FaPhoneAlt className="cell-icon" />{patient.phone}</div></td>
                  <td>{patient.allergies_and_comorbidities.join(', ') || 'N/A'}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6">No patients found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <AddPatientModal isOpen={isModalOpen} onRequestClose={closeModal} onPatientAdded={onPatientAdded} />
    </>
  );
};

export default PatientTable;