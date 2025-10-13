import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useBooking } from '../../contexts/BookingContext';
import './ConfirmationForm.css';

const ConfirmationForm = () => {
  const navigate = useNavigate();
  const { 
    getSelectedServices, 
    calculateTotalPrice, 
    customerInfo, 
    selectedDate, 
    selectedTime 
  } = useBooking();

  const selectedServices = getSelectedServices();
  const totalPrice = calculateTotalPrice();

  const handleSubmit = () => {
    alert('Booking confirmed! You will receive a confirmation email shortly.');
    // TODO: Submit booking data to backend
    console.log('Booking Data:', {
      services: selectedServices,
      customer: customerInfo,
      appointment: { date: selectedDate, time: selectedTime },
      total: totalPrice
    });
  };

  const handleBack = () => {
    navigate('/schedule');
  };

  const formatDate = (date) => {
    if (!date) return 'Not selected';
    return date.toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const getPaymentMethodText = (value) => {
    const paymentMethods = {
      'check': 'Pay with check to Alaska Floor Care before or as the job is finishing.',
      'cash': 'Pay with cash',
      'card': 'Credit card (payment is due prior to or during the job)',
      'other': 'Other'
    };
    return paymentMethods[value] || value;
  };

  const getPresentForApptText = (value) => {
    const presentOptions = {
      'stay-and-pay': 'Yes I will be there - I will stay and pay at the end.',
      'pay-and-leave': 'Yes I will pay and then I will need to leave. (payment is required before you leave :)',
      'unlocked-prepay': 'I will leave the door unlocked and prepay. Please send the invoice. (payment is required before the job begins)',
      'locked-prepay': 'I will prepay. The door is locked and I will provide the lock code or instructions to get in. Please send the invoice.',
      'other': 'Other'
    };
    return presentOptions[value] || value;
  };

  return (
    <div className="confirmation-form">
      <h2>Step 4: Confirm Your Booking</h2>
      <p>Please review your booking details:</p>
      
      <div className="booking-summary">
        <div className="summary-section">
          <h3>Selected Services</h3>
          {selectedServices.length === 0 ? (
            <p>No services selected</p>
          ) : (
            <div className="services-list">
              {selectedServices.map((service, index) => (
                <div key={index} className="service-item">
                  <span className="service-name">{service.name}</span>
                  <span className="service-price">${service.price.toFixed(2)}</span>
                </div>
              ))}
            </div>
          )}
        </div>
        
        <div className="summary-section">
          <h3>Scheduled Date & Time</h3>
          <p><strong>Date:</strong> {formatDate(selectedDate)}</p>
          <p><strong>Time:</strong> {selectedTime || 'Not selected'}</p>
        </div>
        
        <div className="summary-section">
          <h3>Contact Information</h3>
          <p><strong>Name:</strong> {customerInfo.firstName} {customerInfo.lastName}</p>
          <p><strong>Email:</strong> {customerInfo.email}</p>
          <p><strong>Phone:</strong> {customerInfo.phone}</p>
          <p><strong>Address:</strong> {customerInfo.address}</p>
          {customerInfo.instructions && (
            <p><strong>Special Instructions:</strong> {customerInfo.instructions}</p>
          )}
        </div>

        <div className="summary-section">
          <h3>Payment & Access Details</h3>
          <p><strong>Will you be present:</strong> {getPresentForApptText(customerInfo.presentForAppt)}</p>
          <p><strong>Payment method:</strong> {getPaymentMethodText(customerInfo.payment)}</p>
        </div>
        
        <div className="summary-section">
          <h3>Total Price</h3>
          <p className="total-price">${totalPrice.toFixed(2)}</p>
          {totalPrice === 250 && selectedServices.length > 0 && (
            <small className="minimum-charge">*Minimum charge applied</small>
          )}
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