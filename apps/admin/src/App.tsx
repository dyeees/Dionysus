import { useState } from 'react';
import { Navbar } from './components/Navbar';
import { MovieForm } from './components/MovieForm';
import { Dashboard } from './components/Dashboard';
import type { ApiMovie } from './api';

import { TicketList } from './components/TicketList';
import { TicketScanner } from './components/TicketScanner';

function App() {
  const [view, setView] = useState<'dashboard' | 'form' | 'tickets' | 'scan'>('dashboard');
  const [editingMovie, setEditingMovie] = useState<ApiMovie | null>(null);

  const handleNavigate = (newView: 'dashboard' | 'form' | 'tickets' | 'scan') => {
    if (newView === 'form') {
      setEditingMovie(null); // Clear form when explicitly clicking Add Movie
    }
    setView(newView);
  };

  const handleEditMovie = (movie: ApiMovie) => {
    setEditingMovie(movie);
    setView('form');
  };

  return (
    <div className="min-h-screen font-sans selection:bg-[#DDBD68] selection:text-black">
      <Navbar currentView={view} onNavigate={handleNavigate} />
      <main>
        {view === 'dashboard' && <Dashboard onEditMovie={handleEditMovie} />}
        {view === 'form' && (
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
