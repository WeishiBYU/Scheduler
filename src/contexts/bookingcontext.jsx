import React, { createContext, useContext, useState, useEffect } from 'react';

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
    presentForAppt: '',
    payment: '',
    // Additional info fields
    preVacuum: '',
    odorIssues: '',
    petUrineAreas: '',
    stains: '',
    specialInstructions: ''
  });

  // Scheduling state
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);

  // Available time slots
  const timeSlots = ['9:00 AM', '11:00 AM', '1:00 PM', '3:00 PM'];

  // Booked appointments (fetched from backend)
  const [bookedAppointments, setBookedAppointments] = useState([]);

  // Fetch booked appointments on component mount
  React.useEffect(() => {
    const fetchBookedAppointments = async () => {
      try {
        const response = await fetch('/api/appointments');
        if (response.ok) {
          const appointments = await response.json();
          setBookedAppointments(appointments);
        } else {
          console.error('Failed to fetch appointments');
        }
      } catch (error) {
        console.error('Error fetching appointments:', error);
      }
    };

    fetchBookedAppointments();
  }, []);

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

  const getAdditionalServicesDetails = () => {
    const services = [];
    
    // Pre-vacuum pricing (needs to be calculated based on selected rooms)
    if (customerInfo.preVacuum === 'pros-vacuum') {
      const totalRooms = carpetServices.rooms.cleaned + carpetServices.walkInClosets.cleaned;
      const totalHalls = carpetServices.halls.cleaned + carpetServices.landings.cleaned;
      const totalStaircases = carpetServices.staircases.cleaned;
      
      const cost = (totalRooms * 10) + (totalHalls * 5) + (totalStaircases * 20);
      if (cost > 0) {
        services.push({
          name: 'Pre-Vacuum Service',
          price: cost
        });
      }
    }
    
    // Odor treatment pricing
    if (customerInfo.odorIssues === 'mild-odor') {
      const totalRooms = carpetServices.rooms.cleaned + carpetServices.walkInClosets.cleaned;
      let cost = 0;
      if (totalRooms <= 2) {
        cost = 25;
      } else {
        cost = 25 + ((totalRooms - 2) * 10);
      }
      services.push({
        name: 'Odor Treatment (Mild)',
        price: cost
      });
    } else if (customerInfo.odorIssues === 'heavy-odor') {
      const totalRooms = carpetServices.rooms.cleaned + carpetServices.walkInClosets.cleaned;
      let cost = 0;
      if (totalRooms <= 2) {
        cost = 50;
      } else {
        cost = 50 + ((totalRooms - 2) * 30);
      }
      services.push({
        name: 'Odor Treatment (Heavy)',
        price: cost
      });
    }
    
    // Pet urine areas pricing
    if (customerInfo.petUrineAreas === '3-or-less-spots') {
      services.push({
        name: 'Pet Urine Areas (3 or less spots)',
        price: 75
      });
    } else if (customerInfo.petUrineAreas === '1-room') {
      services.push({
        name: 'Pet Urine Areas (1 room)',
        price: 50
      });
    } else if (customerInfo.petUrineAreas === '2-rooms') {
      services.push({
        name: 'Pet Urine Areas (2 rooms)',
        price: 100
      });
    } else if (customerInfo.petUrineAreas === '3-rooms') {
      services.push({
        name: 'Pet Urine Areas (3 rooms)',
        price: 150
      });
    } else if (customerInfo.petUrineAreas === '4-rooms') {
      services.push({
        name: 'Urine Areas (4 rooms)',
        price: 200
      });
    }
    
    // Stain treatment pricing
    if (customerInfo.stains === '1-3-stains') {
      services.push({
        name: 'Stain Treatment (1-3)',
        price: 30
      });
    } else if (customerInfo.stains === '4-6-stains') {
      services.push({
        name: 'Stain Treatment (4-6)',
        price: 60
      });
    } else if (customerInfo.stains === '7-9-stains') {
      services.push({
        name: 'Stain Treatment (7-9)',
        price: 80
      });
    }
    
    return services;
  };

  const calculateAdditionalServices = () => {
    return getAdditionalServicesDetails().reduce((total, service) => total + service.price, 0);
  };

  const calculateTotalPrice = () => {
    const baseTotal = getSelectedServices().reduce((total, service) => total + service.price, 0);
    const additionalTotal = calculateAdditionalServices();
    const total = baseTotal + additionalTotal;
    
    if (total < 250 && total !== 0) return 250; // Minimum charge
    return total;
  };

  const value = {
    carpetServices,
    setCarpetServices,
    upholsteryServices,
    setUpholsteryServices,
    getSelectedServices,
    getAdditionalServicesDetails,
    calculateAdditionalServices,
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