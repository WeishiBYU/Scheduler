import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useBooking } from '../../contexts/BookingContext';
import { serviceConfig } from '../../config/serviceConfig';
import './QuoteForm.css';

const QuoteForm = () => {
  const navigate = useNavigate();
  const [openAccordions, setOpenAccordions] = useState(() =>
    Object.keys(serviceConfig).reduce(
      (acc, key) => ({
        ...acc,
        [key]: true
      }),
      {}
    )
  );
  const { 
    carpetServices, 
    setCarpetServices, 
    upholsteryServices, 
    setUpholsteryServices 
  } = useBooking();

  const serviceState = {
    carpet: { services: carpetServices, setServices: setCarpetServices },
    upholstery: { services: upholsteryServices, setServices: setUpholsteryServices }
  };

  const handleNext = () => {
    navigate('/additional-info');
  };

  const toggleAccordion = (service) => {
    setOpenAccordions(prev => ({
      ...prev,
      [service]: !prev[service]
    }));
  };

  const handleQuantityChange = (categoryKey, itemKey, value) => {
    const numValue = Math.max(0, parseInt(value) || 0);
    const setServices = serviceState[categoryKey].setServices;
    setServices(prev => ({
      ...prev,
      [itemKey]: {
        ...prev[itemKey],
        cleaned: numValue
      }
    }));
  };

  return (
    <div className="quote-form">
      <h2>Step 1: Get Your Quote</h2>
      <p>Select the services you need:</p>
      
      <div className="service-accordions">
        {Object.entries(serviceConfig).map(([categoryKey, category]) => {
          const { services } = serviceState[categoryKey];
          return (
            <div className="accordion-item" key={categoryKey}>
              <div
                className={`accordion-header ${openAccordions[categoryKey] ? 'active' : ''}`}
                onClick={() => toggleAccordion(categoryKey)}
              >
                <h3>{category.title}</h3>
                <span className="accordion-icon">{openAccordions[categoryKey] ? '−' : '+'}</span>
              </div>

              <div className={`accordion-content ${openAccordions[categoryKey] ? 'open' : 'closed'}`}>
                <p>{category.description}</p>

                <div className={`${categoryKey}-services-table`}>
                  <table>
                    <thead>
                      <tr>
                        <th>{categoryKey === 'carpet' ? 'Area' : 'Furniture Type'}</th>
                        <th>Quantity</th>
                      </tr>
                    </thead>
                    <tbody>
                      {category.items.map((item) => {
                        const quantity = services[item.key]?.cleaned ?? 0;
                        return (
                          <tr key={item.key}>
                            <td className="area-label">{item.label}</td>
                            <td>
                              <button
                                onClick={() => handleQuantityChange(categoryKey, item.key, quantity - 1)}
                                className="quantity-btn"
                              >
                                −
                              </button>
                              <input
                                type="number"
                                min="0"
                                value={quantity}
                                onChange={(e) => handleQuantityChange(categoryKey, item.key, e.target.value)}
                                className="quantity-input"
                              />
                              <button
                                onClick={() => handleQuantityChange(categoryKey, item.key, quantity + 1)}
                                className="quantity-btn"
                              >
                                +
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          );
        })}
      </div>
      
      <div className="form-navigation">
        <button onClick={handleNext} className="next-button">
          Continue to Information →
        </button>
      </div>
    </div>
  );
};

export default QuoteForm;