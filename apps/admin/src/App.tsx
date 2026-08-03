import { useState } from 'react';
import { Navbar } from './components/Navbar';
import { MovieForm } from './components/MovieForm';
import { Dashboard } from './components/Dashboard';
import { LoginScreen } from './components/LoginScreen';
import type { ApiMovie } from './api';

import { TicketList } from './components/TicketList';
import { TicketScanner } from './components/TicketScanner';

export type Role = 'staff' | 'manager';

function App() {
  const [role, setRole] = useState<Role | null>(null);
  const [view, setView] = useState<'dashboard' | 'form' | 'tickets' | 'scan'>('dashboard');
  const [editingMovie, setEditingMovie] = useState<ApiMovie | null>(null);

  // Show login screen until authenticated
  if (!role) {
    return <LoginScreen onLogin={(r) => setRole(r)} />;
  }

  const handleNavigate = (newView: 'dashboard' | 'form' | 'tickets' | 'scan') => {
    // Managers only can access the form
    if (newView === 'form' && role !== 'manager') return;
    if (newView === 'form') {
      setEditingMovie(null);
    }
    setView(newView);
  };

  const handleEditMovie = (movie: ApiMovie) => {
    if (role !== 'manager') return;
    setEditingMovie(movie);
    setView('form');
  };

  return (
    <div className="min-h-screen font-sans selection:bg-[#DDBD68] selection:text-black">
      <Navbar currentView={view} onNavigate={handleNavigate} role={role} onLogout={() => { setRole(null); setView('dashboard'); }} />
      <main>
        {view === 'dashboard' && <Dashboard onEditMovie={role === 'manager' ? handleEditMovie : undefined} />}
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
