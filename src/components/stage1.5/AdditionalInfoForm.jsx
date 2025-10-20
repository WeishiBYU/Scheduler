import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useBooking } from '../../contexts/BookingContext';
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
        <div className="form-section">
          <h3>Pre-Cleaning Preparation</h3>
          <div className="form-group">
            <label htmlFor="preVacuum">
              Would you like us to vacuum before cleaning? 
            </label>
            <select 
              id="preVacuum"
              name="preVacuum"
              value={customerInfo.preVacuum || ''}
              onChange={handleInputChange}
              required
            >
              <option value="">Please select...</option>
              <option value="pros-vacuum">Let the Pros pre-vacuum... (adds $10 per room or rug, $5 per hall and $20 per stairway)</option>
              <option value="customer-vacuum">Customer will pre-vacuum including edges and corners (let us know if you change your mind)</option>
              <option value="not-sure">Not sure (you may be charged an additional $10 per room, $20 per stairway, $5 per hallway)</option>
            </select>
          </div>
        </div>

        <div className="form-section">
          <h3>Special Concerns</h3>
          <div className="form-group">
            <label htmlFor="odorIssues">
              Do you want odor treatment? We highly recommend heavy odor treatment if you have shedding pets. 
            </label>
            <select 
              id="odorIssues"
              name="odorIssues"
              value={customerInfo.odorIssues || ''}
              onChange={handleInputChange}
              required
            >
              <option value="">Please select...</option>
              <option value="no-odor">No Odor</option>
              <option value="mild-odor">Move Out or Mild Odor (1or 2 rooms = $25 then add $10 for each additional room)</option>
              <option value="heavy-odor">Heavy Odor (1or 2 rooms = $50. then add $30 for each additional room)</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="petUrineAreas">
              Are there any Pet Urine areas? 
            </label>
            <select 
              id="petUrineAreas"
              name="petUrineAreas"
              value={customerInfo.petUrineAreas || ''}
              onChange={handleInputChange}
              required
            >
              <option value="">Please select...</option>
              <option value="no-urine">No Urine in the carpet</option>
              <option value="3-or-less-spots">Yes 3 or less urine spots throughout the house ($75)(please put a note on the carpet where they are)</option>
              <option value="1-room">Yes 1 room or urine area ($50)</option>
              <option value="2-rooms">Yes 2 rooms or urine areas ($100)</option>
              <option value="3-rooms">Yes 3 rooms or urine areas ($150)</option>
              <option value="4-rooms">Yes 4 rooms or urine areas ($200)</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="petUrine">
              Are there any pet urine stains that need special treatment? 
            </label>
            <select 
              id="petUrine"
              name="petUrine"
              value={customerInfo.petUrine || ''}
              onChange={handleInputChange}
              required
            >
              <option value="">Please select...</option>
              <option value="no-odor-urine">No Odor</option>
              <option value="mild-odor">Move Out or Mild Odor (1or 2 rooms = $25 then add $10 for each additional room)</option>
              <option value="heavy-odor">Heavy Odor (1or 2 rooms = $50. then add $30 for each additional room)</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="stains">
              Are there any specific stains or problem areas? 
            </label>
            <select 
              id="stains"
              name="stains"
              value={customerInfo.stains || ''}
              onChange={handleInputChange}
              required
            >
              <option value="">Please select...</option>
              <option value="no-stains">NO STAINS</option>
              <option value="no-extra-pay">I have stains. I don't want to pay extra if they don't come out with the "primary stain treatment". I understand they may not budge.</option>
              <option value="1-3-stains">Please treat 1-3 stains ($30) please explain the stains below or text pics.</option>
              <option value="4-6-stains">Please treat 4-6 stains ($60) please explain the stains below or text pics.</option>
              <option value="7-9-stains">Please treat 7-9 stains (minimum $80.00 please explain or text pics to 907-378-1228)</option>
            </select>
          </div>
        </div>

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