export type AppView = 'home' | 'auth' | 'dashboard';

export interface UserProfile {
  id: string;
  name: string;
  phone: string;
  dialCode: string;
  role: string;
  clearanceLevel: string;
  sector: string;
  lastLoginAt: string;
  verified: boolean;
}

export type LocationType = 'district' | 'taluk' | 'village' | 'gps';

export interface LocationEntity {
  id: string;
  name: string;
  type: LocationType;
  district: string;
  taluk: string;
  state: string;
  lat: number;
  lng: number;
  elevationMsl: number;
  riskLevel: 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL';
  riskScore: number; // percentage e.g. 86
  rainfall24h: number; // mm
  soilMoisture: number; // percentage
  temperatureC: number;
  humidity: number;
  faultSlipRate: number; // mm/h
  hazardDescription: string;
}

export interface IncidentImageMetadata {
  lat?: number;
  lng?: number;
  altitude?: number;
  timestamp?: string;
  device?: string;
  exifVerified: boolean;
  source: 'EXIF' | 'GPS_SYNC' | 'BODYCAM_SIM' | 'MANUAL';
  fileName?: string;
  fileSize?: string;
  compassHeading?: number;
}

export interface IncidentReport {
  id: string;
  ticketNo: string;
  category: string;
  location: string;
  reporterName: string;
  reporterPhone: string;
  priority: 'MEDIUM' | 'HIGH' | 'CRITICAL';
  description: string;
  status: 'PENDING' | 'DISPATCHED' | 'RESOLVED';
  timeAgo: string;
  timestamp: string;
  coordinates?: { lat: number; lng: number };
  imageUrl?: string;
  imageMetadata?: IncidentImageMetadata;
}
