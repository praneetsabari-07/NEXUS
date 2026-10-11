import React, { useEffect, useState } from 'react';
import { AppView, UserProfile } from '../types';
import { ArrowRight, ChevronRight, LogIn, UserPlus, Zap } from 'lucide-react';
import { DisasterMLPredictorPanel } from './DisasterMLPredictorPanel';

interface HomePageProps {
  onNavigate: (view: AppView) => void;
  currentUser: UserProfile | null;
}

export const HomePage: React.FC<HomePageProps> = ({ onNavigate, currentUser }) => {
  const [activeSection, setActiveSection] = useState<'hero' | 'sensor-data' | 'predictive-ai' | 'emergency-grid' | 'global-telemetrics'>('hero');
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
      const progress = maxScroll > 0 ? Math.min(Math.max(scrollY / maxScroll, 0), 1) : 0;
      setScrollProgress(progress);

      const sections = ['hero', 'sensor-data', 'predictive-ai', 'emergency-grid', 'global-telemetrics'];
      const scrollPosition = scrollY + window.innerHeight * 0.35;

      for (const id of sections) {
        const el = document.getElementById(id);
        if (el) {
          const top = el.offsetTop;
          const height = el.offsetHeight;
          if (scrollPosition >= top && scrollPosition < top + height) {
            setActiveSection(id as any);
            break;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="relative min-h-screen w-full font-sans text-slate-100 antialiased selection:bg-rose-400 selection:text-slate-950 overflow-x-hidden bg-slate-950">
      {/* 1. FIXED SCENIC ALPINE BACKGROUND & SUNRISE DYNAMIC SCROLL OVERLAY */}
      <div className="fixed inset-0 z-0 select-none pointer-events-none" id="scenic-backdrop-wrap">
        <img
          alt="Alpine mountain view"
          className="h-full w-full object-cover object-center transform scale-105 filter transition-all duration-700 ease-out"
          id="bg-mountain"
          src="https://lh3.googleusercontent.com/aida-public/AB6AXuCiECMBEPskcX1LZ1HfS4HnO7zLfQwJh6ERFZaO3OOFhN8lHvLISi4cHFu0q_IFLVWAg2sJxpmgFpg8hFOfWUI6CHxdTLqCcEaLEfoo8P6KrygxqRTs4fz-qEY6oud1OZNX8lN0helxc8oVu9fF9YbxmM6sUxvenm5lOKTihagHdZhGl6LpslppXE5IYeUPuGGygY3E8NfFsO_YbI85i6XG5Vsf4Rx-HMzRlejtYg3-ZeAao6Tx1eGOYg"
          style={{
            filter: `brightness(${(0.88 + scrollProgress * 0.22).toFixed(2)}) contrast(${(1.06 + scrollProgress * 0.08).toFixed(2)})`,
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/40 to-slate-950/60 mix-blend-multiply"></div>
        <div
          className="absolute inset-0 opacity-50"
          style={{ background: 'radial-gradient(circle at 50% 45%, transparent 20%, rgba(6, 11, 25, 0.85) 100%)' }}
        ></div>

        {/* Sunrise Scroll Layer */}
        <div
          className="absolute inset-0 pointer-events-none transition-opacity duration-300 ease-out mix-blend-screen"
          id="sunrise-overlay"
          style={{
            background: 'radial-gradient(circle at 60% 85%, rgba(255, 184, 104, 0.45) 0%, rgba(255, 120, 145, 0.25) 40%, rgba(130, 90, 255, 0.08) 75%, transparent 100%)',
            opacity: (scrollProgress * 0.85).toFixed(3),
          }}
        ></div>
        <div
          className="absolute inset-0 pointer-events-none transition-opacity duration-300 ease-out mix-blend-soft-light"
          id="sunrise-ambient"
          style={{
            background: 'linear-gradient(transparent 0%, rgba(255, 160, 90, 0.3) 50%, rgba(255, 215, 140, 0.4) 100%)',
            opacity: (scrollProgress * 0.75).toFixed(3),
          }}
        ></div>

        {/* Delicate Twinkle micro-stars */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute w-1 h-1 top-[12%] left-[18%] bg-white rounded-full opacity-60 shadow-[0_0_4px_#fff]"></div>
          <div className="absolute w-0.5 h-0.5 top-[22%] left-[45%] bg-white rounded-full opacity-50"></div>
          <div className="absolute w-1 h-1 top-[8%] left-[76%] bg-white rounded-full opacity-70 shadow-[0_0_4px_#fff]"></div>
          <div className="absolute w-0.5 h-0.5 top-[28%] left-[84%] bg-white rounded-full opacity-40"></div>
          <div className="absolute w-1 h-1 top-[35%] left-[28%] bg-white rounded-full opacity-50"></div>
        </div>
      </div>

      {/* 2. APPLE DYNAMIC ISLAND NAVIGATION BAR (Fixed Top Center) */}
      <header className="fixed top-4 sm:top-6 inset-x-0 z-50 flex justify-center px-3 sm:px-4 pointer-events-none">
        <nav
          className="pointer-events-auto apple-glass-island rounded-full p-1.5 sm:p-2 flex items-center gap-1 sm:gap-2 shadow-[0_20px_50px_rgba(0,0,0,0.5)] transition-all duration-300 max-w-full overflow-x-auto no-scrollbar"
          id="dynamic-island"
        >
          {/* Brand Minimal Pill */}
          <button
            type="button"
            onClick={() => scrollToSection('hero')}
            className="flex items-center gap-2 pl-3 pr-2.5 py-1.5 rounded-full hover:bg-white/10 transition-colors group cursor-pointer"
          >
            <div className="h-6 w-6 rounded-full bg-cyan-500/20 border border-cyan-400/40 flex items-center justify-center shadow-[0_0_10px_rgba(0,242,254,0.3)]">
              <svg
                className="w-3.5 h-3.5 text-cyan-300 group-hover:rotate-45 transition-transform duration-500"
                fill="none"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <polygon points="12 2 2 8.5 12 15 22 8.5 12 2" />
                <polygon points="2 15.5 12 22 22 15.5" />
              </svg>
            </div>
            <span className="text-xs font-bold tracking-widest text-white uppercase hidden md:inline">
              NEXUS
            </span>
          </button>

          <div className="h-4 w-px bg-white/15 mx-0.5"></div>

          {/* Navigation Items */}
          <div className="flex items-center gap-1 text-[11px] sm:text-xs font-medium">
            <button
              type="button"
              onClick={() => scrollToSection('sensor-data')}
              className={`px-3 sm:px-4 py-1.5 rounded-full transition-colors duration-200 cursor-pointer ${
                activeSection === 'sensor-data'
                  ? 'bg-white/20 text-white font-semibold border border-white/40 shadow-sm'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              Sensor Data
            </button>
            <button
              type="button"
              onClick={() => scrollToSection('predictive-ai')}
              className={`px-3 sm:px-4 py-1.5 rounded-full transition-colors duration-200 cursor-pointer ${
                activeSection === 'predictive-ai'
                  ? 'bg-white/20 text-white font-semibold border border-white/40 shadow-sm'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              Predictive AI
            </button>
            <button
              type="button"
              onClick={() => scrollToSection('emergency-grid')}
              className={`px-3 sm:px-4 py-1.5 rounded-full transition-colors duration-200 cursor-pointer ${
                activeSection === 'emergency-grid'
                  ? 'bg-white/20 text-white font-semibold border border-white/40 shadow-sm'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              Emergency Grid
            </button>
            <button
              type="button"
              onClick={() => scrollToSection('global-telemetrics')}
              className={`px-3 sm:px-4 py-1.5 rounded-full transition-colors duration-200 cursor-pointer ${
                activeSection === 'global-telemetrics'
                  ? 'bg-white/20 text-white font-semibold border border-white/40 shadow-sm'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              Global Telemetrics
            </button>
          </div>

          <div className="h-4 w-px bg-white/15 mx-0.5 hidden sm:block"></div>

          {/* Planetary Grid Status or Dashboard Jump */}
          {currentUser ? (
            <button
              type="button"
              onClick={() => onNavigate('dashboard')}
              className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-500/25 border border-cyan-400/40 text-[10px] font-mono text-cyan-200 hover:bg-cyan-500/40 transition cursor-pointer shadow-md"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping"></span>
              <span className="font-bold">Dashboard ({currentUser.name})</span>
            </button>
          ) : (
            <div className="hidden sm:flex items-center gap-2 pl-2 pr-3 py-1 rounded-full bg-black/25 border border-emerald-500/30 text-[10px] font-mono tracking-wide text-emerald-200 shadow-[0_0_12px_rgba(16,185,129,0.15)]">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400 shadow-[0_0_6px_#34d399]"></span>
              </span>
              <span className="text-slate-400 hidden lg:inline">Planetary Grid:</span>
              <span className="font-semibold text-emerald-300">Normal</span>
            </div>
          )}
        </nav>
      </header>

      {/* MAIN CONTENT WRAPPER */}
      <div className="relative z-20 w-full flex flex-col">
        {/* SECTION 1: HERO */}
        <section
          className="min-h-screen flex flex-col items-center justify-center px-4 sm:px-6 pt-24 pb-16 relative"
          id="hero"
        >
          {/* Authentic Apple Liquid Glass Center Box */}
          <div className="apple-glass-core rounded-[2.5rem] p-8 sm:p-12 md:p-16 max-w-4xl w-full text-center relative overflow-hidden transition-transform duration-500 hover:scale-[1.008]">
            <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-80 h-80 bg-gradient-to-b from-cyan-400/20 to-transparent rounded-full blur-3xl pointer-events-none"></div>
            <div className="absolute -bottom-24 left-1/2 -translate-x-1/2 w-96 h-96 bg-gradient-to-t from-rose-400/15 to-transparent rounded-full blur-3xl pointer-events-none"></div>

            {/* Frosted Specular Pill Badge */}
            <div className="mb-6 sm:mb-8 inline-flex items-center gap-2.5 px-4 sm:px-5 py-2 rounded-full bg-white/10 border border-white/30 backdrop-blur-xl text-xs sm:text-sm font-medium tracking-wide text-white/90 shadow-[0_4px_20px_rgba(0,0,0,0.3),inset_0_1px_1px_rgba(255,255,255,0.5)]">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-80"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400 shadow-[0_0_8px_#34d399]"></span>
              </span>
              <span className="text-amber-300 drop-shadow-[0_0_6px_rgba(252,211,77,0.8)]">⚡</span>
              <span className="font-semibold text-white tracking-normal">Made by Nexus</span>
              <span className="opacity-40 text-xs">•</span>
              <span className="text-slate-200">Engineered in 36 Hours</span>
            </div>

            {/* Main Brand Headline */}
            <h1 className="text-6xl sm:text-8xl md:text-9xl font-black tracking-tight leading-none specular-text mb-5 select-none drop-shadow-[0_15px_35px_rgba(0,0,0,0.55)]">
              NEXUS
            </h1>

            {/* Sub-headline */}
            <p className="text-sm sm:text-lg md:text-xl font-light tracking-[0.18em] sm:tracking-[0.24em] text-white/90 uppercase max-w-2xl mx-auto mb-10 px-2 drop-shadow-md">
              Disaster Prediction and Management System
            </p>

            {/* Authentication & Action Group (Log In & Sign In) */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full max-w-md mx-auto mb-6">
              {/* Log In Button */}
              <button
                type="button"
                onClick={() => onNavigate('auth')}
                className="w-full sm:w-1/2 backdrop-blur-xl bg-white/15 hover:bg-white/25 active:scale-95 text-white border border-white/40 shadow-[0_8px_32px_0_rgba(0,0,0,0.3),inset_0_1px_1.5px_rgba(255,255,255,0.7)] rounded-full px-8 py-3.5 font-medium tracking-wide transition-all duration-300 hover:scale-105 flex items-center justify-center gap-2 group cursor-pointer text-sm"
              >
                <span>Log In</span>
                <LogIn className="w-4 h-4 text-white/80 group-hover:text-white group-hover:translate-x-0.5 transition-transform" />
              </button>

              {/* Sign In Button */}
              <button
                type="button"
                onClick={() => onNavigate('auth')}
                className="w-full sm:w-1/2 backdrop-blur-xl bg-white/15 hover:bg-white/25 active:scale-95 text-white border border-white/40 shadow-[0_8px_32px_0_rgba(0,0,0,0.3),inset_0_1px_1.5px_rgba(255,255,255,0.7)] rounded-full px-8 py-3.5 font-medium tracking-wide transition-all duration-300 hover:scale-105 flex items-center justify-center gap-2 group cursor-pointer text-sm"
              >
                <span>Sign In</span>
                <UserPlus className="w-4 h-4 text-white/80 group-hover:text-white transition-transform group-hover:rotate-12" />
              </button>
            </div>

            {/* Direct Dashboard Link */}
            <div className="flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => onNavigate('dashboard')}
                className="inline-flex items-center gap-2 text-xs font-semibold tracking-wider text-cyan-200 hover:text-white transition-colors group py-2 px-5 rounded-full bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-400/40 shadow-lg cursor-pointer"
              >
                <span>Enter Operator Incident Dashboard</span>
                <ArrowRight className="w-3.5 h-3.5 transform group-hover:translate-x-1 transition-transform text-cyan-300" />
              </button>
            </div>
          </div>

          {/* Scroll down indicator */}
          <button
            type="button"
            onClick={() => scrollToSection('sensor-data')}
            className="absolute bottom-6 sm:bottom-8 flex flex-col items-center gap-2 text-slate-300/70 hover:text-white transition-colors group cursor-pointer"
          >
            <span className="text-[10px] uppercase font-mono tracking-widest">Scroll to explore</span>
            <div className="w-6 h-10 rounded-full border border-white/30 flex items-start justify-center p-1.5 bg-white/5 backdrop-blur-md">
              <div className="w-1.5 h-2.5 rounded-full bg-cyan-300 animate-bounce"></div>
            </div>
          </button>
        </section>

        {/* SECTION 2: SENSOR DATA */}
        <section
          className="min-h-screen flex flex-col justify-center px-4 sm:px-8 lg:px-16 py-24 max-w-7xl mx-auto w-full"
          id="sensor-data"
        >
          <div className="mb-10 text-center md:text-left">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-cyan-500/10 border border-cyan-400/30 text-cyan-300 text-xs font-mono uppercase tracking-wider mb-3">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></span>
              Telemetry Feed • Live Ingest
            </div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white tracking-tight drop-shadow">
              Sensor Data Matrix
            </h2>
            <p className="text-slate-300/80 text-sm sm:text-base max-w-2xl mt-2">
              Continuous planetary monitoring across subterranean acoustic nodes, atmospheric barometric arrays, and deep-sea pressure transducers.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Live Tectonic & Seismic Tremor */}
            <div className="apple-glass-panel rounded-3xl p-6 sm:p-7 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="p-2.5 rounded-2xl bg-cyan-500/15 border border-cyan-400/30 text-cyan-300">
                    <Zap className="w-5 h-5" />
                  </span>
                  <span className="px-2.5 py-1 rounded-full bg-emerald-500/15 border border-emerald-400/30 text-emerald-300 text-[11px] font-mono">
                    STABLE • 0.8 Hz
                  </span>
                </div>
                <h3 className="text-lg font-semibold text-white">Subterranean Seismic</h3>
                <p className="text-xs text-slate-300/75 mt-1">Pacific Rim Fault line deep-strata acoustic arrays</p>

                {/* Live Waveform Graphic */}
                <div className="mt-6 h-20 w-full bg-slate-950/40 rounded-xl border border-white/10 p-2 flex items-center justify-between gap-1 overflow-hidden">
                  <div className="w-1 bg-cyan-400/60 h-4 rounded-full animate-pulse"></div>
                  <div className="w-1 bg-cyan-400/80 h-7 rounded-full animate-pulse" style={{ animationDelay: '100ms' }}></div>
                  <div className="w-1 bg-cyan-300 h-12 rounded-full animate-pulse" style={{ animationDelay: '200ms' }}></div>
                  <div className="w-1 bg-cyan-400/70 h-5 rounded-full animate-pulse" style={{ animationDelay: '300ms' }}></div>
                  <div className="w-1 bg-cyan-400/90 h-10 rounded-full animate-pulse" style={{ animationDelay: '150ms' }}></div>
                  <div className="w-1 bg-cyan-200 h-14 rounded-full animate-pulse" style={{ animationDelay: '250ms' }}></div>
                  <div className="w-1 bg-cyan-400/50 h-3 rounded-full animate-pulse" style={{ animationDelay: '350ms' }}></div>
                  <div className="w-1 bg-cyan-400/80 h-8 rounded-full animate-pulse" style={{ animationDelay: '180ms' }}></div>
                  <div className="w-1 bg-cyan-300 h-11 rounded-full animate-pulse" style={{ animationDelay: '280ms' }}></div>
                  <div className="w-1 bg-cyan-400/60 h-4 rounded-full animate-pulse"></div>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-between text-xs">
                <span className="text-slate-400">Tremor Index</span>
                <span className="font-mono text-cyan-300 font-semibold">0.14 Mms⁻¹</span>
              </div>
            </div>

            {/* Atmospheric Barometric Pressure */}
            <div className="apple-glass-panel rounded-3xl p-6 sm:p-7 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="p-2.5 rounded-2xl bg-indigo-500/15 border border-indigo-400/30 text-indigo-300">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 00-9.78 2.096A4.001 4.001 0 003 15z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
                    </svg>
                  </span>
                  <span className="px-2.5 py-1 rounded-full bg-indigo-500/15 border border-indigo-400/30 text-indigo-300 text-[11px] font-mono">
                    1013.25 hPa
                  </span>
                </div>
                <h3 className="text-lg font-semibold text-white">Atmospheric &amp; Cyclone</h3>
                <p className="text-xs text-slate-300/75 mt-1">Multi-layer tropospheric radar &amp; pressure vortex sync</p>

                <div className="mt-6 p-3 bg-slate-950/40 rounded-xl border border-white/10 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] uppercase font-mono text-slate-400">Isobar Gradient</span>
                    <p className="text-xl font-bold font-mono text-indigo-200 mt-0.5">-0.4 hPa / 30km</p>
                  </div>
                  <div className="h-10 w-10 rounded-full border-2 border-dashed border-indigo-400/50 flex items-center justify-center animate-spin">
                    <div className="w-2 h-2 rounded-full bg-indigo-300"></div>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-between text-xs">
                <span className="text-slate-400">Vortex Inception</span>
                <span className="font-mono text-emerald-300 font-semibold">Low Probability (&lt; 2%)</span>
              </div>
            </div>

            {/* Oceanographic & Hydrological */}
            <div className="apple-glass-panel rounded-3xl p-6 sm:p-7 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="p-2.5 rounded-2xl bg-teal-500/15 border border-teal-400/30 text-teal-300">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
                    </svg>
                  </span>
                  <span className="px-2.5 py-1 rounded-full bg-teal-500/15 border border-teal-400/30 text-teal-300 text-[11px] font-mono">
                    DART-IV ONLINE
                  </span>
                </div>
                <h3 className="text-lg font-semibold text-white">Oceanographic Transducers</h3>
                <p className="text-xs text-slate-300/75 mt-1">Deep-ocean tsunameter buoys with real-time acoustic link</p>

                <div className="mt-6 p-3 bg-slate-950/40 rounded-xl border border-white/10 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] uppercase font-mono text-slate-400">Pelagic Wave Height</span>
                    <p className="text-xl font-bold font-mono text-teal-200 mt-0.5">1.12 m (Nominal)</p>
                  </div>
                  <span className="px-2 py-1 rounded bg-teal-500/20 text-teal-300 font-mono text-[10px]">Δ 0.02m</span>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-between text-xs">
                <span className="text-slate-400">Active Oceanic Beacons</span>
                <span className="font-mono text-teal-300 font-semibold">348 Deep Sensors</span>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 3: PREDICTIVE AI */}
        <section
          className="min-h-screen flex flex-col justify-center px-4 sm:px-8 lg:px-16 py-24 max-w-7xl mx-auto w-full"
          id="predictive-ai"
        >
          <div className="mb-10 text-center md:text-left">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-amber-500/10 border border-amber-400/30 text-amber-300 text-xs font-mono uppercase tracking-wider mb-3">
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse"></span>
              Neural Inferences • 99.4% Confidence
            </div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white tracking-tight drop-shadow">
              Predictive AI Forecasting
            </h2>
            <p className="text-slate-300/80 text-sm sm:text-base max-w-2xl mt-2">
              Deep probabilistic machine learning models calculating catastrophe trajectories up to 72 hours prior to physical event onset.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
            {/* Big Neural Simulation Radar Card */}
            <div className="lg:col-span-8 apple-glass-panel rounded-3xl p-6 sm:p-8 flex flex-col justify-between">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-white/10">
                <div>
                  <span className="text-xs font-mono uppercase tracking-wider text-slate-400">Forecast Engine</span>
                  <h3 className="text-xl font-bold text-white mt-1">Multi-Modal Catastrophe Projection</h3>
                </div>
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 rounded-full bg-white/10 border border-white/20 text-xs font-mono text-slate-200">
                    Horizon: +72h
                  </span>
                  <span className="px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/40 text-xs font-mono text-emerald-300">
                    Sync: 12ms
                  </span>
                </div>
              </div>

              <div className="my-6 p-6 rounded-2xl bg-black/30 border border-white/10 relative overflow-hidden">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
                  <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                    <span className="text-xs font-mono text-slate-400 uppercase">Seismic Likelihood</span>
                    <p className="text-2xl sm:text-3xl font-bold text-cyan-300 font-mono mt-1">0.6%</p>
                    <span className="text-[10px] text-emerald-400">Within baseline limit</span>
                  </div>
                  <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                    <span className="text-xs font-mono text-slate-400 uppercase">Cyclone Formation</span>
                    <p className="text-2xl sm:text-3xl font-bold text-amber-300 font-mono mt-1">1.2%</p>
                    <span className="text-[10px] text-emerald-400">Sub-tropical dispersion</span>
                  </div>
                  <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                    <span className="text-xs font-mono text-slate-400 uppercase">Flash Flood Vector</span>
                    <p className="text-2xl sm:text-3xl font-bold text-rose-300 font-mono mt-1">0.4%</p>
                    <span className="text-[10px] text-emerald-400">Catchment cleared</span>
                  </div>
                </div>

                <div className="mt-4 text-xs font-mono text-slate-300/80 flex items-center justify-between border-t border-white/10 pt-3">
                  <span>Model Architecture: NEXUS-ProbNet v4.8</span>
                  <span className="text-cyan-300">Weights: 175B Parameters</span>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs text-slate-300/80">
                <span>Early Warning Margin: <strong className="text-white">+38 Minutes Lead Time</strong> vs Legacy Systems</span>
                <span className="text-emerald-300 font-mono">Continuous Training Active</span>
              </div>
            </div>

            {/* Confidence Metrics */}
            <div className="lg:col-span-4 flex flex-col gap-6">
              <div className="apple-glass-panel rounded-3xl p-6 flex-1 flex flex-col justify-between">
                <div>
                  <span className="text-xs font-mono uppercase tracking-wider text-slate-400">Model Accuracy</span>
                  <div className="text-4xl font-extrabold text-white font-mono mt-2">99.4%</div>
                  <p className="text-xs text-slate-300/80 mt-2">
                    Validated across 14,200 simulated historical extreme meteorological incidents.
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between text-xs">
                  <span className="text-slate-400">False Positive Rate</span>
                  <span className="text-emerald-300 font-mono font-medium">0.03%</span>
                </div>
              </div>

              <div className="apple-glass-panel rounded-3xl p-6 flex-1 flex flex-col justify-between">
                <div>
                  <span className="text-xs font-mono uppercase tracking-wider text-slate-400">Tsunami ETA Simulation</span>
                  <div className="text-3xl font-extrabold text-cyan-200 font-mono mt-2">00:00:00</div>
                  <p className="text-xs text-slate-300/80 mt-2">Zero anomalous oceanic displacement vectors currently detected.</p>
                </div>
                <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between text-xs">
                  <span className="text-slate-400">Monitoring Sector</span>
                  <span className="text-cyan-300 font-mono font-medium">Global Oceanic 360°</span>
                </div>
              </div>
            </div>
          </div>

          {/* Embedded Disaster ML Prediction & Physics Simulator Hub */}
          <div className="mt-12 w-full">
            <DisasterMLPredictorPanel standalone={true} />
          </div>
        </section>

        {/* SECTION 4: EMERGENCY GRID */}
        <section
          className="min-h-screen flex flex-col justify-center px-4 sm:px-8 lg:px-16 py-24 max-w-7xl mx-auto w-full"
          id="emergency-grid"
        >
          <div className="mb-10 text-center md:text-left">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-rose-500/10 border border-rose-400/30 text-rose-300 text-xs font-mono uppercase tracking-wider mb-3">
              <span className="w-2 h-2 rounded-full bg-rose-400 animate-pulse"></span>
              Emergency Dispatch • Decentralized Mesh
            </div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white tracking-tight drop-shadow">
              Emergency Response Grid
            </h2>
            <p className="text-slate-300/80 text-sm sm:text-base max-w-2xl mt-2">
              Automated civil protection relay with instant corridor evacuation routing, decentralized drone dispatch, and satellite mesh communication.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="apple-glass-panel rounded-3xl p-6 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="p-2 rounded-xl bg-rose-500/20 text-rose-300 border border-rose-400/30">
                    <Zap className="w-5 h-5" />
                  </span>
                  <span className="font-mono text-xs text-emerald-300">0 ACTIVE</span>
                </div>
                <h3 className="text-base font-semibold text-white">Critical Alert Zones</h3>
                <p className="text-xs text-slate-300/80 mt-1">Real-time localized quarantine &amp; danger zones auto-demarcated by threat AI.</p>
              </div>
              <div className="mt-6 pt-4 border-t border-white/10 text-xs text-slate-300/80 flex justify-between">
                <span>Zones Clear</span>
                <span className="font-mono text-white">100% Secure</span>
              </div>
            </div>

            <div className="apple-glass-panel rounded-3xl p-6 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="p-2 rounded-xl bg-cyan-500/20 text-cyan-300 border border-cyan-400/30">
                    <ArrowRight className="w-5 h-5" />
                  </span>
                  <span className="font-mono text-xs text-cyan-300">1.8s LATENCY</span>
                </div>
                <h3 className="text-base font-semibold text-white">Evacuation Corridors</h3>
                <p className="text-xs text-slate-300/80 mt-1">Autonomous civilian guidance routing avoiding structural stress bottlenecks.</p>
              </div>
              <div className="mt-6 pt-4 border-t border-white/10 text-xs text-slate-300/80 flex justify-between">
                <span>Route Readiness</span>
                <span className="font-mono text-white">Optimal</span>
              </div>
            </div>

            <div className="apple-glass-panel rounded-3xl p-6 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="p-2 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-400/30">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
                    </svg>
                  </span>
                  <span className="font-mono text-xs text-amber-300">STANDBY</span>
                </div>
                <h3 className="text-base font-semibold text-white">Resource Allocation</h3>
                <p className="text-xs text-slate-300/80 mt-1">Predictive supply chain pre-positioning medical &amp; rescue assets 24h ahead.</p>
              </div>
              <div className="mt-6 pt-4 border-t border-white/10 text-xs text-slate-300/80 flex justify-between">
                <span>Logistics Pods</span>
                <span className="font-mono text-white">9,840 Units</span>
              </div>
            </div>

            <div className="apple-glass-panel rounded-3xl p-6 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="p-2 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
                    </svg>
                  </span>
                  <span className="font-mono text-xs text-emerald-300">ENCRYPTED</span>
                </div>
                <h3 className="text-base font-semibold text-white">Rescue Mesh Relay</h3>
                <p className="text-xs text-slate-300/80 mt-1">Cellular blackout fallback using low-earth orbit laser inter-satellite links.</p>
              </div>
              <div className="mt-6 pt-4 border-t border-white/10 text-xs text-slate-300/80 flex justify-between">
                <span>Uptime Rating</span>
                <span className="font-mono text-white">99.999%</span>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 5: GLOBAL TELEMETRICS */}
        <section
          className="min-h-screen flex flex-col justify-center px-4 sm:px-8 lg:px-16 py-24 max-w-7xl mx-auto w-full"
          id="global-telemetrics"
        >
          <div className="mb-10 text-center md:text-left">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-indigo-500/10 border border-indigo-400/30 text-indigo-300 text-xs font-mono uppercase tracking-wider mb-3">
              <span className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse"></span>
              Orbital Constellation • Synchronized
            </div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white tracking-tight drop-shadow">
              Global Telemetrics
            </h2>
            <p className="text-slate-300/80 text-sm sm:text-base max-w-2xl mt-2">
              Real-time planetary sensor health monitoring 1,420 autonomous orbital and terrestrial telemetry nodes.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="apple-glass-panel rounded-3xl p-7 flex flex-col justify-between">
              <div>
                <span className="text-xs font-mono uppercase tracking-wider text-slate-400">Orbital Constellation</span>
                <h3 className="text-2xl font-bold text-white mt-1">LEO Downlink 48-SAT</h3>
                <p className="text-xs text-slate-300/80 mt-2">
                  Continuously acquiring multi-spectral thermal infrared and synthetic aperture radar (SAR) passes.
                </p>
                <div className="mt-6 space-y-3 font-mono text-xs">
                  <div className="p-3 rounded-xl bg-black/30 border border-white/10 flex justify-between items-center">
                    <span className="text-slate-400">Geomagnetic Flux (Kp)</span>
                    <span className="text-emerald-300 font-semibold">1.2 (Quiet)</span>
                  </div>
                  <div className="p-3 rounded-xl bg-black/30 border border-white/10 flex justify-between items-center">
                    <span className="text-slate-400">SAR Refresh Latency</span>
                    <span className="text-cyan-300 font-semibold">4.2 min</span>
                  </div>
                </div>
              </div>
              <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-between text-xs">
                <span className="text-slate-400">Downlink Lock</span>
                <span className="text-emerald-300 font-mono font-medium">Locked 100%</span>
              </div>
            </div>

            <div className="apple-glass-panel rounded-3xl p-7 flex flex-col justify-between">
              <div>
                <span className="text-xs font-mono uppercase tracking-wider text-slate-400">Planetary Mesh</span>
                <h3 className="text-2xl font-bold text-white mt-1">1,420 Active Nodes</h3>
                <p className="text-xs text-slate-300/80 mt-2">Autonomous surface beacons, mountain relay repeaters, oceanic buoys.</p>
                <div className="mt-6 space-y-3 font-mono text-xs">
                  <div className="p-3 rounded-xl bg-black/30 border border-white/10 flex justify-between items-center">
                    <span className="text-slate-400">Online &amp; Pingable</span>
                    <span className="text-emerald-300 font-semibold">1,418 (99.85%)</span>
                  </div>
                  <div className="p-3 rounded-xl bg-black/30 border border-white/10 flex justify-between items-center">
                    <span className="text-slate-400">Global Ping RTT</span>
                    <span className="text-amber-300 font-semibold">18.4 ms</span>
                  </div>
                </div>
              </div>
              <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-between text-xs">
                <span className="text-slate-400">Maintenance Queue</span>
                <span className="text-slate-300 font-mono">2 Nodes Scheduled</span>
              </div>
            </div>

            <div className="apple-glass-panel rounded-3xl p-7 flex flex-col justify-between">
              <div>
                <span className="text-xs font-mono uppercase tracking-wider text-slate-400">Audit Trail</span>
                <h3 className="text-2xl font-bold text-white mt-1">Live Telemetry Log</h3>
                <p className="text-xs text-slate-300/80 mt-2">Immutable cryptographic log of automated sensory alerts and telemetry pulses.</p>
                <div className="mt-6 space-y-2.5 font-mono text-[11px]">
                  <div className="p-2.5 rounded-lg bg-black/20 border border-white/5 flex items-start gap-2">
                    <span className="text-emerald-400 mt-0.5">●</span>
                    <div className="flex-1">
                      <div className="text-slate-200">Orbital telemetry handshake verified</div>
                      <div className="text-[10px] text-slate-400">T-00:01:24 • SAT-44 LEO</div>
                    </div>
                  </div>
                  <div className="p-2.5 rounded-lg bg-black/20 border border-white/5 flex items-start gap-2">
                    <span className="text-cyan-400 mt-0.5">●</span>
                    <div className="flex-1">
                      <div className="text-slate-200">Sub-surface tremor scan cycle normal</div>
                      <div className="text-[10px] text-slate-400">T-00:03:10 • PACIFIC-NODE-88</div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-between text-xs">
                <span className="text-slate-400">Log Hash</span>
                <span className="text-slate-400 font-mono text-[10px]">0x8f2d...b14e</span>
              </div>
            </div>
          </div>

          <footer className="mt-20 pt-8 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
            <div className="flex items-center gap-2">
              <span className="font-bold tracking-widest text-white">NEXUS</span>
              <span>— Planetary Disaster Prediction &amp; Management System</span>
            </div>
            <div className="flex items-center gap-6 font-mono text-[11px]">
              <button
                type="button"
                onClick={() => scrollToSection('hero')}
                className="hover:text-white transition-colors cursor-pointer"
              >
                Return to Top ↑
              </button>
              <span>Engineered in 36 Hours</span>
            </div>
          </footer>
        </section>
      </div>
    </div>
  );
};
