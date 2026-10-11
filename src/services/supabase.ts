import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { UserProfile, IncidentReport } from '../types';

// The Supabase publishable key provided by user
export const SUPABASE_PUBLISHABLE_KEY = 'sb_publishable_WHthJWPngee0mfDNeMXsUA_5s9CVJlb';

// Fallback project URL or custom env variable if present
export const SUPABASE_URL = (import.meta as any).env?.VITE_SUPABASE_URL || 'https://erutgzd5pwvdod2rmluh.supabase.co';

let supabaseClient: SupabaseClient | null = null;

try {
  if (SUPABASE_URL && SUPABASE_PUBLISHABLE_KEY) {
    supabaseClient = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      },
    });
  }
} catch (e) {
  console.warn('Supabase client initialized with local fallback cache:', e);
}

const STORAGE_ACTIVE_USER_KEY = 'nexus_active_operator_session';
const STORAGE_RECALLED_USERS_KEY = 'nexus_recalled_operators_list';
const STORAGE_INCIDENTS_KEY = 'nexus_incident_reports_v1';

// Initial default incidents if none in storage (Tamil Nadu Disaster Response Grid)
const DEFAULT_INCIDENTS: IncidentReport[] = [
  {
    id: 'inc-1',
    ticketNo: '#TN-9852',
    category: 'Ghat Road Debris / Landslip',
    location: 'Coonoor Ghat Section (Km 18), The Nilgiris',
    reporterName: 'M. Selvaraj',
    reporterPhone: '+91 9842012845',
    priority: 'CRITICAL',
    description: 'Active mudslip reported across 14 meters of Mettupalayam-Coonoor Ghat carriageway. JCB excavator unit deployed.',
    status: 'DISPATCHED',
    timeAgo: '6m ago',
    timestamp: new Date(Date.now() - 6 * 60 * 1000).toISOString(),
    coordinates: { lat: 11.353, lng: 76.795 },
    imageUrl: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=1000&q=80',
    imageMetadata: {
      lat: 11.353,
      lng: 76.795,
      altitude: 1420,
      timestamp: new Date(Date.now() - 8 * 60 * 1000).toLocaleString(),
      device: 'NEXUS Bodycam Mk IV',
      exifVerified: true,
      source: 'EXIF',
      fileName: 'coonoor_ghat_slip_01.jpg',
      fileSize: '1.4 MB',
    },
  },
  {
    id: 'inc-2',
    ticketNo: '#TN-9848',
    category: 'Urban Inundation / Storm Surge',
    location: 'Velachery Canal Sector, Chennai',
    reporterName: 'K. Anitha',
    reporterPhone: '+91 9444019284',
    priority: 'HIGH',
    description: 'Buckingham canal feeder overflow. High-capacity dewatering pumps stationed at AGS Colony intersection.',
    status: 'RESOLVED',
    timeAgo: '28m ago',
    timestamp: new Date(Date.now() - 28 * 60 * 1000).toISOString(),
    coordinates: { lat: 12.9815, lng: 80.218 },
    imageUrl: 'https://images.unsplash.com/photo-1547683905-f686c993aae5?auto=format&fit=crop&w=1000&q=80',
    imageMetadata: {
      lat: 12.9815,
      lng: 80.218,
      altitude: 12,
      timestamp: new Date(Date.now() - 35 * 60 * 1000).toLocaleString(),
      device: 'Field Drone Alpha-7',
      exifVerified: true,
      source: 'EXIF',
      fileName: 'velachery_canal_inundation.jpg',
      fileSize: '2.1 MB',
    },
  },
  {
    id: 'inc-3',
    ticketNo: '#TN-9841',
    category: 'Cracked Retaining Wall',
    location: 'Kodaikanal Ghat Road (Hairpin 9), Dindigul',
    reporterName: 'PWD Sub-Inspector R. Ramanathan',
    reporterPhone: '+91 9443099881',
    priority: 'HIGH',
    description: 'Retaining masonry wall tilting 7 degrees over Palani hillside culvert. Sandbag reinforcement and barrier placement active.',
    status: 'PENDING',
    timeAgo: '1h ago',
    timestamp: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
    coordinates: { lat: 10.238, lng: 77.489 },
    imageUrl: 'https://images.unsplash.com/photo-1518495973542-4542c06a5843?auto=format&fit=crop&w=1000&q=80',
    imageMetadata: {
      lat: 10.238,
      lng: 77.489,
      altitude: 2130,
      timestamp: new Date(Date.now() - 65 * 60 * 1000).toLocaleString(),
      device: 'PWD Inspection Bodycam',
      exifVerified: true,
      source: 'EXIF',
      fileName: 'kodaikanal_wall_crack.jpg',
      fileSize: '980 KB',
    },
  },
];

export const supabaseService = {
  getClient(): SupabaseClient | null {
    return supabaseClient;
  },

  /**
   * Recalls the last signed-in user or active session
   */
  getActiveUser(): UserProfile | null {
    try {
      const stored = localStorage.getItem(STORAGE_ACTIVE_USER_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (err) {
      console.error('Failed to read active user from storage', err);
    }
    return null;
  },

  /**
   * Retrieves all users stored in memory/storage so user can recall for login
   */
  getRecalledUsers(): UserProfile[] {
    try {
      const raw = localStorage.getItem(STORAGE_RECALLED_USERS_KEY);
      if (raw) {
        return JSON.parse(raw);
      }
    } catch (e) {
      console.error('Failed to read recalled users', e);
    }
    return [];
  },

  /**
   * Stores user credentials in memory, localStorage, and attempts Supabase sync
   */
  async saveUser(name: string, phone: string, dialCode: string = '+91'): Promise<UserProfile> {
    const trimmedName = name.trim();
    const trimmedPhone = phone.trim();
    const id = `op-${trimmedPhone.replace(/\D/g, '') || Date.now()}`;

    const profile: UserProfile = {
      id,
      name: trimmedName,
      phone: trimmedPhone,
      dialCode,
      role: 'Incident Command Officer',
      clearanceLevel: 'Tactical Level 4',
      sector: 'Planetary Response Grid',
      lastLoginAt: new Date().toISOString(),
      verified: true,
    };

    // 1. Save as current active operator session
    try {
      localStorage.setItem(STORAGE_ACTIVE_USER_KEY, JSON.stringify(profile));

      // 2. Add to recalled users list (deduplicated by phone / name)
      const existing = this.getRecalledUsers();
      const filtered = existing.filter(
        (u) => u.phone !== profile.phone && u.name.toLowerCase() !== profile.name.toLowerCase()
      );
      const updated = [profile, ...filtered].slice(0, 10);
      localStorage.setItem(STORAGE_RECALLED_USERS_KEY, JSON.stringify(updated));
    } catch (e) {
      console.error('Storage write error', e);
    }

    // 3. Attempt Supabase cloud sync if table exists
    if (supabaseClient) {
      try {
        await supabaseClient.from('nexus_users').upsert({
          id: profile.id,
          name: profile.name,
          phone: profile.phone,
          dial_code: profile.dialCode,
          role: profile.role,
          clearance: profile.clearanceLevel,
          last_login: profile.lastLoginAt,
        });
      } catch (err) {
        // Silent fallback to local storage
      }
    }

    return profile;
  },

  /**
   * Clears active session for log out
   */
  logoutUser(): void {
    try {
      localStorage.removeItem(STORAGE_ACTIVE_USER_KEY);
    } catch (e) {
      console.error('Failed to logout', e);
    }
  },

  /**
   * Incident Reports Store
   */
  getIncidents(): IncidentReport[] {
    try {
      const data = localStorage.getItem(STORAGE_INCIDENTS_KEY);
      if (data) {
        const parsed: IncidentReport[] = JSON.parse(data);
        // Ensure default tickets have their imageUrl and imageMetadata if cache predates photo support
        const enriched = parsed.map((item) => {
          const defaultMatch = DEFAULT_INCIDENTS.find((d) => d.id === item.id);
          if (defaultMatch && !item.imageUrl) {
            return {
              ...item,
              imageUrl: defaultMatch.imageUrl,
              imageMetadata: defaultMatch.imageMetadata,
            };
          }
          return item;
        });
        return enriched;
      }
    } catch (e) {
      console.error('Failed to get incidents', e);
    }
    return DEFAULT_INCIDENTS;
  },

  saveIncident(incident: Omit<IncidentReport, 'id' | 'ticketNo' | 'timeAgo' | 'timestamp'>): IncidentReport {
    const randomTicket = `#AS-${Math.floor(1000 + Math.random() * 9000)}`;
    const newRecord: IncidentReport = {
      ...incident,
      id: `inc-${Date.now()}`,
      ticketNo: randomTicket,
      timeAgo: 'Just now',
      timestamp: new Date().toISOString(),
    };

    const current = this.getIncidents();
    const updated = [newRecord, ...current];
    try {
      localStorage.setItem(STORAGE_INCIDENTS_KEY, JSON.stringify(updated));
    } catch (e) {
      console.error('Failed to persist incident', e);
    }

    // Also sync to Supabase if available
    if (supabaseClient) {
      try {
        supabaseClient.from('nexus_incidents').insert({
          ticket_no: newRecord.ticketNo,
          category: newRecord.category,
          location: newRecord.location,
          reporter_name: newRecord.reporterName,
          reporter_phone: newRecord.reporterPhone,
          priority: newRecord.priority,
          description: newRecord.description,
          status: newRecord.status,
          created_at: newRecord.timestamp,
        });
      } catch (e) {
        // Safe fallback
      }
    }

    return newRecord;
  },

  updateIncidentStatus(id: string, status: 'PENDING' | 'DISPATCHED' | 'RESOLVED'): IncidentReport[] {
    const list = this.getIncidents();
    const updated = list.map((item) => (item.id === id ? { ...item, status } : item));
    try {
      localStorage.setItem(STORAGE_INCIDENTS_KEY, JSON.stringify(updated));
    } catch (e) {
      console.error('Failed to update incident', e);
    }
    return updated;
  },
};
