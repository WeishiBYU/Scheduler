export const serviceConfig = {
  carpet: {
    title: 'Carpet Cleaning',
    description: 'Select areas and services for carpet cleaning:',
    items: [
      { key: 'rooms', label: 'Rooms', price: 45 },
      { key: 'halls', label: 'Halls', price: 25 },
      { key: 'staircases', label: 'Staircases', price: 35 },
      { key: 'walkInClosets', label: 'Walk-in Closets', price: 20 },
      { key: 'landings', label: 'Landings', price: 50 }
    ]
  },
  upholstery: {
    title: 'Upholstery Cleaning',
    description: 'Select furniture and services for upholstery cleaning:',
    items: [
      { key: 'sofas', label: 'Sofas', price: 85 },
      { key: 'sectionals', label: 'Sectionals (per seat)', price: 25 },
      { key: 'loveSeats', label: 'Love Seats', price: 65 },
      { key: 'chairs', label: 'Chairs', price: 35 }
    ]
  }
};

// Additional Services Configuration
export const additionalServicesConfig = {
  preVacuum: {
    title: 'Pre-Cleaning Preparation',
    question: 'Would you like us to vacuum before cleaning?',
    required: true,
    options: [
      { 
        key: 'pros-vacuum', 
        label: 'Let the Pros pre-vacuum... (adds $10 per room or rug, $5 per hall and $20 per stairway)',
        pricingRule: (carpetServices) => {
          const totalRooms = (carpetServices.rooms?.cleaned || 0) + (carpetServices.walkInClosets?.cleaned || 0);
          const totalHalls = (carpetServices.halls?.cleaned || 0) + (carpetServices.landings?.cleaned || 0);
          const totalStaircases = carpetServices.staircases?.cleaned || 0;
          return (totalRooms * 10) + (totalHalls * 5) + (totalStaircases * 20);
        },
        displayName: 'Pre-Vacuum Service'
      },
      { 
        key: 'customer-vacuum', 
        label: 'Customer will pre-vacuum including edges and corners (let us know if you change your mind)',
        pricingRule: () => 0,
        displayName: null
      },
      { 
        key: 'not-sure', 
        label: 'Not sure (you may be charged an additional $10 per room, $20 per stairway, $5 per hallway)',
        pricingRule: () => 0,
        displayName: null,
        note: 'May be charged additional $10 per room, $20 per stairway, $5 per hallway'
      }
    ]
  },
  odorIssues: {
    title: 'Odor Treatment',
    question: 'Do you want odor treatment? We highly recommend heavy odor treatment if you have shedding pets.',
    required: true,
    options: [
      { 
        key: 'no-odor', 
        label: 'No Odor',
        pricingRule: () => 0,
        displayName: null
      },
      { 
        key: 'mild-odor', 
        label: 'Move Out or Mild Odor (1or 2 rooms = $25 then add $10 for each additional room)',
        pricingRule: (carpetServices) => {
          const totalRooms = (carpetServices.rooms?.cleaned || 0) + (carpetServices.walkInClosets?.cleaned || 0);
          if (totalRooms === 0) return 0;
          if (totalRooms <= 2) return 25;
          return 25 + ((totalRooms - 2) * 10);
        },
        displayName: 'Odor Treatment (Mild)'
      },
      { 
        key: 'heavy-odor', 
        label: 'Heavy Odor (1or 2 rooms = $50. then add $30 for each additional room)',
        pricingRule: (carpetServices) => {
          const totalRooms = (carpetServices.rooms?.cleaned || 0) + (carpetServices.walkInClosets?.cleaned || 0);
          if (totalRooms === 0) return 0;
          if (totalRooms <= 2) return 50;
          return 50 + ((totalRooms - 2) * 30);
        },
        displayName: 'Odor Treatment (Heavy)'
      }
    ]
  },
  petUrineAreas: {
    title: 'Pet Urine Areas',
    question: 'Are there any Pet Urine areas?',
    required: true,
    options: [
      { 
        key: 'no-urine', 
        label: 'No Urine in the carpet',
        pricingRule: () => 0,
        displayName: null
      },
      { 
        key: '3-or-less-spots', 
        label: 'Yes 3 or less urine spots throughout the house ($75)(please put a note on the carpet where they are)',
        pricingRule: () => 75,
        displayName: 'Pet Urine Areas (3 or less spots)'
      },
      { 
        key: '1-room', 
        label: 'Yes 1 room or urine area ($50)',
        pricingRule: () => 50,
        displayName: 'Pet Urine Areas (1 room)'
      },
      { 
        key: '2-rooms', 
        label: 'Yes 2 rooms or urine areas ($100)',
        pricingRule: () => 100,
        displayName: 'Pet Urine Areas (2 rooms)'
      },
      { 
        key: '3-rooms', 
        label: 'Yes 3 rooms or urine areas ($150)',
        pricingRule: () => 150,
        displayName: 'Pet Urine Areas (3 rooms)'
      },
      { 
        key: '4-rooms', 
        label: 'Yes 4 rooms or urine areas ($200)',
        pricingRule: () => 200,
        displayName: 'Pet Urine Areas (4 rooms)'
      }
    ]
  },
  stains: {
    title: 'Stain Treatment',
    question: 'Are there any specific stains or problem areas?',
    required: true,
    options: [
      { 
        key: 'no-stains', 
        label: 'NO STAINS',
        pricingRule: () => 0,
        displayName: null
      },
      { 
        key: 'no-extra-pay', 
        label: 'I have stains. I don\'t want to pay extra if they don\'t come out with the "primary stain treatment". I understand they may not budge.',
        pricingRule: () => 0,
        displayName: null
      },
      { 
        key: '1-3-stains', 
        label: 'Please treat 1-3 stains ($30) please explain the stains below or text pics.',
        pricingRule: () => 30,
        displayName: 'Stain Treatment (1-3)'
      },
      { 
        key: '4-6-stains', 
        label: 'Please treat 4-6 stains ($60) please explain the stains below or text pics.',
        pricingRule: () => 60,
        displayName: 'Stain Treatment (4-6)'
      },
      { 
        key: '7-9-stains', 
        label: 'Please treat 7-9 stains (minimum $80.00 please explain or text pics to 907-378-1228)',
        pricingRule: () => 80,
        displayName: 'Stain Treatment (7-9)'
      }
    ]
  }
};

// Helper function to calculate additional services price
export const calculateAdditionalServicePrice = (serviceKey, selectedOption, carpetServices) => {
  const serviceConfig = additionalServicesConfig[serviceKey];
  if (!serviceConfig) return 0;
  
  const option = serviceConfig.options.find(opt => opt.key === selectedOption);
  if (!option || !option.pricingRule) return 0;
  
  return option.pricingRule(carpetServices);
};

// Helper function to get display information for selected option
export const getAdditionalServiceDisplay = (serviceKey, selectedOption, carpetServices) => {
  const serviceConfig = additionalServicesConfig[serviceKey];
  if (!serviceConfig) return null;
  
  const option = serviceConfig.options.find(opt => opt.key === selectedOption);
  if (!option) return null;
  
  const price = option.pricingRule ? option.pricingRule(carpetServices) : 0;
  
  return {
    name: option.displayName,
    price: price,
    note: option.note
  };
};
