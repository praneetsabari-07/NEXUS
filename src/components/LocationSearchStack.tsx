import React, { useState, useRef, useEffect } from 'react';
import { LocationEntity } from '../types';
import {
  LOCATIONS_DATABASE,
  getStackWiseHierarchy,
  StackDistrict,
  searchLocations,
} from '../data/locations';
import {
  Search,
  MapPin,
  ChevronRight,
  ChevronDown,
  Locate,
  Layers,
  X,
  Building2,
  Mountain,
} from 'lucide-react';

interface LocationSearchStackProps {
  currentLocation: LocationEntity;
  onSelectLocation: (location: LocationEntity) => void;
  onRequestGps: () => void;
  isGpsActive?: boolean;
}

export const LocationSearchStack: React.FC<LocationSearchStackProps> = ({
  currentLocation,
  onSelectLocation,
  onRequestGps,
  isGpsActive = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'hierarchy' | 'search'>('hierarchy');
  const [expandedDistrict, setExpandedDistrict] = useState<string | null>('The Nilgiris');

  const containerRef = useRef<HTMLDivElement | null>(null);
  const hierarchy = getStackWiseHierarchy();

  // Close dropdown when clicked outside or Escape pressed
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  const searchResults = searchQuery.trim() ? searchLocations(searchQuery) : [];

  const handleSelect = (loc: LocationEntity) => {
    onSelectLocation(loc);
    setSearchQuery('');
    setIsOpen(false);
  };

  // Curated prominent Tamil Nadu monitoring hot-spots
  const quickPills = [
    { label: 'Coonoor (Nilgiris)', taluk: 'Coonoor', district: 'The Nilgiris' },
    { label: 'Ooty (Nilgiris)', taluk: 'Udhagamandalam', district: 'The Nilgiris' },
    { label: 'Kodaikanal', taluk: 'Kodaikanal', district: 'Dindigul' },
    { label: 'Velachery (Chennai)', taluk: 'Velachery', district: 'Chennai' },
    { label: 'Valparai', taluk: 'Valparai', district: 'Coimbatore' },
    { label: 'Bodi Ghat', taluk: 'Bodinayakanur', district: 'Theni' },
  ];

  return (
    <div ref={containerRef} className="relative flex-1 max-w-2xl mx-2">
      {/* Dynamic Island Capsule Bar */}
      <div
        onClick={() => setIsOpen(true)}
        className="liquid-glass-capsule rounded-full px-3.5 py-1.5 flex items-center justify-between gap-2.5 transition-all duration-300 hover:border-white/40 cursor-pointer shadow-md"
      >
        <div className="flex items-center gap-2.5 flex-1 min-w-0">
          <Search className="w-4 h-4 text-cyan-400 flex-shrink-0" />
          <div className="flex items-center gap-1.5 flex-1 min-w-0">
            <span className="text-xs font-semibold text-white truncate font-sans">
              {currentLocation.name}
            </span>
            <span className="text-[10px] text-cyan-300/80 font-mono hidden sm:inline truncate">
              ({currentLocation.district}, Tamil Nadu)
            </span>
          </div>
        </div>

        {/* Quick Sector Pills Matrix */}
        <div className="flex items-center gap-1.5 flex-shrink-0" onClick={(e) => e.stopPropagation()}>
          {quickPills.slice(0, 3).map((pill) => {
            const isSelected =
              currentLocation.taluk?.toLowerCase() === pill.taluk.toLowerCase() ||
              currentLocation.name.toLowerCase().includes(pill.taluk.toLowerCase());
            return (
              <button
                key={pill.label}
                type="button"
                onClick={() => {
                  const target = LOCATIONS_DATABASE.find(
                    (l) => l.taluk === pill.taluk && l.district === pill.district
                  );
                  if (target) handleSelect(target);
                }}
                className={`text-[10px] font-semibold tracking-wide px-2.5 py-1 rounded-full transition-colors cursor-pointer ${
                  isSelected
                    ? 'bg-cyan-500/25 text-cyan-300 border border-cyan-400/40 shadow-sm'
                    : 'bg-white/5 hover:bg-white/10 text-white/70 hover:text-white border border-white/10'
                }`}
              >
                {pill.label}
              </button>
            );
          })}

          {/* GPS Locate Button */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onRequestGps();
            }}
            className={`p-1.5 rounded-full transition-colors border cursor-pointer ${
              isGpsActive
                ? 'bg-emerald-500/25 border-emerald-400 text-emerald-300 shadow-sm'
                : 'bg-white/10 hover:bg-cyan-500/20 text-slate-300 hover:text-cyan-300 border-white/20'
            }`}
            title="Calibrate Live GPS to Nearest Tamil Nadu Taluk"
          >
            <Locate className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Stack-Wise Search & Hierarchy Popover with Liquid Glass Effect & White Frosted Texture */}
      {isOpen && (
        <div
          className="absolute top-full left-0 right-0 mt-2 z-50 rounded-3xl p-4 sm:p-5 apple-glass-core shadow-2xl border border-white/30 backdrop-blur-3xl animate-in fade-in zoom-in-95 duration-150 overflow-hidden relative"
          style={{
            background: 'linear-gradient(145deg, rgba(22, 34, 58, 0.88) 0%, rgba(12, 19, 36, 0.95) 100%)',
            backdropFilter: 'blur(36px) saturate(190%)',
            WebkitBackdropFilter: 'blur(36px) saturate(190%)',
            border: '1px solid rgba(255, 255, 255, 0.28)',
            boxShadow:
              '0 28px 70px -15px rgba(0, 0, 0, 0.75), inset 0 1.5px 2px 0 rgba(255, 255, 255, 0.5), inset 0 -1px 2px 0 rgba(0, 0, 0, 0.25)',
          }}
        >
          {/* Specular White Rim Highlight across Top */}
          <div className="absolute inset-x-0 top-0 h-[1.5px] bg-gradient-to-r from-transparent via-white/80 to-transparent pointer-events-none" />

          {/* Soft White Frosted Texture Gradient */}
          <div className="absolute inset-0 rounded-3xl bg-gradient-to-b from-white/[0.12] via-white/[0.02] to-transparent pointer-events-none" />

          {/* Search Input Box with Liquid Glass & White Sheen */}
          <div className="relative z-10 flex items-center gap-2 mb-3.5">
            <div className="flex-1 relative flex items-center bg-white/[0.08] hover:bg-white/[0.12] rounded-2xl px-3.5 py-2.5 border border-white/25 focus-within:border-white/60 focus-within:bg-white/[0.14] transition-all shadow-[inset_0_1px_2px_rgba(0,0,0,0.25),inset_0_0_0_1px_rgba(255,255,255,0.1)]">
              <Search className="w-4 h-4 text-cyan-300 mr-2.5 flex-shrink-0" />
              <input
                type="text"
                autoFocus
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  if (e.target.value.trim() && activeTab !== 'search') {
                    setActiveTab('search');
                  }
                }}
                placeholder="Search Tamil Nadu Districts (38), Taluks (310), or Capitals..."
                className="bg-transparent border-0 text-xs text-white placeholder-white/50 focus:outline-none focus:ring-0 w-full font-sans tracking-wide"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="p-1 rounded-full text-white/50 hover:text-white hover:bg-white/10 transition cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="p-2.5 rounded-2xl text-white/60 hover:text-white bg-white/[0.06] hover:bg-white/15 border border-white/15 transition cursor-pointer shadow-sm"
              title="Close Search"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Tab Switcher: Stack Hierarchy vs All Locations */}
          <div className="relative z-10 flex flex-wrap items-center justify-between border-b border-white/15 pb-2.5 mb-3 text-xs gap-2">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setActiveTab('hierarchy')}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
                  activeTab === 'hierarchy'
                    ? 'bg-white/20 text-white border border-white/40 shadow-[inset_0_1px_1.5px_rgba(255,255,255,0.6),0_4px_12px_rgba(0,0,0,0.3)]'
                    : 'bg-white/[0.05] text-white/70 hover:text-white hover:bg-white/10 border border-white/10'
                }`}
              >
                <Layers className="w-3.5 h-3.5 text-cyan-300" />
                <span>TN Hierarchy (38 Districts • 87 Rev Divs • 310 Taluks)</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('search')}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  activeTab === 'search'
                    ? 'bg-white/20 text-white border border-white/40 shadow-[inset_0_1px_1.5px_rgba(255,255,255,0.6),0_4px_12px_rgba(0,0,0,0.3)]'
                    : 'bg-white/[0.05] text-white/70 hover:text-white hover:bg-white/10 border border-white/10'
                }`}
              >
                <span>All Taluks ({searchQuery ? searchResults.length : LOCATIONS_DATABASE.length})</span>
              </button>
            </div>

            <button
              type="button"
              onClick={() => {
                onRequestGps();
                setIsOpen(false);
              }}
              className="text-[11px] font-mono px-2.5 py-1 rounded-xl bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30 border border-emerald-400/30 flex items-center gap-1 cursor-pointer transition-all shadow-sm"
            >
              <Locate className="w-3 h-3" />
              <span>Calibrate Nearest Taluk</span>
            </button>
          </div>

          {/* Content Area */}
          <div className="relative z-10 max-h-[380px] overflow-y-auto space-y-2 pr-1 custom-scrollbar">
            {/* TAB 1: Stack-Wise Nested Hierarchy */}
            {activeTab === 'hierarchy' && (
              <div className="space-y-2">
                {hierarchy.map((district) => {
                  const isDistExpanded = expandedDistrict === district.districtEntity.district;

                  return (
                    <div
                      key={district.districtEntity.district}
                      className="rounded-2xl border border-white/20 overflow-hidden bg-white/[0.06] hover:bg-white/[0.09] transition-all shadow-[inset_0_1px_1px_rgba(255,255,255,0.25)]"
                    >
                      {/* District Level Header */}
                      <div
                        onClick={() =>
                          setExpandedDistrict(isDistExpanded ? null : district.districtEntity.district)
                        }
                        className="px-3.5 py-2.5 flex items-center justify-between cursor-pointer hover:bg-white/10 transition-colors"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          {isDistExpanded ? (
                            <ChevronDown className="w-4 h-4 text-cyan-300 flex-shrink-0" />
                          ) : (
                            <ChevronRight className="w-4 h-4 text-white/60 flex-shrink-0" />
                          )}
                          <span className="text-xs font-bold text-white tracking-wide truncate font-sans">
                            {district.name}
                          </span>
                          <span className="text-[10px] font-mono text-cyan-200 bg-white/10 border border-white/20 px-2.5 py-0.5 rounded-full hidden sm:inline truncate shadow-sm">
                            Capital: {district.capital}
                          </span>
                          <span className="text-[9px] font-mono text-white/60 hidden md:inline">
                            • {district.revenueDivisionsCount} Rev Divs • {district.taluksCount} Taluks
                          </span>
                        </div>

                        <div className="flex items-center gap-2 flex-shrink-0">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleSelect(district.districtEntity);
                            }}
                            className="text-[10px] font-mono text-cyan-300 hover:text-white hover:bg-white/15 px-2.5 py-1 rounded-lg border border-cyan-400/30 transition-colors cursor-pointer"
                          >
                            Select District HQ →
                          </button>
                        </div>
                      </div>

                      {/* Taluk Level List */}
                      {isDistExpanded && (
                        <div className="p-3 border-t border-white/15 bg-black/25 space-y-2">
                          <div className="text-[10px] font-mono text-white/70 px-1 flex items-center justify-between">
                            <span>Taluks under {district.name} ({district.taluks.length} total)</span>
                            <span className="text-cyan-300 font-semibold">Click taluk to lock telemetry</span>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                            {district.taluks.map((talukItem) => {
                              const talukEntity =
                                talukItem.villages[0] || district.districtEntity;
                              const isSelected = currentLocation.taluk === talukItem.name && currentLocation.district === district.name;

                              return (
                                <div
                                  key={talukItem.name}
                                  onClick={() => handleSelect(talukEntity)}
                                  className={`p-2.5 rounded-xl cursor-pointer transition-all border flex flex-col justify-between ${
                                    isSelected
                                      ? 'bg-white/25 border-white/70 text-white shadow-[0_0_20px_rgba(255,255,255,0.2),inset_0_1px_1.5px_rgba(255,255,255,0.7)]'
                                      : 'bg-white/[0.06] hover:bg-white/[0.14] border-white/15 hover:border-white/35 text-white/90 shadow-[inset_0_1px_1px_rgba(255,255,255,0.2)]'
                                  }`}
                                >
                                  <div className="flex items-center justify-between gap-1">
                                    <div className="flex items-center gap-1.5 truncate">
                                      <Building2 className="w-3.5 h-3.5 text-cyan-300 flex-shrink-0" />
                                      <span className="text-xs font-bold truncate">
                                        {talukItem.name}
                                      </span>
                                    </div>
                                    <span
                                      className={`text-[9px] font-mono px-1.5 py-0.5 rounded-md font-bold flex-shrink-0 ${
                                        talukEntity.riskLevel === 'CRITICAL'
                                          ? 'bg-rose-500/25 text-rose-300 border border-rose-400/40'
                                          : talukEntity.riskLevel === 'HIGH'
                                          ? 'bg-amber-500/25 text-amber-300 border border-amber-400/40'
                                          : 'bg-emerald-500/25 text-emerald-300 border border-emerald-400/40'
                                      }`}
                                    >
                                      {talukEntity.riskScore}%
                                    </span>
                                  </div>
                                  <div className="text-[9px] font-mono text-white/60 mt-1.5 flex justify-between">
                                    <span className="truncate">Div: {talukItem.revenueDivision}</span>
                                    <span>{talukEntity.rainfall24h}mm/24h</span>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {/* TAB 2: Filtered Search Results */}
            {activeTab === 'search' && (
              <div className="space-y-2">
                {(searchQuery ? searchResults : LOCATIONS_DATABASE).map((loc) => {
                  const isSelected = currentLocation.id === loc.id;

                  return (
                    <div
                      key={loc.id}
                      onClick={() => handleSelect(loc)}
                      className={`p-3 rounded-2xl border flex items-center justify-between gap-3 cursor-pointer transition-all ${
                        isSelected
                          ? 'bg-white/25 border-white/70 text-white shadow-[0_0_20px_rgba(255,255,255,0.2),inset_0_1px_1.5px_rgba(255,255,255,0.7)]'
                          : 'bg-white/[0.06] hover:bg-white/[0.14] border-white/15 hover:border-white/35 text-white/90 shadow-[inset_0_1px_1px_rgba(255,255,255,0.2)]'
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="p-2 rounded-xl bg-white/10 text-cyan-300 border border-white/20 flex-shrink-0 shadow-sm">
                          <MapPin className="w-4 h-4" />
                        </div>
                        <div className="min-w-0">
                          <div className="text-xs font-bold text-white truncate flex items-center gap-1.5">
                            <span>{loc.name}</span>
                            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-white/15 text-cyan-200 border border-white/20">
                              Taluk
                            </span>
                          </div>
                          <div className="text-[10px] text-white/70 font-mono truncate mt-0.5">
                            {loc.taluk} Taluk • {loc.district} District, Tamil Nadu • Elev {loc.elevationMsl}m MSL
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2.5 flex-shrink-0 text-right">
                        <div className="font-mono text-right">
                          <div
                            className={`text-xs font-bold ${
                              loc.riskLevel === 'CRITICAL'
                                ? 'text-rose-400'
                                : loc.riskLevel === 'HIGH'
                                ? 'text-amber-300'
                                : 'text-emerald-300'
                            }`}
                          >
                            {loc.riskScore}%
                          </div>
                          <div className="text-[9px] text-white/60 uppercase">{loc.riskLevel}</div>
                        </div>
                        <ChevronRight className="w-4 h-4 text-white/50" />
                      </div>
                    </div>
                  );
                })}

                {searchQuery && searchResults.length === 0 && (
                  <div className="text-center py-8 text-white/60 text-xs font-mono">
                    No sectors matching &quot;{searchQuery}&quot; found in Tamil Nadu. Try &quot;Coonoor&quot;, &quot;Ooty&quot;, &quot;Velachery&quot;, &quot;Kodaikanal&quot;, or &quot;Valparai&quot;.
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
