import React from 'react';
import { useBooking } from '../../contexts/BookingContext';
import './PriceTracker.css';

const PriceTracker = () => {
  const { getSelectedServices, getAdditionalServicesDetails, calculateTotalPrice } = useBooking();
  const selectedServices = getSelectedServices();
  const additionalServices = getAdditionalServicesDetails();

  return (
    <div className="price-tracker">
      <h3>Your Quote</h3>
      
      <div className="services-list">
        {selectedServices.length === 0 && additionalServices.length === 0 ? (
          <p className="no-services">No services selected</p>
        ) : (
          <>
            {selectedServices.map((service, index) => (
              <div key={`main-${index}`} className="service-item">
                <span className="service-name">{service.name}</span>
                <span className="service-price">${service.price.toFixed(2)}</span>
              </div>
            ))}
            
            {additionalServices.map((service, index) => (
              <div key={`additional-${index}`} className="service-item additional-services">
                <span className="service-name">{service.name}</span>
                <span className="service-price">${service.price.toFixed(2)}</span>
              </div>
            ))}
          </>
        )}
      </div>
      
      <div className="price-total">
        <strong>Total: ${calculateTotalPrice().toFixed(2)}</strong>
        <span className="price-message">{calculateTotalPrice() === 250 ? ' (Minimum charge applied)' : ''}</span>
      </div>
      
      <div className="price-note">
        <small>*Final price may vary based on assessment and additional services selected</small>
      </div>
    </div>
  );
};

export default PriceTracker;