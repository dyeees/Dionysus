import { useState, useRef, useEffect } from 'react'

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  tabs: string[];
  hideIndicator?: boolean;
}

export function Navbar({ activeTab, setActiveTab, tabs, hideIndicator }: NavbarProps) {
  const tabsRef = useRef<(HTMLButtonElement | null)[]>([])
  const [lineStyle, setLineStyle] = useState({ left: 0, width: 0 })

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
    <nav className="relative flex items-center justify-between px-8 sm:px-12 lg:px-20 py-4 bg-[#0A0A0A]/95 backdrop-blur-md border-b border-white/5">
      {/* Fading gold border bottom */}
      <div
        className="absolute bottom-0 left-0 right-0 h-[1px] pointer-events-none"
        style={{
          background: 'linear-gradient(to right, transparent, rgba(221,189,104,0.6) 20%, rgba(221,189,104,0.6) 80%, transparent)',
        }}
      />

      {/* Logo */}
      <div
        className="text-shimmer text-xl sm:text-2xl font-black tracking-[0.25em] uppercase relative z-10 select-none"
        style={{ fontFamily: "'Cinzel', serif" }}
      >
        Dionysus
      </div>

      {/* Tabs */}
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

      {/* Right actions */}
      <div className="flex items-center gap-3 relative z-10">
        <button
          className="p-2 text-[#DDBD68]/50 hover:text-[#DDBD68] hover:bg-white/5 rounded-full transition-all duration-200 cursor-pointer"
          aria-label="Search"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </button>
        <button
          className="relative overflow-hidden border border-[#DDBD68]/40 text-[#DDBD68] hover:text-[#0C0C0C] px-5 py-1.5 rounded-full font-semibold uppercase tracking-widest text-xs transition-all duration-300 cursor-pointer group"
        >
          <span className="relative z-10 transition-colors duration-300">Login</span>
          <span className="absolute inset-0 bg-gradient-to-r from-[#DDBD68] via-[#FCEEAA] to-[#DDBD68] translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out" />
        </button>
      </div>
    </nav>
  )
}
