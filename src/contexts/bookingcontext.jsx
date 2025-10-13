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
    return getSelectedServices().reduce((total, service) => total + service.price, 0);
  };

  const value = {
    carpetServices,
    setCarpetServices,
    upholsteryServices,
    setUpholsteryServices,
    getSelectedServices,
    calculateTotalPrice,
    pricing
  };

  return (
    <BookingContext.Provider value={value}>
      {children}
    </BookingContext.Provider>
  );
};