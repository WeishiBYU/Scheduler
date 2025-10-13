import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useBooking } from '../../contexts/BookingContext';
import './QuoteForm.css';

const QuoteForm = () => {
  const navigate = useNavigate();
  const [openAccordion, setOpenAccordion] = useState('both');
  const { 
    carpetServices, 
    setCarpetServices, 
    upholsteryServices, 
    setUpholsteryServices 
  } = useBooking();

  const handleNext = () => {
    navigate('/information');
  };

  const toggleAccordion = (service) => {
    setOpenAccordion(openAccordion === service ? null : service);
  };

  const handleCarpetServiceChange = (area, serviceType, value) => {
    const numValue = Math.max(0, parseInt(value) || 0);
    setCarpetServices(prev => ({
      ...prev,
      [area]: {
        ...prev[area],
        [serviceType]: numValue
      }
    }));
  };

  const handleUpholsteryServiceChange = (furniture, serviceType, value) => {
    const numValue = Math.max(0, parseInt(value) || 0);
    setUpholsteryServices(prev => ({
      ...prev,
      [furniture]: {
        ...prev[furniture],
        [serviceType]: numValue
      }
    }));
  };

  // ...existing code for labels and JSX remains the same...
  const areaLabels = {
    rooms: 'Rooms',
    halls: 'Halls',
    staircases: 'Staircases',
    walkInClosets: 'Walk-in Closets',
    landings: 'Landings'
  };

  const furnitureLabels = {
    sofas: 'Sofas',
    sectionals: 'Sectionals (per seat)',
    loveSeats: 'Love Seats',
    chairs: 'Chairs'
  };

  return (
    <div className="quote-form">
      <h2>Step 1: Get Your Quote</h2>
      <p>Select the services you need:</p>
      
      <div className="service-accordions">
        {/* Carpet Cleaning Accordion */}
        <div className="accordion-item">
          <div 
            className={`accordion-header ${(openAccordion === 'carpet' || openAccordion === 'both') ? 'active' : ''}`}
            onClick={() => toggleAccordion('carpet')}
          >
            <h3>Carpet Cleaning</h3>
            <span className="accordion-icon">{openAccordion === 'carpet' ? '−' : '+'}</span>
          </div>
          
          {(openAccordion === 'carpet' || openAccordion === 'both') && (
            <div className="accordion-content">
              <p>Select areas and services for carpet cleaning:</p>
              
              <div className="carpet-services-table">
                <table>
                  <thead>
                    <tr>
                      <th>Area</th>
                      <th>Quantity</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Object.keys(carpetServices).map((area) => (
                      <tr key={area}>
                        <td className="area-label">{areaLabels[area]}</td>
                        <td>
                              <button 
                                onClick={() => handleCarpetServiceChange(area, 'cleaned', carpetServices[area].cleaned - 1)}
                                className="quantity-btn"
                              >−</button>
                          <input
                            type="number"
                            min="0"
                            value={carpetServices[area].cleaned}
                            onChange={(e) => handleCarpetServiceChange(area, 'cleaned', e.target.value)}
                            className="quantity-input"
                          />
                              <button 
                                onClick={() => handleCarpetServiceChange(area, 'cleaned', carpetServices[area].cleaned + 1)}
                                className="quantity-btn"
                              >+</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Upholstery Cleaning Accordion */}
        <div className="accordion-item">
          <div 
            className={`accordion-header ${(openAccordion === 'upholstery' || openAccordion === 'both') ? 'active' : ''}`}
            onClick={() => toggleAccordion('upholstery')}
          >
            <h3>Upholstery Cleaning</h3>
            <span className="accordion-icon">{openAccordion === 'upholstery' ? '−' : '+'}</span>
          </div>
          
          {(openAccordion === 'upholstery' || openAccordion === 'both') && (
            <div className="accordion-content">
              <p>Select furniture and services for upholstery cleaning:</p>
              
              <div className="upholstery-services-table">
                <table>
                  <thead>
                    <tr>
                      <th>Furniture Type</th>
                      <th>Quantity</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Object.keys(upholsteryServices).map((furniture) => (
                      <tr key={furniture}>
                        <td className="furniture-label">{furnitureLabels[furniture]}</td>
                        <td>
                            <button 
                                onClick={() => handleUpholsteryServiceChange(furniture, 'cleaned', upholsteryServices[furniture].cleaned - 1)}
                                className="quantity-btn"
                              >-</button>
                          <input
                            type="number"
                            min="0"
                            value={upholsteryServices[furniture].cleaned}
                            onChange={(e) => handleUpholsteryServiceChange(furniture, 'cleaned', e.target.value)}
                            className="quantity-input"
                          />
                            <button 
                                onClick={() => handleUpholsteryServiceChange(furniture, 'cleaned', upholsteryServices[furniture].cleaned + 1)}
                                className="quantity-btn"
                              >+</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
      
      <div className="form-navigation">
        <button onClick={handleNext} className="next-button">
          Continue to Scheduling →
        </button>
      </div>
    </div>
  );
};

export default QuoteForm;