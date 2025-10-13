import React, { createContext, useContext, useState } from 'react';

const BookingContext = createContext();

export const useBooking = () => {
  const context = useContext(BookingContext);
  if (!context) {
    throw new Error('useBooking must be used within a BookingProvider');
  }
  return context;
};

export const BookingProvider = ({ children }) => {
  const [carpetServices, setCarpetServices] = useState({
    rooms: { cleaned: 0 },
    halls: { cleaned: 0 },
    staircases: { cleaned: 0 },
    walkInClosets: { cleaned: 0 },
    landings: { cleaned: 0 }
  });
  
  const [upholsteryServices, setUpholsteryServices] = useState({
    sofas: { cleaned: 0 },
    sectionals: { cleaned: 0 },
    loveSeats: { cleaned: 0 },
    chairs: { cleaned: 0 }
  });

  // Customer information state
  const [customerInfo, setCustomerInfo] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    instructions: '',
    presentForAppt: ''
  });

  // Scheduling state
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);

  // Available time slots
  const timeSlots = ['9:00 AM', '11:00 AM', '1:00 PM', '3:00 PM'];

  // Booked appointments (this would typically come from a database)
  const [bookedAppointments, setBookedAppointments] = useState([
    // Example booked slots - in real app this would come from your backend
    { date: '2025-10-15', time: '9:00 AM' },
    { date: '2025-10-15', time: '1:00 PM' },
    { date: '2025-10-16', time: '11:00 AM' },
  ]);

  // Check if a date is available (not fully booked)
  const isDateAvailable = (date) => {
    const dateString = date.toISOString().split('T')[0];
    const bookedSlotsForDate = bookedAppointments.filter(apt => apt.date === dateString);
    return bookedSlotsForDate.length < timeSlots.length; // Not all slots are booked
  };

  // Check if a specific time slot is available
  const isTimeSlotAvailable = (date, time) => {
    if (!date) return false;
    const dateString = date.toISOString().split('T')[0];
    return !bookedAppointments.some(apt => apt.date === dateString && apt.time === time);
  };

  // Get available time slots for a specific date
  const getAvailableTimeSlots = (date) => {
    if (!date) return [];
    return timeSlots.filter(time => isTimeSlotAvailable(date, time));
  };

  // Check if date should be disabled in calendar
  const isDateDisabled = (date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Disable past dates
    if (date < today) return true;
    
    // Disable Sundays (assuming you don't work Sundays)
    if (date.getDay() === 0) return true;
    
    // Disable if no available slots
    if (!isDateAvailable(date)) return true;
    
    return false;
  };

  // Define pricing structure
  const pricing = {
    carpet: {
      rooms: 45,
      halls: 25,
      staircases: 35,
      walkInClosets: 20,
      landings: 15
    },
    upholstery: {
      sofas: 85,
      sectionals: 25, // per seat
      loveSeats: 65,
      chairs: 35
    }
  };

  const getSelectedServices = () => {
    const services = [];
    
    // Add carpet services
    Object.entries(carpetServices).forEach(([area, service]) => {
      if (service.cleaned > 0) {
        const areaLabels = {
          rooms: 'Rooms',
          halls: 'Halls',
          staircases: 'Staircases',
          walkInClosets: 'Walk-in Closets',
          landings: 'Landings'
        };
        
        services.push({
          name: `${areaLabels[area]} (${service.cleaned})`,
          price: pricing.carpet[area] * service.cleaned,
          category: 'carpet'
        });
      }
    });

    // Add upholstery services
    Object.entries(upholsteryServices).forEach(([furniture, service]) => {
      if (service.cleaned > 0) {
        const furnitureLabels = {
          sofas: 'Sofas',
          sectionals: 'Sectionals',
          loveSeats: 'Love Seats',
          chairs: 'Chairs'
        };
        
        services.push({
          name: `${furnitureLabels[furniture]} (${service.cleaned})`,
          price: pricing.upholstery[furniture] * service.cleaned,
          category: 'upholstery'
        });
      }
    });

    return services;
  };

  const calculateTotalPrice = () => {
    const total = getSelectedServices().reduce((total, service) => total + service.price, 0);
    if (total < 250 && total !== 0) return 250; // Minimum charge
    return total
    };

  const value = {
    carpetServices,
    setCarpetServices,
    upholsteryServices,
    setUpholsteryServices,
    getSelectedServices,
    calculateTotalPrice,
    pricing,
    // Customer Information
    customerInfo,
    setCustomerInfo,
    // Scheduling
    selectedDate,
    setSelectedDate,
    selectedTime,
    setSelectedTime,
    timeSlots,
    isDateAvailable,
    isTimeSlotAvailable,
    getAvailableTimeSlots,
    isDateDisabled,
    bookedAppointments
  };

  return (
    <BookingContext.Provider value={value}>
      {children}
    </BookingContext.Provider>
  );
};