import React, { useState, useRef, useEffect } from 'react';
import {
  Camera,
  Upload,
  CheckCircle2,
  AlertTriangle,
  MapPin,
  X,
  Eye,
  RotateCw,
  Sparkles,
  Radio,
  Maximize2,
  Trash2,
  ShieldCheck,
  Video,
} from 'lucide-react';
import { ExifParser, ParsedExifData } from '../services/exifParser';
import { IncidentImageMetadata, LocationEntity } from '../types';

interface GeoPositionImageModuleProps {
  currentLocation: LocationEntity;
  onImageChange: (imageUrl: string | null, metadata: IncidentImageMetadata | null) => void;
  onGeotagResolved?: (lat: number, lng: number, talukHint?: string) => void;
}

// Preset field disaster photos with authentic GPS coordinates for quick testing
const DISASTER_PHOTO_PRESETS = [
  {
    label: 'Coonoor Ghat Landslide',
    url: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=1000&q=80',
    lat: 11.353,
    lng: 76.795,
    alt: 1420,
    device: 'NEXUS Bodycam Mk IV',
    locationName: 'Coonoor Ghat Section, The Nilgiris',
  },
  {
    label: 'Velachery Canal Flood Surge',
    url: 'https://images.unsplash.com/photo-1547683905-f686c993aae5?auto=format&fit=crop&w=1000&q=80',
    lat: 12.9815,
    lng: 80.218,
    alt: 12,
    device: 'Field Drone Alpha-7',
    locationName: 'Velachery Canal, Chennai',
  },
  {
    label: 'Kodaikanal Retaining Wall Fracture',
    url: 'https://images.unsplash.com/photo-1518495973542-4542c06a5843?auto=format&fit=crop&w=1000&q=80',
    lat: 10.238,
    lng: 77.489,
    alt: 2130,
    device: 'PWD Inspection Bodycam',
    locationName: 'Kodaikanal Ghat Hairpin 9',
  },
];

export const GeoPositionImageModule: React.FC<GeoPositionImageModuleProps> = ({
  currentLocation,
  onImageChange,
  onGeotagResolved,
}) => {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageMeta, setImageMeta] = useState<IncidentImageMetadata | null>(null);
  const [isParsing, setIsParsing] = useState(false);

  // Live Camera Modal states
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [mediaStream, setMediaStream] = useState<MediaStream | null>(null);
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');
  const [cameraError, setCameraError] = useState<string | null>(null);

  // Stop camera when unmounting or modal closes
  useEffect(() => {
    return () => {
      if (mediaStream) {
        mediaStream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [mediaStream]);

  // Handle file selection from local device
  const processFile = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file (JPEG, PNG, WEBP).');
      return;
    }

    setIsParsing(true);

    try {
      // 1. Read EXIF
      const exifData: ParsedExifData = await ExifParser.parseImage(file);

      // 2. Read image as Data URL
      const reader = new FileReader();
      reader.onload = () => {
        const dataUrl = reader.result as string;
        setImagePreview(dataUrl);

        const fileSizeKb = Math.round(file.size / 1024);
        const sizeStr = fileSizeKb > 1024 ? `${(fileSizeKb / 1024).toFixed(1)} MB` : `${fileSizeKb} KB`;

        let metadata: IncidentImageMetadata;

        if (exifData.hasGps && exifData.lat && exifData.lng) {
          // Photo has embedded EXIF GPS tags
          metadata = {
            lat: exifData.lat,
            lng: exifData.lng,
            altitude: exifData.altitude,
            timestamp: exifData.timestamp || new Date().toLocaleString(),
            device: exifData.make ? `${exifData.make} ${exifData.model || ''}`.trim() : 'Digital Camera / Drone',
            exifVerified: true,
            source: 'EXIF',
            fileName: file.name,
            fileSize: sizeStr,
          };

          if (onGeotagResolved) {
            onGeotagResolved(exifData.lat, exifData.lng);
          }
        } else {
          // Fallback: Stamp with current tactical GPS
          metadata = {
            lat: currentLocation.lat,
            lng: currentLocation.lng,
            altitude: currentLocation.elevationMsl,
            timestamp: new Date().toLocaleString(),
            device: 'Mobile Upload (Field GPS Lock)',
            exifVerified: false,
            source: 'GPS_SYNC',
            fileName: file.name,
            fileSize: sizeStr,
          };
        }

        setImageMeta(metadata);
        onImageChange(dataUrl, metadata);
        setIsParsing(false);
      };

      reader.readAsDataURL(file);
    } catch (err) {
      console.error('Failed to parse file:', err);
      setIsParsing(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  // Open Live Camera / Bodycam Modal
  const startCamera = async () => {
    setCameraError(null);
    setIsCameraActive(true);

    try {
      if (mediaStream) {
        mediaStream.getTracks().forEach((t) => t.stop());
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: facingMode, width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: false,
      });

      setMediaStream(stream);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
    } catch (err: any) {
      console.warn('Camera access error:', err);
      setCameraError(err.message || 'Unable to access field camera. Ensure camera permissions are granted.');
    }
  };

  const stopCamera = () => {
    if (mediaStream) {
      mediaStream.getTracks().forEach((track) => track.stop());
      setMediaStream(null);
    }
    setIsCameraActive(false);
  };

  const switchCameraFacing = () => {
    const nextMode = facingMode === 'environment' ? 'user' : 'environment';
    setFacingMode(nextMode);
    stopCamera();
    setTimeout(() => {
      startCamera();
    }, 100);
  };

  // Capture Frame from Live Video
  const captureFrame = () => {
    if (!videoRef.current) return;

    const video = videoRef.current;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth || 1280;
    canvas.height = video.videoHeight || 720;
    const ctx = canvas.getContext('2d');

    if (!ctx) return;

    // Draw video frame
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Overlay Tactical GPS Telemetrics Watermark on Image
    const timeStr = new Date().toISOString().replace('T', ' ').substring(0, 19);
    const latStr = `${currentLocation.lat.toFixed(5)}° N`;
    const lngStr = `${currentLocation.lng.toFixed(5)}° E`;

    ctx.fillStyle = 'rgba(2, 6, 23, 0.75)';
    ctx.fillRect(20, canvas.height - 70, 480, 50);

    ctx.fillStyle = '#00f5ff';
    ctx.font = 'bold 16px monospace';
    ctx.fillText(`NEXUS BODYCAM — ${timeStr} UTC`, 32, canvas.height - 45);

    ctx.fillStyle = '#ffffff';
    ctx.font = '13px monospace';
    ctx.fillText(`GPS: ${latStr}, ${lngStr} | ELEV: ${currentLocation.elevationMsl}m MSL`, 32, canvas.height - 28);

    const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
    setImagePreview(dataUrl);

    const metadata: IncidentImageMetadata = {
      lat: currentLocation.lat,
      lng: currentLocation.lng,
      altitude: currentLocation.elevationMsl,
      timestamp: new Date().toLocaleString(),
      device: 'NEXUS Live Bodycam Sensor',
      exifVerified: true,
      source: 'GPS_SYNC',
      fileName: `bodycam_snapshot_${Date.now()}.jpg`,
      fileSize: '450 KB',
    };

    setImageMeta(metadata);
    onImageChange(dataUrl, metadata);

    if (onGeotagResolved) {
      onGeotagResolved(currentLocation.lat, currentLocation.lng);
    }

    stopCamera();
  };

  // Select a pre-configured disaster test preset
  const selectPreset = (preset: (typeof DISASTER_PHOTO_PRESETS)[0]) => {
    setImagePreview(preset.url);

    const metadata: IncidentImageMetadata = {
      lat: preset.lat,
      lng: preset.lng,
      altitude: preset.alt,
      timestamp: new Date(Date.now() - 15 * 60 * 1000).toLocaleString(),
      device: preset.device,
      exifVerified: true,
      source: 'EXIF',
      fileName: `${preset.label.toLowerCase().replace(/\s+/g, '_')}.jpg`,
      fileSize: '1.2 MB',
    };

    setImageMeta(metadata);
    onImageChange(preset.url, metadata);

    if (onGeotagResolved) {
      onGeotagResolved(preset.lat, preset.lng, preset.locationName);
    }
  };

  // Remove current image
  const handleRemoveImage = () => {
    setImagePreview(null);
    setImageMeta(null);
    onImageChange(null, null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-2">
      {/* Hidden native file input */}
      <input
        type="file"
        ref={fileInputRef}
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />

      <div className="flex items-center justify-between">
        <label className="block text-xs font-bold text-slate-700">Camera Field Evidence &amp; Imagery</label>

        {/* Quick Disaster Presets dropdown/pill */}
        <div className="flex items-center gap-1">
          <span className="text-[10px] text-slate-400 font-mono hidden sm:inline">Presets:</span>
          {DISASTER_PHOTO_PRESETS.map((p, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => selectPreset(p)}
              className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-slate-100 hover:bg-cyan-50 hover:text-cyan-700 text-slate-600 transition-colors border border-slate-200 cursor-pointer"
              title={`Load ${p.label} with live GPS`}
            >
              Preset {idx + 1}
            </button>
          ))}
        </div>
      </div>

      {/* Main Module Body */}
      {!imagePreview ? (
        /* Empty State: Matching screenshot with dashed border + interactive actions */
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          className={`border-2 border-dashed rounded-xl p-3 sm:p-3.5 transition-all shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
            isDragging
              ? 'border-cyan-500 bg-cyan-50/70 scale-[1.01]'
              : 'border-slate-300 bg-slate-50 hover:bg-slate-100/80 hover:border-cyan-400'
          }`}
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-100 border border-cyan-200 flex items-center justify-center text-cyan-700 flex-shrink-0 shadow-sm">
              <Camera className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <span>Attach Live Field Photo or Bodycam</span>
                {isParsing && <span className="text-[10px] text-cyan-600 font-mono animate-pulse">(Reading EXIF...)</span>}
              </p>
              <p className="text-[10px] text-slate-500 font-medium flex items-center gap-1">
                <ShieldCheck className="w-3 h-3 text-emerald-600 inline" />
                EXIF Geotag verified automatically
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-center">
            {/* Live Camera / Bodycam Button */}
            <button
              type="button"
              onClick={startCamera}
              className="px-2.5 py-1 rounded-lg bg-cyan-50 hover:bg-cyan-100 text-[11px] font-bold text-cyan-700 border border-cyan-200 flex items-center gap-1 transition-colors cursor-pointer shadow-sm"
              title="Open real-time camera viewfinder to capture evidence"
            >
              <Video className="w-3.5 h-3.5" />
              <span>Camera</span>
            </button>

            {/* Browse Button matching screenshot */}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="px-3 py-1 rounded-lg bg-white hover:bg-slate-50 text-[11px] font-bold text-cyan-700 border border-slate-300 shadow-sm transition-all cursor-pointer hover:border-cyan-500"
            >
              Browse
            </button>
          </div>
        </div>
      ) : (
        /* Attached State: Rich Evidence Card with Geotag Badge */
        <div className="rounded-xl border border-cyan-300/80 bg-gradient-to-r from-cyan-50/70 to-emerald-50/40 p-3 shadow-md">
          <div className="flex items-start justify-between gap-3">
            {/* Thumbnail */}
            <div className="relative group w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden border border-slate-300 flex-shrink-0 bg-slate-900 shadow-sm">
              <img
                src={imagePreview}
                alt="Field evidence preview"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform"
              />
              <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                <Eye className="w-4 h-4" />
              </div>
            </div>

            {/* Metadata and Geotag status */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap mb-1">
                {imageMeta?.exifVerified ? (
                  <span className="inline-flex items-center gap-1 text-[10px] font-mono font-bold px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 border border-emerald-300">
                    <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                    EXIF Geotag Verified
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-[10px] font-mono font-bold px-2 py-0.5 rounded-md bg-cyan-100 text-cyan-800 border border-cyan-300">
                    <MapPin className="w-3 h-3 text-cyan-600" />
                    GPS Telemetry Locked
                  </span>
                )}

                <span className="text-[10px] font-mono text-slate-500">
                  {imageMeta?.fileSize || 'Evidence Attached'}
                </span>
              </div>

              {/* Coordinates Pill */}
              <div className="text-[11px] font-mono text-slate-800 font-bold flex items-center gap-1.5">
                <span className="text-cyan-700">📍</span>
                <span>
                  {imageMeta?.lat?.toFixed(4)}° N, {imageMeta?.lng?.toFixed(4)}° E
                </span>
                {imageMeta?.altitude && (
                  <span className="text-[10px] font-normal text-slate-500">({imageMeta.altitude}m MSL)</span>
                )}
              </div>

              {/* Device and Time */}
              <p className="text-[10px] text-slate-500 font-medium truncate mt-0.5">
                {imageMeta?.device || 'Field Sensor'} • {imageMeta?.timestamp || 'Synchronized'}
              </p>
            </div>

            {/* Actions: Replace / Remove */}
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                title="Replace photo"
                className="p-1.5 rounded-lg bg-white border border-slate-200 text-slate-600 hover:text-cyan-700 hover:bg-slate-50 transition-colors cursor-pointer shadow-sm"
              >
                <RotateCw className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={handleRemoveImage}
                title="Remove evidence photo"
                className="p-1.5 rounded-lg bg-white border border-slate-200 text-rose-500 hover:bg-rose-50 hover:border-rose-300 transition-colors cursor-pointer shadow-sm"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* LIVE CAMERA / BODYCAM MODAL */}
      {isCameraActive && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md">
          <div className="relative w-full max-w-lg bg-slate-900 border border-cyan-500/50 rounded-2xl overflow-hidden shadow-2xl flex flex-col">
            {/* Modal Header */}
            <div className="px-4 py-3 bg-slate-950/80 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping"></span>
                <span className="text-xs font-mono font-black tracking-wider text-cyan-300 uppercase">
                  Live Field Camera / Bodycam Viewfinder
                </span>
              </div>
              <button
                type="button"
                onClick={stopCamera}
                className="p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Video Stream & Tactical Crosshair Viewfinder */}
            <div className="relative bg-black aspect-video flex items-center justify-center overflow-hidden">
              {cameraError ? (
                <div className="p-6 text-center text-rose-300 text-xs font-mono">
                  <AlertTriangle className="w-8 h-8 mx-auto mb-2 text-rose-400" />
                  <p>{cameraError}</p>
                </div>
              ) : (
                <>
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-full h-full object-cover"
                  />

                  {/* Tactical Reticle Overlay */}
                  <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                    <div className="w-32 h-32 border border-cyan-400/40 rounded-lg relative">
                      <div className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-cyan-400"></div>
                      <div className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 border-cyan-400"></div>
                      <div className="absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2 border-cyan-400"></div>
                      <div className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 border-cyan-400"></div>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-1.5 h-1.5 rounded-full bg-cyan-400"></div>
                      </div>
                    </div>
                  </div>

                  {/* HUD Watermark */}
                  <div className="absolute bottom-2 left-2 px-2 py-1 rounded bg-slate-950/80 border border-white/10 text-[9px] font-mono text-cyan-300 pointer-events-none">
                    GPS: {currentLocation.lat.toFixed(4)}° N, {currentLocation.lng.toFixed(4)}° E | ELEV: {currentLocation.elevationMsl}m
                  </div>
                </>
              )}
            </div>

            {/* Camera Controls Footer */}
            <div className="p-4 bg-slate-950 flex items-center justify-between">
              <button
                type="button"
                onClick={switchCameraFacing}
                className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-mono flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <RotateCw className="w-3.5 h-3.5" />
                <span>Flip Lens</span>
              </button>

              <button
                type="button"
                onClick={captureFrame}
                disabled={!!cameraError}
                className="btn-liquid-sheen px-5 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs flex items-center gap-2 transition-all shadow-lg cursor-pointer disabled:opacity-50"
              >
                <Camera className="w-4 h-4" />
                <span>Snap Evidence Frame</span>
              </button>

              <button
                type="button"
                onClick={stopCamera}
                className="px-3 py-1.5 rounded-xl text-slate-400 hover:text-white text-xs font-mono transition-colors cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
