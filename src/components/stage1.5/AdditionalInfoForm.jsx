import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useBooking } from '../../contexts/BookingContext';
import { additionalServicesConfig } from '../../config/serviceConfig';
import './AdditionalInfoForm.css';

const AdditionalInfoForm = () => {
  const navigate = useNavigate();
  const { customerInfo, setCustomerInfo } = useBooking();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCustomerInfo(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    navigate('/information');
  };

  const handleBack = () => {
    navigate('/quote');
  };

  return (
    <div className="additional-info-form">
      <div className="form-header">
        <h2>Additional Service Information</h2>
        <p>Please provide additional details about your cleaning needs</p>
      </div>

      <form onSubmit={handleSubmit} className="additional-info-content">
        {Object.entries(additionalServicesConfig).map(([serviceKey, serviceData]) => (
          <div className="form-section" key={serviceKey}>
            <h3>{serviceData.title}</h3>
            <div className="form-group">
              <label htmlFor={serviceKey}>
                {serviceData.question}
              </label>
              <select 
                id={serviceKey}
                name={serviceKey}
                value={customerInfo[serviceKey] || ''}
                onChange={handleInputChange}
                required={serviceData.required}
              >
                <option value="">Please select...</option>
                {serviceData.options.map(option => (
                  <option key={option.key} value={option.key}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        ))}

        <div className="form-section">
          <div className="form-group">
            <label htmlFor="specialInstructions">
              Special Instructions or Additional Details
            </label>
            <textarea
              id="specialInstructions"
              name="specialInstructions"
              value={customerInfo.specialInstructions || ''}
              onChange={handleInputChange}
              placeholder="Please provide any additional information about problem areas, accessibility concerns, or special requests..."
              rows="4"
            />
          </div>
        </div>

        <div className="form-actions">
          <button type="button" className="btn-secondary" onClick={handleBack}>
            Back to Quote
          </button>
          <button type="submit" className="btn-primary">
            Continue to Contact Information
          </button>
        </div>
      </form>
    </div>
  );
};

export default AdditionalInfoForm;