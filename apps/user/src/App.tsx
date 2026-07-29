import { useState, useEffect } from 'react'
import { Navbar } from './components/Navbar'
import { MovieGrid } from './components/MovieGrid'
import { MovieDetails } from './components/MovieDetails'
import { SeatSelection } from './components/SeatSelection'
import { Login } from './components/Login'
import { fetchMovies, fetchComingSoon, type ApiMovie as Movie, type ShowtimeDate } from './api'
import './App.css'

const TABS = ['NOW SHOWING', 'COMING SOON']

interface BookingInfo {
  dateObj: ShowtimeDate;
  time: string;
}

function App() {
  const [activeTab, setActiveTab] = useState('NOW SHOWING')
  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null)
  const [bookingInfo, setBookingInfo] = useState<BookingInfo | null>(null)
  const [isLoginVisible, setIsLoginVisible] = useState(() => window.location.hash === '#login')
  
  const [nowShowing, setNowShowing] = useState<Movie[]>([])
  const [comingSoon, setComingSoon] = useState<Movie[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const loadData = async () => {
      try {
        const [nowShowingData, comingSoonData] = await Promise.all([
          fetchMovies(),
          fetchComingSoon()
        ])
        setNowShowing(nowShowingData)
        setComingSoon(comingSoonData)
      } catch (error) {
        console.error('Failed to fetch movies:', error)
      } finally {
        setIsLoading(false)
      }
    }
    loadData()
  }, [])

  // View derivation: 'login' | 'grid' | 'details' | 'seats'
  const view = isLoginVisible ? 'login' : !selectedMovie ? 'grid' : !bookingInfo ? 'details' : 'seats'

  useEffect(() => {
    const handlePopState = (e: PopStateEvent) => {
      const state = e.state || {}
      if (state.login || window.location.hash === '#login') {
        setIsLoginVisible(true)
      } else if (state.payment) {
        // handled by SeatSelection
      } else if (state.seats) {
        // handled by SeatSelection
      } else if (state.movieId) {
        setBookingInfo(null)
        setIsLoginVisible(false)
      } else {
        setBookingInfo(null)
        setSelectedMovie(null)
        setIsLoginVisible(false)
      }
    }
    window.addEventListener('popstate', handlePopState)
    if (window.location.hash === '#login') {
      setIsLoginVisible(true)
    }
    return () => window.removeEventListener('popstate', handlePopState)
  }, [])

  const handleMovieClick = (movie: Movie) => {
    window.history.pushState({ movieId: movie.id }, '', `#${movie.id}`)
    setSelectedMovie(movie)
    setBookingInfo(null)
    setIsLoginVisible(false)
  }

  const handleLoginClick = () => {
    window.history.pushState({ login: true }, '', '#login')
    setIsLoginVisible(true)
    setSelectedMovie(null)
    setBookingInfo(null)
  }

  const handleBackFromLogin = () => {
    window.history.pushState({}, '', '/')
    setIsLoginVisible(false)
  }

  const handleTimeSelect = (dateObj: ShowtimeDate, time: string) => {
    window.history.pushState({ seats: true }, '', `#seats`)
    setBookingInfo({ dateObj, time })
  }

  // Called after confirmed booking — go all the way back to grid
  const handleBackFromSeats = () => {
    setBookingInfo(null)
    setSelectedMovie(null)
  }


  return (
    <div className="min-h-screen text-[#DDBD68]">
      <Navbar
        activeTab={activeTab}
        setActiveTab={(tab) => {
          setActiveTab(tab)
          setSelectedMovie(null)
          setBookingInfo(null)
          setIsLoginVisible(false)
        }}
        tabs={TABS}
        hideIndicator={!!selectedMovie || isLoginVisible}
        onLoginClick={handleLoginClick}
        hideNavElements={isLoginVisible}
      />

      {/* Main Content Area */}
      <main className="relative flex flex-col px-6 py-10 sm:px-10 sm:py-12 lg:px-16 lg:py-14 mx-auto w-full max-w-6xl my-8 bg-[#0C0C0C]/75 backdrop-blur-sm rounded-2xl border border-white/[0.06] shadow-[0_20px_80px_rgba(0,0,0,0.5)]">
        {/* Fading Border Overlay */}
        <div
          className="absolute inset-0 pointer-events-none border-y-[2px] border-[#DDBD68] rounded-2xl opacity-40"
          style={{
            maskImage: 'linear-gradient(to right, transparent, black 12%, black 88%, transparent)',
            WebkitMaskImage: 'linear-gradient(to right, transparent, black 12%, black 88%, transparent)',
          }}
        />

        {/* Content */}
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#DDBD68]"></div>
          </div>
        ) : view === 'grid' && (
          <>
            {activeTab === 'NOW SHOWING' && <MovieGrid movies={nowShowing} onMovieClick={handleMovieClick} />}
            {activeTab === 'COMING SOON' && <MovieGrid movies={comingSoon} onMovieClick={handleMovieClick} />}
          </>
        )}

        {view === 'details' && selectedMovie && (
          <MovieDetails
            movie={selectedMovie}
            onTimeSelect={handleTimeSelect}
          />
        )}

        {view === 'seats' && selectedMovie && bookingInfo && (
          <SeatSelection
            movie={selectedMovie}
            dateObj={bookingInfo.dateObj}
            time={bookingInfo.time}
            onBack={handleBackFromSeats}
          />
        )}

        {view === 'login' && (
          <Login onBack={handleBackFromLogin} />
        )}
      </main>
    </div>
  )
}

export default App
