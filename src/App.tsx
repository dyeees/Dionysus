import { useState } from 'react'
import { Navbar } from './components/Navbar'
import { MovieGrid } from './components/MovieGrid'
import { CinemaGrid } from './components/CinemaGrid'
import { NOW_SHOWING, COMING_SOON, CINEMAS } from './data'
import './App.css'

const TABS = ['Now Showing', 'Coming Soon', 'Cinemas']

function App() {
  const [activeTab, setActiveTab] = useState('Now Showing')

  return (
    <div className="min-h-screen text-white">
      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} tabs={TABS} />

      {/* Main Content Area */}
      <main className="relative flex flex-col p-12 sm:p-16 lg:p-20 mx-24 md:mx-48 lg:mx-68 my-8 bg-[#0C0C0C]/80 rounded-3xl">        
        {/* Fading Border Overlay */}
        <div 
          className="absolute inset-0 pointer-events-none border-y-[2px] border-[#DDBD68] rounded-3xl opacity-50"
          style={{
            maskImage: 'linear-gradient(to right, transparent, black 5%, black 95%, transparent)',
            WebkitMaskImage: 'linear-gradient(to right, transparent, black 5%, black 95%, transparent)'
          }}
        />
        
        {/* Conditional Content Rendering */}
        {activeTab === 'Now Showing' && <MovieGrid movies={NOW_SHOWING} />}
        {activeTab === 'Coming Soon' && <MovieGrid movies={COMING_SOON} />}
        {activeTab === 'Cinemas' && <CinemaGrid cinemas={CINEMAS} />}
      </main>
    </div>
  )
}

export default App
