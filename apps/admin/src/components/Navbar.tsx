import { Film, LayoutDashboard, PlusCircle } from 'lucide-react';

interface NavbarProps {
  currentView: 'dashboard' | 'form';
  onNavigate: (view: 'dashboard' | 'form') => void;
}

export function Navbar({ currentView, onNavigate }: NavbarProps) {
  return (
    <nav className="fixed top-0 w-full z-50 bg-[#0A0A0A]/80 backdrop-blur-md border-b border-white/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => onNavigate('dashboard')}>
            <Film className="w-8 h-8 text-[#DDBD68]" />
            <span className="font-serif text-2xl font-bold tracking-widest text-white">
              DIONYSUS <span className="text-white/30 text-sm align-top ml-1">ADMIN</span>
            </span>
          </div>
          <div className="flex items-center space-x-2 sm:space-x-8">
            <button 
              onClick={() => onNavigate('dashboard')}
              className={`flex items-center gap-2 text-xs sm:text-sm tracking-widest transition-colors duration-300 font-medium ${currentView === 'dashboard' ? 'text-[#DDBD68]' : 'text-white/40 hover:text-white'}`}
            >
              <LayoutDashboard className="w-4 h-4 hidden sm:block" />
              DASHBOARD
            </button>
            <button 
              onClick={() => onNavigate('form')}
              className={`flex items-center gap-2 text-xs sm:text-sm tracking-widest transition-colors duration-300 font-medium ${currentView === 'form' ? 'text-[#DDBD68]' : 'text-white/40 hover:text-white'}`}
            >
              <PlusCircle className="w-4 h-4 hidden sm:block" />
              ADD MOVIE
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
