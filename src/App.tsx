import { useState } from 'react'
import { Navbar } from './components/Navbar'
import { MovieGrid } from './components/MovieGrid'
import { MovieDetails } from './components/MovieDetails'
import { NOW_SHOWING, COMING_SOON, type Movie } from './data'
import './App.css'

const TABS = ['NOW SHOWING', 'COMING SOON']

function App() {
  const [activeTab, setActiveTab] = useState('NOW SHOWING')
  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null)
  return (
    <div className="min-h-screen text-white">
      <Navbar 
        activeTab={activeTab} 
        setActiveTab={(tab) => {
          setActiveTab(tab)
          setSelectedMovie(null)
        }} 
        tabs={TABS} 
        hideIndicator={!!selectedMovie}
      />

      {/* Main Content Area */}
      <main className="relative flex flex-col p-12 sm:p-16 lg:p-20 mx-24 md:mx-48 lg:mx-68 my-8 bg-[#0C0C0C]/80 rounded-3xl">        
        {/* Fading Border Overlay */}
        <div 
          className="absolute inset-0 pointer-events-none border-y-[2px] border-[#DDBD68] rounded-3xl opacity-50"
          style={{
            maskImage: 'linear-gradient(to right, transparent, black 15%, black 85%, transparent)',
            WebkitMaskImage: 'linear-gradient(to right, transparent, black 15%, black 85%, transparent)'
          }}
        />
        
        {/* Conditional Content Rendering */}
        {!selectedMovie ? (
          <>
            {activeTab === 'NOW SHOWING' && <MovieGrid movies={NOW_SHOWING} onMovieClick={setSelectedMovie} />}
            {activeTab === 'COMING SOON' && <MovieGrid movies={COMING_SOON} onMovieClick={setSelectedMovie} />}
          </>
        ) : (
          <MovieDetails movie={selectedMovie} onBack={() => setSelectedMovie(null)} />
        )}
      </main>
    </div>
  )
}

export default App
