import { useState } from 'react';
import { Navbar } from './components/Navbar';
import { MovieForm } from './components/MovieForm';
import { Dashboard } from './components/Dashboard';
import type { ApiMovie } from './api';

function App() {
  const [view, setView] = useState<'dashboard' | 'form'>('dashboard');
  const [editingMovie, setEditingMovie] = useState<ApiMovie | null>(null);

  const handleNavigate = (newView: 'dashboard' | 'form') => {
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
    <div className="min-h-screen bg-[#0A0A0A] font-sans selection:bg-[#DDBD68] selection:text-black">
      <Navbar currentView={view} onNavigate={handleNavigate} />
      <main>
        {view === 'dashboard' ? (
          <Dashboard onEditMovie={handleEditMovie} />
        ) : (
          <MovieForm 
            initialData={editingMovie} 
            onSaved={() => handleNavigate('dashboard')} 
          />
        )}
      </main>
    </div>
  );
}

export default App;
