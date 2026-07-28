import type { ApiMovie as Movie } from '../api'

interface MovieGridProps {
  movies: Movie[];
  onMovieClick?: (movie: Movie) => void;
}

export function MovieGrid({ movies, onMovieClick }: MovieGridProps) {
  if (movies.length === 0) {
    return (
      <div className="w-full flex justify-center items-center py-24 text-[#DDBD68]/50 tracking-widest text-sm" style={{ fontFamily: "'Cinzel', serif" }}>
        no movies available
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="w-full grid justify-center gap-4 sm:gap-6 grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 relative z-10">
        {movies.map((movie, i) => (
          <div
            key={movie.id}
            onClick={() => onMovieClick?.(movie)}
            className="animate-fade-up group relative rounded-xl overflow-hidden cursor-pointer shadow-[0_8px_32px_rgba(0,0,0,0.6)] border border-white/[0.07] hover:border-[#DDBD68]/50 hover:shadow-[0_0_40px_rgba(221,189,104,0.25)] transition-all duration-400"
            style={{ animationDelay: `${i * 55}ms` }}
          >
            {/* Poster */}
            <div className="aspect-[2/3] w-full bg-[#111]">
              <img
                src={movie.img}
                alt={movie.title}
                className="w-full h-full object-cover transition-transform duration-500 ease-out"
              />
            </div>

            {/* Gradient overlay + title */}
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-3">
              <p
                className="text-[#FCEEAA] text-xs font-bold tracking-wider uppercase leading-tight line-clamp-2"
                style={{ fontFamily: "'Cinzel', serif" }}
              >
                {movie.title}
              </p>
              {movie.runtime && (
                <p className="text-[#DDBD68]/60 text-[10px] mt-1 tracking-widest">{movie.runtime}</p>
              )}
              <div className="mt-2 flex items-center gap-1 text-[#FCEEAA]/70">
                <svg className="w-3 h-3 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-[10px] tracking-widest font-medium">View Details</span>
              </div>
            </div>

            {/* Corner shine */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
          </div>
        ))}
      </div>
    </div>
  )
}
