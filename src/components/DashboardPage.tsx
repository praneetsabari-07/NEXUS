import React, { useState, useEffect } from 'react';
import { AppView, LocationEntity, UserProfile, IncidentReport, IncidentImageMetadata } from '../types';
import { supabaseService } from '../services/supabase';
import { DEFAULT_LOCATION, LOCATIONS_DATABASE, findNearestTaluk } from '../data/locations';
import { InteractiveTacticalMap } from './InteractiveTacticalMap';
import { LocationSearchStack } from './LocationSearchStack';
import { ProfileDropdown } from './ProfileDropdown';
import { AICopilotDrawer } from './AICopilotDrawer';
import { StarFieldCanvas } from './StarFieldCanvas';
import { DisasterMLPredictorPanel } from './DisasterMLPredictorPanel';
import { QuickSOSToggle } from './QuickSOSToggle';
import { GeoPositionImageModule } from './GeoPositionImageModule';
import { EvidenceLightboxModal } from './EvidenceLightboxModal';
import { ClimateService, LiveClimateData } from '../services/climateService';
import { geminiService } from '../services/geminiService';
import {
  AlertTriangle,
  ArrowRight,
  Boxes,
  Camera,
  CheckCircle2,
  ChevronRight,
  CloudRain,
  Cpu,
  Droplets,
  Eye,
  Flame,
  Home,
  Image as ImageIcon,
  Layers,
  Locate,
  MapPin,
  Menu,
  Radio,
  RefreshCw,
  Search,
  Send,
  Shield,
  ShieldAlert,
  Sparkles,
  Thermometer,
  Wind,
  Zap,
} from 'lucide-react';

interface DashboardPageProps {
  currentUser: UserProfile;
  onNavigate: (view: AppView) => void;
  onLogout: () => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({
  currentUser,
  onNavigate,
  onLogout,
}) => {
  // State for active location (defaults to Haflong - Jatinga Basin or user's GPS)
  const [currentLocation, setCurrentLocation] = useState<LocationEntity>(DEFAULT_LOCATION);
  const [isGpsActive, setIsGpsActive] = useState(false);
  const [gpsStatusText, setGpsStatusText] = useState<string>('');

  // Incidents stack state
  const [incidents, setIncidents] = useState<IncidentReport[]>([]);
  const [activeQueueFilter, setActiveQueueFilter] = useState<'ALL' | 'PHOTOS' | 'PENDING' | 'DISPATCHED' | 'RESOLVED'>('ALL');

  // Photo Evidence State for Incident Token Raiser
  const [attachedImage, setAttachedImage] = useState<string | null>(null);
  const [attachedImageMeta, setAttachedImageMeta] = useState<IncidentImageMetadata | null>(null);

  // Evidence Lightbox Inspector Modal State
  const [selectedEvidenceTicket, setSelectedEvidenceTicket] = useState<IncidentReport | null>(null);
  const [isEvidenceModalOpen, setIsEvidenceModalOpen] = useState(false);

  // Form states for Incident Token Raiser
  const [incidentCategory, setIncidentCategory] = useState('Road Blockage / Debris');
  const [incidentLocation, setIncidentLocation] = useState(DEFAULT_LOCATION.name);
  const [reporterInfo, setReporterInfo] = useState(`${currentUser.name} (${currentUser.dialCode} ${currentUser.phone})`);
  const [incidentPriority, setIncidentPriority] = useState<'MEDIUM' | 'HIGH' | 'CRITICAL'>('HIGH');
  const [groundDescription, setGroundDescription] = useState(
    `Active slope instability observed in ${DEFAULT_LOCATION.name}. Heavy surface water saturation leading to debris movement.`
  );
  const [ndrfMasterDispatch, setNdrfMasterDispatch] = useState(true);
  const [formFeedback, setFormFeedback] = useState<string | null>(null);

  // Copilot Modal state
  const [isCopilotOpen, setIsCopilotOpen] = useState(false);
  const [isMLPanelOpen, setIsMLPanelOpen] = useState(false);

  // Live Climate & Regional API Telemetrics state
  const [liveClimate, setLiveClimate] = useState<LiveClimateData | null>(null);
  const [isClimateLoading, setIsClimateLoading] = useState(false);

  // Gemini AI Location Weather Summary State
  const [aiWeatherSummary, setAiWeatherSummary] = useState<string>('');
  const [isAiWeatherLoading, setIsAiWeatherLoading] = useState(false);

  // Gemini AI Weather Summarizer for currently selected location
  const fetchGeminiWeatherSummary = async (
    loc: LocationEntity,
    climateData?: LiveClimateData | null,
    force: boolean = false
  ) => {
    setIsAiWeatherLoading(true);
    try {
      const summary = await geminiService.summarizeLocationWeather(loc, climateData, force);
      setAiWeatherSummary(summary);
    } catch (err) {
      console.error('Failed to generate Gemini weather summary:', err);
    } finally {
      setIsAiWeatherLoading(false);
    }
  };

  useEffect(() => {
    fetchGeminiWeatherSummary(currentLocation, liveClimate);
  }, [currentLocation.id, currentLocation.lat, currentLocation.lng, liveClimate]);

  // Live Climate API fetcher (Open-Meteo WMO / Google Maps Layer)
  const fetchCurrentClimate = async (lat: number, lng: number, locName: string) => {
    setIsClimateLoading(true);
    try {
      const data = await ClimateService.getLiveClimate(lat, lng, locName);
      setLiveClimate(data);
    } catch (err) {
      console.error('Failed to fetch live regional climate telemetrics:', err);
    } finally {
      setIsClimateLoading(false);
    }
  };

  useEffect(() => {
    fetchCurrentClimate(currentLocation.latitude, currentLocation.longitude, currentLocation.name);
  }, [currentLocation.latitude, currentLocation.longitude, currentLocation.name]);

  // Load incidents from storage/service
  useEffect(() => {
    const list = supabaseService.getIncidents();
    setIncidents(list);
  }, []);

  // Sync reporter info whenever user changes
  useEffect(() => {
    setReporterInfo(`${currentUser.name} (${currentUser.dialCode} ${currentUser.phone})`);
  }, [currentUser]);

  // Sync form location whenever active location changes
  useEffect(() => {
    setIncidentLocation(currentLocation.name);
    setGroundDescription(
      `Active slope instability observed in ${currentLocation.name}. ${currentLocation.hazardDescription}`
    );
  }, [currentLocation]);

  // Real Browser Geolocation Handler (Resolves to nearest matching Tamil Nadu Taluk)
  const handleRequestGps = () => {
    if (!('geolocation' in navigator)) {
      alert('Geolocation is not supported by your browser environment.');
      return;
    }

    setGpsStatusText('Acquiring satellite GPS lock & matching nearest taluk...');

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        setIsGpsActive(true);

        // Map live GPS coordinates directly to the nearest Tamil Nadu Taluk & District entity
        const matchedTaluk = findNearestTaluk(latitude, longitude);
        setCurrentLocation(matchedTaluk);
        setGpsStatusText(`GPS Synchronized: ${matchedTaluk.taluk} Taluk, ${matchedTaluk.district}`);

        setTimeout(() => setGpsStatusText(''), 4500);
      },
      (err) => {
        console.warn('GPS permission denied or unavailable:', err.message);
        setGpsStatusText('GPS unavailable: Defaulting to Coonoor Taluk, The Nilgiris');
        setTimeout(() => setGpsStatusText(''), 3000);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  // Automatically request GPS on mount if user allows
  useEffect(() => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const { latitude, longitude } = pos.coords;
          setIsGpsActive(true);
          const matchedTaluk = findNearestTaluk(latitude, longitude);
          setCurrentLocation(matchedTaluk);
        },
        () => {
          // Graceful fallback to default Coonoor Taluk, The Nilgiris
        },
        { enableHighAccuracy: false, timeout: 5000 }
      );
    }
  }, []);

  // Submit new incident
  const handleRegisterIncident = (e: React.FormEvent) => {
    e.preventDefault();
    if (!incidentLocation.trim() || !groundDescription.trim()) return;

    const newTicket = supabaseService.saveIncident({
      category: incidentCategory,
      location: incidentLocation,
      reporterName: currentUser.name,
      reporterPhone: `${currentUser.dialCode} ${currentUser.phone}`,
      priority: incidentPriority,
      description: groundDescription,
      status: ndrfMasterDispatch ? 'DISPATCHED' : 'PENDING',
      coordinates: attachedImageMeta?.lat && attachedImageMeta?.lng
        ? { lat: attachedImageMeta.lat, lng: attachedImageMeta.lng }
        : { lat: currentLocation.lat, lng: currentLocation.lng },
      imageUrl: attachedImage || undefined,
      imageMetadata: attachedImageMeta || undefined,
    });

    setIncidents(supabaseService.getIncidents());
    setAttachedImage(null);
    setAttachedImageMeta(null);
    setFormFeedback(`Ticket ${newTicket.ticketNo} registered & dispatched to NDRF team for ${incidentLocation}!`);
    setTimeout(() => setFormFeedback(null), 4000);
  };

  // Mark incident resolved
  const handleResolveIncident = (id: string) => {
    const updated = supabaseService.updateIncidentStatus(id, 'RESOLVED');
    setIncidents(updated);
  };

  // Filtered incidents
  const filteredIncidents = incidents.filter((item) => {
    if (activeQueueFilter === 'ALL') return true;
    if (activeQueueFilter === 'PHOTOS') return !!item.imageUrl;
    return item.status === activeQueueFilter;
  });

  return (
    <div className="min-h-screen relative font-sans antialiased text-slate-100 bg-[#060a12] pb-24 select-none">
      {/* Scenic Alpine Twilight Background */}
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none" data-purpose="scenic-background">
        <img
          alt="Alpine Twilight Mountain Backdrop"
          className="w-full h-full object-cover object-center scale-100 filter brightness-95 contrast-[1.03]"
          src="https://lh3.googleusercontent.com/aida-public/AB6AXuCiECMBEPskcX1LZ1HfS4HnO7zLfQwJh6ERFZaO3OOFhN8lHvLISi4cHFu0q_IFLVWAg2sJxpmgFpg8hFOfWUI6CHxdTLqCcEaLEfoo8P6KrygxqRTs4fz-qEY6oud1OZNX8lN0helxc8oVu9fF9YbxmM6sUxvenm5lOKTihagHdZhGl6LpslppXE5IYeUPuGGygY3E8NfFsO_YbI85i6XG5Vsf4Rx-HMzRlejtYg3-ZeAao6Tx1eGOYg"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#060a12]/50 via-transparent to-[#04070e]/85"></div>
      </div>

      {/* Star Field Canvas */}
      <StarFieldCanvas starCount={65} maxHeightRatio={0.65} />

      {/* TOP NAVIGATION BAR */}
      <header className="sticky top-0 z-40 px-3 sm:px-6 lg:px-8 pt-4 pb-2" data-purpose="header-navigation">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-2 sm:gap-3">
          {/* Left Section: Home Action & Brand Capsule */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => onNavigate('home')}
              title="Toggle Menu / Return to Public Overview"
              aria-label="Toggle Navigation Menu"
              className="w-10 h-10 rounded-2xl liquid-glass-capsule flex items-center justify-center text-white/80 hover:text-white hover:border-white/35 transition-all active:scale-95 cursor-pointer shadow-md"
            >
              <Menu className="w-4 h-4 text-cyan-400" />
            </button>

            <div className="h-10 px-3 sm:px-4 rounded-2xl liquid-glass-capsule flex items-center gap-2.5 sm:gap-3 shadow-md">
              <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center p-0.5 shadow-sm shadow-cyan-500/30">
                <svg
                  className="w-3.5 h-3.5 text-white"
                  fill="none"
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2.2"
                  viewBox="0 0 24 24"
                >
                  <polygon points="12 2 2 8.5 2 15.5 12 22 22 15.5" />
                  <line x1="12" x2="12" y1="22" y2="15.5" />
                  <polyline points="22 8.5 12 15.5 2 8.5" />
                </svg>
              </div>
              <span className="font-mono font-bold tracking-widest text-xs sm:text-sm text-white uppercase">
                NEXUS
              </span>
              <div className="h-3.5 w-[1px] bg-white/15"></div>
              {/* Quick SOS Sender Toggle (replaces GRID ACTIVE) */}
              <QuickSOSToggle currentLocation={currentLocation} />
            </div>
          </div>

          {/* Center Section: Stack-Wise Hierarchical Location Search Capsule */}
          <LocationSearchStack
            currentLocation={currentLocation}
            onSelectLocation={(loc) => {
              setCurrentLocation(loc);
              setIsGpsActive(false);
            }}
            onRequestGps={handleRequestGps}
            isGpsActive={isGpsActive}
          />

          {/* Right Section: Geotag & Real Operator Profile Capsule with Logout */}
          <div className="flex items-center gap-2">
            {/* Live Geotag Badge */}
            <button
              type="button"
              onClick={handleRequestGps}
              title="Click to refresh browser GPS location"
              className="hidden md:flex items-center gap-2 h-10 px-3.5 rounded-2xl liquid-glass-capsule text-xs font-medium text-white/80 shadow-sm hover:border-white/35 transition cursor-pointer"
            >
              <span className="relative flex h-2 w-2">
                <span
                  className={`animate-ping absolute inline-flex h-full w-full rounded-full ${
                    isGpsActive ? 'bg-emerald-400' : 'bg-rose-400'
                  } opacity-75`}
                ></span>
                <span
                  className={`relative inline-flex rounded-full h-2 w-2 ${
                    isGpsActive ? 'bg-emerald-500' : 'bg-rose-500'
                  }`}
                ></span>
              </span>
              <span className="font-sans text-[11px] text-white/90 truncate max-w-[150px]">
                {currentLocation.name}
              </span>
            </button>

            {/* Operator Profile Capsule (NO dummy names, has Log Out dropdown) */}
            <ProfileDropdown
              user={currentUser}
              currentLocationName={currentLocation.name}
              onLogout={onLogout}
              onSwitchAccount={() => onNavigate('auth')}
            />
          </div>
        </div>

        {gpsStatusText && (
          <div className="max-w-7xl mx-auto mt-1 text-center">
            <span className="text-[11px] font-mono text-cyan-300 bg-slate-900/90 border border-cyan-400/30 px-3 py-0.5 rounded-full shadow-lg inline-block">
              {gpsStatusText}
            </span>
          </div>
        )}
      </header>

      {/* MAIN COMMAND VIEWPORT */}
      <main className="max-w-7xl mx-auto w-full px-3 sm:px-6 lg:px-8 mt-4 space-y-6">
        {/* PRIMARY MASTER MONITORING HUB */}
        <section
          className="liquid-glass-shell rounded-3xl p-4 sm:p-7"
          data-purpose="primary-monitoring-hub"
          style={{
            background: 'rgba(255, 255, 255, 0.52)',
            backdropFilter: 'blur(40px) saturate(200%)',
            WebkitBackdropFilter: 'blur(40px) saturate(200%)',
            border: '1px solid rgba(255, 255, 255, 0.85)',
            boxShadow: '0 24px 60px -12px rgba(15, 23, 42, 0.2), inset 0 1.5px 2px 0 rgba(255, 255, 255, 0.9)',
          }}
        >
          {/* Hub Header */}
          <div className="flex flex-wrap items-center justify-between gap-4 pb-5 border-b border-slate-200/80">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="px-2.5 py-0.5 rounded-md bg-cyan-700 text-white font-mono text-[10px] font-bold uppercase tracking-wider">
                  Live Sector Lock
                </span>
                <span className="text-xs font-mono font-bold text-slate-700">
                  {currentLocation.district}, {currentLocation.state}
                </span>
              </div>
              <h1 className="text-lg sm:text-2xl font-black tracking-tight text-slate-900">
                Location Enabled Disaster Management System: {currentLocation.name}
              </h1>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleRequestGps}
                className="px-3.5 py-1.5 rounded-xl bg-white/85 hover:bg-white text-xs font-bold text-slate-800 border border-slate-200/80 shadow-sm transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <Locate className="w-3.5 h-3.5 text-cyan-600" />
                <span>GPS Auto-Lock</span>
              </button>

              <button
                type="button"
                onClick={() => setIsMLPanelOpen(!isMLPanelOpen)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all shadow-sm flex items-center gap-1.5 cursor-pointer ${
                  isMLPanelOpen
                    ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white border border-cyan-400'
                    : 'bg-slate-900/90 hover:bg-slate-800 text-cyan-300 border border-cyan-500/40'
                }`}
              >
                <Cpu className="w-3.5 h-3.5" />
                <span>{isMLPanelOpen ? 'Hide ML Predictor' : 'ML Formula Predictor (E,C,F,L,T)'}</span>
              </button>
            </div>
          </div>

          {/* Conditional ML Formula Predictor & Live Simulation Hub */}
          {isMLPanelOpen && (
            <div className="mt-6 mb-6 p-1 sm:p-3 rounded-2xl bg-slate-950/90 border border-cyan-500/40 shadow-2xl">
              <DisasterMLPredictorPanel standalone={true} />
            </div>
          )}

          {/* Split Grid: Interactive Leaflet Map & 4 Nested Glass Telemetry Cards */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 mt-6 items-stretch">
            {/* Interactive Map with Pinpoint */}
            <InteractiveTacticalMap
              location={currentLocation}
              isGpsActive={isGpsActive}
              onRequestGps={handleRequestGps}
            />

            {/* Right: 4 Nested Liquid Glass Telemetry Cards */}
            <div className="lg:col-span-5 grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {/* Card 1: Rainfall Deluge - Live Synchronized */}
              <div className="bg-white rounded-2xl p-4 flex flex-col justify-between border border-white/60 shadow-lg border-t-4 border-t-cyan-500">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-600 uppercase tracking-wide">Live Rainfall</span>
                  <span className="p-1.5 rounded-lg bg-cyan-50 text-cyan-600 border border-cyan-100">
                    <Droplets className="w-3.5 h-3.5" />
                  </span>
                </div>
                <div className="my-2.5">
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-2xl sm:text-3xl font-black text-slate-900 font-mono tracking-tight">
                      {liveClimate ? liveClimate.rainfall24hMm.toFixed(1) : (currentLocation.rainfall24h > 50 ? (currentLocation.rainfall24h * 0.05).toFixed(1) : currentLocation.rainfall24h)}
                    </span>
                    <span className="text-xs font-bold text-cyan-700 font-mono">mm / 24h</span>
                  </div>
                  <p className="text-[11px] font-medium text-slate-500 mt-0.5 flex items-center gap-1.5">
                    <span className="inline-block w-1.5 h-1.5 rounded-full bg-cyan-500 animate-pulse"></span>
                    <span>Rate: <strong className="text-slate-800">{liveClimate ? `${liveClimate.rainfallCurrentMm.toFixed(1)} mm/h` : '0.0 mm/h'}</strong></span>
                  </p>
                </div>
                <div>
                  <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden border border-slate-200/60">
                    <div
                      className="bg-gradient-to-r from-cyan-500 to-blue-600 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${Math.min(((liveClimate?.rainfall24hMm ?? 0.5) / 50) * 100, 100)}%` }}
                    ></div>
                  </div>
                  <div className="flex justify-between text-[10px] text-slate-500 mt-1.5 font-mono font-medium">
                    <span>
                      Condition: {liveClimate?.weatherCondition || 'Normal'}
                    </span>
                    <span className="text-cyan-700 font-bold">
                      {liveClimate?.source ? 'WMO Live' : 'Calibrated'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Card 2: Soil Moisture */}
              <div className="bg-white rounded-2xl p-4 flex flex-col justify-between border border-white/60 shadow-lg border-t-4 border-t-amber-500">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-600 uppercase tracking-wide">Soil Moisture</span>
                  <span className="p-1.5 rounded-lg bg-amber-50 text-amber-600 border border-amber-100">
                    <Zap className="w-3.5 h-3.5" />
                  </span>
                </div>
                <div className="my-2.5">
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-2xl sm:text-3xl font-black text-slate-900 font-mono tracking-tight">
                      {liveClimate ? liveClimate.soilMoisturePct : currentLocation.soilMoisture}
                    </span>
                    <span className="text-xs font-bold text-amber-700 font-mono">% Sat</span>
                  </div>
                  <p className="text-[11px] text-amber-600 font-bold mt-0.5">
                    Liquefaction Hazard: {(liveClimate?.soilMoisturePct ?? currentLocation.soilMoisture) > 75 ? 'ACTIVE' : 'MONITORED'}
                  </p>
                </div>
                <div>
                  <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden border border-slate-200/60">
                    <div
                      className="bg-gradient-to-r from-emerald-500 via-amber-500 to-rose-500 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${liveClimate ? liveClimate.soilMoisturePct : currentLocation.soilMoisture}%` }}
                    ></div>
                  </div>
                  <div className="flex justify-between text-[10px] text-slate-500 mt-1.5 font-mono font-medium">
                    <span>Pore Pressure</span>
                    <span className="text-amber-700 font-bold">1.82 kPa</span>
                  </div>
                </div>
              </div>

              {/* Card 3: Atmosphere / Temperature */}
              <div className="bg-white rounded-2xl p-4 flex flex-col justify-between border border-white/60 shadow-lg border-t-4 border-t-indigo-500">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-600 uppercase tracking-wide">Atmosphere</span>
                  <span className="p-1.5 rounded-lg bg-indigo-50 text-indigo-600 border border-indigo-100">
                    <Wind className="w-3.5 h-3.5" />
                  </span>
                </div>
                <div className="my-2.5">
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-2xl sm:text-3xl font-black text-slate-900 font-mono tracking-tight">
                      {liveClimate ? liveClimate.temperatureC.toFixed(1) : currentLocation.temperatureC}
                    </span>
                    <span className="text-xs font-bold text-slate-500 font-mono">°C</span>
                  </div>
                  <p className="text-[11px] font-medium text-slate-600 mt-0.5">
                    Relative Humidity: {liveClimate ? liveClimate.humidityPct : currentLocation.humidity}% RH
                  </p>
                </div>
                <div className="pt-2 text-[10px] text-slate-500 flex items-center justify-between border-t border-slate-100 font-mono font-medium">
                  <span className="truncate max-w-[120px]">{liveClimate?.weatherCondition || 'Normal'}</span>
                  <span className="text-indigo-700 font-bold">{liveClimate?.windSpeedKmh ? `${liveClimate.windSpeedKmh} km/h` : '18 km/h NW'}</span>
                </div>
              </div>

              {/* Card 4: Online Datas (Live Climate API & Sensor Feed) */}
              <div className="bg-white rounded-2xl p-4 flex flex-col justify-between border border-white/60 shadow-lg border-t-4 border-t-emerald-500 relative overflow-hidden">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                    </span>
                    <span className="text-xs font-bold text-slate-800 uppercase tracking-wide">
                      Online Datas
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => fetchCurrentClimate(currentLocation.latitude, currentLocation.longitude, currentLocation.name)}
                    title="Click to refresh live API data"
                    className="p-1 rounded-md hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition cursor-pointer"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isClimateLoading ? 'animate-spin text-emerald-600' : ''}`} />
                  </button>
                </div>

                {/* Point-wise manner in that single box */}
                <div className="my-2 space-y-1.5 text-xs">
                  {/* Point 1: Rainfall */}
                  <div className="flex items-start justify-between py-1 border-b border-slate-100">
                    <div className="flex items-center gap-1 text-slate-700 font-medium">
                      <span className="text-cyan-600 font-bold">•</span>
                      <span>Rainfall:</span>
                    </div>
                    <div className="text-right font-mono">
                      <span className="font-bold text-slate-900">
                        {liveClimate ? `${liveClimate.rainfall24hMm.toFixed(1)} mm` : '0.0 mm'}
                      </span>
                      <span className="text-[10px] text-slate-500 block">
                        ({liveClimate ? `${liveClimate.rainfallCurrentMm.toFixed(1)} mm/h` : '0.0 mm/h'})
                      </span>
                    </div>
                  </div>

                  {/* Point 2: Temperature */}
                  <div className="flex items-start justify-between py-1 border-b border-slate-100">
                    <div className="flex items-center gap-1 text-slate-700 font-medium">
                      <span className="text-rose-500 font-bold">•</span>
                      <span>Temp:</span>
                    </div>
                    <div className="text-right font-mono">
                      <span className="font-bold text-slate-900">
                        {liveClimate ? `${liveClimate.temperatureC.toFixed(1)}°C` : `${currentLocation.temperatureC}°C`}
                      </span>
                      <span className="text-[10px] text-slate-500 block">
                        (Feels {liveClimate ? `${liveClimate.apparentTemperatureC.toFixed(1)}°C` : `${currentLocation.temperatureC}°C`})
                      </span>
                    </div>
                  </div>

                  {/* Point 3: Moisture Data */}
                  <div className="flex items-start justify-between py-1">
                    <div className="flex items-center gap-1 text-slate-700 font-medium">
                      <span className="text-emerald-600 font-bold">•</span>
                      <span>Moisture:</span>
                    </div>
                    <div className="text-right font-mono">
                      <span className="font-bold text-slate-900">
                        {liveClimate ? `${liveClimate.humidityPct}% RH` : `${currentLocation.humidity}% RH`}
                      </span>
                      <span className="text-[10px] text-emerald-700 font-semibold block">
                        Soil {liveClimate ? `${liveClimate.soilMoisturePct}%` : `${currentLocation.soilMoisture}%`} Sat
                      </span>
                    </div>
                  </div>
                </div>

                {/* Point 4 / Feed status footer */}
                <div className="pt-2 text-[10px] text-slate-500 flex items-center justify-between border-t border-slate-100 font-mono">
                  <span className="truncate max-w-[140px]" title={liveClimate?.source || 'Live Climate API'}>
                    {liveClimate?.source ? 'WMO / Google Maps Layer' : 'API Connecting...'}
                  </span>
                  <span className="text-emerald-700 font-bold">
                    {liveClimate?.timestamp || 'Live Sync'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* AI ANALYSIS CAPSULE BAR: GEMINI WEATHER & METEOROLOGICAL INTELLIGENCE */}
        <div className="w-full liquid-glass-capsule rounded-2xl px-4 sm:px-5 py-3.5 flex flex-col md:flex-row md:items-center justify-between gap-3.5 shadow-xl relative overflow-hidden transition-all duration-300 hover:border-cyan-400/40 bg-gradient-to-r from-slate-900/90 via-[#071224]/90 to-slate-900/90 border border-white/20">
          <div className="flex items-start sm:items-center gap-3 min-w-0 flex-1">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-400/30 via-blue-500/25 to-indigo-500/25 border border-cyan-400/40 flex items-center justify-center text-cyan-300 flex-shrink-0 shadow-md shadow-cyan-500/20">
              <Sparkles className="w-5 h-5 text-cyan-300 animate-pulse" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 flex-wrap mb-0.5">
                <span className="text-[11px] font-bold text-white tracking-wider uppercase font-mono flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping"></span>
                  Gemini AI Weather Summary
                </span>
                <span className="text-white/30 font-mono text-xs hidden sm:inline">•</span>
                <span className="text-[10px] font-mono text-cyan-300 font-semibold bg-cyan-500/15 border border-cyan-400/30 px-2 py-0.5 rounded-md">
                  {currentLocation.name} ({currentLocation.district})
                </span>
                <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                  Gemini 3.6 Flash Active
                </span>
              </div>

              {/* Weather Summary Text */}
              {isAiWeatherLoading ? (
                <div className="flex items-center gap-2 text-xs font-mono text-cyan-300 py-1">
                  <span className="animate-spin">⚡</span>
                  <span>Synthesizing live atmospheric telemetry and weather forecast for {currentLocation.name}...</span>
                </div>
              ) : (
                <p className="text-xs text-slate-200 font-medium leading-relaxed">
                  {aiWeatherSummary || `${currentLocation.name} atmospheric conditions: ${liveClimate ? `${liveClimate.temperatureC}°C, ${liveClimate.humidityPct}% humidity, ${liveClimate.rainfall24hMm}mm rain.` : `${currentLocation.temperatureC}°C, ${currentLocation.humidity}% humidity.`} ${currentLocation.hazardDescription}`}
                </p>
              )}

              {/* Real-time Telemetry Mini Chips */}
              <div className="flex items-center gap-2 flex-wrap mt-2 text-[10px] font-mono text-slate-300">
                <span className="px-2 py-0.5 rounded-md bg-white/5 border border-white/10 flex items-center gap-1">
                  <Thermometer className="w-3 h-3 text-amber-400" />
                  {liveClimate ? `${liveClimate.temperatureC}°C` : `${currentLocation.temperatureC}°C`}
                </span>
                <span className="px-2 py-0.5 rounded-md bg-white/5 border border-white/10 flex items-center gap-1">
                  <Droplets className="w-3 h-3 text-cyan-400" />
                  {liveClimate ? `${liveClimate.humidityPct}% RH` : `${currentLocation.humidity}% RH`}
                </span>
                <span className="px-2 py-0.5 rounded-md bg-white/5 border border-white/10 flex items-center gap-1">
                  <CloudRain className="w-3 h-3 text-blue-400" />
                  {liveClimate ? `${liveClimate.rainfall24hMm}mm Rain` : `${currentLocation.rainfall24h}mm Rain`}
                </span>
                <span className="px-2 py-0.5 rounded-md bg-white/5 border border-white/10 flex items-center gap-1">
                  <Wind className="w-3 h-3 text-emerald-400" />
                  {liveClimate ? `${liveClimate.windSpeedKmh} km/h` : '12 km/h'}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0 self-end md:self-center">
            <button
              type="button"
              onClick={() => fetchGeminiWeatherSummary(currentLocation, liveClimate, true)}
              disabled={isAiWeatherLoading}
              title="Re-run Gemini AI weather analysis for this location"
              className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white border border-white/20 text-xs font-mono transition-all cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isAiWeatherLoading ? 'animate-spin text-cyan-400' : ''}`} />
              <span className="hidden sm:inline text-[11px]">Refresh</span>
            </button>
          </div>
        </div>

        {/* 4 BOXES FROM HTML FILES: EMERGENCY GRID & PREDICTIVE AI COMMAND MODULES */}
        <section className="space-y-3" data-purpose="ai-analysis-emergency-grid">
          <div className="flex items-center justify-between px-1">
            <h2 className="text-xs font-mono font-semibold uppercase tracking-wider text-white/70 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400"></span>
              Emergency Dispatch &amp; Autonomous AI Guidance Grid ({currentLocation.name})
            </h2>
            <span className="text-[11px] font-mono text-cyan-400/90">Decentralized Mesh • TN-SDRF Linked</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Box 1: Critical Alert Zones */}
            <div className="apple-glass-panel rounded-3xl p-5 flex flex-col justify-between border border-white/20 hover:border-rose-400/50 transition-all duration-300 shadow-xl bg-white/[0.04]">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="p-2.5 rounded-2xl bg-rose-500/20 text-rose-300 border border-rose-400/30 shadow-sm">
                    <Zap className="w-4 h-4" />
                  </span>
                  <span
                    className={`font-mono text-xs px-2.5 py-0.5 rounded-full font-bold tracking-wider ${
                      currentLocation.riskLevel === 'CRITICAL'
                        ? 'bg-rose-500/25 text-rose-300 border border-rose-400/40 animate-pulse'
                        : 'bg-emerald-500/20 text-emerald-300 border border-emerald-400/30'
                    }`}
                  >
                    {currentLocation.riskLevel === 'CRITICAL' ? '1 ACTIVE' : '0 ACTIVE'}
                  </span>
                </div>
                <h3 className="text-base font-bold text-white tracking-wide">Critical Alert Zones</h3>
                <p className="text-xs text-slate-300/80 mt-1 leading-relaxed">
                  Real-time localized quarantine &amp; danger zones auto-demarcated by threat AI for {currentLocation.taluk || currentLocation.name}.
                </p>
              </div>
              <div className="mt-5 pt-3.5 border-t border-white/10 text-xs text-slate-300/80 flex justify-between font-mono">
                <span>{currentLocation.riskLevel === 'CRITICAL' ? 'Quarantine Radius' : 'Zones Clear'}</span>
                <span className={`font-bold ${currentLocation.riskLevel === 'CRITICAL' ? 'text-rose-400' : 'text-emerald-300'}`}>
                  {currentLocation.riskLevel === 'CRITICAL' ? '1.4 km Active' : '100% Secure'}
                </span>
              </div>
            </div>

            {/* Box 2: Evacuation Corridors */}
            <div className="apple-glass-panel rounded-3xl p-5 flex flex-col justify-between border border-white/20 hover:border-cyan-400/50 transition-all duration-300 shadow-xl bg-white/[0.04]">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="p-2.5 rounded-2xl bg-cyan-500/20 text-cyan-300 border border-cyan-400/30 shadow-sm">
                    <ArrowRight className="w-4 h-4" />
                  </span>
                  <span className="font-mono text-xs px-2.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-400/30 font-bold tracking-wider">
                    1.8s LATENCY
                  </span>
                </div>
                <h3 className="text-base font-bold text-white tracking-wide">Evacuation Corridors</h3>
                <p className="text-xs text-slate-300/80 mt-1 leading-relaxed">
                  Autonomous civilian guidance routing avoiding structural bottlenecks across {currentLocation.district}.
                </p>
              </div>
              <div className="mt-5 pt-3.5 border-t border-white/10 text-xs text-slate-300/80 flex justify-between font-mono">
                <span>Route Readiness</span>
                <span className="font-bold text-white">Optimal</span>
              </div>
            </div>

            {/* Box 3: Resource Allocation */}
            <div className="apple-glass-panel rounded-3xl p-5 flex flex-col justify-between border border-white/20 hover:border-amber-400/50 transition-all duration-300 shadow-xl bg-white/[0.04]">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="p-2.5 rounded-2xl bg-amber-500/20 text-amber-300 border border-amber-400/30 shadow-sm">
                    <Boxes className="w-4 h-4" />
                  </span>
                  <span className="font-mono text-xs px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-400/30 font-bold tracking-wider">
                    STANDBY
                  </span>
                </div>
                <h3 className="text-base font-bold text-white tracking-wide">Resource Allocation</h3>
                <p className="text-xs text-slate-300/80 mt-1 leading-relaxed">
                  Predictive supply chain pre-positioning medical &amp; earthmover rescue assets 24h ahead of alerts.
                </p>
              </div>
              <div className="mt-5 pt-3.5 border-t border-white/10 text-xs text-slate-300/80 flex justify-between font-mono">
                <span>Logistics Pods</span>
                <span className="font-bold text-white">9,840 Units</span>
              </div>
            </div>

            {/* Box 4: Rescue Mesh Relay */}
            <div className="apple-glass-panel rounded-3xl p-5 flex flex-col justify-between border border-white/20 hover:border-emerald-400/50 transition-all duration-300 shadow-xl bg-white/[0.04]">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="p-2.5 rounded-2xl bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 shadow-sm">
                    <Radio className="w-4 h-4" />
                  </span>
                  <span className="font-mono text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 font-bold tracking-wider">
                    ENCRYPTED
                  </span>
                </div>
                <h3 className="text-base font-bold text-white tracking-wide">Rescue Mesh Relay</h3>
                <p className="text-xs text-slate-300/80 mt-1 leading-relaxed">
                  Cellular blackout fallback using low-earth orbit laser inter-satellite links linked to TN Grid.
                </p>
              </div>
              <div className="mt-5 pt-3.5 border-t border-white/10 text-xs text-slate-300/80 flex justify-between font-mono">
                <span>Uptime Rating</span>
                <span className="font-bold text-white">99.999%</span>
              </div>
            </div>
          </div>
        </section>

        {/* PREDICTIVE ANALYTICAL GRAPH GRID (24-HOUR TRENDS) */}
        <section className="space-y-3">
          <div className="flex items-center justify-between px-1">
            <h2 className="text-xs font-mono font-semibold uppercase tracking-wider text-white/70 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400"></span>
              Real-Time Borehole &amp; Seismographic Dynamics ({currentLocation.name})
            </h2>
            <span className="text-[11px] font-mono text-white/40">Polling: 250ms</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Graph 1: Landslide Risk Factor */}
            <div className="bg-white rounded-2xl p-4 transition-all duration-300 shadow-md border border-white/60 hover:shadow-lg">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Landslide Risk Factor</p>
                  <p className="text-lg font-black text-slate-900 font-mono mt-0.5">
                    {currentLocation.faultSlipRate} mm/h <span className="text-xs font-bold text-rose-600">+18%</span>
                  </p>
                </div>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-md bg-rose-100 text-rose-700 border border-rose-200">
                  DISPLACEMENT
                </span>
              </div>
              <div className="h-14 mt-3">
                <svg className="w-full h-full" preserveAspectRatio="none" viewBox="0 0 160 50">
                  <path d="M0,35 Q30,30 50,38 T90,25 T130,12 L160,6" fill="none" stroke="#DC2626" strokeWidth="2.4" />
                  <path d="M0,35 Q30,30 50,38 T90,25 T130,12 L160,6 L160,50 L0,50 Z" fill="rgba(220, 38, 38, 0.14)" />
                </svg>
              </div>
              <div className="text-[11px] text-slate-600 mt-2 flex justify-between font-mono font-medium pt-1 border-t border-slate-100">
                <span>Shear creep strain</span>
                <span className="text-slate-900 font-bold">Node B-09</span>
              </div>
            </div>

            {/* Graph 2: Flood River Runoff */}
            <div className="bg-white rounded-2xl p-4 transition-all duration-300 shadow-md border border-white/60 hover:shadow-lg">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Hydraulic Runoff</p>
                  <p className="text-lg font-black text-slate-900 font-mono mt-0.5">
                    +4.2m <span className="text-xs font-bold text-amber-600">Crest Peak</span>
                  </p>
                </div>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-md bg-cyan-100 text-cyan-800 border border-cyan-200">
                  CATCHMENT
                </span>
              </div>
              <div className="h-14 mt-3">
                <svg className="w-full h-full" preserveAspectRatio="none" viewBox="0 0 160 50">
                  <path d="M0,44 Q40,40 70,28 T120,10 L160,8" fill="none" stroke="#0284C7" strokeWidth="2.4" />
                  <path d="M0,44 Q40,40 70,28 T120,10 L160,8 L160,50 L0,50 Z" fill="rgba(2, 132, 199, 0.14)" />
                </svg>
              </div>
              <div className="text-[11px] text-slate-600 mt-2 flex justify-between font-mono font-medium pt-1 border-t border-slate-100">
                <span>Hydraulic crest</span>
                <span className="text-cyan-800 font-bold">Gauging Stn 3</span>
              </div>
            </div>

            {/* Graph 3: Seismic Accelerometer */}
            <div className="bg-white rounded-2xl p-4 transition-all duration-300 shadow-md border border-white/60 hover:shadow-lg">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Seismic Tremor</p>
                  <p className="text-lg font-black text-slate-900 font-mono mt-0.5">
                    2.4 ML <span className="text-xs font-semibold text-slate-600">Micro-slip</span>
                  </p>
                </div>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 border border-emerald-200">
                  ACCEL
                </span>
              </div>
              <div className="h-14 mt-3">
                <svg className="w-full h-full" preserveAspectRatio="none" viewBox="0 0 160 50">
                  <path d="M0,25 L30,25 L40,15 L50,38 L60,10 L70,42 L80,22 L90,26 L120,25 L160,25" fill="none" stroke="#16A34A" strokeWidth="2" />
                  <path d="M0,25 L30,25 L40,15 L50,38 L60,10 L70,42 L80,22 L90,26 L120,25 L160,25 L160,50 L0,50 Z" fill="rgba(22, 163, 74, 0.12)" />
                </svg>
              </div>
              <div className="text-[11px] text-slate-600 mt-2 flex justify-between font-mono font-medium pt-1 border-t border-slate-100">
                <span>Tri-axial motion</span>
                <span className="text-emerald-700 font-bold">Z-Axis Normal</span>
              </div>
            </div>

            {/* Graph 4: Thermal Ground Flux */}
            <div className="bg-white rounded-2xl p-4 transition-all duration-300 shadow-md border border-white/60 hover:shadow-lg">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Thermal Ground Flux</p>
                  <p className="text-lg font-black text-slate-900 font-mono mt-0.5">
                    +0.4°C <span className="text-xs font-medium text-slate-500">Baseline</span>
                  </p>
                </div>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-md bg-purple-100 text-purple-800 border border-purple-200">
                  IR SENSOR
                </span>
              </div>
              <div className="h-14 mt-3">
                <svg className="w-full h-full" preserveAspectRatio="none" viewBox="0 0 160 50">
                  <path d="M0,20 Q40,22 80,18 T160,15" fill="none" stroke="#9333EA" strokeWidth="2.4" />
                  <path d="M0,20 Q40,22 80,18 T160,15 L160,50 L0,50 Z" fill="rgba(147, 51, 234, 0.12)" />
                </svg>
              </div>
              <div className="text-[11px] text-slate-600 mt-2 flex justify-between font-mono font-medium pt-1 border-t border-slate-100">
                <span>Subsurface temp</span>
                <span className="text-purple-800 font-bold">Calibrated</span>
              </div>
            </div>
          </div>
        </section>

        {/* INCIDENT REPORTING & TOKEN RAISER MODULE */}
        <section
          className="liquid-glass-shell rounded-3xl p-4 sm:p-7"
          data-purpose="incident-reporting-module"
          style={{
            background: 'rgba(255, 255, 255, 0.52)',
            backdropFilter: 'blur(40px) saturate(200%)',
            WebkitBackdropFilter: 'blur(40px) saturate(200%)',
            border: '1px solid rgba(255, 255, 255, 0.85)',
            boxShadow: '0 24px 60px -12px rgba(15, 23, 42, 0.2), inset 0 1.5px 2px 0 rgba(255, 255, 255, 0.9)',
          }}
        >
          {/* Header with Emergency Priority Master Switch */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-5 border-b border-slate-200/80">
            <div className="flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-2xl bg-cyan-500/20 border border-cyan-400/30 flex items-center justify-center text-cyan-300 shadow-sm">
                <ShieldAlert className="w-5 h-5 text-cyan-600" />
              </div>
              <div>
                <h2 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">
                  Citizen Grievance, Complaints &amp; Incident Reporting Portal
                </h2>
                <p className="text-xs text-slate-600 font-medium mt-0.5">
                  Logged in as Operator: <strong className="text-slate-900 font-bold">{currentUser.name}</strong> • Linked to Comms ({currentUser.phone})
                </p>
              </div>
            </div>

            {/* Emergency Priority Master Toggle */}
            <div className="flex items-center gap-3 bg-white/80 border border-slate-200/80 shadow-sm px-4 py-2 rounded-2xl self-start lg:self-auto">
              <span className="text-xs font-bold text-slate-800">NDRF Immediate Dispatch</span>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={ndrfMasterDispatch}
                  onChange={(e) => setNdrfMasterDispatch(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-10 h-5 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-rose-500"></div>
              </label>
            </div>
          </div>

          {/* Master Warning Banner */}
          <div className="mt-4 p-3.5 rounded-2xl bg-rose-500/15 border border-rose-500/30 flex items-center gap-3 text-xs text-rose-800">
            <span className="text-sm flex-shrink-0">⚠️</span>
            <span>
              <strong>VERY IMPORTANT ISSUE:</strong> High-Severity Incident Token will instantly trigger immediate first-responder dispatch and PWD earthmover alerts.
            </span>
          </div>

          {formFeedback && (
            <div className="mt-3 p-3 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-xs text-emerald-800 font-bold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>{formFeedback}</span>
            </div>
          )}

          {/* Dual Column Form & Stack Queue */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mt-6">
            {/* Left Column: Token Raiser Form (6 Columns) */}
            <form
              onSubmit={handleRegisterIncident}
              className="lg:col-span-6 bg-white rounded-2xl p-5 sm:p-6 space-y-4 shadow-xl border border-white/60"
            >
              <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-800 flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-cyan-600"></span>
                Dispatch Incident Token Raiser
              </h3>

              {/* Row 1: Incident Category & Geotag */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Incident Category</label>
                  <select
                    value={incidentCategory}
                    onChange={(e) => setIncidentCategory(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 focus:outline-none focus:bg-white focus:border-cyan-500 cursor-pointer shadow-sm"
                  >
                    <option value="Road Blockage / Debris">Road Blockage / Debris</option>
                    <option value="Active Hillside Landslide">Active Hillside Landslide</option>
                    <option value="Cracked Retaining Wall">Cracked Retaining Wall</option>
                    <option value="Flash Flood Inundation">Flash Flood Inundation</option>
                    <option value="Stranded Citizens / Relatives">Stranded Citizens / Relatives</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Location / Geotag</label>
                  <div className="relative flex items-center">
                    <input
                      type="text"
                      required
                      value={incidentLocation}
                      onChange={(e) => setIncidentLocation(e.target.value)}
                      placeholder="Location name"
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-3 pr-20 py-2 text-xs font-semibold text-slate-800 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-cyan-500 shadow-sm"
                    />
                    <button
                      type="button"
                      onClick={handleRequestGps}
                      className="absolute right-1.5 px-2.5 py-1 rounded-lg bg-cyan-600 hover:bg-cyan-700 text-white font-bold text-[9px] tracking-wide uppercase transition-colors shadow-sm cursor-pointer"
                    >
                      GPS Lock
                    </button>
                  </div>
                </div>
              </div>

              {/* Row 2: Reporter Officer / Citizen (NO dummy names) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Reporter Officer (Your Name)
                  </label>
                  <input
                    type="text"
                    required
                    value={reporterInfo}
                    onChange={(e) => setReporterInfo(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 focus:outline-none focus:bg-white focus:border-cyan-500 shadow-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Emergency Priority</label>
                  <div className="grid grid-cols-3 gap-1.5">
                    <button
                      type="button"
                      onClick={() => setIncidentPriority('MEDIUM')}
                      className={`py-1.5 text-[10px] font-bold rounded-lg transition-colors cursor-pointer ${
                        incidentPriority === 'MEDIUM'
                          ? 'bg-slate-700 text-white shadow-sm'
                          : 'bg-slate-100 border border-slate-200 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      MEDIUM
                    </button>
                    <button
                      type="button"
                      onClick={() => setIncidentPriority('HIGH')}
                      className={`py-1.5 text-[10px] font-bold rounded-lg transition-colors cursor-pointer ${
                        incidentPriority === 'HIGH'
                          ? 'bg-amber-500 text-slate-950 font-black shadow-sm'
                          : 'bg-slate-100 border border-slate-200 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      HIGH
                    </button>
                    <button
                      type="button"
                      onClick={() => setIncidentPriority('CRITICAL')}
                      className={`py-1.5 text-[10px] font-bold rounded-lg transition-colors cursor-pointer ${
                        incidentPriority === 'CRITICAL'
                          ? 'bg-rose-600 text-white shadow-sm'
                          : 'bg-rose-50 border border-rose-200 text-rose-700 hover:bg-rose-100'
                      }`}
                    >
                      CRITICAL
                    </button>
                  </div>
                </div>
              </div>

              {/* Ground Situation Description */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Ground Situation Description</label>
                <textarea
                  rows={3}
                  required
                  value={groundDescription}
                  onChange={(e) => setGroundDescription(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 text-xs font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-cyan-500 resize-none leading-relaxed shadow-sm"
                />
              </div>

              {/* Full-Fledged Geo-Position Imaging & Evidence Module */}
              <GeoPositionImageModule
                currentLocation={currentLocation}
                onImageChange={(url, meta) => {
                  setAttachedImage(url);
                  setAttachedImageMeta(meta);
                }}
                onGeotagResolved={(lat, lng, locationName) => {
                  if (locationName) {
                    setIncidentLocation(locationName);
                  } else {
                    const nearest = findNearestTaluk(lat, lng);
                    setIncidentLocation(`${nearest.taluk} Taluk, ${nearest.district}`);
                  }
                }}
              />

              {/* Register CTA Button */}
              <button
                type="submit"
                className="btn-liquid-sheen w-full py-3 px-5 rounded-xl text-white font-bold text-xs sm:text-sm tracking-wide flex items-center justify-center gap-2 cursor-pointer active:scale-[0.99] transition-all shadow-md"
              >
                <Zap className="w-4 h-4" />
                <span>Register Verified Complaint &amp; Trigger Response</span>
              </button>
            </form>

            {/* Right Column: Stacked Incident Reports Queue */}
            <div className="lg:col-span-6 flex flex-col justify-between" data-purpose="incident-queue">
              <div>
                {/* Queue Header & Filter Tabs */}
                <div className="flex flex-wrap items-center justify-between gap-2 pb-3">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-lg bg-cyan-100 text-cyan-700 border border-cyan-200">
                      <Layers className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="text-sm font-black text-slate-900 leading-tight">
                        Stacked Incident Reports Queue
                      </h3>
                      <p className="text-[11px] font-mono text-slate-600 font-semibold">
                        {filteredIncidents.length} Active Tickets in Stack
                      </p>
                    </div>
                  </div>

                  {/* Filter Buttons */}
                  <div className="flex items-center gap-1 bg-white/80 p-1 rounded-xl border border-slate-200/80 shadow-sm">
                    {(['ALL', 'PHOTOS', 'PENDING', 'DISPATCHED', 'RESOLVED'] as const).map((status) => (
                      <button
                        key={status}
                        type="button"
                        onClick={() => setActiveQueueFilter(status)}
                        className={`px-2 py-1 text-[10px] font-bold rounded-lg transition-colors cursor-pointer ${
                          activeQueueFilter === status
                            ? 'bg-cyan-600 text-white shadow-sm'
                            : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                        }`}
                      >
                        {status === 'PHOTOS' ? '📸 PHOTOS' : status}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Ticket Stack List */}
                <div className="space-y-3 mt-3 max-h-[420px] overflow-y-auto pr-1 custom-scrollbar">
                  {filteredIncidents.map((ticket) => {
                    const isResolved = ticket.status === 'RESOLVED';
                    const isDispatched = ticket.status === 'DISPATCHED';

                    return (
                      <div
                        key={ticket.id}
                        className={`bg-white rounded-2xl p-4 border border-white/60 shadow-lg border-l-4 transition-all hover:translate-x-0.5 ${
                          isResolved
                            ? 'border-l-emerald-500'
                            : isDispatched
                            ? 'border-l-cyan-500'
                            : 'border-l-amber-500'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-xs font-mono font-bold text-slate-900">{ticket.ticketNo}</span>
                            <span
                              className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded-md ${
                                ticket.priority === 'CRITICAL'
                                  ? 'bg-rose-100 text-rose-700 border border-rose-200'
                                  : ticket.priority === 'HIGH'
                                  ? 'bg-amber-100 text-amber-800 border border-amber-200'
                                  : 'bg-slate-100 text-slate-700'
                              }`}
                            >
                              {ticket.priority}
                            </span>
                            <span
                              className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded-md ${
                                isResolved
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : isDispatched
                                  ? 'bg-cyan-100 text-cyan-800'
                                  : 'bg-amber-100 text-amber-800'
                              }`}
                            >
                              {ticket.status}
                            </span>
                          </div>
                          <span className="text-[11px] font-mono font-bold text-slate-400">{ticket.timeAgo}</span>
                        </div>

                        <p className="text-xs font-bold text-slate-900 mt-2 flex items-center gap-1.5">
                          <span>📍</span> {ticket.location}
                        </p>

                        <div className="p-2.5 my-2 rounded-xl bg-slate-50 text-xs font-medium text-slate-700 italic border border-slate-200/80">
                          “{ticket.description}”
                        </div>

                        {/* Evidence Photo Strip & Geotag Preview */}
                        {ticket.imageUrl && (
                          <div className="mb-2.5 p-2 rounded-xl bg-gradient-to-r from-slate-50 to-cyan-50/40 border border-slate-200/90 flex items-center justify-between gap-3 shadow-inner">
                            <div className="flex items-center gap-2.5 min-w-0">
                              <button
                                type="button"
                                onClick={() => {
                                  setSelectedEvidenceTicket(ticket);
                                  setIsEvidenceModalOpen(true);
                                }}
                                className="relative w-12 h-12 rounded-lg overflow-hidden border border-slate-300 flex-shrink-0 cursor-pointer group shadow-sm bg-slate-900"
                                title="Click to inspect full-resolution evidence photo & GPS"
                              >
                                <img
                                  src={ticket.imageUrl}
                                  alt="Field evidence"
                                  className="w-full h-full object-cover group-hover:scale-110 transition-transform"
                                />
                                <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                                  <Eye className="w-3.5 h-3.5" />
                                </div>
                              </button>
                              <div className="min-w-0">
                                <div className="flex items-center gap-1.5 flex-wrap">
                                  <span className="text-[10px] font-mono font-bold text-cyan-800 flex items-center gap-1">
                                    <Camera className="w-3 h-3 text-cyan-600" />
                                    Field Evidence
                                  </span>
                                  {ticket.imageMetadata?.exifVerified ? (
                                    <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 border border-emerald-300">
                                      EXIF Verified
                                    </span>
                                  ) : (
                                    <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-cyan-100 text-cyan-800">
                                      GPS Locked
                                    </span>
                                  )}
                                </div>
                                <p className="text-[10px] font-mono text-slate-600 mt-0.5 truncate">
                                  {ticket.imageMetadata?.lat && ticket.imageMetadata?.lng
                                    ? `${ticket.imageMetadata.lat.toFixed(4)}° N, ${ticket.imageMetadata.lng.toFixed(4)}° E`
                                    : `${ticket.coordinates?.lat.toFixed(4)}° N, ${ticket.coordinates?.lng.toFixed(4)}° E`}
                                  {ticket.imageMetadata?.altitude ? ` • ${ticket.imageMetadata.altitude}m MSL` : ''}
                                </p>
                              </div>
                            </div>
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedEvidenceTicket(ticket);
                                setIsEvidenceModalOpen(true);
                              }}
                              className="px-2.5 py-1 rounded-lg bg-white hover:bg-cyan-50 border border-slate-300 hover:border-cyan-400 text-[10px] font-bold text-cyan-700 shadow-sm transition-colors cursor-pointer flex-shrink-0"
                            >
                              Inspect
                            </button>
                          </div>
                        )}

                        <div className="flex items-center justify-between pt-1 border-t border-slate-100">
                          <span className="text-[11px] text-slate-600">
                            Reporter: <strong className="text-slate-900 font-bold">{ticket.reporterName}</strong>{' '}
                            <span className="text-[10px] text-slate-400">({ticket.reporterPhone})</span>
                          </span>

                          {!isResolved ? (
                            <button
                              type="button"
                              onClick={() => handleResolveIncident(ticket.id)}
                              className="px-3 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[10px] transition-colors shadow-sm cursor-pointer"
                            >
                              Mark Resolved
                            </button>
                          ) : (
                            <span className="text-[11px] font-mono text-emerald-700 font-bold flex items-center gap-1">
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              Cleared by Field Command
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}

                  {filteredIncidents.length === 0 && (
                    <div className="p-8 text-center bg-white/40 rounded-2xl border border-slate-200 text-slate-500 text-xs font-mono">
                      No tickets matching filter &quot;{activeQueueFilter}&quot;.
                    </div>
                  )}
                </div>
              </div>

              {/* Queue Footer Status */}
              <div className="pt-4 mt-3 border-t border-slate-200/80 flex items-center justify-between text-[11px] text-slate-600 font-mono font-medium">
                <span>Geofence Sync: Active</span>
                <span className="text-cyan-800 font-bold">Supabase Cloud Sync: Connected</span>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* FLOATING AI LIQUID GLASS ASSISTANT ORB */}
      <div className="fixed bottom-6 right-6 z-40" data-purpose="floating-ai-assistant">
        <button
          type="button"
          onClick={() => setIsCopilotOpen(true)}
          aria-label="Open NEXUS AI Field Copilot"
          className="ai-orb-button w-14 h-14 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110 active:scale-95 group cursor-pointer"
        >
          <Sparkles className="w-6 h-6 text-cyan-300 group-hover:text-white group-hover:rotate-12 transition-all duration-300 drop-shadow-[0_0_8px_rgba(0,245,255,0.6)]" />
        </button>
      </div>

      {/* AI Copilot Drawer */}
      <AICopilotDrawer
        isOpen={isCopilotOpen}
        onClose={() => setIsCopilotOpen(false)}
        location={currentLocation}
        user={currentUser}
        liveClimate={liveClimate}
      />

      {/* Field Evidence Photo & Geolocation Lightbox Modal */}
      <EvidenceLightboxModal
        isOpen={isEvidenceModalOpen}
        onClose={() => {
          setIsEvidenceModalOpen(false);
          setSelectedEvidenceTicket(null);
        }}
        ticket={selectedEvidenceTicket}
      />
    </div>
  );
};
