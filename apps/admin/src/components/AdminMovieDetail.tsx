import { useState } from 'react';
import { createPortal } from 'react-dom';
import { Pencil, Upload, X, Plus, Loader2 } from 'lucide-react';
import { updateMovie, type ApiMovie, type ShowtimeDate } from '../api';
import type { Role } from '../App';

interface AdminMovieDetailProps {
  movie: ApiMovie;
  role: Role;
  onEdit: () => void;
  onSaved?: (movie: ApiMovie) => void;
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

export function AdminMovieDetail({ movie, role, onEdit, onSaved }: AdminMovieDetailProps) {
  const [showTrailer, setShowTrailer] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [editData, setEditData] = useState<ApiMovie>(movie);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const hasShowtimes = isEditing ? true : (movie.showtimes && movie.showtimes.length > 0);

  const handleStartEdit = () => {
    setEditData(JSON.parse(JSON.stringify(movie))); // deep copy
    setImageFile(null);
    setImagePreview(movie.img);
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setImageFile(null);
    setImagePreview(null);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSave = async () => {
    if (!editData.id) return;
    setIsSaving(true);
    try {
      let imageUrl = editData.img;

      if (imageFile) {
        setIsUploading(true);
        const cloudName = 'zetriroz';
        const uploadPreset = 'dionysus_uploads';
        const formDataUpload = new FormData();
        formDataUpload.append('file', imageFile);
        formDataUpload.append('upload_preset', uploadPreset);

        const cloudinaryRes = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
          method: 'POST',
          body: formDataUpload
        });

        const cloudinaryData = await cloudinaryRes.json();
        if (!cloudinaryRes.ok) throw new Error(cloudinaryData.error?.message || 'Failed to upload image');
        imageUrl = cloudinaryData.secure_url;
        setIsUploading(false);
      }

      const movieToSave: ApiMovie = {
        ...editData,
        img: imageUrl,
        showtimes: editData.status === 'now_showing' ? (editData.showtimes || []).filter(s => s.date && s.times.some(t => t)) : []
      };

      await updateMovie(movieToSave.id, movieToSave);
      setIsEditing(false);
      if (onSaved) onSaved(movieToSave);
    } catch (error) {
      console.error(error);
      alert("Error saving movie: " + (error as Error).message);
    } finally {
      setIsSaving(false);
      setIsUploading(false);
    }
  };

  // Showtime helpers
  const addTime = (dateIndex: number) => {
    const newShowtimes = [...(editData.showtimes || [])];
    newShowtimes[dateIndex].times.push('');
    setEditData({ ...editData, showtimes: newShowtimes });
  };
  const removeTime = (dateIndex: number, timeIndex: number) => {
    const newShowtimes = [...(editData.showtimes || [])];
    newShowtimes[dateIndex].times.splice(timeIndex, 1);
    setEditData({ ...editData, showtimes: newShowtimes });
  };
  const updateTime = (dateIndex: number, timeIndex: number, value: string) => {
    const newShowtimes = [...(editData.showtimes || [])];
    newShowtimes[dateIndex].times[timeIndex] = value;
    setEditData({ ...editData, showtimes: newShowtimes });
  };
  const addDate = () => {
    const newShowtimes = [...(editData.showtimes || []), { date: '', times: [''] }];
    setEditData({ ...editData, showtimes: newShowtimes });
  };
  const removeDate = (dateIndex: number) => {
    const newShowtimes = [...(editData.showtimes || [])];
    newShowtimes.splice(dateIndex, 1);
    setEditData({ ...editData, showtimes: newShowtimes });
  };
  const updateDate = (dateIndex: number, value: string) => {
    const newShowtimes = [...(editData.showtimes || [])];
    newShowtimes[dateIndex].date = value;
    setEditData({ ...editData, showtimes: newShowtimes });
  };

  return (
    <div className="flex flex-col gap-10 animate-fade-up">
      <style>{`
        .gold-date-picker::-webkit-calendar-picker-indicator {
          background-image: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="%23DDBD68" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>');
          cursor: pointer;
        }
        .gold-time-picker::-webkit-calendar-picker-indicator {
          background-image: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="%23DDBD68" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>');
          cursor: pointer;
        }
      `}</style>
      {/* Hero */}
      <div className="relative w-full rounded-2xl overflow-hidden" style={{ minHeight: 220 }}>
        {/* Blurred bg */}
        <img
          src={isEditing ? (imagePreview || editData.img) : movie.img}
          alt=""
          aria-hidden
          className="absolute inset-0 w-full h-full object-cover scale-110 blur-2xl opacity-30 pointer-events-none transition-all duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#0C0C0C] via-[#0C0C0C]/80 to-transparent pointer-events-none" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0C0C0C] to-transparent pointer-events-none" />

        {/* Content */}
        <div className="relative z-10 flex flex-col sm:flex-row gap-6 p-6 sm:p-8 items-start">
          {/* Poster */}
          <div className="relative shrink-0 w-28 sm:w-36 aspect-[2/3] rounded-xl overflow-hidden shadow-[0_8px_40px_rgba(0,0,0,0.8)] border border-white/10 ring-1 ring-[#DDBD68]/20 group">
            <img src={isEditing ? (imagePreview || editData.img) : movie.img} alt={movie.title} className="w-full h-full object-cover" />
            {isEditing && (
              <label className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity">
                <Upload className="w-6 h-6 text-[#DDBD68] mb-2" />
                <span className="text-[10px] text-white/80 font-semibold uppercase tracking-wider text-center px-2">Change Poster</span>
                <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
              </label>
            )}
          </div>

          {/* Text */}
          <div className="flex flex-col justify-end gap-3 pt-2 sm:pt-4 w-full">
            {isEditing ? (
              <input
                value={editData.title}
                onChange={e => setEditData({...editData, title: e.target.value})}
                className="text-[#DDBD68] leading-tight font-black tracking-wider m-0 bg-transparent border-b border-dashed border-[#DDBD68]/40 hover:border-[#DDBD68]/80 focus:border-[#DDBD68] focus:outline-none w-full pb-1 transition-colors"
                style={{ fontFamily: "'Cinzel', serif", fontSize: 'clamp(1.4rem, 3vw, 2.4rem)' }}
                placeholder="Movie Title"
              />
            ) : (
              <h2
                className="text-[#DDBD68] leading-tight font-black tracking-wider m-0"
                style={{ fontFamily: "'Cinzel', serif", fontSize: 'clamp(1.4rem, 3vw, 2.4rem)' }}
              >
                {movie.title}
              </h2>
            )}

            <div className="flex flex-wrap gap-x-6 gap-y-2">
              <div>
                <MetaLabel>Runtime</MetaLabel>
                {isEditing ? (
                  <input
                    value={editData.runtime}
                    onChange={e => setEditData({...editData, runtime: e.target.value})}
                    className="text-[#FCEEAA] font-medium text-sm leading-snug bg-transparent border-b border-dashed border-[#FCEEAA]/30 hover:border-[#FCEEAA]/70 focus:border-[#FCEEAA] focus:outline-none w-24 pb-0.5 transition-colors"
                    placeholder="e.g. 2h 28m"
                  />
                ) : (
                  <MetaValue>{movie.runtime}</MetaValue>
                )}
              </div>
              <div>
                <MetaLabel>Director</MetaLabel>
                {isEditing ? (
                  <input
                    value={editData.director}
                    onChange={e => setEditData({...editData, director: e.target.value})}
                    className="text-[#FCEEAA] font-medium text-sm leading-snug bg-transparent border-b border-dashed border-[#FCEEAA]/30 hover:border-[#FCEEAA]/70 focus:border-[#FCEEAA] focus:outline-none w-48 pb-0.5 transition-colors"
                    placeholder="Director Name"
                  />
                ) : (
                  <MetaValue>{movie.director}</MetaValue>
                )}
              </div>
            </div>

            <div className="mt-3 flex flex-col gap-3">
              {isEditing && (
                <div className="w-full">
                  <MetaLabel>Trailer URL</MetaLabel>
                  <input
                    value={editData.trailerUrl}
                    onChange={e => setEditData({...editData, trailerUrl: e.target.value})}
                    className="text-[#DDBD68] text-xs font-mono w-full max-w-sm bg-black/20 border-b border-dashed border-[#DDBD68]/40 hover:border-[#DDBD68]/80 focus:border-[#DDBD68] focus:outline-none py-1 transition-colors"
                    placeholder="YouTube URL"
                  />
                </div>
              )}

              <div className="flex flex-wrap items-center gap-4">
                {!isEditing && movie.trailerUrl && (
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
                
                {!isEditing && role === 'manager' && (
                  <button
                    onClick={handleStartEdit}
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

                {isEditing && (
                  <div className="flex items-center gap-3">
                    <button
                      onClick={handleCancelEdit}
                      disabled={isSaving}
                      className="px-4 py-2 rounded-full text-xs font-bold uppercase tracking-widest text-[#DDBD68]/70 hover:text-[#DDBD68] hover:bg-[#DDBD68]/10 transition-colors disabled:opacity-50"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSave}
                      disabled={isSaving}
                      className="flex items-center gap-2 px-5 py-2.5 rounded-full text-xs tracking-widest font-bold uppercase cursor-pointer transition-all duration-300 w-max disabled:opacity-50"
                      style={{
                        background: 'linear-gradient(135deg, #DDBD68 0%, #FCEEAA 50%, #DDBD68 100%)',
                        color: '#0C0C0C',
                        boxShadow: '0 0 24px rgba(221,189,104,0.3)',
                      }}
                    >
                      {isSaving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Pencil className="w-3.5 h-3.5" />}
                      {isSaving ? (isUploading ? 'Uploading...' : 'Saving...') : 'Save Changes'}
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Details Grid */}
      <div className="flex flex-col gap-6">
        <div className="animate-fade-up animate-fade-up-delay-1">
          <MetaLabel>Synopsis</MetaLabel>
          {isEditing ? (
            <textarea
              value={editData.synopsis}
              onChange={e => setEditData({...editData, synopsis: e.target.value})}
              rows={4}
              className="text-[#DDBD68]/80 text-sm leading-relaxed max-w-3xl mt-1 w-full bg-black/10 border border-dashed border-[#DDBD68]/30 hover:border-[#DDBD68]/60 focus:border-[#DDBD68] focus:bg-black/30 outline-none rounded-lg p-3 -ml-3 resize-none transition-all"
            />
          ) : (
            movie.synopsis && (
              <p className="text-[#DDBD68]/80 text-sm leading-relaxed max-w-3xl mt-1">
                {movie.synopsis}
              </p>
            )
          )}
        </div>

        <div className="animate-fade-up animate-fade-up-delay-2">
          <MetaLabel>Cast</MetaLabel>
          {isEditing ? (
            <input
              value={editData.cast}
              onChange={e => setEditData({...editData, cast: e.target.value})}
              className="text-[#FCEEAA]/80 text-xs tracking-wide w-full max-w-3xl bg-transparent border-b border-dashed border-[#DDBD68]/30 hover:border-[#DDBD68]/60 focus:border-[#DDBD68] outline-none mt-1 pb-1 transition-colors"
              placeholder="Comma separated names"
            />
          ) : (
            movie.cast && (
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
            )
          )}
        </div>
      </div>

      <div
        className="h-px w-full"
        style={{ background: 'linear-gradient(to right, transparent, rgba(221,189,104,0.3) 30%, rgba(221,189,104,0.3) 70%, transparent)' }}
      />

      {/* Showtimes */}
      <div className="animate-fade-up animate-fade-up-delay-3">
        <div className="flex items-center justify-between mb-5">
          <h3
            className="text-[#FCEEAA] text-xs uppercase tracking-[0.25em] font-semibold m-0"
            style={{ fontFamily: "'Inter', sans-serif" }}
          >
            Scheduled Showtimes
          </h3>
          {isEditing && (
            <button
              onClick={addDate}
              className="text-xs text-[#DDBD68]/70 hover:text-[#DDBD68] flex items-center gap-1 bg-[#DDBD68]/10 px-3 py-1.5 rounded-lg transition-colors"
            >
              <Plus className="w-3 h-3" /> Add Date
            </button>
          )}
        </div>

        {hasShowtimes ? (
          <div className="flex gap-6 overflow-x-auto pb-4 w-full scrollbar-thin">
            {(isEditing ? editData.showtimes : movie.showtimes)?.map((dateObj, idx) => {
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
              <div key={idx} className="flex flex-col gap-2.5 w-[140px] shrink-0 relative group">
                {isEditing && (
                  <button onClick={() => removeDate(idx)} className="absolute -top-3 -right-3 w-6 h-6 bg-red-500/20 text-red-400 hover:bg-red-500 hover:text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all z-10">
                    <X className="w-3 h-3" />
                  </button>
                )}
                
                <div className="text-center">
                  {isEditing ? (
                    <input
                      type="date"
                      value={dateObj.date}
                      onChange={e => updateDate(idx, e.target.value)}
                      className="gold-date-picker text-center pl-6 bg-black/30 border border-dashed border-[#DDBD68]/40 focus:border-[#DDBD68] text-[#FCEEAA] text-[10px] rounded py-1.5 w-full outline-none transition-colors"
                    />
                  ) : (
                    <>
                      <p
                        className="text-[#FCEEAA] font-bold text-xs tracking-widest uppercase leading-tight"
                        style={{ fontFamily: "'Cinzel', serif" }}
                      >
                        {topLine}
                      </p>
                      {bottomLine && (
                        <p className="text-[#DDBD68]/45 text-[10px] tracking-[0.18em] uppercase mt-0.5">{bottomLine}</p>
                      )}
                    </>
                  )}
                </div>
                
                <div className="w-full h-px bg-gradient-to-r from-transparent via-[#DDBD68]/25 to-transparent" />
                
                <div className="flex flex-col gap-1.5">
                  {dateObj.times.map((time, tIdx) => (
                    <div key={tIdx} className="relative group/time">
                      {isEditing ? (
                        <div className="flex items-center gap-1">
                          <input
                            type="time"
                            value={time}
                            onChange={e => updateTime(idx, tIdx, e.target.value)}
                            className="gold-time-picker w-full py-1.5 text-center pl-6 text-[10px] font-semibold tracking-widest bg-black/30 border border-dashed border-[#DDBD68]/40 focus:border-[#DDBD68] text-[#DDBD68] rounded outline-none transition-colors"
                          />
                          <button onClick={() => removeTime(idx, tIdx)} className="text-white/20 hover:text-red-400 p-1 shrink-0">
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ) : (
                        <div
                          className="w-full py-2 text-center text-xs font-semibold tracking-widest bg-[#DDBD68]/[0.06] border border-[#DDBD68]/20 text-[#DDBD68]/70 rounded-lg uppercase"
                          style={{ fontFamily: "'Inter', sans-serif" }}
                        >
                          {formatTime(time)}
                        </div>
                      )}
                    </div>
                  ))}
                  {isEditing && (
                    <button
                      onClick={() => addTime(idx)}
                      className="w-full py-1.5 flex items-center justify-center text-[#DDBD68]/40 hover:text-[#DDBD68] border border-dashed border-[#DDBD68]/20 hover:border-[#DDBD68]/60 rounded-lg transition-colors"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  )}
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
      {!isEditing && showTrailer && movie.trailerUrl && createPortal(
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
