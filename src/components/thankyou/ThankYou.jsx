import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useBooking } from '../../contexts/BookingContext';
import './ThankYou.css';

const ThankYou = () => {
  const navigate = useNavigate();
  const { customerInfo, selectedDate, selectedTime, calculateTotalPrice } = useBooking();

  const handleNewBooking = () => {
    // Reset and go back to start
    navigate('/');
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

  return (
    <div className="thank-you-page">
      <div className="thank-you-container">
        <div className="success-icon">✓</div>
        
        <h1>Thank You for Your Booking!</h1>
        
        <p className="confirmation-message">
          Your carpet cleaning appointment has been successfully scheduled.
        </p>

        <div className="booking-summary">
          <h2>Booking Details</h2>
          
          <div className="detail-row">
            <span className="label">Name:</span>
            <span className="value">{customerInfo.firstName} {customerInfo.lastName}</span>
          </div>

          <div className="detail-row">
            <span className="label">Email:</span>
            <span className="value">{customerInfo.email}</span>
          </div>

          <div className="detail-row">
            <span className="label">Phone:</span>
            <span className="value">{customerInfo.phone}</span>
          </div>

          <div className="detail-row">
            <span className="label">Date:</span>
            <span className="value">{formatDate(selectedDate)}</span>
          </div>

          <div className="detail-row">
            <span className="label">Time:</span>
            <span className="value">{selectedTime}</span>
          </div>

          <div className="detail-row total">
            <span className="label">Total:</span>
            <span className="value">${calculateTotalPrice()}</span>
          </div>
        </div>

        <div className="next-steps">
          <h3>What's Next?</h3>
          <ul>
            <li>You will receive a confirmation email shortly</li>
            <li>We'll send you a reminder 24 hours before your appointment</li>
            <li>If you need to make any changes, please contact us</li>
          </ul>
        </div>

        <div className="contact-info">
          <p>Questions? Contact us at:</p>
          <p><strong>Phone:</strong> 907-378-1228</p>
          <p><strong>Email:</strong> info@alaskafloorcare.com</p>
        </div>

        <button onClick={handleNewBooking} className="new-booking-btn">
          Make Another Booking
        </button>
      </div>
    </div>
  );
};

export default ThankYou;
