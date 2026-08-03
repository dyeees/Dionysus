import { useState } from 'react';
import { createPortal } from 'react-dom';
import { Pencil } from 'lucide-react';
import type { ApiMovie } from '../api';
import type { Role } from '../App';

interface AdminMovieDetailProps {
  movie: ApiMovie;
  role: Role;
  onEdit: () => void;
}

function formatTime(time24: string) {
  const [hourStr, minStr] = time24.split(':');
  let hour = parseInt(hourStr, 10);
  const ampm = hour >= 12 ? 'PM' : 'AM';
  hour = hour % 12;
  if (hour === 0) hour = 12;
  return `${hour.toString().padStart(2, '0')}:${minStr} ${ampm}`;
}

function getEmbedUrl(url: string) {
  if (!url) return '';
  const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([^&?]+)/);
  return match ? `https://www.youtube.com/embed/${match[1]}?autoplay=1` : url;
}

const MetaLabel = ({ children }: { children: React.ReactNode }) => (
  <span
    className="text-[#FCEEAA]/50 uppercase text-[10px] tracking-[0.2em] font-semibold block mb-0.5"
    style={{ fontFamily: "'Inter', sans-serif" }}
  >
    {children}
  </span>
);

const MetaValue = ({ children }: { children: React.ReactNode }) => (
  <span className="text-[#FCEEAA] font-medium text-sm leading-snug block">
    {children}
  </span>
);

export function AdminMovieDetail({ movie, role, onEdit }: AdminMovieDetailProps) {
  const [showTrailer, setShowTrailer] = useState(false);
  const hasShowtimes = movie.showtimes && movie.showtimes.length > 0;

  return (
    <div className="flex flex-col gap-10 animate-fade-up">

      {/* Hero — identical to user app */}
      <div className="relative w-full rounded-2xl overflow-hidden" style={{ minHeight: 220 }}>
        {/* Blurred bg */}
        <img
          src={movie.img}
          alt=""
          aria-hidden
          className="absolute inset-0 w-full h-full object-cover scale-110 blur-2xl opacity-30 pointer-events-none"
        />
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#0C0C0C] via-[#0C0C0C]/80 to-transparent pointer-events-none" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0C0C0C] to-transparent pointer-events-none" />

        {/* Content */}
        <div className="relative z-10 flex flex-col sm:flex-row gap-6 p-6 sm:p-8 items-start">
          {/* Poster */}
          <div className="shrink-0 w-28 sm:w-36 aspect-[2/3] rounded-xl overflow-hidden shadow-[0_8px_40px_rgba(0,0,0,0.8)] border border-white/10 ring-1 ring-[#DDBD68]/20">
            <img src={movie.img} alt={movie.title} className="w-full h-full object-cover" />
          </div>

          {/* Text */}
          <div className="flex flex-col justify-end gap-3 pt-2 sm:pt-4">
            <h2
              className="text-[#DDBD68] leading-tight font-black tracking-wider m-0"
              style={{ fontFamily: "'Cinzel', serif", fontSize: 'clamp(1.4rem, 3vw, 2.4rem)' }}
            >
              {movie.title}
            </h2>

            <div className="flex flex-wrap gap-x-6 gap-y-2">
              {movie.runtime && (
                <div>
                  <MetaLabel>Runtime</MetaLabel>
                  <MetaValue>{movie.runtime}</MetaValue>
                </div>
              )}
              {movie.director && (
                <div>
                  <MetaLabel>Director</MetaLabel>
                  <MetaValue>{movie.director}</MetaValue>
                </div>
              )}
            </div>

            <div className="mt-3 flex flex-wrap items-center gap-4">
              {movie.trailerUrl && (
                <button
                  onClick={() => setShowTrailer(true)}
                  className="flex items-center gap-2 bg-[#DDBD68]/10 hover:bg-[#DDBD68]/20 border border-[#DDBD68]/30 hover:border-[#DDBD68]/60 text-[#DDBD68] px-4 py-2 rounded-full text-xs font-bold tracking-widest uppercase transition-all duration-300 cursor-pointer w-max"
                >
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                  Watch Trailer
                </button>
              )}
              
              {role === 'manager' && (
                <button
                  onClick={onEdit}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-full text-xs tracking-widest font-bold uppercase cursor-pointer transition-all duration-300 w-max"
                  style={{
                    background: 'linear-gradient(135deg, #DDBD68 0%, #FCEEAA 50%, #DDBD68 100%)',
                    color: '#0C0C0C',
                    boxShadow: '0 0 24px rgba(221,189,104,0.3)',
                  }}
                >
                  <Pencil className="w-3.5 h-3.5" />
                  Edit Movie
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Details Grid */}
      <div className="flex flex-col gap-6">
        {movie.synopsis && (
          <div className="animate-fade-up animate-fade-up-delay-1">
            <MetaLabel>Synopsis</MetaLabel>
            <p className="text-[#DDBD68]/80 text-sm leading-relaxed max-w-3xl mt-1">
              {movie.synopsis}
            </p>
          </div>
        )}

        {movie.cast && (
          <div className="animate-fade-up animate-fade-up-delay-2">
            <MetaLabel>Cast</MetaLabel>
            <div className="flex flex-wrap gap-2 mt-1.5">
              {movie.cast.split(',').map((name) => (
                <span
                  key={name}
                  className="text-xs text-[#FCEEAA]/80 bg-[#DDBD68]/10 border border-[#DDBD68]/15 rounded-full px-3 py-1 tracking-wide"
                >
                  {name.trim()}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      <div
        className="h-px w-full"
        style={{ background: 'linear-gradient(to right, transparent, rgba(221,189,104,0.3) 30%, rgba(221,189,104,0.3) 70%, transparent)' }}
      />

      {/* Showtimes — read-only */}
      <div className="animate-fade-up animate-fade-up-delay-3">
        <h3
          className="text-[#FCEEAA] text-xs uppercase tracking-[0.25em] font-semibold mb-5"
          style={{ fontFamily: "'Inter', sans-serif" }}
        >
          Scheduled Showtimes
        </h3>

        {hasShowtimes ? (
          <div className="flex gap-6 overflow-x-auto pb-4 w-full scrollbar-thin">
            {movie.showtimes.map((dateObj, idx) => {
              const today = new Date();
              today.setHours(0, 0, 0, 0);
              
              let isToday = dateObj.isToday;
              let month = dateObj.month;
              let day = dateObj.day;
              let dayOfWeek = dateObj.dayOfWeek;

              if (month === undefined && dateObj.date) {
                const parts = dateObj.date.split('-');
                const dObj = parts.length === 3
                  ? new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]))
                  : new Date(dateObj.date);
                if (!isNaN(dObj.getTime())) {
                  isToday = dObj.toDateString() === today.toDateString();
                  month = dObj.toLocaleString('default', { month: 'short' }).toUpperCase();
                  day = dObj.getDate().toString().padStart(2, '0');
                  dayOfWeek = dObj.toLocaleString('default', { weekday: 'short' }).toUpperCase();
                }
              }

              const todayDayName = ['SUN','MON','TUE','WED','THU','FRI','SAT'][today.getDay()];
              const topLine = isToday ? 'TODAY' : (month && day ? `${month} ${day}` : dateObj.date);
              const bottomLine = isToday ? todayDayName : dayOfWeek;

              return (
              <div key={idx} className="flex flex-col gap-2.5 w-[140px] shrink-0">
                <div className="text-center">
                  <p
                    className="text-[#FCEEAA] font-bold text-xs tracking-widest uppercase leading-tight"
                    style={{ fontFamily: "'Cinzel', serif" }}
                  >
                    {topLine}
                  </p>
                  {bottomLine && (
                    <p className="text-[#DDBD68]/45 text-[10px] tracking-[0.18em] uppercase mt-0.5">{bottomLine}</p>
                  )}
                </div>
                <div className="w-full h-px bg-gradient-to-r from-transparent via-[#DDBD68]/25 to-transparent" />
                <div className="flex flex-col gap-1.5">
                  {dateObj.times.map((time) => (
                    <div
                      key={time}
                      className="w-full py-2 text-center text-xs font-semibold tracking-widest bg-[#DDBD68]/[0.06] border border-[#DDBD68]/20 text-[#DDBD68]/70 rounded-lg uppercase"
                      style={{ fontFamily: "'Inter', sans-serif" }}
                    >
                      {formatTime(time)}
                    </div>
                  ))}
                </div>
              </div>
              );
            })}
          </div>
        ) : (
          <div className="bg-white/[0.03] border border-white/[0.07] rounded-2xl p-10 text-center">
            <div className="text-4xl mb-3 opacity-30">🎬</div>
            <p className="text-[#DDBD68]/40 text-sm italic tracking-wide">
              No showtimes scheduled yet.
            </p>
          </div>
        )}
      </div>

      {/* Trailer Modal */}
      {showTrailer && movie.trailerUrl && createPortal(
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-12 bg-black animate-fade-up"
          onClick={() => setShowTrailer(false)}
        >
          <div className="relative w-full max-w-6xl">
            <div className="absolute -top-10 left-0 right-0 flex items-center justify-between px-2">
              <h3 className="text-[#DDBD68] font-serif font-bold tracking-[0.2em] uppercase text-xs sm:text-sm">
                Official Trailer
              </h3>
              <button
                onClick={() => setShowTrailer(false)}
                className="p-1.5 text-white/50 hover:text-black hover:bg-[#DDBD68] rounded-full transition-colors cursor-pointer"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div
              className="w-full bg-black rounded-2xl overflow-hidden shadow-[0_0_50px_rgba(221,189,104,0.15)] ring-1 ring-white/10"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="aspect-video w-full bg-black">
                <iframe
                  src={getEmbedUrl(movie.trailerUrl)}
                  className="w-full h-full border-0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
