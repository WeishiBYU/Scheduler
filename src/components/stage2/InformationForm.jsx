import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useBooking } from '../../contexts/BookingContext';
import './InformationForm.css';

const InformationForm = () => {
  const navigate = useNavigate();
  const { customerInfo, setCustomerInfo } = useBooking();

  const handleNext = (e) => {
    e.preventDefault();
    console.log('Form submitted!');
    console.log('Current customerInfo:', customerInfo);
    
    // Validate required fields
    if (!customerInfo.firstName || !customerInfo.lastName || !customerInfo.email || 
        !customerInfo.phone || !customerInfo.address || !customerInfo.presentForAppt || 
        !customerInfo.payment) {
      console.log('Validation failed - missing required fields');
      alert('Please fill in all required fields.');
      return;
    }
    console.log('Validation passed, navigating to schedule');
    navigate('/schedule');
  };

  const handleBack = () => {
    navigate('/quote');
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    console.log(`Input changed: ${name} = ${value}`);
    setCustomerInfo(prev => {
      const updated = {
        ...prev,
        [name]: value
      };
      console.log('Updated customerInfo:', updated);
      return updated;
    });
  };

  return (
    <div className="information-form">
      <h2>Step 2: Your Information</h2>
      <p>Please provide your contact details and preferences:</p>
      
      <form className="info-form" onSubmit={handleNext}>
        <div className="form-group">
          <label htmlFor="firstName">First Name *</label>
          <input 
            type="text" 
            id="firstName" 
            name="firstName" 
            value={customerInfo.firstName || ''}
            onChange={handleInputChange}
            required 
          />
          <small className="field-description">Enter your first name for the service agreement</small>
        </div>
        
        <div className="form-group">
          <label htmlFor="lastName">Last Name *</label>
          <input 
            type="text" 
            id="lastName" 
            name="lastName" 
            value={customerInfo.lastName || ''}
            onChange={handleInputChange}
            required 
          />
          <small className="field-description">Enter your last name for the service agreement</small>
        </div>
        
        <div className="form-group">
          <label htmlFor="email">Email Address *</label>
          <input 
            type="email" 
            id="email" 
            name="email" 
            value={customerInfo.email || ''}
            onChange={handleInputChange}
            required 
          />
          <small className="field-description">We'll send your booking confirmation and updates to this email</small>
        </div>
        
        <div className="form-group">
          <label htmlFor="phone">Phone Number *</label>
          <input 
            type="tel" 
            id="phone" 
            name="phone" 
            value={customerInfo.phone || ''}
            onChange={handleInputChange}
            required 
          />
          <small className="field-description">*By giving your phone number you give permission to Alaska Floor Care to update you via SMS/MMS with information regarding your booking. You can opt out of these SMS messages anytime by replying STOP. We do not sell or distribute your data to third parties. Data rates may apply to the SMS messages you receive. Thank you.
            Please find our Privacy Statement here: <a href="https://www.alaskafloorcare.com/general-5" target="_blank" rel="noopener noreferrer">https://www.alaskafloorcare.com/general-5</a></small>
        </div>
        
        <div className="form-group">
          <label htmlFor="address">Service Address *</label>
          <textarea 
            id="address" 
            name="address" 
            rows="2" 
            value={customerInfo.address || ''}
            onChange={handleInputChange}
            required
          ></textarea>
          <small className="field-description">We will use GPS, please include city and/or unit number</small>
        </div>

        <div className="form-group">
          <label htmlFor="presentForAppt">Will the paying party be there to let us in on the day of the appointment? If not, we WILL NEED PRE-PAYMENT. *</label>
          <select 
            id="presentForAppt" 
            name="presentForAppt" 
            value={customerInfo.presentForAppt || ''}
            onChange={handleInputChange}
            required
          >
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
          <label htmlFor="payment">PAYMENT *</label>
          <select 
            id="payment" 
            name="payment" 
            value={customerInfo.payment || ''}
            onChange={handleInputChange}
            required
          >
            <option value="">Please select an option...</option>
            <option value="check">Pay with check to Alaska Floor Care before or as the job is finishing.</option>
            <option value="cash">Pay with cash</option>
            <option value="card">Credit card (payment is due prior to or during the job)</option>
            <option value="other">Other</option>
          </select>
          <small className="field-description">Please note that PAYMENT IS DUE AS WE FINISH the last area. If you are not present or need to leave the job site, we require pre-payment. :) We do not do billing. THANK YOU for helping us work efficiently.</small>
        </div>
        
        <div className="form-group">
          <label htmlFor="instructions">Special Instructions</label>
          <textarea 
            id="instructions" 
            name="instructions" 
            rows="4" 
            placeholder="Any special requirements or notes..."
            value={customerInfo.instructions || ''}
            onChange={handleInputChange}
          ></textarea>
          <small className="field-description">Example: lock box code, dog urine areas, deadlines, smiley faces, etc. THANK YOU :)</small>
        </div>
        
        <div className="form-navigation">
          <button type="button" onClick={handleBack} className="back-button">
            ← Back to Quote
          </button>
          <button type="submit" className="next-button">
            Continue to Scheduling →
          </button>
        </div>
      </form>
    </div>
  );
};

export default InformationForm;