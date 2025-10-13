import React from 'react';
import { useNavigate } from 'react-router-dom';
import './InformationForm.css';

const InformationForm = () => {
  const navigate = useNavigate();

  const handleNext = () => {
    navigate('/schedule');
  };

  const handleBack = () => {
    navigate('/quote');
  };

  return (
    <div className="information-form">
      <h2>Step 2: Your Information</h2>
      <p>Please provide your contact details and preferences:</p>
      
      <form className="info-form">
        <div className="form-group">
          <label htmlFor="firstName">First Name *</label>
          <input type="text" id="firstName" name="firstName" required />
          <small className="field-description">Enter your first name for the service agreement</small>
        </div>
        
        <div className="form-group">
          <label htmlFor="lastName">Last Name *</label>
          <input type="text" id="lastName" name="lastName" required />
          <small className="field-description">Enter your last name for the service agreement</small>
        </div>
        
        <div className="form-group">
          <label htmlFor="email">Email Address *</label>
          <input type="email" id="email" name="email" required />
          <small className="field-description">We'll send your booking confirmation and updates to this email</small>
        </div>
        
        <div className="form-group">
          <label htmlFor="phone">Phone Number *</label>
          <input type="tel" id="phone" name="phone" required />
          <small className="field-description">*By giving your phone number you give permission to Alaska Floor Care to update you via SMS/MMS with information regarding your booking.  You can opt out of these SMS messages anytime by replying STOP. We do not sell or distribute your data to third parties. Data rates may apply to the SMS messages you receive. Thank you.
            Please find our Privacy Statement here: <a href="https://www.alaskafloorcare.com/general-5" target="_blank" rel="noopener noreferrer">https://www.alaskafloorcare.com/general-5</a></small>
        </div>
        

        <div className="form-group">
          <label htmlFor="address">Service Address *</label>
          <textarea id="address" name="address" rows="2" required></textarea>
          <small className="field-description">We will use GPS, please include city and/or unit number</small>
        </div>

        <div className="form-group">
          <label htmlFor="reason">Reason for Cleaning (Optional)</label>
          <input type="text" id="reason" name="reason" required />
        </div>
        
        <div className="form-group">
          <label htmlFor="instructions">Special Instructions</label>
          <textarea id="instructions" name="instructions" rows="4" placeholder="Any special requirements or notes..."></textarea>
          <small className="field-description"> example: lock box code, dog urine areas, deadlines, smiley faces, etc. THANK YOU :)</small>

        </div>

        <div className="form-group">
          <label htmlFor="presentForAppt">Will the paying party be there to let us in on the day of the appointment? If not, we WILL NEED PRE-PAYMENT. *  </label>
          <select id="presentForAppt" name="presentForAppt" required>
            <option value="">Please select an option...</option>
            <option value="stay-and-pay">Yes I will be there - I will stay and pay at the end.</option>
            <option value="pay-and-leave">Yes I will pay and then I will need to leave. (payment is required before you leave :)</option>
            <option value="unlocked-prepay">I will leave the door unlocked and prepay. Please send the invoice. (payment is required before the job begins)</option>
            <option value="locked-prepay">I will prepay. The door is locked and I will provide the lock code or instructions to get in. Please send the invoice.</option>
            <option value="other">Other</option>
          </select>
          <small className="field-description">Choose how you'll handle payment and access for your appointment</small>
        </div>

        <div className="form-group">
          <label htmlFor="payment">PAYMENT*</label>
          <select id="payment" name="payment" required>
            <option value="">Please select an option...</option>
            <option value="check">Pay with check to Alaska Floor Care before or as the job is finishing.</option>
            <option value="cash">Pay with cash</option>
            <option value="card">Credit card (payment is due prior to or during the job)</option>
            <option value="other">Other</option>
          </select>
          <small className="field-description">Please note that PAYMENT IS DUE AS WE FINISH the last area.  If you are not present or need to leave the job site, we require pre-payment. :)  We do not do billing.  THANK YOU for helping us work efficiently.</small>
        </div>

        <div className="form-group">
          <label htmlFor="instructions">Special Instructions</label>
          <textarea id="instructions" name="instructions" rows="4" placeholder="Any special requirements or notes..."></textarea>
          <small className="field-description"> example: lock box code, dog urine areas, deadlines, smiley faces, etc. THANK YOU :)</small>
        </div>
      </form>
      
      <div className="form-navigation">
        <button onClick={handleBack} className="back-button">
          ← Back to Quote
        </button>
        <button onClick={handleNext} className="next-button">
          Continue to Scheduling →
        </button>
      </div>
    </div>
  );
};

export default InformationForm;