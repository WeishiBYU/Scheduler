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
      
      <div className="what-to-expect">
        <h3>WHAT TO EXPECT</h3>
        <p className="intro-text">
          When you submit, you are booked into the schedule. We will contact you quickly if there is a conflict.
        </p>
        
        <div className="expect-section">
          <h4>SOON:</h4>
          <p>
            Your appointment will be processed with the Housecall Pro App which can also process payments..if you want to pay now please ask for an invoice and you can pay online.
          </p>
        </div>
        
        <div className="expect-section">
          <h4>ON THE DATE OF SERVICE:</h4>
          <p>
            You will receive a text or phone call from the technician letting you know he is on the way. He may be early OR he may let you know he is still helping the previous customer and will be delayed.
          </p>
        </div>
        
        <div className="expect-section">
          <h4>DURING THE JOB:</h4>
          <p>
            Your technician will need water from an available sink or tub and will dump the dirty water down the toilet (or wherever you specify). Our enzyme actually HELPS septic tanks.
          </p>
          <ul className="job-details">
            <li>Please give access to areas to be cleaned.</li>
            <li>For best results circulate air the best you can after the service to speed up drying.</li>
            <li>Dry times vary but usually takes about 24 hours.</li>
            <li>Text 907-206-2995 with any questions. THANKS!</li>
          </ul>
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