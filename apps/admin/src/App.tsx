import { useState } from 'react';
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

  // Show login screen until authenticated
  if (!role) {
    return <LoginScreen onLogin={(r) => setRole(r)} />;
  }

  const handleNavigate = (newView: 'dashboard' | 'form' | 'tickets' | 'scan') => {
    if (newView === 'form' && role !== 'manager') return;
    if (newView === 'form') setEditingMovie(null);
    setSelectedMovie(null);
    setView(newView);
  };

  const handleMovieClick = (movie: ApiMovie) => {
    setSelectedMovie(movie);
    setView('detail');
  };

  const handleEditFromDetail = () => {
    if (role !== 'manager' || !selectedMovie) return;
    setEditingMovie(selectedMovie);
    setView('form');
  };

  return (
    <div className="min-h-screen font-sans selection:bg-[#DDBD68] selection:text-black">
      <Navbar
        currentView={view === 'detail' ? 'dashboard' : view}
        onNavigate={handleNavigate}
        role={role}
        onLogout={() => { setRole(null); setView('dashboard'); setSelectedMovie(null); }}
      />
      <main>
        {view === 'dashboard' && (
          <Dashboard onMovieClick={handleMovieClick} />
        )}
        {view === 'detail' && selectedMovie && (
          <main className="relative flex flex-col px-4 py-8 sm:px-10 sm:py-12 lg:px-16 lg:py-14 mx-auto w-[calc(100%-2rem)] sm:w-full max-w-6xl mt-24 mb-8 bg-[#0C0C0C]/75 backdrop-blur-sm rounded-2xl border border-white/[0.06] shadow-[0_20px_80px_rgba(0,0,0,0.5)]">
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
              onBack={() => { setSelectedMovie(null); setView('dashboard'); }}
            />
          </main>
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
