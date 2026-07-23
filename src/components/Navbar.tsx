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
    
    // Slight delay to ensure fonts/layout are ready
    setTimeout(updateLine, 50)
    
    window.addEventListener('resize', updateLine)
    return () => window.removeEventListener('resize', updateLine)
  }, [activeTab, tabs])

  return (
    <nav className="relative flex items-center justify-between px-24 md:px-48 lg:px-68 py-2 bg-[#0C0C0C] shadow-lg border-y-[4px] border-transparent mt-6">
      {/* Fading Border Overlay */}
      <div 
        className="absolute -inset-y-[4px] inset-x-0 pointer-events-none border-y-[4px] border-double border-[#DDBD68]"
        style={{
          maskImage: 'linear-gradient(to right, transparent, black 5%, black 95%, transparent)',
          WebkitMaskImage: 'linear-gradient(to right, transparent, black 5%, black 95%, transparent)'
        }}
      />

      <div className="text-2xl font-bold tracking-wider text-[#DDBD68] uppercase relative z-10"> 
        Dionysus
      </div>
      
      <div className="relative flex gap-8 text-sm font-medium text-[#DDBD68]/70 uppercase tracking-widest z-10">
        {tabs.map((tab, i) => (
          <button 
            key={tab}
            ref={(el) => { tabsRef.current[i] = el; }}
            onClick={() => setActiveTab(tab)}
            className={`transition-colors cursor-pointer py-1 ${
              !hideIndicator && activeTab === tab 
                ? 'text-[#DDBD68]' 
                : 'text-[#DDBD68]/70 hover:text-[#DDBD68]'
            }`}
          >
            {tab}
          </button>
        ))}
        {/* Sliding Underline */}
        <div 
          className={`absolute bottom-0 h-[2px] bg-[#DDBD68] transition-all duration-300 ease-out ${hideIndicator ? 'opacity-0' : 'opacity-100'}`}
          style={{ left: `${lineStyle.left}px`, width: `${lineStyle.width}px` }}
        />
      </div>

      <div className="flex items-center gap-4 relative z-10">
        <button className="p-2 hover:bg-white/5 rounded-full transition-colors cursor-pointer">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-[#DDBD68]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </button>
        <button className="border border-[#DDBD68] text-[#DDBD68] hover:bg-[#DDBD68] hover:text-[#0C0C0C] px-5 py-2 rounded-md font-medium uppercase tracking-wider text-xs transition-colors cursor-pointer">
          Login
        </button>
      </div>
    </nav>
  )
}
