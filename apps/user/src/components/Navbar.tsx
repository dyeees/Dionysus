import { useState, useRef, useEffect } from 'react'
import type { User } from 'firebase/auth'
import { Moon, Sun } from 'lucide-react'

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  tabs: string[];
  hideIndicator?: boolean;
  onLoginClick?: () => void;
  onLogout?: () => void;
  onTicketsClick?: () => void;
  hideNavElements?: boolean;
  currentUser?: User | null;
}

export function Navbar({ activeTab, setActiveTab, tabs, hideIndicator, onLoginClick, onLogout, onTicketsClick, hideNavElements, currentUser }: NavbarProps) {
  const tabsRef = useRef<(HTMLButtonElement | null)[]>([])
  const [lineStyle, setLineStyle] = useState({ left: 0, width: 0 })
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [isDarkMode, setIsDarkMode] = useState(true)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  useEffect(() => {
    const updateLine = () => {
      const activeIndex = tabs.indexOf(activeTab)
      const activeEl = tabsRef.current[activeIndex]
      if (activeEl) {
        setLineStyle({
          left: activeEl.offsetLeft,
          width: activeEl.offsetWidth,
        })
      }
    }
    setTimeout(updateLine, 50)
    window.addEventListener('resize', updateLine)
    return () => window.removeEventListener('resize', updateLine)
  }, [activeTab, tabs])

  return (
    <nav className="fixed top-0 w-full z-50 bg-[#0A0A0A]/95 backdrop-blur-xl border-b border-white/[0.06]">
      {/* Fading gold border bottom */}
      <div
        className="absolute bottom-0 left-0 right-0 h-[1px] pointer-events-none"
        style={{
          background: 'linear-gradient(to right, transparent, rgba(221,189,104,0.6) 20%, rgba(221,189,104,0.6) 80%, transparent)',
        }}
      />

      <div className="max-w-screen-2xl mx-auto px-4 sm:px-8 md:px-12 lg:px-20">
        <div className="flex items-center justify-between h-20">
          
          {/* Logo */}
          <div
            className="text-shimmer text-xl sm:text-2xl font-black tracking-[0.25em] uppercase select-none cursor-pointer"
            style={{ fontFamily: "'Cinzel', serif" }}
            onClick={() => {
              setActiveTab(tabs[0]);
              if (onLoginClick) {
                 window.history.pushState({}, '', '/');
                 window.dispatchEvent(new PopStateEvent('popstate'));
              }
            }}
          >
            Dionysus
          </div>

          {/* Center: Tabs */}
          <div className={`absolute left-1/2 -translate-x-1/2 flex items-center justify-center ${hideNavElements ? 'opacity-0 pointer-events-none' : ''}`}>
            <div className="hidden sm:flex relative gap-1 z-10 bg-white/[0.04] rounded-full px-1 py-1 border border-white/[0.07]">
              {tabs.map((tab, i) => (
                <button
                  key={tab}
                  ref={(el) => { tabsRef.current[i] = el; }}
                  onClick={() => setActiveTab(tab)}
                  className={`relative z-10 transition-all duration-300 cursor-pointer px-4 lg:px-5 py-1.5 rounded-full text-[10px] lg:text-xs tracking-[0.15em] font-semibold uppercase ${
                    !hideIndicator && activeTab === tab
                      ? 'text-[#0C0C0C]'
                      : 'text-[#DDBD68]/60 hover:text-[#DDBD68]'
                  }`}
                  style={{ fontFamily: "'Inter', sans-serif" }}
                >
                  {tab}
                </button>
              ))}
              {/* Sliding pill */}
              {!hideIndicator && (
                <div
                  className="absolute top-1 bottom-1 rounded-full bg-gradient-to-r from-[#DDBD68] via-[#FCEEAA] to-[#DDBD68] transition-all duration-300 ease-out pointer-events-none"
                  style={{ left: `${lineStyle.left}px`, width: `${lineStyle.width}px` }}
                />
              )}
            </div>
          </div>

          {/* Right actions */}
          <div className={`flex items-center gap-4 sm:gap-6 relative z-50 ${hideNavElements ? 'opacity-0 pointer-events-none' : ''}`}>
            
            <button
              onClick={() => setIsDarkMode(!isDarkMode)}
              className="relative px-3 h-8 rounded-lg border border-[#DDBD68]/30 hover:border-[#DDBD68] flex items-center justify-center gap-2 text-[#DDBD68] transition-all duration-300 overflow-hidden group shadow-[0_0_15px_rgba(221,189,104,0.05)]"
              title="Toggle theme (Decorative)"
            >
              {/* Subtle hover background */}
              <div className="absolute inset-0 bg-[#DDBD68]/0 group-hover:bg-[#DDBD68]/10 transition-colors duration-300" />
              
              {/* Rotating Icon Container */}
              <div 
                className={`relative z-10 flex items-center justify-center transition-transform duration-700 ease-[cubic-bezier(0.34,1.56,0.64,1)] ${isDarkMode ? 'rotate-0' : 'rotate-[360deg]'}`}
              >
                {isDarkMode ? (
                  <Moon className="w-3.5 h-3.5" strokeWidth={2.5} />
                ) : (
                  <Sun className="w-3.5 h-3.5" strokeWidth={2.5} />
                )}
              </div>
              
              {/* Text Label */}
              <span className="relative z-10 text-[10px] tracking-[0.2em] font-semibold uppercase whitespace-nowrap hidden sm:block leading-none -mt-[1px]">
                {isDarkMode ? 'Dark Mode' : 'Light Mode'}
              </span>
            </button>
            
            {currentUser ? (
                <div className="relative" ref={dropdownRef}>
                  <div 
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    className={`relative overflow-hidden border border-[#DDBD68]/40 px-4 h-8 rounded-lg flex items-center justify-center font-bold text-xs tracking-widest uppercase cursor-pointer group transition-all duration-300 ${isDropdownOpen ? 'text-[#0C0C0C]' : 'text-[#DDBD68] hover:text-[#0C0C0C]'}`}
                  >
                    <span className="relative z-10 transition-colors duration-300">
                      {currentUser.displayName ? currentUser.displayName.split(' ')[0] : currentUser.email?.split('@')[0]}
                    </span>
                    <span className={`absolute inset-0 bg-gradient-to-r from-[#DDBD68] via-[#FCEEAA] to-[#DDBD68] transition-transform duration-300 ease-out ${isDropdownOpen ? 'translate-y-0' : 'translate-y-full group-hover:translate-y-0'}`} />
                  </div>
                  
                  {isDropdownOpen && (
                    <div className="absolute right-0 mt-4 w-40 bg-[#0C0C0C]/95 backdrop-blur-xl border border-white/[0.08] rounded-xl shadow-[0_10px_40px_rgba(0,0,0,0.8)] overflow-hidden z-[9999]">
                      <button
                        onClick={() => {
                          setIsDropdownOpen(false)
                          onTicketsClick?.()
                        }}
                        className="w-full text-left px-5 py-3 text-xs tracking-widest uppercase text-[#DDBD68] hover:bg-white/[0.06] transition-colors cursor-pointer font-semibold border-b border-white/[0.06]"
                      >
                        My Tickets
                      </button>
                      <button
                        onClick={() => {
                          setIsDropdownOpen(false)
                          onLogout?.()
                        }}
                        className="w-full text-left px-5 py-3 text-xs tracking-widest uppercase text-red-400 hover:bg-white/[0.06] transition-colors cursor-pointer font-semibold"
                      >
                        Logout
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <button
                  onClick={onLoginClick}
                  className="relative overflow-hidden border border-[#DDBD68]/40 text-[#DDBD68] hover:text-[#0C0C0C] px-5 py-1.5 rounded-full font-semibold uppercase tracking-widest text-xs transition-all duration-300 cursor-pointer group"
                >
                  <span className="relative z-10 transition-colors duration-300">Login</span>
                  <span className="absolute inset-0 bg-gradient-to-r from-[#DDBD68] via-[#FCEEAA] to-[#DDBD68] translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out" />
                </button>
              )}
            </div>
        </div>
      </div>
    </nav>
  )
}
