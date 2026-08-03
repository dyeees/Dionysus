import { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { MovieForm } from './components/MovieForm';
import { Dashboard } from './components/Dashboard';
import { AdminMovieDetail } from './components/AdminMovieDetail';
import { LoginScreen } from './components/LoginScreen';
import type { ApiMovie } from './api';

import { TicketList } from './components/TicketList';
import { TicketScanner } from './components/TicketScanner';

export type Role = 'staff' | 'manager';

function App() {
  const [role, setRole] = useState<Role | null>(null);
  const [view, setView] = useState<'dashboard' | 'detail' | 'form' | 'tickets' | 'scan'>('dashboard');
  const [selectedMovie, setSelectedMovie] = useState<ApiMovie | null>(null);
  const [editingMovie, setEditingMovie] = useState<ApiMovie | null>(null);

  // Initialize base history state if missing
  useEffect(() => {
    if (role && !window.history.state) {
      window.history.replaceState({ view: 'dashboard' }, '');
    }
  }, [role]);

  // Handle popstate for browser back/forward buttons
  useEffect(() => {
    const handlePopState = (e: PopStateEvent) => {
      const state = e.state;
      if (state) {
        setView(state.view || 'dashboard');
        setSelectedMovie(state.movie || null);
        setEditingMovie(state.editingMovie || null);
      }
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Show login screen until authenticated
  if (!role) {
    return <LoginScreen onLogin={(r) => setRole(r)} />;
  }

  const handleNavigate = (newView: 'dashboard' | 'form' | 'tickets' | 'scan') => {
    if (newView === 'form' && role !== 'manager') return;
    if (newView === 'form') setEditingMovie(null);
    setSelectedMovie(null);
    setView(newView);
    window.history.pushState({ view: newView, movie: null, editingMovie: null }, '');
  };

  const handleMovieClick = (movie: ApiMovie) => {
    setSelectedMovie(movie);
    setView('detail');
    window.history.pushState({ view: 'detail', movie, editingMovie: null }, '');
  };

  const handleEditFromDetail = () => {
    if (role !== 'manager' || !selectedMovie) return;
    setEditingMovie(selectedMovie);
    setView('form');
    window.history.pushState({ view: 'form', movie: selectedMovie, editingMovie: selectedMovie }, '');
  };

  return (
    <div className="min-h-screen flex flex-col font-sans selection:bg-[#DDBD68] selection:text-black">
      <Navbar
        currentView={view === 'detail' ? 'dashboard' : view}
        onNavigate={handleNavigate}
        role={role}
        onLogout={() => { 
          setRole(null); 
          setView('dashboard'); 
          setSelectedMovie(null);
          window.history.replaceState(null, '');
        }}
      />
      <main className="flex flex-col">
        {view === 'dashboard' && (
          <Dashboard onMovieClick={handleMovieClick} />
        )}
        {view === 'detail' && selectedMovie && (
          <div className="relative flex flex-col px-4 py-8 sm:px-10 sm:py-12 lg:px-16 lg:py-14 mx-auto w-[calc(100%-2rem)] sm:w-full max-w-6xl mt-24 mb-4 bg-[#0C0C0C]/75 backdrop-blur-sm rounded-2xl border border-white/[0.06] shadow-[0_20px_80px_rgba(0,0,0,0.5)]">
            <div
              className="absolute inset-0 pointer-events-none border-y-[2px] border-[#DDBD68] rounded-2xl opacity-40"
              style={{
                maskImage: 'linear-gradient(to right, transparent, black 12%, black 88%, transparent)',
                WebkitMaskImage: 'linear-gradient(to right, transparent, black 12%, black 88%, transparent)',
              }}
            />
            <AdminMovieDetail
              movie={selectedMovie}
              role={role}
              onEdit={handleEditFromDetail}
              onSaved={(updatedMovie) => setSelectedMovie(updatedMovie)}
            />
          </div>
        )}
        {view === 'form' && role === 'manager' && (
          <MovieForm
            initialData={editingMovie}
            onSaved={() => handleNavigate('dashboard')}
          />
        )}
        {view === 'tickets' && <TicketList />}
        {view === 'scan' && <TicketScanner />}
      </main>
    </div>
  );
}

export default App;
