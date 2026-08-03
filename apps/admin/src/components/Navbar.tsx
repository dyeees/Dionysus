import { Film, LayoutDashboard, PlusCircle, Ticket, ScanLine, LogOut, ShieldCheck, User } from 'lucide-react';
import type { Role } from '../App';

interface NavbarProps {
  currentView: 'dashboard' | 'form' | 'tickets' | 'scan';
  onNavigate: (view: 'dashboard' | 'form' | 'tickets' | 'scan') => void;
  role: Role;
  onLogout: () => void;
}

const ALL_NAV_ITEMS = [
  { id: 'dashboard' as const, label: 'Dashboard', Icon: LayoutDashboard, managerOnly: false },
  { id: 'tickets' as const, label: 'Tickets', Icon: Ticket, managerOnly: false },
  { id: 'scan' as const, label: 'Scan', Icon: ScanLine, managerOnly: false },
  { id: 'form' as const, label: 'Add Movie', Icon: PlusCircle, managerOnly: true },
];

export function Navbar({ currentView, onNavigate, role, onLogout }: NavbarProps) {
  const visibleItems = ALL_NAV_ITEMS.filter((item) => !item.managerOnly || role === 'manager');

  return (
    <nav className="fixed top-0 w-full z-50 bg-[#0A0A0A] backdrop-blur-xl border-b border-white/[0.06]">
      {/* Glowing gold bottom border */}
      <div
        className="absolute bottom-0 left-0 right-0 h-[1px] pointer-events-none"
        style={{
          background: 'linear-gradient(to right, transparent, rgba(221,189,104,0.5) 20%, rgba(221,189,104,0.5) 80%, transparent)',
        }}
      />

      <div className="max-w-7xl mx-auto px-6 lg:px-10">
        <div className="flex items-center justify-between h-20">

          {/* Logo */}
          <div
            className="flex items-center gap-3 cursor-pointer group"
            onClick={() => onNavigate('dashboard')}
          >
            <div className="relative">
              <Film className="w-7 h-7 text-[#DDBD68] group-hover:scale-110 transition-transform duration-300" />
              <div className="absolute inset-0 bg-[#DDBD68]/20 rounded-full blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </div>
            <div className="flex flex-col leading-none">
              <span className="text-shimmer font-serif text-xl font-black tracking-[0.25em] uppercase">
                Dionysus
              </span>
              <span className="text-[#DDBD68]/40 text-[9px] tracking-[0.4em] uppercase font-medium mt-0.5">
                Administration
              </span>
            </div>
          </div>

          {/* Right side: Nav Items + role badge + logout */}
          <div className="flex items-center gap-3">
            {/* Nav Items */}
            <div className="flex items-center gap-1">
              {visibleItems.map(({ id, label, Icon }) => (
                <button
                  key={id}
                  onClick={() => onNavigate(id)}
                  className={`relative flex items-center gap-2 px-4 py-2 rounded-lg text-xs tracking-widest font-semibold uppercase transition-all duration-300 cursor-pointer ${
                    currentView === id
                      ? 'text-[#0C0C0C] bg-gradient-to-r from-[#DDBD68] via-[#FCEEAA] to-[#DDBD68] shadow-[0_0_20px_rgba(221,189,104,0.35)]'
                      : 'text-[#DDBD68]/50 hover:text-[#DDBD68] hover:bg-white/[0.04]'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">{label}</span>
                </button>
              ))}
            </div>

            {/* Divider */}
            <div className="w-px h-6 bg-white/10" />

            {/* Role badge */}
            <div
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] tracking-widest uppercase font-semibold"
              style={{
                background: role === 'manager'
                  ? 'rgba(221,189,104,0.12)'
                  : 'rgba(120,160,255,0.08)',
                border: role === 'manager'
                  ? '1px solid rgba(221,189,104,0.25)'
                  : '1px solid rgba(120,160,255,0.2)',
                color: role === 'manager' ? '#DDBD68' : 'rgba(160,190,255,0.75)',
              }}
            >
              {role === 'manager'
                ? <ShieldCheck className="w-3 h-3" />
                : <User className="w-3 h-3" />
              }
              <span className="hidden sm:inline">{role}</span>
            </div>

            {/* Logout */}
            <button
              onClick={onLogout}
              title="Sign out"
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs tracking-widest font-semibold uppercase text-red-400/60 hover:text-red-400 hover:bg-red-400/[0.08] transition-all duration-300 cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>

        </div>
      </div>
    </nav>
  );
}
