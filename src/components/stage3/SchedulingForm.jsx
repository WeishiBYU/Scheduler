import React from 'react';
import { useNavigate } from 'react-router-dom';
import Calendar from 'react-calendar';
import { useBooking } from '../../contexts/BookingContext';
import 'react-calendar/dist/Calendar.css';
import './SchedulingForm.css';

const SchedulingForm  = () => {
  const navigate = useNavigate();
  const {
    selectedDate,
    setSelectedDate,
    selectedTime,
    setSelectedTime,
    getAvailableTimeSlots,
    isDateDisabled
  } = useBooking();

  const handleNext = () => {
    if (!selectedDate || !selectedTime) {
      alert('Please select both a date and time for your appointment.');
      return;
    }
    navigate('/confirmation');
  };

  const handleBack = () => {
    navigate('/information');
  };

  const handleDateChange = (date) => {
    setSelectedDate(date);
    setSelectedTime(null); // Reset time when date changes
  };

  const handleTimeSelect = (time) => {
    setSelectedTime(time);
  };

  const availableTimeSlots = getAvailableTimeSlots(selectedDate);
  
  return (
    <div className="scheduling-form">
      <h2>Step 3: Schedule Your Service</h2>
      <p>Choose your preferred date and time:</p>
      
      <div className="calendar-container">
        <h3>Select Date</h3>
        <Calendar
          onChange={handleDateChange}
          value={selectedDate}
          tileDisabled={({ date }) => isDateDisabled(date)}
          minDate={new Date()}
          showNeighboringMonth={false}
          className="booking-calendar"
        />
        {selectedDate && (
          <p className="selected-date">
            Selected: {selectedDate.toLocaleDateString('en-US', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </p>
        )}
      </div>
      
      <div className="time-slots-container">
        <h3>Available Times</h3>
        {!selectedDate ? (
          <p className="time-instruction">Please select a date first</p>
        ) : availableTimeSlots.length === 0 ? (
          <p className="no-slots">No available time slots for this date</p>
        ) : (
          <div className="time-grid">
            {availableTimeSlots.map((time) => (
              <button
                key={time}
                className={`time-slot ${selectedTime === time ? 'selected' : ''}`}
                onClick={() => handleTimeSelect(time)}
              >
                {time}
              </button>
            ))}
          </div>
        )}
        {selectedTime && (
          <p className="selected-time">
            Selected time: {selectedTime}
          </p>
        )}
      </div>
      
      <div className="form-navigation">
        <button onClick={handleBack} className="back-button">
          ← Back to Information
        </button>
        <button 
          onClick={handleNext} 
          className={`next-button ${!selectedDate || !selectedTime ? 'disabled' : ''}`}
          disabled={!selectedDate || !selectedTime}
        >
          Continue to Confirmation →
        </button>
      </div>
    </div>
  );
};

export default SchedulingForm;