import { useState, useRef, useEffect } from 'react'
import type { User } from 'firebase/auth'

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
    <nav className="relative flex flex-wrap md:flex-nowrap items-center justify-between px-4 sm:px-8 md:px-12 lg:px-20 py-3 md:py-4 gap-y-4 bg-[#0A0A0A]/95 backdrop-blur-md border-b border-white/5">
      {/* Fading gold border bottom */}
      <div
        className="absolute bottom-0 left-0 right-0 h-[1px] pointer-events-none"
        style={{
          background: 'linear-gradient(to right, transparent, rgba(221,189,104,0.6) 20%, rgba(221,189,104,0.6) 80%, transparent)',
        }}
      />

      {/* Logo */}
      <div
        className="text-shimmer text-xl sm:text-2xl font-black tracking-[0.25em] uppercase relative z-10 select-none cursor-pointer order-1"
        style={{ fontFamily: "'Cinzel', serif" }}
        onClick={() => {
          setActiveTab(tabs[0]);
          if (onLoginClick) {
             // Just navigating away from login, the App will handle state reset
             window.history.pushState({}, '', '/');
             window.dispatchEvent(new PopStateEvent('popstate'));
          }
        }}
      >
        Dionysus
      </div>

      {/* Tabs */}
      <div className={`order-3 md:order-none w-full md:w-auto relative md:absolute md:left-1/2 md:-translate-x-1/2 flex justify-center mt-2 md:mt-0 ${hideNavElements ? 'opacity-0 pointer-events-none' : ''}`}>
        <div className="relative flex gap-1 z-10 bg-white/[0.04] rounded-full px-1 py-1 border border-white/[0.07]">
        {tabs.map((tab, i) => (
          <button
            key={tab}
            ref={(el) => { tabsRef.current[i] = el; }}
            onClick={() => setActiveTab(tab)}
            className={`relative z-10 transition-all duration-300 cursor-pointer px-5 py-1.5 rounded-full text-xs tracking-[0.15em] font-semibold uppercase ${
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
      <div className={`flex items-center gap-2 sm:gap-3 relative z-10 order-2 md:order-3 ${hideNavElements ? 'opacity-0 pointer-events-none' : ''}`}>
        {currentUser ? (
          <div className="relative" ref={dropdownRef}>
            <div 
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="w-8 h-8 rounded-lg bg-gradient-to-r from-[#DDBD68] to-[#FCEEAA] text-[#0C0C0C] flex items-center justify-center font-bold text-sm uppercase select-none cursor-pointer hover:scale-105 transition-transform"
              title={currentUser.displayName || currentUser.email || ''}
            >
              {currentUser.displayName ? currentUser.displayName.charAt(0) : currentUser.email?.charAt(0)}
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
    </nav>
  )
}
