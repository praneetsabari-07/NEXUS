import React, { useState, useRef, useEffect } from 'react';
import { UserProfile } from '../types';
import { LogOut, Shield, User, Phone, MapPin, KeyRound, CheckCircle2 } from 'lucide-react';

interface ProfileDropdownProps {
  user: UserProfile;
  currentLocationName: string;
  onLogout: () => void;
  onSwitchAccount: () => void;
}

export const ProfileDropdown: React.FC<ProfileDropdownProps> = ({
  user,
  currentLocationName,
  onLogout,
  onSwitchAccount,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement | null>(null);

  // Derive initials from real user name
  const initials = user.name
    .split(' ')
    .filter(Boolean)
    .map((part) => part[0])
    .slice(0, 2)
    .join('')
    .toUpperCase() || 'OP';

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div ref={dropdownRef} className="relative">
      {/* Operator Avatar Capsule in Top Nav */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="h-10 pl-2 pr-3.5 rounded-2xl liquid-glass-capsule flex items-center gap-2.5 cursor-pointer hover:border-white/35 transition-all shadow-sm group focus:outline-none"
        aria-label="User profile and session settings"
      >
        <div className="relative w-7 h-7 rounded-full bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center font-mono font-bold text-xs text-white border border-white/40 shadow-sm">
          {initials}
          <span className="absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-400 border border-slate-900"></span>
        </div>

        <div className="text-left hidden lg:block">
          <p className="text-[11px] font-bold leading-tight text-white group-hover:text-cyan-200 transition-colors truncate max-w-[140px]">
            {user.name}
          </p>
          <p className="text-[9px] font-mono text-cyan-300/80 leading-tight truncate">
            {user.phone ? `${user.dialCode} ${user.phone}` : 'Operator Active'}
          </p>
        </div>
      </button>

      {/* Liquid Glass Dropdown Menu */}
      {isOpen && (
        <div
          className="absolute right-0 top-full mt-2 w-72 rounded-2xl liquid-glass-card p-4 shadow-2xl border border-white/25 backdrop-blur-3xl z-50 animate-in fade-in zoom-in-95 duration-150"
          style={{
            background: 'linear-gradient(145deg, rgba(16, 24, 44, 0.96) 0%, rgba(8, 14, 28, 0.98) 100%)',
          }}
        >
          {/* User Profile Card Header */}
          <div className="flex items-center gap-3 pb-3 border-b border-white/10">
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-cyan-400 to-blue-600 flex items-center justify-center text-sm font-mono font-bold text-white shadow-md border border-white/30 flex-shrink-0">
              {initials}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5">
                <h4 className="text-xs font-bold text-white truncate">{user.name}</h4>
                <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400 flex-shrink-0" />
              </div>
              <p className="text-[10px] font-mono text-cyan-300">{user.role || 'Incident Command Officer'}</p>
              <span className="inline-block mt-0.5 px-2 py-0.2 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-mono text-[9px]">
                {user.clearanceLevel || 'Level 4 Clearance'}
              </span>
            </div>
          </div>

          {/* Details Section */}
          <div className="py-3 space-y-2 text-xs font-mono border-b border-white/10">
            <div className="flex items-center justify-between text-slate-300">
              <span className="flex items-center gap-1.5 text-slate-400 text-[11px]">
                <Phone className="w-3 h-3 text-cyan-400" />
                <span>Comms Relay (2FA)</span>
              </span>
              <span className="text-white font-medium">{user.dialCode} {user.phone}</span>
            </div>

            <div className="flex items-center justify-between text-slate-300">
              <span className="flex items-center gap-1.5 text-slate-400 text-[11px]">
                <MapPin className="w-3 h-3 text-cyan-400" />
                <span>Active Sector</span>
              </span>
              <span className="text-cyan-300 font-medium truncate max-w-[120px]">{currentLocationName}</span>
            </div>

            <div className="flex items-center justify-between text-slate-300">
              <span className="flex items-center gap-1.5 text-slate-400 text-[11px]">
                <KeyRound className="w-3 h-3 text-emerald-400" />
                <span>Session Encryption</span>
              </span>
              <span className="text-emerald-400 font-medium">AES-256 Valid</span>
            </div>
          </div>

          {/* Action Links */}
          <div className="pt-3 space-y-1.5">
            <button
              type="button"
              onClick={() => {
                setIsOpen(false);
                onSwitchAccount();
              }}
              className="w-full px-3 py-2 rounded-xl text-left text-xs text-slate-300 hover:text-white hover:bg-white/10 transition-colors flex items-center gap-2 cursor-pointer font-sans"
            >
              <User className="w-3.5 h-3.5 text-cyan-400" />
              <span>Switch Operator Profile</span>
            </button>

            {/* Prominent Log Out Button */}
            <button
              type="button"
              onClick={() => {
                setIsOpen(false);
                onLogout();
              }}
              className="w-full px-3 py-2 rounded-xl text-left text-xs font-semibold text-rose-300 hover:text-white hover:bg-rose-500/25 transition-all flex items-center gap-2 border border-rose-500/30 hover:border-rose-400/60 cursor-pointer font-sans"
            >
              <LogOut className="w-3.5 h-3.5 text-rose-400" />
              <span>Log Out of NEXUS</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
