import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { LocationEntity } from '../types';
import { Layers, Locate, Maximize2, Minimize2, RotateCcw, X, ZoomIn, ZoomOut } from 'lucide-react';

interface InteractiveTacticalMapProps {
  location: LocationEntity;
  isGpsActive?: boolean;
  onRequestGps?: () => void;
  onSelectFaultPin?: (name: string) => void;
}

type MapLayerType = 'satellite' | 'terrain' | 'radar';

export const InteractiveTacticalMap: React.FC<InteractiveTacticalMapProps> = ({
  location,
  isGpsActive = false,
  onRequestGps,
  onSelectFaultPin,
}) => {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);
  const tileLayerRef = useRef<L.TileLayer | null>(null);
  const [layerType, setLayerType] = useState<MapLayerType>('satellite');
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Initialize Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: [location.lat, location.lng],
        zoom: 13,
        zoomControl: false,
        attributionControl: false,
      });

      mapInstanceRef.current = map;

      // Google Satellite/Hybrid tile URL
      const initialLayer = L.tileLayer('https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}', {
        maxZoom: 20,
        subdomains: ['mt0', 'mt1', 'mt2', 'mt3'],
      }).addTo(map);

      tileLayerRef.current = initialLayer;

      // Create Custom Animated Radar Pinpoint Icon
      const customPinIcon = L.divIcon({
        className: 'nexus-tactical-pin-wrapper',
        html: `
          <div class="relative flex items-center justify-center -translate-x-1/2 -translate-y-1/2">
            <span class="animate-ping absolute inline-flex h-9 w-9 rounded-full bg-cyan-400 opacity-60"></span>
            <span class="absolute inline-flex h-6 w-6 rounded-full bg-cyan-500/40 border border-cyan-300"></span>
            <span class="relative inline-flex rounded-full h-3.5 w-3.5 bg-cyan-400 border-2 border-white shadow-[0_0_12px_#00f5ff]"></span>
            <div class="absolute -top-7 px-2.5 py-0.5 rounded-md bg-slate-950/90 border border-cyan-400/40 text-[10px] font-mono text-cyan-200 whitespace-nowrap shadow-lg pointer-events-none">
              ${location.name}
            </div>
          </div>
        `,
        iconSize: [36, 36],
        iconAnchor: [18, 18],
      });

      const marker = L.marker([location.lat, location.lng], { icon: customPinIcon }).addTo(map);
      markerRef.current = marker;

      marker.bindPopup(`
        <div style="font-family: 'Plus Jakarta Sans', sans-serif; min-width: 180px;">
          <div style="font-weight: 800; font-size: 13px; color: #00f5ff; margin-bottom: 2px;">
            ${location.name}
          </div>
          <div style="font-size: 11px; color: #94a3b8; font-family: monospace;">
            ${location.district}, ${location.state}
          </div>
          <div style="margin-top: 6px; padding-top: 6px; border-top: 1px solid rgba(255,255,255,0.15); display: flex; justify-content: space-between; font-size: 11px;">
            <span style="color: #cbd5e1;">Risk Score:</span>
            <strong style="color: ${location.riskLevel === 'CRITICAL' ? '#f43f5e' : '#38bdf8'}; font-family: monospace;">
              ${location.riskScore}% (${location.riskLevel})
            </strong>
          </div>
          <div style="font-size: 10px; color: #38bdf8; font-family: monospace; margin-top: 2px;">
            Elev: ${location.elevationMsl}m MSL
          </div>
        </div>
      `);
    }

    return () => {
      // Keep map instance alive
    };
  }, []);

  // Update map layer when toggled
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    if (tileLayerRef.current) {
      map.removeLayer(tileLayerRef.current);
    }

    let url = 'https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}'; // Google Satellite Hybrid
    if (layerType === 'terrain') {
      url = 'https://mt1.google.com/vt/lyrs=p&x={x}&y={y}&z={z}'; // Google Terrain / Topo
    } else if (layerType === 'radar') {
      url = 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'; // Dark Radar
    }

    const newLayer = L.tileLayer(url, {
      maxZoom: 20,
      subdomains: layerType === 'radar' ? 'abcd' : ['mt0', 'mt1', 'mt2', 'mt3'],
    }).addTo(map);

    tileLayerRef.current = newLayer;
  }, [layerType]);

  // Smoothly pan to location whenever location changes
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    map.flyTo([location.lat, location.lng], 13.5, {
      duration: 1.4,
      easeLinearity: 0.25,
    });

    if (markerRef.current) {
      markerRef.current.setLatLng([location.lat, location.lng]);

      const customPinIcon = L.divIcon({
        className: 'nexus-tactical-pin-wrapper',
        html: `
          <div class="relative flex items-center justify-center -translate-x-1/2 -translate-y-1/2">
            <span class="animate-ping absolute inline-flex h-9 w-9 rounded-full ${isGpsActive ? 'bg-emerald-400' : 'bg-cyan-400'} opacity-60"></span>
            <span class="absolute inline-flex h-6 w-6 rounded-full ${isGpsActive ? 'bg-emerald-500/40 border-emerald-300' : 'bg-cyan-500/40 border-cyan-300'} border"></span>
            <span class="relative inline-flex rounded-full h-3.5 w-3.5 ${isGpsActive ? 'bg-emerald-400 shadow-[0_0_12px_#34d399]' : 'bg-cyan-400 shadow-[0_0_12px_#00f5ff]'} border-2 border-white"></span>
            <div class="absolute -top-7 px-2.5 py-0.5 rounded-md bg-slate-950/90 border ${isGpsActive ? 'border-emerald-400/40 text-emerald-200' : 'border-cyan-400/40 text-cyan-200'} text-[10px] font-mono whitespace-nowrap shadow-lg pointer-events-none">
              ${location.name}
            </div>
          </div>
        `,
        iconSize: [36, 36],
        iconAnchor: [18, 18],
      });

      markerRef.current.setIcon(customPinIcon);
      markerRef.current.setPopupContent(`
        <div style="font-family: 'Plus Jakarta Sans', sans-serif; min-width: 190px;">
          <div style="font-weight: 800; font-size: 13px; color: ${isGpsActive ? '#34d399' : '#00f5ff'}; margin-bottom: 2px;">
            ${location.name}
          </div>
          <div style="font-size: 11px; color: #94a3b8; font-family: monospace;">
            ${location.district}, ${location.state}
          </div>
          <div style="margin-top: 6px; padding-top: 6px; border-top: 1px solid rgba(255,255,255,0.15); display: flex; justify-content: space-between; font-size: 11px;">
            <span style="color: #cbd5e1;">Risk Rating:</span>
            <strong style="color: ${location.riskLevel === 'CRITICAL' ? '#f43f5e' : '#38bdf8'}; font-family: monospace;">
              ${location.riskScore}% • ${location.riskLevel}
            </strong>
          </div>
          <div style="font-size: 10px; color: #38bdf8; font-family: monospace; margin-top: 2px;">
            Elev: ${location.elevationMsl}m MSL
          </div>
        </div>
      `);
    }
  }, [location, isGpsActive]);

  // Recalculate Leaflet map dimensions whenever maximized/minimized or window resizes
  useEffect(() => {
    const timer = setTimeout(() => {
      mapInstanceRef.current?.invalidateSize();
    }, 200);
    return () => clearTimeout(timer);
  }, [isFullscreen]);

  // Keyboard shortcut: ESC to exit fullscreen
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isFullscreen) {
        setIsFullscreen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isFullscreen]);

  const handleZoomIn = () => {
    mapInstanceRef.current?.zoomIn();
  };

  const handleZoomOut = () => {
    mapInstanceRef.current?.zoomOut();
  };

  const handleRecenter = () => {
    mapInstanceRef.current?.flyTo([location.lat, location.lng], 13.5, { duration: 0.8 });
  };

  return (
    <>
      {/* Fullscreen Backdrop Blur */}
      {isFullscreen && (
        <div
          className="fixed inset-0 bg-black/80 backdrop-blur-xl z-50 animate-in fade-in duration-200"
          onClick={() => setIsFullscreen(false)}
        />
      )}

      <div
        className={`transition-all duration-300 ${
          isFullscreen
            ? 'fixed inset-2 sm:inset-5 z-50 rounded-3xl p-4 sm:p-6 flex flex-col justify-between shadow-2xl border border-white/30 apple-glass-core overflow-hidden'
            : 'lg:col-span-7 liquid-glass-card rounded-2xl p-4 sm:p-5 relative overflow-hidden flex flex-col justify-between min-h-[380px] sm:min-h-[420px]'
        }`}
        style={{
          background: isFullscreen
            ? 'linear-gradient(135deg, rgba(14, 22, 42, 0.94) 0%, rgba(8, 14, 28, 0.98) 100%)'
            : 'rgba(9, 15, 30, 0.92)',
          backdropFilter: 'blur(32px) saturate(180%)',
          WebkitBackdropFilter: 'blur(32px) saturate(180%)',
          border: '1px solid rgba(255, 255, 255, 0.22)',
          boxShadow: isFullscreen
            ? '0 25px 70px -15px rgba(0, 0, 0, 0.85), inset 0 1.5px 2px 0 rgba(255, 255, 255, 0.4)'
            : '0 16px 36px -8px rgba(0, 0, 0, 0.45), inset 0 1px 1px 0 rgba(255, 255, 255, 0.15)',
        }}
      >
        {/* Top Header Controls Bar */}
        <div className="relative z-20 flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-white/10">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-cyan-400 shadow-[0_0_8px_#00f5ff]"></span>
            </span>
            <span className="text-xs font-mono font-bold tracking-wider text-cyan-300 uppercase">
              Tactical Topometry • {location.taluk ? `${location.taluk} Taluk` : location.name}
            </span>
            {isFullscreen && (
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-cyan-500/20 text-cyan-300 border border-cyan-400/30">
                MAXIMIZED VIEW
              </span>
            )}
          </div>

          {/* Action Pills */}
          <div className="flex items-center gap-2 flex-wrap font-mono text-[11px]">
            {/* Location Entity HUD Badge */}
            <span className="bg-white/10 border border-white/15 px-2.5 py-1 rounded-lg text-white/90 font-medium">
              {location.district}, Tamil Nadu • Elev {location.elevationMsl}m MSL
            </span>

            {/* Map Layer Mode Switcher */}
            <div className="flex items-center bg-black/40 rounded-lg p-0.5 border border-white/10">
              <button
                type="button"
                onClick={() => setLayerType('satellite')}
                title="Google Satellite Hybrid"
                className={`px-2 py-0.5 rounded text-[10px] font-semibold transition-colors cursor-pointer ${
                  layerType === 'satellite'
                    ? 'bg-cyan-500/30 text-cyan-300 border border-cyan-400/40'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Satellite
              </button>
              <button
                type="button"
                onClick={() => setLayerType('terrain')}
                title="Topographical Terrain"
                className={`px-2 py-0.5 rounded text-[10px] font-semibold transition-colors cursor-pointer ${
                  layerType === 'terrain'
                    ? 'bg-cyan-500/30 text-cyan-300 border border-cyan-400/40'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Terrain
              </button>
              <button
                type="button"
                onClick={() => setLayerType('radar')}
                title="Tactical Dark Radar"
                className={`px-2 py-0.5 rounded text-[10px] font-semibold transition-colors cursor-pointer ${
                  layerType === 'radar'
                    ? 'bg-cyan-500/30 text-cyan-300 border border-cyan-400/40'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Radar
              </button>
            </div>

            {/* Maximize / Minimize Button */}
            <button
              type="button"
              onClick={() => setIsFullscreen(!isFullscreen)}
              title={isFullscreen ? 'Minimize map to normal view (Esc)' : 'Maximize map to full screen'}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/10 hover:bg-cyan-500/20 text-white/90 hover:text-cyan-200 border border-white/20 hover:border-cyan-400/40 text-[10px] font-semibold transition-all cursor-pointer shadow-sm active:scale-95"
            >
              {isFullscreen ? (
                <>
                  <Minimize2 className="w-3.5 h-3.5 text-cyan-300" />
                  <span>Minimize</span>
                </>
              ) : (
                <>
                  <Maximize2 className="w-3.5 h-3.5 text-cyan-300" />
                  <span>Maximize</span>
                </>
              )}
            </button>

            {/* Close Button if Fullscreen */}
            {isFullscreen && (
              <button
                type="button"
                onClick={() => setIsFullscreen(false)}
                title="Close full-screen view (Esc)"
                className="p-1 rounded-lg bg-white/10 hover:bg-rose-500/20 text-slate-300 hover:text-rose-200 border border-white/20 hover:border-rose-400/40 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Main Map Container with HUD overlays */}
        <div className="relative z-10 my-3 flex-1 min-h-[260px] rounded-xl overflow-hidden border border-white/15 shadow-inner">
          {/* Real Leaflet Map */}
          <div ref={mapContainerRef} className="w-full h-full min-h-[260px] bg-slate-950" />

          {/* Optical Tactical Reticle Overlay */}
          <div className="absolute inset-0 pointer-events-none opacity-35">
            <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
              <circle cx="50%" cy="50%" r="35%" fill="none" stroke="#00f5ff" strokeWidth="0.75" strokeDasharray="4 6" />
              <circle cx="50%" cy="50%" r="20%" fill="none" stroke="#ffffff" strokeWidth="0.5" strokeOpacity="0.4" />
              <line x1="50%" y1="5%" x2="50%" y2="95%" stroke="rgba(255,255,255,0.15)" strokeDasharray="3 4" strokeWidth="0.8" />
              <line x1="5%" y1="50%" x2="95%" y2="50%" stroke="rgba(255,255,255,0.15)" strokeDasharray="3 4" strokeWidth="0.8" />
            </svg>
          </div>

          {/* Floating Map Controls in Bottom-Right */}
          <div className="absolute bottom-3 right-3 z-[400] flex flex-col gap-1.5">
            <button
              type="button"
              onClick={handleZoomIn}
              className="w-8 h-8 rounded-lg bg-slate-950/85 hover:bg-slate-900 border border-white/20 text-white flex items-center justify-center shadow-lg transition-transform active:scale-95 cursor-pointer"
              title="Zoom in"
            >
              <ZoomIn className="w-4 h-4 text-cyan-300" />
            </button>
            <button
              type="button"
              onClick={handleZoomOut}
              className="w-8 h-8 rounded-lg bg-slate-950/85 hover:bg-slate-900 border border-white/20 text-white flex items-center justify-center shadow-lg transition-transform active:scale-95 cursor-pointer"
              title="Zoom out"
            >
              <ZoomOut className="w-4 h-4 text-cyan-300" />
            </button>
            <button
              type="button"
              onClick={handleRecenter}
              className="w-8 h-8 rounded-lg bg-slate-950/85 hover:bg-slate-900 border border-white/20 text-white flex items-center justify-center shadow-lg transition-transform active:scale-95 cursor-pointer"
              title="Recenter on Pinpoint"
            >
              <RotateCcw className="w-3.5 h-3.5 text-cyan-300" />
            </button>
            {onRequestGps && (
              <button
                type="button"
                onClick={onRequestGps}
                className={`w-8 h-8 rounded-lg ${
                  isGpsActive ? 'bg-emerald-500/40 border-emerald-400 text-emerald-300' : 'bg-slate-950/85 border-white/20 text-cyan-300'
                } hover:bg-slate-900 border flex items-center justify-center shadow-lg transition-transform active:scale-95 cursor-pointer`}
                title="Acquire Real GPS Location"
              >
                <Locate className="w-3.5 h-3.5" />
              </button>
            )}
            <button
              type="button"
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="w-8 h-8 rounded-lg bg-slate-950/85 hover:bg-slate-900 border border-white/20 text-white flex items-center justify-center shadow-lg transition-transform active:scale-95 cursor-pointer"
              title={isFullscreen ? 'Minimize (Esc)' : 'Maximize Map'}
            >
              {isFullscreen ? (
                <Minimize2 className="w-3.5 h-3.5 text-cyan-300" />
              ) : (
                <Maximize2 className="w-3.5 h-3.5 text-cyan-300" />
              )}
            </button>
          </div>

          {/* Active Pin Target HUD Card in Top-Left */}
          <div className="absolute top-3 left-3 z-[400] bg-slate-950/85 backdrop-blur-md px-3 py-2 rounded-xl border border-white/15 text-xs text-white shadow-xl max-w-[260px]">
            <div className="flex items-center gap-1.5 text-[10px] font-mono text-cyan-300 uppercase">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse"></span>
              <span>Target Lock</span>
            </div>
            <div className="font-bold text-white text-xs mt-0.5 truncate">{location.name}</div>
            <div className="text-[10px] text-slate-300 font-mono flex items-center gap-2 mt-1">
              <span>Elev: {location.elevationMsl}m MSL</span>
              <span>•</span>
              <span className={location.riskLevel === 'CRITICAL' ? 'text-rose-400 font-bold' : 'text-amber-400'}>
                Slip {location.faultSlipRate} mm/h
              </span>
            </div>
          </div>
        </div>

        {/* Radar Footer Indicators */}
        <div className="relative z-10 pt-2 border-t border-white/10 flex flex-wrap items-center justify-between gap-2 text-[11px] text-white/70 font-mono">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse"></span> Active Shear Slump
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-cyan-400"></span> Stable Bedrock Anchor
            </span>
          </div>
          <span className="text-cyan-300 font-semibold">
            Azimuth: 142.4° • Elev: {location.elevationMsl}m MSL • Precision: ±1.2m
          </span>
        </div>
      </div>
    </>
  );
};
