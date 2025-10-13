import React from 'react';
import { useNavigate } from 'react-router-dom';
import './ConfirmationForm.css';

const ConfirmationForm = () => {
  const navigate = useNavigate();

  const handleSubmit = () => {
    alert('Booking confirmed! You will receive a confirmation email shortly.');
    // TODO: Submit booking data
  };

  const handleBack = () => {
    navigate('/schedule');
  };

  return (
    <div className="confirmation-form">
      <h2>Step 4: Confirm Your Booking</h2>
      <p>Please review your booking details:</p>
      
      <div className="booking-summary">
        <div className="summary-section">
          <h3>Selected Services</h3>
          <p>Services will be displayed here from global state</p>
        </div>
        
        <div className="summary-section">
          <h3>Scheduled Date & Time</h3>
          <p>Date and time will be displayed here from global state</p>
        </div>
        
        <div className="summary-section">
          <h3>Contact Information</h3>
          <p>Customer details will be displayed here from global state</p>
        </div>
        
        <div className="summary-section">
          <h3>Total Price</h3>
          <p className="total-price">$0.00 (will be calculated from selected services)</p>
        </div>
      </div>
      
      <div className="confirmation-actions">
        <div className="form-navigation">
          <button onClick={handleBack} className="back-button">
            ← Back to Scheduling
          </button>
          <button onClick={handleSubmit} className="confirm-button">
            Confirm Booking ✓
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationForm;