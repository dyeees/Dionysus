import { useState, useEffect } from 'react';
import type { Movie } from '../data';

interface MovieDetailsProps {
  movie: Movie;
  onBack: () => void;
}

export function MovieDetails({ movie, onBack }: MovieDetailsProps) {
  const [selectedDateIndex, setSelectedDateIndex] = useState(0);

  // Reset selected date when movie changes
  useEffect(() => {
    setSelectedDateIndex(0);
  }, [movie.id]);

  const hasShowtimes = movie.showtimes && movie.showtimes.length > 0;

  return (
    <div className="flex flex-col animate-in fade-in duration-500 gap-12 pb-12">
      
      {/* Top section: Poster + Details */}
      <div className="flex flex-col lg:flex-row gap-12 items-start mt-4">
        <div className="w-full lg:w-1/3 max-w-sm mx-auto lg:mx-0 shrink-0">
          <div className="w-full aspect-[2/3] rounded-2xl overflow-hidden shadow-2xl border border-white/10">
            <img src={movie.img} alt={movie.title} className="w-full h-full object-cover" />
          </div>
        </div>
        
        {/* Details section beside poster */}
        <div className="flex-1 w-full flex flex-col gap-6 pt-2">
          <h2 className="text-4xl md:text-6xl font-bold text-[#DDBD68] tracking-wide mb-2">{movie.title}</h2>
          
          {movie.runtime && (
            <div className="flex items-center text-white/70 text-lg uppercase tracking-widest font-medium">
              <span>{movie.runtime}</span>
            </div>
          )}

          {movie.synopsis && (
            <p className="text-lg text-white/80 leading-relaxed max-w-3xl">
              {movie.synopsis}
            </p>
          )}

          {(movie.director || movie.cast) && (
            <div className="flex flex-col gap-4 mt-6 pt-8 border-t border-white/10">
              {movie.director && (
                <div className="flex flex-col sm:flex-row gap-2 sm:gap-6 items-start sm:items-center">
                  <span className="text-[#DDBD68]/70 w-24 uppercase text-sm tracking-widest font-bold">Director</span>
                  <span className="text-white font-medium text-lg">{movie.director}</span>
                </div>
              )}
              {movie.cast && (
                <div className="flex flex-col sm:flex-row gap-2 sm:gap-6 items-start sm:items-center">
                  <span className="text-[#DDBD68]/70 w-24 uppercase text-sm tracking-widest font-bold">Cast</span>
                  <span className="text-white font-medium text-lg leading-relaxed">{movie.cast}</span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Bottom section: Showtimes */}
      <div className="w-full pt-12 border-t border-white/10">
        <h3 className="text-3xl font-bold mb-10 text-white uppercase tracking-widest">Showtimes</h3>
        
        {hasShowtimes ? (
          <div className="flex flex-col gap-4">
            {/* Date Tabs */}
            <div className="flex flex-wrap gap-4 border-b border-white/10 pb-6">
              {movie.showtimes.map((dateObj, idx) => {
                const isActive = selectedDateIndex === idx;
                
                return (
                  <button
                    key={idx}
                    onClick={() => setSelectedDateIndex(idx)}
                    className={`flex flex-col items-center justify-center w-[5.5rem] h-[5.5rem] rounded-xl transition-all duration-300 ${
                      isActive 
                        ? 'bg-[#DDBD68] text-black shadow-[0_0_20px_rgba(221,189,104,0.4)]' 
                        : 'bg-white/5 text-white/70 hover:bg-white/10 hover:text-white border border-white/10'
                    }`}
                  >
                    {dateObj.isToday ? (
                      <span className="font-bold text-lg uppercase tracking-wider">Today</span>
                    ) : (
                      <>
                        <span className="text-[11px] font-bold tracking-widest uppercase">{dateObj.dayOfWeek}</span>
                        <span className="text-2xl font-black my-0.5 leading-none">{dateObj.day}</span>
                        <span className="text-[11px] font-bold tracking-widest uppercase">{dateObj.month}</span>
                      </>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Times for selected date */}
            {movie.showtimes[selectedDateIndex] && (
              <div className="bg-white/5 border border-white/10 rounded-2xl p-6 md:p-8 animate-in fade-in slide-in-from-bottom-4 duration-500 mt-2">
                <div className="flex flex-wrap gap-4">
                  {movie.showtimes[selectedDateIndex].times.map(time => (
                    <button 
                      key={time} 
                      className="px-8 py-4 bg-black/60 border border-[#DDBD68]/30 hover:border-[#DDBD68] hover:bg-[#DDBD68]/20 text-white rounded-xl transition-all duration-300 font-bold text-lg hover:shadow-[0_0_20px_rgba(221,189,104,0.3)] hover:-translate-y-1"
                    >
                      {time}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="bg-white/5 border border-white/10 rounded-2xl p-12 text-center">
            <p className="text-2xl text-white/50 italic">Showtimes not available yet for this movie.</p>
          </div>
        )}
      </div>
    </div>
  );
}
