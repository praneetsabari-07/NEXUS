import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import { IncidentReport } from '../types';
import {
  X,
  MapPin,
  Camera,
  CheckCircle2,
  AlertTriangle,
  ExternalLink,
  Navigation,
  Compass,
  Calendar,
  Layers,
  HardDrive,
  Download,
} from 'lucide-react';

interface EvidenceLightboxModalProps {
  isOpen: boolean;
  onClose: () => void;
  ticket: IncidentReport | null;
}

export const EvidenceLightboxModal: React.FC<EvidenceLightboxModalProps> = ({
  isOpen,
  onClose,
  ticket,
}) => {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);

  const coords = ticket?.imageMetadata?.lat && ticket?.imageMetadata?.lng
    ? { lat: ticket.imageMetadata.lat, lng: ticket.imageMetadata.lng }
    : ticket?.coordinates || { lat: 11.353, lng: 76.795 };

  useEffect(() => {
    if (!isOpen || !ticket || !mapContainerRef.current) return;

    // Small delay to ensure modal DOM is mounted and visible
    const timer = setTimeout(() => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }

      if (mapContainerRef.current) {
        const map = L.map(mapContainerRef.current, {
          center: [coords.lat, coords.lng],
          zoom: 15,
          zoomControl: true,
          attributionControl: false,
        });

        L.tileLayer('https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}', {
          maxZoom: 20,
          subdomains: ['mt0', 'mt1', 'mt2', 'mt3'],
        }).addTo(map);

        const customPinIcon = L.divIcon({
          className: 'nexus-evidence-map-pin',
          html: `
            <div class="relative flex items-center justify-center -translate-x-1/2 -translate-y-1/2">
              <span class="animate-ping absolute inline-flex h-8 w-8 rounded-full bg-cyan-400 opacity-75"></span>
              <span class="relative inline-flex rounded-full h-4 w-4 bg-cyan-500 border-2 border-white shadow-[0_0_10px_#00f5ff]"></span>
            </div>
          `,
          iconSize: [20, 20],
        });

        L.marker([coords.lat, coords.lng], { icon: customPinIcon })
          .addTo(map)
          .bindPopup(`<b>${ticket.location}</b><br/>Ticket: ${ticket.ticketNo}`)
          .openPopup();

        mapInstanceRef.current = map;
        map.invalidateSize();
      }
    }, 150);

    return () => {
      clearTimeout(timer);
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [isOpen, ticket, coords.lat, coords.lng]);

  if (!isOpen || !ticket) return null;

  const isExifVerified = ticket.imageMetadata?.exifVerified;
  const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${coords.lat},${coords.lng}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-5xl bg-slate-900 border border-slate-700/80 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="px-5 py-4 bg-slate-900/90 border-b border-slate-800 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 flex-wrap">
            <div className="p-2 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
              <Camera className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-sm font-black text-white">{ticket.ticketNo}</span>
                <span
                  className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded-md ${
                    ticket.priority === 'CRITICAL'
                      ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                      : ticket.priority === 'HIGH'
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                      : 'bg-slate-700 text-slate-300'
                  }`}
                >
                  {ticket.priority}
                </span>
                {isExifVerified ? (
                  <span className="inline-flex items-center gap-1 text-[10px] font-mono font-bold px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                    <CheckCircle2 className="w-3 h-3" />
                    EXIF Geotag Verified
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-[10px] font-mono font-bold px-2 py-0.5 rounded-md bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
                    <MapPin className="w-3 h-3" />
                    GPS Telemetry Locked
                  </span>
                )}
              </div>
              <h3 className="text-xs font-semibold text-slate-400 mt-0.5">
                Field Evidence Imagery & Geolocation Telemetrics
              </h3>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close modal"
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body (2 Columns on Desktop) */}
        <div className="p-4 sm:p-6 overflow-y-auto custom-scrollbar flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: High-Res Photo Viewer */}
          <div className="lg:col-span-7 flex flex-col gap-3">
            <div className="relative rounded-2xl overflow-hidden bg-black/60 border border-slate-800 group shadow-inner min-h-[300px] flex items-center justify-center">
              {ticket.imageUrl ? (
                <img
                  src={ticket.imageUrl}
                  alt={`Field evidence for ${ticket.ticketNo}`}
                  className="w-full max-h-[460px] object-contain rounded-2xl transition-transform duration-300"
                />
              ) : (
                <div className="text-center p-8 text-slate-500">
                  <Camera className="w-12 h-12 mx-auto mb-2 opacity-30" />
                  <p className="text-xs font-mono">No image payload attached to this token</p>
                </div>
              )}

              {/* Live Overlay Stamp on Top-Left */}
              <div className="absolute top-3 left-3 px-2.5 py-1.5 rounded-lg bg-slate-950/80 backdrop-blur-md border border-white/10 text-[10px] font-mono text-cyan-300 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                <span>
                  {coords.lat.toFixed(4)}° N, {coords.lng.toFixed(4)}° E
                </span>
              </div>

              {ticket.imageUrl && (
                <a
                  href={ticket.imageUrl}
                  target="_blank"
                  rel="noreferrer"
                  download={`nexus-evidence-${ticket.ticketNo}.jpg`}
                  className="absolute bottom-3 right-3 px-3 py-1.5 rounded-xl bg-slate-900/90 hover:bg-cyan-600 text-white text-xs font-semibold backdrop-blur-md border border-white/20 flex items-center gap-1.5 transition-all shadow-lg cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Full Res</span>
                </a>
              )}
            </div>

            {/* Ground Description Quote */}
            <div className="p-3.5 rounded-2xl bg-slate-800/60 border border-slate-700/60 text-xs text-slate-300 italic">
              “{ticket.description}”
            </div>
          </div>

          {/* Right Column: EXIF Metadata Breakdown & Mini Tactical Map */}
          <div className="lg:col-span-5 flex flex-col gap-4">
            {/* Metadata Badges */}
            <div className="bg-slate-800/60 rounded-2xl p-4 border border-slate-700/60 space-y-3">
              <h4 className="text-[11px] font-mono font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5" />
                EXIF & Sensor Telemetrics
              </h4>

              <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800">
                  <span className="text-[10px] text-slate-500 block">GPS LATITUDE</span>
                  <span className="text-white font-bold">{coords.lat.toFixed(6)}° N</span>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800">
                  <span className="text-[10px] text-slate-500 block">GPS LONGITUDE</span>
                  <span className="text-white font-bold">{coords.lng.toFixed(6)}° E</span>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800">
                  <span className="text-[10px] text-slate-500 block">ELEVATION (MSL)</span>
                  <span className="text-white font-bold">
                    {ticket.imageMetadata?.altitude ? `${ticket.imageMetadata.altitude}m` : '1,420m Est.'}
                  </span>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800">
                  <span className="text-[10px] text-slate-500 block">DEVICE / SENSOR</span>
                  <span className="text-white font-bold truncate block" title={ticket.imageMetadata?.device || 'NEXUS Field Cam'}>
                    {ticket.imageMetadata?.device || 'NEXUS Tactical Cam'}
                  </span>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800 col-span-2">
                  <span className="text-[10px] text-slate-500 block">TIMESTAMP (ORIGINAL)</span>
                  <span className="text-white font-bold">
                    {ticket.imageMetadata?.timestamp || ticket.timestamp || 'Realtime Sync'}
                  </span>
                </div>
              </div>

              {/* Location Name & Map Link */}
              <div className="pt-2 border-t border-slate-700/60 flex items-center justify-between text-xs">
                <span className="text-slate-400 truncate max-w-[200px]" title={ticket.location}>
                  📍 {ticket.location}
                </span>
                <a
                  href={googleMapsUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 text-cyan-400 hover:text-cyan-300 font-mono text-[11px] font-bold"
                >
                  <span>Google Maps</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>

            {/* Mini Tactical Satellite Map */}
            <div className="flex-1 min-h-[190px] rounded-2xl overflow-hidden border border-slate-700/60 relative bg-slate-950 flex flex-col">
              <div className="px-3 py-1.5 bg-slate-900/90 border-b border-slate-800 flex items-center justify-between text-[10px] font-mono text-slate-400">
                <span className="flex items-center gap-1">
                  <Navigation className="w-3 h-3 text-cyan-400" />
                  Tactical Satellite Fix
                </span>
                <span className="text-cyan-400 font-bold">Google Hybrid L15</span>
              </div>
              <div ref={mapContainerRef} className="w-full flex-1 min-h-[160px] z-10" />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3.5 bg-slate-900/90 border-t border-slate-800 flex items-center justify-between">
          <div className="text-xs text-slate-400 font-mono">
            Reporter: <strong className="text-white">{ticket.reporterName}</strong> ({ticket.reporterPhone})
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold transition-colors cursor-pointer shadow-md"
          >
            Close Evidence Inspector
          </button>
        </div>
      </div>
    </div>
  );
};
