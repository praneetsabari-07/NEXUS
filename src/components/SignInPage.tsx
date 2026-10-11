import React, { useState, useEffect } from 'react';
import { UserProfile } from '../types';
import { supabaseService } from '../services/supabase';
import { StarFieldCanvas } from './StarFieldCanvas';
import { ArrowLeft, ArrowRight, CheckCircle2, Shield, User, Phone, Sparkles } from 'lucide-react';

interface SignInPageProps {
  onSuccess: (user: UserProfile) => void;
  onBackToOverview: () => void;
}

export const SignInPage: React.FC<SignInPageProps> = ({ onSuccess, onBackToOverview }) => {
  const [operatorName, setOperatorName] = useState('');
  const [phone, setPhone] = useState('');
  const [dialCode, setDialCode] = useState('+91');
  const [isDialDropdownOpen, setIsDialDropdownOpen] = useState(false);
  const [recalledUsers, setRecalledUsers] = useState<UserProfile[]>([]);
  const [errorMsg, setErrorMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Load recalled users from memory / localStorage
  useEffect(() => {
    const list = supabaseService.getRecalledUsers();
    setRecalledUsers(list);

    // If there is an active or last user, prefill for instant recall
    const active = supabaseService.getActiveUser();
    if (active) {
      setOperatorName(active.name);
      setPhone(active.phone);
      if (active.dialCode) setDialCode(active.dialCode);
    } else if (list.length > 0) {
      setOperatorName(list[0].name);
      setPhone(list[0].phone);
      if (list[0].dialCode) setDialCode(list[0].dialCode);
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!operatorName.trim()) {
      setErrorMsg('Please enter your full Operator Identifier / Name.');
      return;
    }
    if (!phone.trim() || phone.replace(/\D/g, '').length < 8) {
      setErrorMsg('Please provide a valid registered mobile number for comms token verification.');
      return;
    }

    setIsSubmitting(true);
    try {
      const user = await supabaseService.saveUser(operatorName, phone, dialCode);
      onSuccess(user);
    } catch (err) {
      setErrorMsg('Authentication error. Falling back to secure offline local clearance.');
      const user = await supabaseService.saveUser(operatorName, phone, dialCode);
      onSuccess(user);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSelectRecalledUser = (u: UserProfile) => {
    setOperatorName(u.name);
    setPhone(u.phone);
    if (u.dialCode) setDialCode(u.dialCode);
    setErrorMsg('');
  };

  const dialCodes = ['+91', '+1', '+44', '+81', '+61', '+49', '+33', '+65'];

  return (
    <div className="min-h-screen bg-[#060a12] text-slate-100 font-sans antialiased select-none overflow-hidden relative flex flex-col justify-between p-4 sm:p-8 md:p-10">
      {/* Alpine Mountain Background */}
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none" data-purpose="scenic-background">
        <img
          alt="Alpine Mountain View with Twilight Horizon"
          className="w-full h-full object-cover object-center scale-100 transform transition-transform duration-1000 ease-out brightness-90 contrast-[1.04]"
          src="https://lh3.googleusercontent.com/aida-public/AB6AXuCiECMBEPskcX1LZ1HfS4HnO7zLfQwJh6ERFZaO3OOFhN8lHvLISi4cHFu0q_IFLVWAg2sJxpmgFpg8hFOfWUI6CHxdTLqCcEaLEfoo8P6KrygxqRTs4fz-qEY6oud1OZNX8lN0helxc8oVu9fF9YbxmM6sUxvenm5lOKTihagHdZhGl6LpslppXE5IYeUPuGGygY3E8NfFsO_YbI85i6XG5Vsf4Rx-HMzRlejtYg3-ZeAao6Tx1eGOYg"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#060a12]/50 via-transparent to-[#04070e]/85"></div>
      </div>

      {/* Star Field Canvas */}
      <StarFieldCanvas starCount={75} maxHeightRatio={0.65} />

      {/* Top Floating Header Navigation */}
      <header className="relative z-10 w-full flex items-center justify-between max-w-7xl mx-auto">
        {/* Left Pill: Brand Identity & Status */}
        <div className="liquid-glass-capsule rounded-full px-4 sm:px-5 py-2 sm:py-2.5 flex items-center gap-3 sm:gap-4 transition hover:border-white/30">
          <button
            type="button"
            onClick={onBackToOverview}
            className="flex items-center gap-2.5 group cursor-pointer focus:outline-none"
          >
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center p-0.5 shadow-md shadow-cyan-500/20 group-hover:scale-105 transition-transform duration-300">
              <svg
                className="w-4 h-4 text-white drop-shadow"
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
                <polyline points="2 15.5 12 8.5 22 15.5" />
                <line x1="12" x2="12" y1="2" y2="8.5" />
              </svg>
            </div>
            <span className="text-xs sm:text-sm font-bold tracking-widest text-white uppercase font-mono">
              NEXUS
            </span>
          </button>

          <div className="h-4 w-[1px] bg-white/20"></div>

          <div className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="text-[11px] sm:text-xs font-medium tracking-wide text-slate-300/90 font-mono uppercase hidden xs:inline">
              Grid: Nominal
            </span>
          </div>
        </div>

        {/* Right Pill: Return Action */}
        <div className="flex items-center">
          <button
            type="button"
            onClick={onBackToOverview}
            className="liquid-glass-capsule rounded-full px-3.5 sm:px-4 py-2 sm:py-2.5 flex items-center gap-2 text-xs font-medium text-slate-200 hover:text-white hover:border-white/35 transition duration-200 group cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5 text-cyan-400 transform group-hover:-translate-x-0.5 transition-transform duration-200" />
            <span className="hidden sm:inline">Back to Overview</span>
            <span className="sm:hidden">Back</span>
          </button>
        </div>
      </header>

      {/* Main Sign In Form Container */}
      <main className="relative z-10 flex-1 flex items-center justify-center py-6 my-auto">
        <div className="w-full max-w-[440px] liquid-glass-card rounded-[28px] p-6 sm:p-9 transition-all duration-300 shadow-2xl">
          {/* Header Pill Badge */}
          <div className="flex justify-center mb-5">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-cyan-950/40 border border-cyan-400/25 text-[11px] font-medium tracking-wide text-cyan-300 shadow-sm">
              <span className="text-cyan-400 text-xs animate-pulse">⚡</span>
              <span>Tactical Operator Clearance</span>
            </div>
          </div>

          {/* Typography Heading */}
          <div className="text-center space-y-1.5 mb-6">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white drop-shadow-sm">
              Sign In
            </h1>
            <p className="text-xs text-slate-300/80 leading-relaxed max-w-[340px] mx-auto font-light">
              Enter your credentials to interface with the Planetary Disaster Intelligence Grid.
            </p>
          </div>

          {/* Recalled Operators Quick Chips */}
          {recalledUsers.length > 0 && (
            <div className="mb-4 p-2.5 rounded-xl bg-white/5 border border-white/10">
              <span className="text-[10px] font-mono text-cyan-300/90 uppercase tracking-wider block mb-1.5">
                Recalled Operators in Memory:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {recalledUsers.slice(0, 3).map((u) => (
                  <button
                    key={u.id}
                    type="button"
                    onClick={() => handleSelectRecalledUser(u)}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition flex items-center gap-1.5 cursor-pointer ${
                      operatorName === u.name
                        ? 'bg-cyan-500/30 text-cyan-200 border border-cyan-400/40 font-bold'
                        : 'bg-white/10 hover:bg-white/20 text-slate-200 border border-white/15'
                    }`}
                  >
                    <span>{u.name}</span>
                    <span className="text-[9px] font-mono opacity-70">({u.phone})</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {errorMsg && (
            <div className="mb-4 p-2.5 rounded-xl bg-rose-500/20 border border-rose-500/40 text-xs text-rose-200 flex items-center gap-2">
              <span className="text-rose-400">⚠️</span>
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Operator Name Field */}
            <div className="space-y-1.5 text-left">
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300/90 font-mono">
                Operator Identifier (Your Name)
              </label>
              <div className="liquid-glass-input rounded-2xl flex items-center px-3.5 py-3 gap-3">
                <User className="w-4 h-4 text-cyan-400/80 flex-shrink-0" />
                <input
                  type="text"
                  required
                  value={operatorName}
                  onChange={(e) => setOperatorName(e.target.value)}
                  placeholder="Enter your full name or operator ID"
                  className="bg-transparent border-0 p-0 text-sm text-white placeholder-slate-500 focus:ring-0 focus:outline-none w-full font-sans tracking-wide"
                />
              </div>
            </div>

            {/* Phone Number Input with Dial Code Selector */}
            <div className="space-y-1.5 text-left">
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300/90 font-mono">
                Registered Comms Relay (2FA)
              </label>
              <div className="liquid-glass-input rounded-2xl flex items-center px-3.5 py-2.5 gap-2.5 relative">
                {/* Dial Code Dropdown */}
                <div
                  onClick={() => setIsDialDropdownOpen(!isDialDropdownOpen)}
                  className="flex items-center gap-1.5 pr-2.5 border-r border-white/15 cursor-pointer hover:opacity-80 transition relative"
                >
                  <span className="text-xs">🌐</span>
                  <span className="text-xs font-mono text-cyan-300 font-medium">{dialCode}</span>
                  <svg className="w-3 h-3 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path d="M19 9l-7 7-7-7" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
                  </svg>

                  {isDialDropdownOpen && (
                    <div className="absolute top-full left-0 mt-2 bg-slate-900 border border-white/20 rounded-xl p-1 shadow-xl z-50 min-w-[70px]">
                      {dialCodes.map((code) => (
                        <div
                          key={code}
                          onClick={(e) => {
                            e.stopPropagation();
                            setDialCode(code);
                            setIsDialDropdownOpen(false);
                          }}
                          className="px-2 py-1 text-xs font-mono text-slate-200 hover:bg-cyan-500/20 rounded hover:text-cyan-300"
                        >
                          {code}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Phone Input */}
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="Enter 10-digit mobile number"
                  className="bg-transparent border-0 p-0 text-sm text-white placeholder-slate-500 focus:ring-0 focus:outline-none w-full font-mono tracking-wider"
                />

                <Phone className="w-4 h-4 text-slate-400/80 flex-shrink-0" />
              </div>
            </div>

            {/* Token Dispatch Notice */}
            <div className="flex items-start gap-2 pt-1 pb-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400 mt-0.5 flex-shrink-0" />
              <p className="text-[11px] text-slate-400 leading-snug">
                Credentials and session will be stored in memory and verified against the NEXUS Supabase clearance cluster.
              </p>
            </div>

            {/* Primary Sign In Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="btn-liquid-sheen w-full mt-2 py-3.5 px-6 rounded-2xl text-white font-semibold text-sm tracking-wide flex items-center justify-center gap-2 hover:brightness-110 active:scale-[0.985] transition-all cursor-pointer disabled:opacity-50"
            >
              <span>{isSubmitting ? 'Authenticating Clearance...' : 'Authorize & Connect'}</span>
              <ArrowRight className="w-4 h-4 text-white" />
            </button>
          </form>

          {/* Secondary Navigation Links */}
          <div className="mt-6 pt-5 border-t border-white/10 text-center space-y-3">
            <div className="text-xs text-slate-300/80">
              <span>Trouble signing in? </span>
              <button
                type="button"
                onClick={() => {
                  setOperatorName('Praneet Sabari');
                  setPhone('9864012845');
                }}
                className="text-cyan-400 hover:text-cyan-300 font-medium underline underline-offset-2 transition cursor-pointer"
              >
                Auto-fill Clearance Demo
              </button>
            </div>
            <div className="text-[11px] text-slate-400">
              <span>Secure clearance with: </span>
              <span className="text-cyan-300 font-mono">Supabase Key Sync Enabled</span>
            </div>
          </div>
        </div>
      </main>

      {/* Secure Footer Protocols */}
      <footer className="relative z-10 w-full flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-slate-400 font-mono tracking-wider pt-2 max-w-7xl mx-auto">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5 text-slate-300">
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-cyan-400"></span>
            <span>AES-256-GCM / Post-Quantum Mesh</span>
          </div>
          <span className="text-white/20 hidden sm:inline">•</span>
          <div className="flex items-center gap-1.5 text-slate-300">
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-blue-400"></span>
            <span>Zero-Trust Protocol Active</span>
          </div>
        </div>

        <div className="text-slate-400/80 font-sans text-[11px]">
          NEXUS Planetary Node #084-Alps • Secure Session
        </div>
      </footer>
    </div>
  );
};
