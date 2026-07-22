import './App.css'

function App() {
  return (
    <div className="min-h-screen text-white">
      {/* Navigation Bar */}
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
        <div className="flex gap-8 text-sm font-medium text-[#DDBD68]/70 uppercase tracking-widest relative z-10">
          <a href="#" className="text-[#DDBD68] underline decoration-2 underline-offset-4">Now Showing</a>
          <a href="#" className="hover:text-[#DDBD68] transition-colors">Coming Soon</a>
          <a href="#" className="hover:text-[#DDBD68] transition-colors">Cinemas</a>
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
        {/* Movies Container */}
        <div className="w-full grid justify-center gap-4 sm:gap-8 grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          
          {/* Movie Card 1 */}
          <div className="w-full group relative rounded-2xl overflow-hidden cursor-pointer shadow-[0_8px_30px_rgb(0,0,0,0.5)] border border-white/10 hover:border-[#DDBD68] hover:shadow-[0_0_30px_rgba(221,189,104,0.4)] transition-all duration-300">
            <div className="aspect-[2/3] w-full">
              <img 
                src="/images/sci_fi_movie_poster_1784678342992.png" 
                alt="Neon Horizon" 
                className="w-full h-full object-cover group-hover:brightness-110 transition-all duration-300"
              />
            </div>
          </div>

          {/* Movie Card 2 */}
          <div className="w-full group relative rounded-2xl overflow-hidden cursor-pointer shadow-[0_8px_30px_rgb(0,0,0,0.5)] border border-white/10 hover:border-[#DDBD68] hover:shadow-[0_0_30px_rgba(221,189,104,0.4)] transition-all duration-300">
            <div className="aspect-[2/3] w-full">
              <img 
                src="/images/fantasy_movie_poster_1784678352631.png" 
                alt="Blade of Aether" 
                className="w-full h-full object-cover group-hover:brightness-110 transition-all duration-300"
              />
            </div>
          </div>

          {/* Movie Card 3 */}
          <div className="w-full group relative rounded-2xl overflow-hidden cursor-pointer shadow-[0_8px_30px_rgb(0,0,0,0.5)] border border-white/10 hover:border-[#DDBD68] hover:shadow-[0_0_30px_rgba(221,189,104,0.4)] transition-all duration-300">
            <div className="aspect-[2/3] w-full">
              <img 
                src="/images/action_movie_poster_1784678361087.png" 
                alt="Extraction Point" 
                className="w-full h-full object-cover group-hover:brightness-110 transition-all duration-300"
              />
            </div>
          </div>

          {/* Movie Card 4 */}
          <div className="w-full group relative rounded-2xl overflow-hidden cursor-pointer shadow-[0_8px_30px_rgb(0,0,0,0.5)] border border-white/10 hover:border-[#DDBD68] hover:shadow-[0_0_30px_rgba(221,189,104,0.4)] transition-all duration-300">
            <div className="aspect-[2/3] w-full">
              <img 
                src="/images/horror_movie_poster_1784679040189.png" 
                alt="Horror Movie" 
                className="w-full h-full object-cover group-hover:brightness-110 transition-all duration-300"
              />
            </div>
          </div>

          {/* Movie Card 5 */}
          <div className="w-full group relative rounded-2xl overflow-hidden cursor-pointer shadow-[0_8px_30px_rgb(0,0,0,0.5)] border border-white/10 hover:border-[#DDBD68] hover:shadow-[0_0_30px_rgba(221,189,104,0.4)] transition-all duration-300">
            <div className="aspect-[2/3] w-full">
              <img 
                src="/images/comedy_movie_poster_1784679050150.png" 
                alt="Comedy Movie" 
                className="w-full h-full object-cover group-hover:brightness-110 transition-all duration-300"
              />
            </div>
          </div>

          {/* Movie Card 6 */}
          <div className="w-full group relative rounded-2xl overflow-hidden cursor-pointer shadow-[0_8px_30px_rgb(0,0,0,0.5)] border border-white/10 hover:border-[#DDBD68] hover:shadow-[0_0_30px_rgba(221,189,104,0.4)] transition-all duration-300">
            <div className="aspect-[2/3] w-full">
              <img 
                src="/images/romance_movie_poster_1784679058597.png" 
                alt="Romance Movie" 
                className="w-full h-full object-cover group-hover:brightness-110 transition-all duration-300"
              />
            </div>
          </div>

          {/* Movie Card 7 */}
          <div className="w-full group relative rounded-2xl overflow-hidden cursor-pointer shadow-[0_8px_30px_rgb(0,0,0,0.5)] border border-white/10 hover:border-[#DDBD68] hover:shadow-[0_0_30px_rgba(221,189,104,0.4)] transition-all duration-300">
            <div className="aspect-[2/3] w-full">
              <img 
                src="/images/superhero_movie_poster_1784682091775.png" 
                alt="Superhero Movie" 
                className="w-full h-full object-cover group-hover:brightness-110 transition-all duration-300"
              />
            </div>
          </div>

          {/* Movie Card 8 */}
          <div className="w-full group relative rounded-2xl overflow-hidden cursor-pointer shadow-[0_8px_30px_rgb(0,0,0,0.5)] border border-white/10 hover:border-[#DDBD68] hover:shadow-[0_0_30px_rgba(221,189,104,0.4)] transition-all duration-300">
            <div className="aspect-[2/3] w-full">
              <img 
                src="/images/animation_movie_poster_1784683337920.png" 
                alt="Animation Movie" 
                className="w-full h-full object-cover group-hover:brightness-110 transition-all duration-300"
              />
            </div>
          </div>

          {/* Movie Card 9 */}
          <div className="w-full group relative rounded-2xl overflow-hidden cursor-pointer shadow-[0_8px_30px_rgb(0,0,0,0.5)] border border-white/10 hover:border-[#DDBD68] hover:shadow-[0_0_30px_rgba(221,189,104,0.4)] transition-all duration-300">
            <div className="aspect-[2/3] w-full">
              <img 
                src="/images/thriller_movie_poster_1784683348023.png" 
                alt="Thriller Movie" 
                className="w-full h-full object-cover group-hover:brightness-110 transition-all duration-300"
              />
            </div>
          </div>

        </div>
      </main>
    </div>
  )
}

export default App
