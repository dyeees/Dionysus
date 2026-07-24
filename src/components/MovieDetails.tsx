import { useState, useEffect } from 'react';
import type { Movie } from '../data';

interface MovieDetailsProps {
  movie: Movie;
}

export function MovieDetails({ movie }: MovieDetailsProps) {


  const hasShowtimes = movie.showtimes && movie.showtimes.length > 0;

  return (
    <div className="flex flex-col animate-in fade-in duration-500 gap-12">
      
      {/* Top section: Poster + Details */}
      <div className="flex flex-col lg:flex-row gap-12 items-start">
        <div className="w-full lg:w-1/3 max-w-sm mx-auto lg:mx-0 shrink-0">
          <div className="w-full aspect-[2/3] rounded-2xl overflow-hidden shadow-2xl border border-white/10">
            <img src={movie.img} alt={movie.title} className="w-full h-full object-cover" />
          </div>
        </div>
        
        {/* Details section beside poster */}
        <div className="flex-1 w-full flex flex-col gap-4 pt-2">
          <h2 
            className="leading-tight font-black text-[#DDBD68] tracking-wider mb-2"
            style={{ fontSize: 'clamp(1.25rem, 2vw, 2rem)' }}
          >
            {movie.title}
          </h2>
          
          {movie.runtime && (
            <div className="flex flex-col">
              <span className="text-[#FCEEAA] uppercase text-sm tracking-widest font-bold leading-tight">Runtime</span>
              <span className="text-[#DDBD68] font-medium text-base leading-tight">{movie.runtime}</span>
            </div>
          )}

          {movie.synopsis && (
            <div className="flex flex-col gap-1">
              <span className="text-[#FCEEAA] uppercase text-sm tracking-widest font-bold leading-tight">Synopsis</span>
              <p className="text-base text-[#DDBD68] leading-relaxed max-w-3xl">
                {movie.synopsis}
              </p>
            </div>
          )}

          {(movie.director || movie.cast) && (
            <div className="flex flex-col gap-4 mt-6 pt-8 border-t border-white/10">
              {movie.director && (
                <div className="flex flex-col">
                  <span className="text-[#FCEEAA] uppercase text-sm tracking-widest font-bold leading-tight">Director</span>
                  <span className="text-[#DDBD68] font-medium text-base leading-tight">{movie.director}</span>
                </div>
              )}
              {movie.cast && (
                <div className="flex flex-col">
                  <span className="text-[#FCEEAA] uppercase text-sm tracking-widest font-bold leading-tight">Cast</span>
                  <span className="text-[#DDBD68] font-medium text-base leading-tight">{movie.cast}</span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Bottom section: Showtimes */}
      <div className="w-full pt-6 border-t border-white/10">
        <h3 className="text-2xl font-bold mb-4 text-[#DDBD68] tracking-widest">Showtimes</h3>
        
        {hasShowtimes ? (
          <div className="flex flex-col divide-y divide-white/10">
            {movie.showtimes.map((dateObj, idx) => (
              <div key={idx} className="flex flex-wrap gap-4 py-6 first:pt-0 last:pb-0 animate-in fade-in slide-in-from-bottom-4 duration-500">
                {dateObj.times.slice(0, 4).map(time => {
                  const dateText = dateObj.isToday 
                    ? 'TODAY' 
                    : `${dateObj.dayOfWeek} ${dateObj.day} ${dateObj.month}`;
                    
                  return (
                    <button 
                      key={time} 
                      className="w-48 py-2.5 text-center bg-transparent border border-[#DDBD68]/30 hover:border-[#DDBD68] hover:bg-gradient-to-r hover:from-[#DDBD68] hover:via-[#FCEEAA] hover:to-[#DDBD68] hover:text-black text-[#DDBD68] rounded-lg transition-all duration-300 font-bold text-sm whitespace-nowrap"
                    >
                      {dateText} &bull; {time}
                    </button>
                  );
                })}
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white/5 border border-white/10 rounded-2xl p-12 text-center">
            <p className="text-2xl text-[#DDBD68]/50 italic">Showtimes not available yet for this movie.</p>
          </div>
        )}
      </div>
    </div>
  );
}
