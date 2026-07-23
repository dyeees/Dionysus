import type { Movie } from '../data'

interface MovieGridProps {
  movies: Movie[];
  onMovieClick?: (movie: Movie) => void;
}

export function MovieGrid({ movies, onMovieClick }: MovieGridProps) {
  return (
    <div className="w-full grid justify-center gap-4 sm:gap-8 grid-cols-2 md:grid-cols-3 lg:grid-cols-4 relative z-10">
      {movies.map((movie) => (
        <div 
          key={movie.id} 
          onClick={() => onMovieClick?.(movie)}
          className="w-full group relative rounded-2xl overflow-hidden cursor-pointer shadow-[0_8px_30px_rgb(0,0,0,0.5)] border border-white/10 hover:border-[#DDBD68] hover:shadow-[0_0_30px_rgba(221,189,104,0.4)] transition-all duration-300"
        >
          <div className="aspect-[2/3] w-full">
            <img 
              src={movie.img} 
              alt={movie.title} 
              className="w-full h-full object-cover group-hover:brightness-110 transition-all duration-300"
            />
          </div>
        </div>
      ))}
    </div>
  )
}
