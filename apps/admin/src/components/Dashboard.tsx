import { useState, useEffect } from 'react';
import { fetchAllMovies, type ApiMovie } from '../api';
import { Loader2, Clock, Calendar } from 'lucide-react';

export function Dashboard({ onMovieClick }: { onMovieClick: (movie: ApiMovie) => void }) {
  const [movies, setMovies] = useState<ApiMovie[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchAllMovies().then((data) => {
      setMovies(data);
      setIsLoading(false);
    });
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 text-[#DDBD68] animate-spin" />
      </div>
    );
  }

  const nowShowing = movies.filter(m => m.status === 'now_showing');
  const comingSoon = movies.filter(m => m.status === 'coming_soon');

  return (
    <div className="max-w-7xl mx-auto pt-32 pb-20 px-6 animate-fade-in">

      {/* Page Header */}
      <div className="mb-12 flex items-end justify-between">
        <div>
          <h1 className="font-serif text-3xl sm:text-4xl font-black text-[#DDBD68] tracking-[0.15em] uppercase">
            Movie Database
          </h1>
          <p className="text-white/30 tracking-[0.3em] text-[10px] uppercase mt-2 font-medium">
            {movies.length} titles · {nowShowing.length} showing · {comingSoon.length} coming soon
          </p>
        </div>
        {/* Decorative fading line */}
        <div className="hidden md:block flex-1 h-px mx-8 bg-gradient-to-r from-[#DDBD68]/20 to-transparent" />
      </div>

      {movies.length === 0 ? (
        <div className="text-center bg-[#111]/80 border border-white/5 p-16 rounded-2xl backdrop-blur-sm">
          <p className="text-white/30 tracking-widest text-sm">No movies found in the database.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {movies.map(movie => (
            <div
              key={movie.id}
              onClick={() => onMovieClick(movie)}
              className="relative bg-[#0E0E0E] border border-white/[0.06] rounded-2xl overflow-hidden hover:border-[#DDBD68]/30 transition-all duration-500 group flex flex-col shadow-[0_4px_30px_rgba(0,0,0,0.5)] hover:shadow-[0_16px_48px_rgba(0,0,0,0.8),0_0_30px_rgba(221,189,104,0.1)] cursor-pointer"
            >
              {/* Poster */}
              <div className="aspect-[2/3] w-full relative overflow-hidden">
                <img
                  src={movie.img}
                  alt={movie.title}
                  className="w-full h-full object-cover"
                />
                {/* Gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#0E0E0E] via-[#0E0E0E]/20 to-transparent" />
                {/* Gold & silver hover tint */}
                <div
                  className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-400 pointer-events-none"
                  style={{ background: 'linear-gradient(160deg, rgba(221,189,104,0.25) 0%, rgba(192,192,210,0.15) 60%, transparent 100%)' }}
                />

                {/* Status badge */}
                <div className="absolute top-3 left-3">
                  <span className={`flex items-center gap-1.5 text-[9px] uppercase tracking-[0.2em] font-bold px-2.5 py-1.5 rounded-full backdrop-blur-md border ${
                    movie.status === 'now_showing'
                      ? 'bg-[#DDBD68]/90 text-[#0C0C0C] border-[#DDBD68]/50'
                      : 'bg-black/60 text-[#DDBD68]/80 border-white/10'
                  }`}>
                    {movie.status === 'now_showing' ? (
                      <><span className="w-1 h-1 rounded-full bg-current animate-pulse inline-block" />Now Showing</>
                    ) : (
                      <><Clock className="w-2.5 h-2.5" />Coming Soon</>
                    )}
                  </span>
                </div>
              </div>

              {/* Card Body */}
              <div className="p-4 flex-1 flex flex-col justify-between gap-3">
                <div>
                  <h3 className="text-sm font-serif font-bold text-[#DDBD68] truncate tracking-wide leading-snug">
                    {movie.title}
                  </h3>
                  <div className="flex items-center gap-1.5 text-white/30 text-[10px] tracking-widest mt-1 uppercase">
                    <Calendar className="w-3 h-3" />
                    <span>{movie.showtimes?.length || 0} Showings Set</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
