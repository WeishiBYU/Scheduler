import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useBooking } from '../../contexts/BookingContext';
import './ConfirmationForm.css';

const ConfirmationForm = () => {
  const navigate = useNavigate();
  const { 
    getSelectedServices, 
    getAdditionalServicesDetails,
    calculateTotalPrice, 
    customerInfo, 
    selectedDate, 
    selectedTime 
  } = useBooking();

  const selectedServices = getSelectedServices();
  const additionalServices = getAdditionalServicesDetails();
  const totalPrice = calculateTotalPrice();

  const handleSubmit = async () => {
    try {
      const bookingData = {
        services: selectedServices,
        customerInfo,
        selectedDate: selectedDate ? selectedDate.toISOString().split('T')[0] : null,
        selectedTime,
        totalPrice,
        additionalServices: additionalServices
      };

      console.log('Submitting booking data:', bookingData);

      const response = await fetch('/api/booking', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(bookingData),
      });

      if (response.ok) {
        const result = await response.json();
        alert('Booking confirmed! You will receive a confirmation email shortly.');
        console.log('Booking created successfully:', result);
        // Optionally redirect to a success page or reset the form
      } else {
        const error = await response.json();
        alert(`Error creating booking: ${error.msg || 'Unknown error'}`);
        console.error('Booking error:', error);
      }
    } catch (error) {
      console.error('Error submitting booking:', error);
      alert('Error submitting booking. Please try again.');
    }
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

        {additionalServices.length > 0 && (
          <div className="summary-section">
            <h3>Additional Services</h3>
            <div className="services-list">
              {additionalServices.map((service, index) => (
                <div key={index} className="service-item">
                  <span className="service-name">{service.name}</span>
                  <span className="service-price">${service.price.toFixed(2)}</span>
                </div>
              ))}
            </div>
          </div>
        )}
        
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
          <h3>Service Details</h3>
          {customerInfo.preVacuum && (
            <p><strong>Pre-vacuum service:</strong> {
              customerInfo.preVacuum === 'pros-vacuum' ? 'Let the Pros pre-vacuum (adds $10 per room or rug, $5 per hall and $20 per stairway)' :
              customerInfo.preVacuum === 'customer-vacuum' ? 'Customer will pre-vacuum including edges and corners' :
              customerInfo.preVacuum === 'not-sure' ? 'Not sure (may be charged additional $10 per room, $20 per stairway, $5 per hallway)' :
              customerInfo.preVacuum
            }</p>
          )}
          {customerInfo.odorIssues && (
            <p><strong>Odor treatment:</strong> {
              customerInfo.odorIssues === 'no-odor' ? 'No Odor' :
              customerInfo.odorIssues === 'mild-odor' ? 'Move Out or Mild Odor (1or 2 rooms = $25 then add $10 for each additional room)' :
              customerInfo.odorIssues === 'heavy-odor' ? 'Heavy Odor (1or 2 rooms = $50. then add $30 for each additional room)' :
              customerInfo.odorIssues
            }</p>
          )}
          {customerInfo.petUrineAreas && customerInfo.petUrineAreas !== '' && (
            <p><strong>Pet urine areas:</strong> {
              customerInfo.petUrineAreas === '3-or-less-spots' ? 'Yes 3 or less urine spots throughout the house ($75) - notes on carpet where they are' :
              customerInfo.petUrineAreas === '1-room' ? 'Yes 1 room or urine area ($50)' :
              customerInfo.petUrineAreas === '2-rooms' ? 'Yes 2 rooms or urine areas ($100)' :
              customerInfo.petUrineAreas === '3-rooms' ? 'Yes 3 rooms or urine areas ($150)' :
              customerInfo.petUrineAreas === '4-rooms' ? 'Yes 4 rooms or urine areas ($200)' :
              customerInfo.petUrineAreas === 'no-urine' ? 'No Urine in the carpet' :
              customerInfo.petUrineAreas
            }</p>
          )}
          {customerInfo.petUrine && customerInfo.petUrine !== '' && (
            <p><strong>Pet urine treatment:</strong> {
              customerInfo.petUrine === 'mild-odor' ? 'Move Out or Mild Odor (1or 2 rooms = $25 then add $10 for each additional room)' :
              customerInfo.petUrine === 'heavy-odor' ? 'Heavy Odor (1or 2 rooms = $50. then add $30 for each additional room)' :
              customerInfo.petUrine === 'no-odor-urine' ? 'No Odor' :
              customerInfo.petUrine
            }</p>
          )}
          {customerInfo.stains && customerInfo.stains !== '' && (
            <p><strong>Stain treatment:</strong> {
              customerInfo.stains === 'no-extra-pay' ? 'I have stains. I don\'t want to pay extra if they don\'t come out with the "primary stain treatment". I understand they may not budge.' :
              customerInfo.stains === '1-3-stains' ? 'Please treat 1-3 stains ($30) - details provided below or via text pics' :
              customerInfo.stains === '4-6-stains' ? 'Please treat 4-6 stains ($60) - details provided below or via text pics' :
              customerInfo.stains === '7-9-stains' ? 'Please treat 7-9 stains (minimum $80.00) - details provided below or via text pics to 907-378-1228' :
              customerInfo.stains === 'no-stains' ? 'NO STAINS' :
              customerInfo.stains
            }</p>
          )}
          {customerInfo.specialInstructions && (
            <p><strong>Special instructions:</strong> {customerInfo.specialInstructions}</p>
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
          {totalPrice === 250 && (selectedServices.length > 0 || additionalServices.length > 0) && (
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