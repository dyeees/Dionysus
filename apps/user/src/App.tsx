import { useState, useEffect } from 'react'
import { Navbar } from './components/Navbar'
import { MovieGrid } from './components/MovieGrid'
import { MovieDetails } from './components/MovieDetails'
import { SeatSelection } from './components/SeatSelection'
import { MyTickets } from './components/MyTickets'
import { Login } from './components/auth/Login'
import { Signup } from './components/auth/Signup'
import { auth } from './firebase'
import { onAuthStateChanged, signOut } from 'firebase/auth'
import type { User } from 'firebase/auth'
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
  const [showProfile, setShowProfile] = useState(false)
  const [authView, setAuthView] = useState<'none' | 'login' | 'signup'>(() => {
    if (window.location.hash === '#profile') return 'none'
    if (window.location.hash === '#login') return 'login'
    if (window.location.hash === '#signup') return 'signup'
    return 'none'
  })
  
  const [nowShowing, setNowShowing] = useState<Movie[]>([])
  const [comingSoon, setComingSoon] = useState<Movie[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [currentUser, setCurrentUser] = useState<User | null>(null)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user && user.emailVerified) {
        setCurrentUser(user)
      } else {
        setCurrentUser(null)
      }
    })
    return () => unsubscribe()
  }, [])

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

  // View derivation: 'auth' | 'profile' | 'grid' | 'details' | 'seats'
  const view = authView !== 'none' ? 'auth' : showProfile ? 'profile' : !selectedMovie ? 'grid' : !bookingInfo ? 'details' : 'seats'

  useEffect(() => {
    const handlePopState = (e: PopStateEvent) => {
      const state = e.state || {}
      if (state.login || window.location.hash === '#login') {
        setAuthView('login')
        setShowProfile(false)
      } else if (state.signup || window.location.hash === '#signup') {
        setAuthView('signup')
        setShowProfile(false)
      } else if (state.profile || window.location.hash === '#profile') {
        setShowProfile(true)
        setAuthView('none')
      } else if (state.payment) {
        // handled by SeatSelection
      } else if (state.seats) {
        // handled by SeatSelection
      } else if (state.movieId) {
        setBookingInfo(null)
        setShowProfile(false)
        setAuthView('none')
      } else {
        setBookingInfo(null)
        setSelectedMovie(null)
        setShowProfile(false)
        setAuthView('none')
      }
    }
    window.addEventListener('popstate', handlePopState)
    if (window.location.hash === '#login') {
      setAuthView('login')
    } else if (window.location.hash === '#signup') {
      setAuthView('signup')
    } else if (window.location.hash === '#profile') {
      setShowProfile(true)
    }
    return () => window.removeEventListener('popstate', handlePopState)
  }, [])

  const handleMovieClick = (movie: Movie) => {
    window.history.pushState({ movieId: movie.id }, '', `#${movie.id}`)
    setSelectedMovie(movie)
    setBookingInfo(null)
    setShowProfile(false)
    setAuthView('none')
  }

  const handleProfileClick = () => {
    window.history.pushState({ profile: true }, '', '#profile')
    setShowProfile(true)
    setSelectedMovie(null)
    setBookingInfo(null)
    setAuthView('none')
  }

  const handleLoginClick = () => {
    window.history.pushState({ login: true }, '', '#login')
    setAuthView('login')
    setShowProfile(false)
    setSelectedMovie(null)
    setBookingInfo(null)
  }

  const handleSignupClick = () => {
    window.history.pushState({ signup: true }, '', '#signup')
    setAuthView('signup')
    setShowProfile(false)
    setSelectedMovie(null)
    setBookingInfo(null)
  }

  const handleBackFromAuth = () => {
    window.history.pushState({}, '', '/')
    setAuthView('none')
    setShowProfile(false)
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

  const handleLogout = async () => {
    try {
      await signOut(auth)
      setAuthView('none')
      setShowProfile(false)
      window.history.pushState({}, '', '/')
    } catch (error) {
      console.error('Error logging out:', error)
    }
  }

  return (
    <div className="min-h-screen text-[#DDBD68]">
      <Navbar
        activeTab={activeTab}
        setActiveTab={(tab) => {
          setActiveTab(tab)
          setSelectedMovie(null)
          setBookingInfo(null)
          setShowProfile(false)
          setAuthView('none')
        }}
        tabs={TABS}
        hideIndicator={!!selectedMovie || authView !== 'none' || showProfile}
        onLoginClick={handleLoginClick}
        onLogout={handleLogout}
        onProfileClick={handleProfileClick}
        hideNavElements={authView !== 'none'}
        currentUser={currentUser}
      />

      {/* Main Content Area */}
      <main className="relative flex flex-col px-4 py-8 sm:px-10 sm:py-12 lg:px-16 lg:py-14 mx-auto w-[calc(100%-2rem)] sm:w-full max-w-6xl my-4 sm:my-8 bg-[#0C0C0C]/75 backdrop-blur-sm rounded-2xl border border-white/[0.06] shadow-[0_20px_80px_rgba(0,0,0,0.5)]">
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

        {view === 'profile' && <MyTickets />}

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

        {view === 'auth' && authView === 'login' && (
          <Login onBack={handleBackFromAuth} onNavigateToSignup={handleSignupClick} />
        )}

        {view === 'auth' && authView === 'signup' && (
          <Signup onBack={handleBackFromAuth} onNavigateToLogin={handleLoginClick} />
        )}
      </main>
    </div>
  )
}

export default App
