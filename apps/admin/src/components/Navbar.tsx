import { Film } from 'lucide-react';

export function Navbar() {
  return (
    <nav className="fixed top-0 w-full z-50 bg-[#0A0A0A]/80 backdrop-blur-md border-b border-white/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          <div className="flex items-center gap-3">
            <Film className="w-8 h-8 text-[#DDBD68]" />
            <span className="font-serif text-2xl font-bold tracking-widest text-white">
              DIONYSUS <span className="text-white/30 text-sm align-top ml-1">ADMIN</span>
            </span>
          </div>
          <div className="hidden md:flex items-center space-x-8">
            <a href="#" className="text-[#DDBD68] text-sm tracking-widest hover:text-white transition-colors duration-300">
              ADD MOVIE
            </a>
          </div>
        </div>
      </div>
    </nav>
  );
}
