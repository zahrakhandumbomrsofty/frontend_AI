import React, { useState } from 'react';
import Modal from 'react-modal';
import { 
  FaUser, FaHashtag, FaPhoneAlt, FaVenusMars, FaCalendarAlt, 
  FaPlusCircle, FaBan, FaSave, FaNotesMedical 
} from 'react-icons/fa';
import './AddPatientModal.css';

Modal.setAppElement('#root');

const AddPatientModal = ({ isOpen, onRequestClose, onPatientAdded }) => {
  // State for form fields
  const [name, setName] = useState('');
  const [mrn, setMrn] = useState('');
  const [dob, setDob] = useState('');
  const [gender, setGender] = useState('Male');
  const [phone, setPhone] = useState('');
  const [allergies, setAllergies] = useState('');

  // --- 1. MAKE THE SUBMIT HANDLER ASYNCHRONOUS ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Process the allergies string into an array of strings
    const allergiesList = allergies.split(',').map(item => item.trim()).filter(item => item);

    const newPatientData = { 
      name, 
      mrn, 
      dob, 
      gender, 
      phone,
      allergies_and_comorbidities: allergiesList
    };

    // --- 2. CALL THE FUNCTION FROM PROPS AND AWAIT ITS RESULT ---
    const success = await onPatientAdded(newPatientData);

    // --- 3. ONLY CLOSE THE MODAL IF THE API CALL WAS SUCCESSFUL ---
    if (success) {
      // Clear the form for the next time it opens
      setName('');
      setMrn('');
      setDob('');
      setGender('Male');
      setPhone('');
      setAllergies('');
      onRequestClose();
    }
    // If not successful, the modal stays open, and the Dashboard will show an error.
  };

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onRequestClose}
      className="modal"
      overlayClassName="overlay"
      contentLabel="Add New Patient"
    >
      <div className="modal-header">
        <h2><FaPlusCircle style={{ marginRight: '10px' }} />Add New Patient</h2>
        <button onClick={onRequestClose} className="close-button">&times;</button>
      </div>
      <form onSubmit={handleSubmit} className="modal-form">
        <div className="form-group">
          <label htmlFor="name"><FaUser className="form-icon" />Full Name</label>
          <input id="name" type="text" value={name} onChange={e => setName(e.target.value)} required />
        </div>
        <div className="form-group">
          <label htmlFor="mrn"><FaHashtag className="form-icon" />Medical Record Number (MRN)</label>
          <input id="mrn" type="text" value={mrn} onChange={e => setMrn(e.target.value)} required />
        </div>
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="dob"><FaCalendarAlt className="form-icon" />Date of Birth</label>
            <input id="dob" type="date" value={dob} onChange={e => setDob(e.target.value)} required />
          </div>
          <div className="form-group">
            <label htmlFor="gender"><FaVenusMars className="form-icon" />Gender</label>
            <select id="gender" value={gender} onChange={e => setGender(e.target.value)}>
              <option>Male</option>
              <option>Female</option>
              <option>Other</option>
            </select>
          </div>
        </div>
        <div className="form-group">
          <label htmlFor="phone"><FaPhoneAlt className="form-icon" />Phone Number</label>
          <input id="phone" type="tel" value={phone} onChange={e => setPhone(e.target.value)} />
        </div>
        <div className="form-group">
          <label htmlFor="allergies"><FaNotesMedical className="form-icon" />Allergies & Comorbidities</label>
          <input 
            id="allergies" 
            type="text" 
            value={allergies} 
            onChange={e => setAllergies(e.target.value)}
            placeholder="e.g., Penicillin, Asthma, Diabetes"
          />
        </div>
        <div className="modal-actions">
          <button type="button" onClick={onRequestClose} className="cancel-btn">
            <FaBan style={{ marginRight: '8px' }} />Cancel
          </button>
          <button type="submit" className="submit-btn">
            <FaSave style={{ marginRight: '8px' }} />Save Patient
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default AddPatientModal;