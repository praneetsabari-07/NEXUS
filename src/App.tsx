import React, { useState, useEffect } from 'react';
import { AppView, UserProfile } from './types';
import { supabaseService } from './services/supabase';
import { HomePage } from './components/HomePage';
import { SignInPage } from './components/SignInPage';
import { DashboardPage } from './components/DashboardPage';

export default function App() {
  const [currentView, setCurrentView] = useState<AppView>('home');
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);

  // Check for existing user session on mount
  useEffect(() => {
    const active = supabaseService.getActiveUser();
    if (active) {
      setCurrentUser(active);
    }
  }, []);

  const handleSignInSuccess = (user: UserProfile) => {
    setCurrentUser(user);
    setCurrentView('dashboard');
  };

  const handleLogout = () => {
    supabaseService.logoutUser();
    setCurrentUser(null);
    setCurrentView('home');
  };

  const handleNavigate = (view: AppView) => {
    if (view === 'dashboard' && !currentUser) {
      // If user hasn't logged in yet, prompt them to sign in
      setCurrentView('auth');
    } else {
      setCurrentView(view);
    }
  };

  return (
    <div className="min-h-screen bg-[#060a12] text-slate-100 font-sans selection:bg-cyan-500/30 selection:text-white">
      {currentView === 'home' && (
        <HomePage onNavigate={handleNavigate} currentUser={currentUser} />
      )}

      {currentView === 'auth' && (
        <SignInPage
          onSuccess={handleSignInSuccess}
          onBackToOverview={() => setCurrentView('home')}
        />
      )}

      {currentView === 'dashboard' && currentUser && (
        <DashboardPage
          currentUser={currentUser}
          onNavigate={handleNavigate}
          onLogout={handleLogout}
        />
      )}
    </div>
  );
}
