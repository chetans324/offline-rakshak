export interface EmergencyInstruction {
  id: string;
  title: string;
  category: string;
  steps: string[];
  icon?: string;
  warRelated?: boolean;
}

export interface FirstAidGuide {
  id: string;
  title: string;
  steps: { text: string; imageUrl?: string }[];
  priority: 'high' | 'medium' | 'low';
  warRelated?: boolean;
}

export interface ShelterLocation {
  id: string;
  name: string;
  address: string;
  coordinates: [number, number]; // [longitude, latitude]
  type: 'shelter' | 'hospital' | 'police' | 'fire';
  contact?: string;
}

// Sample emergency instructions
export const emergencyInstructions: EmergencyInstruction[] = [
  {
    id: 'eq-001',
    title: 'Earthquake Safety',
    category: 'natural',
    steps: [
      'Drop to the ground and take cover under sturdy furniture.',
      'Stay away from windows, outside doors, and walls.',
      'Stay inside until the shaking stops.',
      'If outdoors, move to an open area away from buildings, trees, and power lines.',
      'If in a vehicle, pull over and stay inside until the shaking stops.',
    ]
  },
  {
    id: 'fl-001',
    title: 'Flood Response',
    category: 'natural',
    steps: [
      'Move to higher ground immediately.',
      'Do not walk or drive through flood waters.',
      'Stay away from bridges over fast-moving water.',
      'Evacuate if told to do so.',
      'Return home only when authorities say it is safe.',
    ]
  },
  {
    id: 'fr-001',
    title: 'Fire Emergency',
    category: 'disaster',
    steps: [
      'Activate the nearest fire alarm if available.',
      'Call emergency services as soon as possible.',
      'Use stairs, not elevators, when evacuating a building.',
      'If clothes catch fire: Stop, Drop, and Roll.',
      'If trapped, close doors and vents, place wet cloth under doors, and signal at windows.',
    ]
  },
  {
    id: 'me-001',
    title: 'Medical Emergency',
    category: 'health',
    steps: [
      'Check if the scene is safe before approaching.',
      'Check for responsiveness – tap and shout.',
      'If unresponsive, call emergency services immediately.',
      'Start CPR if the person is not breathing or only gasping.',
      'Control bleeding with direct pressure.',
    ]
  },
  // Adding war-related emergency instructions
  {
    id: 'ar-001',
    title: 'Air Raid Protocol',
    category: 'disaster',
    warRelated: true,
    steps: [
      'Immediately move to the nearest designated shelter or basement when sirens sound.',
      'If no shelter is nearby, find an interior room with no windows.',
      'Stay away from doors and windows at all times.',
      'Drop to the floor if you hear explosions nearby.',
      'Cover ears and open mouth slightly to protect from blast pressure.',
      'Wait for official all-clear before leaving shelter.',
    ]
  },
  {
    id: 'bs-001',
    title: 'Building Collapse Survival',
    category: 'disaster',
    warRelated: true,
    steps: [
      'If trapped, cover nose and mouth with cloth to filter dust.',
      'Tap on pipes or walls so rescuers can locate you.',
      'Shout only as a last resort to avoid inhaling dust.',
      'Avoid unnecessary movement that might shift debris.',
      'If possible, use phone light signals to attract attention.',
      'Conserve energy and stay calm to reduce oxygen consumption.',
    ]
  },
  {
    id: 'cs-001',
    title: 'Chemical Attack Response',
    category: 'disaster',
    warRelated: true,
    steps: [
      'Move upwind of the contaminated area immediately.',
      'Remove outer clothing if it may be contaminated.',
      'Wash exposed skin thoroughly with soap and water.',
      'Seek medical attention as soon as possible.',
      'If sheltering in place, seal all windows, doors and vents with plastic and tape.',
      'Breathe through wet cloth if chemical smell is present.',
    ]
  },
  {
    id: 'ev-001',
    title: 'Emergency Evacuation',
    category: 'disaster',
    warRelated: true,
    steps: [
      'Follow designated evacuation routes only.',
      'Travel light, taking only essentials and important documents.',
      'If using a vehicle, keep to the right to allow emergency vehicles to pass.',
      'Follow all military and civil defense instructions.',
      'Check in at official evacuation points for further guidance.',
      'Assist elderly, disabled, and families with children when possible.',
    ]
  },
  {
    id: 'cc-001',
    title: 'Civil Conflict Safety',
    category: 'disaster',
    warRelated: true,
    steps: [
      'Stay away from demonstrations, protests, and civil disturbances.',
      'Avoid government buildings, military installations, and crowded areas.',
      'Prepare an emergency go-bag with essentials for quick evacuation.',
      'Establish communication protocols with family members.',
      'Have alternative routes planned for daily travel.',
      'Maintain a low profile and avoid discussing sensitive topics in public.',
    ]
  },
  {
    id: 'lw-001',
    title: 'Loss of Water Supply',
    category: 'disaster',
    steps: [
      'Conserve existing clean water; prioritize drinking over washing.',
      'Collect rainwater in clean containers if safe to do so.',
      'Use water purification tablets or boil water for at least one minute before consumption.',
      'Know alternative water sources in your area (springs, streams).',
      'Disable water heaters if water supply is completely cut.',
      'Use sealed bottled water for infants and immunocompromised individuals.',
    ]
  },
  {
    id: 'pe-001',
    title: 'Power Outage Management',
    category: 'disaster',
    steps: [
      'Keep refrigerator and freezer doors closed to maintain temperature.',
      'Unplug sensitive electronic equipment to protect from power surges.',
      'Use battery-powered lights instead of candles to prevent fire.',
      'Dress in layers during cold weather rather than using portable heaters.',
      'Check on elderly neighbors and those with medical equipment that requires power.',
      'Turn off or disconnect appliances to avoid damage when power returns.',
    ]
  },
  {
    id: 'ht-001',
    title: 'Extreme Heat Safety',
    category: 'natural',
    steps: [
      'Stay in air-conditioned buildings as much as possible.',
      'Drink more water than usual; don\'t wait until you\'re thirsty.',
      'Wear lightweight, light-colored, loose-fitting clothing.',
      'Take cool showers or baths to lower body temperature.',
      'Avoid using the stove or oven to keep home cooler.',
      'Check on elderly relatives and neighbors twice daily.',
    ]
  },
  {
    id: 'ts-001',
    title: 'Tornado Safety',
    category: 'natural',
    steps: [
      'Go to a basement or interior room on the lowest floor with no windows.',
      'Cover your head and neck with your arms or a mattress/blanket.',
      'Do not try to outrun a tornado in a vehicle; instead, seek sturdy shelter.',
      'If caught outdoors, lie flat in a nearby ditch or depression.',
      'Watch out for flying debris – it causes most fatalities and injuries.',
      'Stay away from damaged buildings and downed power lines after the storm.',
    ]
  },
  {
    id: 'hu-001',
    title: 'Hurricane Preparedness',
    category: 'natural',
    steps: [
      'Board up windows and secure outdoor objects before the storm arrives.',
      'Prepare a disaster supply kit with food, water, medicine and important documents.',
      'Fill vehicle gas tanks and get extra cash in advance.',
      'Evacuate if ordered by authorities, especially in flood-prone areas.',
      'Stay indoors during the hurricane, away from windows and glass.',
      'Be aware that the calm "eye" of the storm can be followed by stronger winds.',
    ]
  },
  {
    id: 'wp-001',
    title: 'Winter Storm Preparedness',
    category: 'natural',
    steps: [
      'Stay indoors and dress warmly in layers during the storm.',
      'Prepare for power outages with blankets, flashlights and charged devices.',
      'Keep a supply of non-perishable food, water and medicine.',
      'Maintain ventilation when using kerosene heaters or fireplaces.',
      'Check on elderly neighbors and those with special needs.',
      'Conserve heat by closing off unused rooms and stuffing towels under doors.',
    ]
  },
  {
    id: 'ls-001',
    title: 'Landslide Awareness',
    category: 'natural',
    steps: [
      'Be alert for unusual sounds like trees cracking or boulders knocking together.',
      'Move away from the path of the landslide as quickly as possible.',
      'Avoid river valleys and low-lying areas during heavy rainfall.',
      'If escape is impossible, curl into tight ball and protect your head.',
      'Watch for flooding after a landslide or debris flow.',
      'Report broken utility lines and damaged roadways to authorities.',
    ]
  },
  {
    id: 'pd-001',
    title: 'Pandemic Disease Prevention',
    category: 'health',
    steps: [
      'Wash hands frequently with soap and water for at least 20 seconds.',
      'Cover coughs and sneezes with tissue or elbow, not hands.',
      'Clean and disinfect frequently touched surfaces daily.',
      'Maintain social distance from others when public health advisories recommend it.',
      'Follow official guidance on vaccinations and preventive measures.',
      'Prepare a two-week supply of medications, food, and essential items.',
    ]
  },
  {
    id: 'fd-001',
    title: 'Food/Water Safety in Emergencies',
    category: 'health',
    steps: [
      'Discard food that has been at room temperature for over two hours.',
      'Never taste food to determine its safety.',
      'Boil water for 1 minute (3 minutes at high altitudes) when safety is uncertain.',
      'Add 1/8 teaspoon unscented bleach per gallon of water as alternative purification.',
      'Store food in sealed, airtight containers to protect from pests.',
      'Prioritize consuming refrigerated foods before shelf-stable items.',
    ]
  }
];

// Sample first aid guides
export const firstAidGuides: FirstAidGuide[] = [
  {
    id: 'fa-001',
    title: 'CPR Instructions',
    priority: 'high',
    steps: [
      { text: 'Check the scene is safe and the person is unresponsive.' },
      { text: 'Call emergency services or ask someone else to.' },
      { text: 'Place the person on their back on a firm surface.' },
      { text: 'Begin chest compressions: push hard and fast in the center of the chest.' },
      { text: 'Give 30 chest compressions followed by 2 rescue breaths.' },
      { text: 'Continue until help arrives or the person begins to move.' },
    ]
  },
  {
    id: 'fa-002',
    title: 'Treating Burns',
    priority: 'medium',
    steps: [
      { text: 'Stop the burning process. Remove the source of heat.' },
      { text: 'Remove clothing and jewelry from the burned area.' },
      { text: 'Cool the burn with cool (not cold) running water for 10-15 minutes.' },
      { text: 'Cover the burn with a sterile, non-stick bandage.' },
      { text: 'Do not apply butter, oil, or ointments to the burn.' },
      { text: 'Seek medical attention for severe burns.' },
    ]
  },
  {
    id: 'fa-003',
    title: 'Controlling Bleeding',
    priority: 'high',
    steps: [
      { text: 'Apply direct pressure to the wound with a clean cloth or bandage.' },
      { text: 'If blood soaks through, add another bandage on top and continue pressure.' },
      { text: 'If possible, elevate the wound above the heart.' },
      { text: 'If bleeding is severe, apply pressure to the nearest pressure point.' },
      { text: 'Apply a tourniquet only as a last resort for life-threatening bleeding.' },
      { text: 'Seek medical attention as soon as possible.' },
    ]
  },
  {
    id: 'fa-004',
    title: 'Choking Response',
    priority: 'high',
    steps: [
      { text: 'Ask the person if they are choking. If they can speak or cough, let them clear the obstruction themselves.' },
      { text: 'If they cannot speak or are turning blue, stand behind them and wrap your arms around their waist.' },
      { text: 'Make a fist with one hand and place the thumb side against the middle of their abdomen, just above the navel.' },
      { text: 'Grasp your fist with your other hand and press into the abdomen with quick, upward thrusts.' },
      { text: 'Repeat until the object is expelled or the person becomes unconscious.' },
      { text: 'If the person becomes unconscious, begin CPR.' },
    ]
  },
  // Adding war-related first aid guides
  {
    id: 'fa-005',
    title: 'Treating Shock',
    priority: 'high',
    warRelated: true,
    steps: [
      { text: 'Lay the person down flat on their back with legs elevated 8-12 inches.' },
      { text: 'Keep the person warm with blankets or coats.' },
      { text: 'Do not give food or water - moisten lips if they complain of thirst.' },
      { text: 'Loosen tight clothing, especially around neck, chest, and waist.' },
      { text: 'Monitor breathing and circulation, be prepared to perform CPR.' },
      { text: 'Treat any visible injuries like bleeding or burns.' },
    ]
  },
  {
    id: 'fa-006',
    title: 'Gunshot Wound First Aid',
    priority: 'high',
    warRelated: true,
    steps: [
      { text: 'Ensure safety before approaching - make sure there is no ongoing threat.' },
      { text: 'Apply direct pressure with clean cloth to control bleeding.' },
      { text: 'Do not remove the dressing once applied - add more on top if needed.' },
      { text: 'Do not attempt to remove embedded objects or bullets.' },
      { text: 'Cover the wound with clean bandage after bleeding is controlled.' },
      { text: 'Treat for shock by laying person flat with legs elevated.' },
    ]
  },
  {
    id: 'fa-007',
    title: 'Improvised Tourniquet',
    priority: 'high',
    warRelated: true,
    steps: [
      { text: 'Use only for life-threatening limb bleeding that cannot be controlled with pressure.' },
      { text: 'Place a cloth band (belt, scarf, strip of cloth) 2-3 inches above wound, not on joint.' },
      { text: 'Wrap the band around the limb and tie a half knot.' },
      { text: 'Place a stick or rod on the half knot and tie a full knot over it.' },
      { text: 'Twist the stick to tighten until bleeding stops, then secure in position.' },
      { text: 'Note the time applied and do not loosen once applied.' },
    ]
  },
  {
    id: 'fa-008',
    title: 'Treating Blast Injuries',
    priority: 'high',
    warRelated: true,
    steps: [
      { text: 'First ensure the area is safe and there are no secondary explosive threats.' },
      { text: 'Address life-threatening bleeding first with direct pressure or tourniquets.' },
      { text: 'Check for and clear airway obstructions in unconscious casualties.' },
      { text: 'Cover open chest wounds with airtight dressings sealed on three sides.' },
      { text: 'Immobilize fractures with splints and treat for shock.' },
      { text: 'Monitor for breathing difficulties which may indicate internal injuries.' },
    ]
  }
];

// Sample shelter locations
export const shelterLocations: ShelterLocation[] = [
  {
    id: 'sh-001',
    name: 'Central Community Shelter',
    address: 'Main Street, City Center',
    coordinates: [77.2090, 28.6139], // Delhi
    type: 'shelter',
    contact: '0123456789'
  },
  {
    id: 'sh-002',
    name: 'City General Hospital',
    address: 'Hospital Road, Medical District',
    coordinates: [72.8777, 19.0760], // Mumbai
    type: 'hospital',
    contact: '0123456789'
  },
  {
    id: 'sh-003',
    name: 'North District Police Station',
    address: 'Police Avenue, North District',
    coordinates: [88.3639, 22.5726], // Kolkata
    type: 'police',
    contact: '0123456789'
  },
  {
    id: 'sh-004',
    name: 'East Side Fire Station',
    address: 'Firefighter Road, East District',
    coordinates: [80.2707, 13.0827], // Chennai
    type: 'fire',
    contact: '0123456789'
  }
];

// QR Code data format
export interface QrCodeData {
  type: 'instruction' | 'location' | 'contact';
  id: string;
  title: string;
  content: string;
  timestamp: number;
}

// Sample QR codes
export const sampleQrCodeData: QrCodeData[] = [
  {
    type: 'instruction',
    id: 'qr-eq-001',
    title: 'Earthquake Safety',
    content: JSON.stringify(emergencyInstructions[0]),
    timestamp: Date.now()
  },
  {
    type: 'instruction',
    id: 'qr-fr-001',
    title: 'Fire Emergency',
    content: JSON.stringify(emergencyInstructions[2]),
    timestamp: Date.now()
  },
  {
    type: 'location',
    id: 'qr-sh-001',
    title: 'Nearest Shelter',
    content: JSON.stringify(shelterLocations[0]),
    timestamp: Date.now()
  }
];
