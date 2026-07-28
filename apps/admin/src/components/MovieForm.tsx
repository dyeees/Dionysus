import { useState, useEffect } from 'react';
import { Upload, Plus, X, Loader2, CheckCircle2 } from 'lucide-react';
import { addMovie, updateMovie, type ApiMovie, type ShowtimeDate } from '../api';

interface MovieFormProps {
  initialData?: ApiMovie | null;
  onSaved: () => void;
}

export function MovieForm({ initialData, onSaved }: MovieFormProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    title: '',
    runtime: '',
    synopsis: '',
    director: '',
    cast: '',
    status: 'now_showing' as 'now_showing' | 'coming_soon',
  });

  const [showtimes, setShowtimes] = useState<ShowtimeDate[]>([
    { date: '', times: [''] }
  ]);

  useEffect(() => {
    if (initialData) {
      setFormData({
        title: initialData.title || '',
        runtime: initialData.runtime || '',
        synopsis: initialData.synopsis || '',
        director: initialData.director || '',
        cast: initialData.cast || '',
        status: initialData.status || 'now_showing',
      });
      if (initialData.showtimes && initialData.showtimes.length > 0) {
        setShowtimes(initialData.showtimes);
      } else {
        setShowtimes([{ date: '', times: [''] }]);
      }
      setImagePreview(initialData.img);
    }
  }, [initialData]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const addTime = (dateIndex: number) => {
    const newShowtimes = [...showtimes];
    newShowtimes[dateIndex].times.push('');
    setShowtimes(newShowtimes);
  };

  const removeTime = (dateIndex: number, timeIndex: number) => {
    const newShowtimes = [...showtimes];
    newShowtimes[dateIndex].times.splice(timeIndex, 1);
    setShowtimes(newShowtimes);
  };

  const updateTime = (dateIndex: number, timeIndex: number, value: string) => {
    const newShowtimes = [...showtimes];
    newShowtimes[dateIndex].times[timeIndex] = value;
    setShowtimes(newShowtimes);
  };

  const addDate = () => {
    setShowtimes([...showtimes, { date: '', times: [''] }]);
  };

  const removeDate = (dateIndex: number) => {
    const newShowtimes = [...showtimes];
    newShowtimes.splice(dateIndex, 1);
    setShowtimes(newShowtimes);
  };

  const updateDate = (dateIndex: number, value: string) => {
    const newShowtimes = [...showtimes];
    newShowtimes[dateIndex].date = value;
    setShowtimes(newShowtimes);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!initialData && !imageFile) {
      alert("Please select a movie poster");
      return;
    }

    setIsSubmitting(true);

    try {
      let imageUrl = initialData?.img || '';

      if (imageFile) {
        setIsUploading(true);
        // Upload to Cloudinary
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
        if (!cloudinaryRes.ok) {
          throw new Error(cloudinaryData.error?.message || 'Failed to upload image');
        }
        imageUrl = cloudinaryData.secure_url;
        setIsUploading(false);
      }

      // Save to Firebase
      const movieToSave: ApiMovie = {
        title: formData.title,
        director: formData.director,
        cast: formData.cast,
        synopsis: formData.synopsis,
        runtime: formData.runtime,
        status: formData.status,
        img: imageUrl,
        showtimes: formData.status === 'now_showing' ? showtimes.filter(s => s.date && s.times.some(t => t)) : []
      };

      if (initialData?.id) {
        await updateMovie(initialData.id, movieToSave);
      } else {
        await addMovie(movieToSave);
      }
      
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        onSaved(); // Return to dashboard
      }, 1500);
      
    } catch (error) {
      console.error(error);
      alert("Error saving movie: " + (error as Error).message);
    } finally {
      setIsSubmitting(false);
      setIsUploading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto pt-32 pb-20 px-6">
      <div className="mb-10 text-center">
        <h1 className="font-serif text-4xl text-white mb-2">
          {initialData ? 'Edit Movie' : 'Add New Movie'}
        </h1>
        <p className="text-white/40 tracking-widest text-sm">DIONYSUS ADMINISTRATION</p>
      </div>

      {success && (
        <div className="mb-8 p-4 bg-green-500/10 border border-green-500/20 rounded-xl flex items-center justify-center gap-3 text-green-400">
          <CheckCircle2 className="w-5 h-5" />
          <span>Movie successfully saved!</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8 bg-[#111] p-8 md:p-12 rounded-2xl border border-white/5 shadow-2xl">
        
        {/* Basic Info Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-white/60 mb-2">Movie Title</label>
              <input required type="text" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="w-full bg-[#1A1A1A] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#DDBD68] transition-colors" placeholder="e.g. Inception" />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-white/60 mb-2">Runtime</label>
                <input required type="text" value={formData.runtime} onChange={e => setFormData({...formData, runtime: e.target.value})} className="w-full bg-[#1A1A1A] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#DDBD68] transition-colors" placeholder="e.g. 2h 28m" />
              </div>
              <div>
                <label className="block text-sm font-medium text-white/60 mb-2">Director</label>
                <input required type="text" value={formData.director} onChange={e => setFormData({...formData, director: e.target.value})} className="w-full bg-[#1A1A1A] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#DDBD68] transition-colors" placeholder="e.g. Nolan" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-white/60 mb-2">Cast (comma separated)</label>
              <input required type="text" value={formData.cast} onChange={e => setFormData({...formData, cast: e.target.value})} className="w-full bg-[#1A1A1A] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#DDBD68] transition-colors" placeholder="e.g. Leo, Tom Hardy" />
            </div>

            <div>
              <label className="block text-sm font-medium text-white/60 mb-2">Synopsis</label>
              <textarea required value={formData.synopsis} onChange={e => setFormData({...formData, synopsis: e.target.value})} rows={4} className="w-full bg-[#1A1A1A] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#DDBD68] transition-colors resize-none" placeholder="Brief description..."></textarea>
            </div>
          </div>

          {/* Image Upload Section */}
          <div>
            <label className="block text-sm font-medium text-white/60 mb-2">Movie Poster</label>
            <div className="relative group h-[400px] w-full border-2 border-dashed border-white/10 rounded-2xl overflow-hidden hover:border-[#DDBD68]/50 transition-colors bg-[#1A1A1A] flex flex-col items-center justify-center cursor-pointer">
              <input type="file" accept="image/*" onChange={handleFileChange} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" />
              
              {imagePreview ? (
                <div className="relative w-full h-full">
                  <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                    <span className="text-white text-sm font-medium bg-black/50 px-4 py-2 rounded-lg backdrop-blur-sm">Click to change poster</span>
                  </div>
                </div>
              ) : (
                <div className="text-center p-6">
                  <Upload className="w-10 h-10 text-white/20 mx-auto mb-4 group-hover:text-[#DDBD68] transition-colors" />
                  <p className="text-white/60 text-sm">Click or drag image here</p>
                  <p className="text-white/30 text-xs mt-2">JPEG, PNG up to 10MB</p>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="h-px w-full bg-white/5 my-8"></div>

        {/* Status Section */}
        <div>
          <label className="block text-sm font-medium text-white/60 mb-4">Display Status</label>
          <div className="flex gap-4">
            <label className={`flex-1 cursor-pointer p-4 rounded-xl border transition-all flex items-center justify-center gap-3 ${formData.status === 'now_showing' ? 'bg-[#DDBD68]/10 border-[#DDBD68] text-[#DDBD68]' : 'bg-[#1A1A1A] border-white/5 text-white/40 hover:border-white/20'}`}>
              <input type="radio" name="status" className="hidden" checked={formData.status === 'now_showing'} onChange={() => setFormData({...formData, status: 'now_showing'})} />
              <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${formData.status === 'now_showing' ? 'border-[#DDBD68]' : 'border-white/20'}`}>
                {formData.status === 'now_showing' && <div className="w-2 h-2 rounded-full bg-[#DDBD68]"></div>}
              </div>
              <span className="font-medium tracking-wide">Now Showing</span>
            </label>
            <label className={`flex-1 cursor-pointer p-4 rounded-xl border transition-all flex items-center justify-center gap-3 ${formData.status === 'coming_soon' ? 'bg-[#DDBD68]/10 border-[#DDBD68] text-[#DDBD68]' : 'bg-[#1A1A1A] border-white/5 text-white/40 hover:border-white/20'}`}>
              <input type="radio" name="status" className="hidden" checked={formData.status === 'coming_soon'} onChange={() => setFormData({...formData, status: 'coming_soon'})} />
              <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${formData.status === 'coming_soon' ? 'border-[#DDBD68]' : 'border-white/20'}`}>
                {formData.status === 'coming_soon' && <div className="w-2 h-2 rounded-full bg-[#DDBD68]"></div>}
              </div>
              <span className="font-medium tracking-wide">Coming Soon</span>
            </label>
          </div>
        </div>

        {/* Dynamic Showtimes (Only for Now Showing) */}
        {formData.status === 'now_showing' && (
          <div className="space-y-6 pt-6 border-t border-white/5">
            <div className="flex items-center justify-between">
              <label className="block text-sm font-medium text-[#DDBD68]">Showtimes Schedule</label>
              <button type="button" onClick={addDate} className="text-xs text-white/60 flex items-center gap-1 hover:text-white bg-white/5 px-3 py-1.5 rounded-lg transition-colors">
                <Plus className="w-3 h-3" /> Add Date
              </button>
            </div>

            {showtimes.map((st, dateIndex) => (
              <div key={dateIndex} className="bg-[#1A1A1A] p-6 rounded-xl border border-white/5 relative">
                {showtimes.length > 1 && (
                  <button type="button" onClick={() => removeDate(dateIndex)} className="absolute top-4 right-4 text-white/20 hover:text-red-400">
                    <X className="w-4 h-4" />
                  </button>
                )}
                
                <div className="mb-4">
                  <label className="block text-xs text-white/40 mb-2 uppercase tracking-wider">Date</label>
                  <input type="date" required value={st.date} onChange={e => updateDate(dateIndex, e.target.value)} className="bg-[#111] border border-white/10 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-[#DDBD68] w-full sm:w-auto" />
                </div>

                <div>
                  <label className="block text-xs text-white/40 mb-2 uppercase tracking-wider">Times</label>
                  <div className="flex flex-wrap gap-3">
                    {st.times.map((time, timeIndex) => (
                      <div key={timeIndex} className="relative group flex items-center">
                        <input type="time" required value={time} onChange={e => updateTime(dateIndex, timeIndex, e.target.value)} className="bg-[#111] border border-white/10 rounded-lg pl-4 pr-8 py-2 text-sm text-white focus:outline-none focus:border-[#DDBD68]" />
                        {st.times.length > 1 && (
                          <button type="button" onClick={() => removeTime(dateIndex, timeIndex)} className="absolute right-2 text-white/20 hover:text-red-400">
                            <X className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                    ))}
                    <button type="button" onClick={() => addTime(dateIndex)} className="w-9 h-9 flex items-center justify-center rounded-lg border border-dashed border-white/20 text-white/40 hover:text-[#DDBD68] hover:border-[#DDBD68]/50 transition-colors">
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Submit Button */}
        <button 
          type="submit" 
          disabled={isSubmitting}
          className="w-full py-4 mt-8 bg-[#DDBD68] hover:bg-[#F2D588] text-black font-semibold tracking-wider rounded-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              {isUploading ? 'UPLOADING POSTER...' : 'SAVING MOVIE...'}
            </>
          ) : (
            initialData ? 'SAVE CHANGES' : 'ADD MOVIE TO DATABASE'
          )}
        </button>
      </form>
    </div>
  );
}
