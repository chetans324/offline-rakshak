
// Utility for storing and retrieving data for offline use
const STORAGE_KEYS = {
  EMERGENCY_INSTRUCTIONS: 'emergency-instructions',
  FIRST_AID_GUIDES: 'first-aid-guides',
  SHELTER_LOCATIONS: 'shelter-locations',
  GENERATED_QR_CODES: 'generated-qr-codes',
  SCANNED_QR_CODES: 'scanned-qr-codes',
};

// Save data to localStorage
export const saveToLocalStorage = <T>(key: string, data: T): void => {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (error) {
    console.error(`Error saving to localStorage: ${key}`, error);
  }
};

// Get data from localStorage
export const getFromLocalStorage = <T>(key: string, defaultValue: T): T => {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : defaultValue;
  } catch (error) {
    console.error(`Error retrieving from localStorage: ${key}`, error);
    return defaultValue;
  }
};

// Check if app is online
export const isOnline = (): boolean => {
  return navigator.onLine;
};

// Save emergency instructions for offline use
export const saveEmergencyInstructions = (instructions: any[]): void => {
  saveToLocalStorage(STORAGE_KEYS.EMERGENCY_INSTRUCTIONS, instructions);
};

// Get emergency instructions from offline storage
export const getEmergencyInstructions = (): any[] => {
  return getFromLocalStorage(STORAGE_KEYS.EMERGENCY_INSTRUCTIONS, []);
};

// Save first aid guides for offline use
export const saveFirstAidGuides = (guides: any[]): void => {
  saveToLocalStorage(STORAGE_KEYS.FIRST_AID_GUIDES, guides);
};

// Get first aid guides from offline storage
export const getFirstAidGuides = (): any[] => {
  return getFromLocalStorage(STORAGE_KEYS.FIRST_AID_GUIDES, []);
};

// Save shelter locations for offline use
export const saveShelterLocations = (locations: any[]): void => {
  saveToLocalStorage(STORAGE_KEYS.SHELTER_LOCATIONS, locations);
};

// Get shelter locations from offline storage
export const getShelterLocations = (): any[] => {
  return getFromLocalStorage(STORAGE_KEYS.SHELTER_LOCATIONS, []);
};

// Save generated QR codes
export const saveGeneratedQrCodes = (qrCodes: any[]): void => {
  saveToLocalStorage(STORAGE_KEYS.GENERATED_QR_CODES, qrCodes);
};

// Get generated QR codes
export const getGeneratedQrCodes = (): any[] => {
  return getFromLocalStorage(STORAGE_KEYS.GENERATED_QR_CODES, []);
};

// Save scanned QR code history
export const saveScannedQrCode = (qrCode: any): void => {
  const existingCodes = getScannedQrCodes();
  const updatedCodes = [qrCode, ...existingCodes.slice(0, 19)]; // Keep last 20 codes
  saveToLocalStorage(STORAGE_KEYS.SCANNED_QR_CODES, updatedCodes);
};

// Get scanned QR code history
export const getScannedQrCodes = (): any[] => {
  return getFromLocalStorage(STORAGE_KEYS.SCANNED_QR_CODES, []);
};

// Initialize the app's offline data
export const initializeOfflineData = (
  instructions: any[],
  guides: any[],
  locations: any[]
): void => {
  saveEmergencyInstructions(instructions);
  saveFirstAidGuides(guides);
  saveShelterLocations(locations);
};

export default {
  saveToLocalStorage,
  getFromLocalStorage,
  isOnline,
  saveEmergencyInstructions,
  getEmergencyInstructions,
  saveFirstAidGuides,
  getFirstAidGuides,
  saveShelterLocations,
  getShelterLocations,
  saveGeneratedQrCodes,
  getGeneratedQrCodes,
  saveScannedQrCode,
  getScannedQrCodes,
  initializeOfflineData,
};
