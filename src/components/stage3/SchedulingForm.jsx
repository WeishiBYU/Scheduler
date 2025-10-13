import React from 'react';
import { useNavigate } from 'react-router-dom';
import './SchedulingForm.css';

const SchedulingForm  = () => {
  const navigate = useNavigate();

  const handleNext = () => {
    navigate('/confirmation');
  };

  const handleBack = () => {
    navigate('/information');
  };
  
  return (
    <div className="scheduling-form">
      <h2>Step 3: Schedule Your Service</h2>
      <p>Choose your preferred date and time:</p>
      
      <div className="calendar-placeholder">
        <p>📅 Calendar Component will be implemented here</p>
        <p>Available time slots will be shown here</p>
      </div>
      
      <div className="time-slots-placeholder">
        <h3>Available Times</h3>
        <div className="time-grid">
          <button className="time-slot">9:00 AM</button>
          <button className="time-slot">11:00 AM</button>
          <button className="time-slot">1:00 PM</button>
          <button className="time-slot">3:00 PM</button>
        </div>
      </div>
      
      <div className="form-navigation">
        <button onClick={handleBack} className="back-button">
          ← Back to Information
        </button>
        <button onClick={handleNext} className="next-button">
          Continue to Confirmation →
        </button>
      </div>
    </div>
  );
};

export default SchedulingForm;