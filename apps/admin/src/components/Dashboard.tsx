import { useState, useEffect } from 'react';
import { fetchAllMovies, type ApiMovie } from '../api';
import { Pencil, Loader2, Calendar } from 'lucide-react';

export function Dashboard({ onEditMovie }: { onEditMovie: (movie: ApiMovie) => void }) {
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

  return (
    <div className="max-w-7xl mx-auto pt-32 pb-20 px-6">
      <div className="mb-10 flex items-center justify-between">
        <div>
          <h1 className="font-serif text-3xl sm:text-4xl text-white mb-2 tracking-wide">Movie Database</h1>
          <p className="text-white/40 tracking-widest text-xs uppercase">Manage your listings</p>
        </div>
      </div>

      {movies.length === 0 ? (
        <div className="text-center bg-[#111] border border-white/5 p-12 rounded-2xl">
          <p className="text-white/40">No movies found in the database.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {movies.map(movie => (
            <div key={movie.id} className="bg-[#111] border border-white/5 rounded-2xl overflow-hidden hover:border-white/10 transition-colors group flex flex-col">
              <div className="aspect-[2/3] w-full relative overflow-hidden">
                <img src={movie.img} alt={movie.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                <div className="absolute inset-0 bg-gradient-to-t from-[#111] via-transparent to-transparent"></div>
                <div className="absolute top-3 right-3">
                  <span className={`text-[10px] uppercase tracking-widest font-bold px-3 py-1.5 rounded-full backdrop-blur-md ${movie.status === 'now_showing' ? 'bg-[#DDBD68]/90 text-black' : 'bg-black/50 text-white border border-white/20'}`}>
                    {movie.status === 'now_showing' ? 'Showing' : 'Soon'}
                  </span>
                </div>
              </div>
              <div className="p-5 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="text-lg font-serif font-bold text-white mb-1 truncate">{movie.title}</h3>
                  <div className="flex items-center gap-2 text-white/40 text-xs tracking-wider mb-4">
                    <Calendar className="w-3 h-3" />
                    <span>{movie.showtimes?.length || 0} Showings Set</span>
                  </div>
                </div>
                <button 
                  onClick={() => onEditMovie(movie)}
                  className="w-full py-2.5 bg-white/5 hover:bg-[#DDBD68] hover:text-black text-[#DDBD68] border border-[#DDBD68]/20 hover:border-[#DDBD68] rounded-xl text-xs font-bold tracking-widest uppercase transition-all flex items-center justify-center gap-2"
                >
                  <Pencil className="w-3 h-3" />
                  Edit Movie
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
