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

  // Available time slots (fetched from Google Sheets)
  const [timeSlots, setTimeSlots] = useState([]);

  // Available dates (fetched from Google Sheets)
  const [availableDates, setAvailableDates] = useState([]);

  // Cache for date-specific time slots
  const [dateTimeSlotsCache, setDateTimeSlotsCache] = useState(new Map());

  // Dates with time slot errors (should be grayed out)
  const [datesWithErrors, setDatesWithErrors] = useState(new Set());

  // Track if Google Sheets data has been loaded
  const [sheetsDataLoaded, setSheetsDataLoaded] = useState(false);

  // Booked appointments (fetched from backend)
  const [bookedAppointments, setBookedAppointments] = useState([]);

  // Fetch booked appointments on component mount (lightweight)
  React.useEffect(() => {
    const fetchAppointments = async () => {
      try {
        // Only fetch booked appointments initially
        const appointmentsResponse = await fetch('/api/appointments');
        if (appointmentsResponse.ok) {
          const appointments = await appointmentsResponse.json();
          setBookedAppointments(appointments);
        } else {
          console.error('Failed to fetch appointments');
        }
      } catch (error) {
        console.error('Error fetching appointments:', error);
      }
    };

    fetchAppointments();
  }, []);

  // Check if a date is available (not fully booked)
  const isDateAvailable = (date) => {
    if (timeSlots.length === 0) return false; // No time slots available yet
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

  // Load Google Sheets data (called only when schedule page opens)
  const loadGoogleSheetsData = async () => {
    if (sheetsDataLoaded) return; // Already loaded
    
    try {
      console.log('🔄 Loading Google Sheets data for schedule page...');
      
      // Fetch available time slots from Google Sheets
      const timeSlotsResponse = await fetch('/api/time-slots');
      if (timeSlotsResponse.ok) {
        const slots = await timeSlotsResponse.json();
        setTimeSlots(slots);
      } else {
        console.error('Failed to fetch time slots');
        setTimeSlots(['9:00 AM', '11:00 AM', '1:00 PM', '3:00 PM']);
      }

      // Fetch available dates from Google Sheets
      const availableDatesResponse = await fetch('/api/available-dates');
      if (availableDatesResponse.ok) {
        const dates = await availableDatesResponse.json();
        setAvailableDates(dates);
      } else {
        console.error('Failed to fetch available dates');
        setAvailableDates([]);
      }
      
      setSheetsDataLoaded(true);
      console.log('✅ Google Sheets data loaded');
    } catch (error) {
      console.error('Error loading Google Sheets data:', error);
      setTimeSlots(['9:00 AM', '11:00 AM', '1:00 PM', '3:00 PM']);
      setAvailableDates([]);
    }
  };

  // Fetch time slots for a specific date from Google Sheets (with caching)
  // Fetch time slots for a specific date from Google Sheets (with caching)
  const fetchTimeSlotsForDate = async (date) => {
    if (!date) return [];
    
    const dateString = date.toISOString().split('T')[0];
    
    // Check cache first
    if (dateTimeSlotsCache.has(dateString)) {
      console.log(`📋 Using cached time slots for ${dateString}`);
      return dateTimeSlotsCache.get(dateString);
    }
    
    try {
      const response = await fetch(`/api/time-slots/${dateString}`);
      if (response.ok) {
        const slots = await response.json();
        
        // Cache the result
        setDateTimeSlotsCache(prev => new Map(prev).set(dateString, slots));
        
        // Remove date from error set if successful
        setDatesWithErrors(prev => {
          const newSet = new Set(prev);
          newSet.delete(dateString);
          return newSet;
        });
        
        return slots;
      } else {
        console.error('Failed to fetch time slots for date');
        
        // Add date to error set
        setDatesWithErrors(prev => new Set(prev).add(dateString));
        
        return [];
      }
    } catch (error) {
      console.error('Error fetching time slots for date:', error);
      
      // Add date to error set
      setDatesWithErrors(prev => new Set(prev).add(dateString));
      
      return [];
    }
  };

  // Add a new booked appointment to the state
  const addBookedAppointment = (appointment) => {
    setBookedAppointments(prev => [...prev, appointment]);
  };

  // Check and update fully booked dates in Google Sheets
  const checkAndUpdateFullyBookedDates = async () => {
    try {
      console.log('🔍 Checking for fully booked dates...');
      const response = await fetch('/api/availability/check-fully-booked', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const result = await response.json();
        console.log('📊 Fully booked check results:', result);
        
        // Refresh available dates if any were updated
        if (result.fullyBookedDatesUpdated > 0) {
          const availableDatesResponse = await fetch('/api/available-dates');
          if (availableDatesResponse.ok) {
            const updatedDates = await availableDatesResponse.json();
            setAvailableDates(updatedDates);
          }
        }
        
        return result;
      } else {
        console.error('Failed to check fully booked dates');
        return null;
      }
    } catch (error) {
      console.error('Error checking fully booked dates:', error);
      return null;
    }
  };

  // Check if date should be disabled in calendar
  const isDateDisabled = (date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Disable past dates
    if (date < today) return true;
    
    // Disable Sundays (assuming you don't work Sundays)
    if (date.getDay() === 0) return true;
    
    const dateString = date.toISOString().split('T')[0];
    
    // Disable if there was an error fetching time slots for this date
    if (datesWithErrors.has(dateString)) return true;
    
    // Check if date is in Google Sheets available dates
    const isInAvailableDates = availableDates.includes(dateString);
    
    // If we have available dates from Google Sheets, only allow those dates
    if (availableDates.length > 0 && !isInAvailableDates) {
      return true;
    }
    
    // Disable if no available slots (all time slots booked)
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
    availableDates,
    datesWithErrors,
    sheetsDataLoaded,
    loadGoogleSheetsData,
    isDateAvailable,
    isTimeSlotAvailable,
    getAvailableTimeSlots,
    fetchTimeSlotsForDate,
    isDateDisabled,
    bookedAppointments,
    addBookedAppointment,
    checkAndUpdateFullyBookedDates
  };

  return (
    <BookingContext.Provider value={value}>
      {children}
    </BookingContext.Provider>
  );
};