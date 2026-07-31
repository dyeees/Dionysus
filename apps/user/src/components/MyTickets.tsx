import { useState, useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { fetchUserBookings, type ApiBooking } from '../api';
import { auth } from '../firebase';

import { Ticket } from './Ticket';

export function MyTickets() {
  const [bookings, setBookings] = useState<ApiBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTicket, setSelectedTicket] = useState<ApiBooking | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user?.email) {
        setLoading(false);
        return;
      }
      try {
        const data = await fetchUserBookings(user.email);
        setBookings(data);
      } catch (err) {
        console.error('Failed to load tickets', err);
      } finally {
        setLoading(false);
      }
    });
    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="w-8 h-8 rounded-full border-2 border-[#DDBD68] border-t-transparent animate-spin" />
      </div>
    );
  }

  if (bookings.length === 0) {
    return (
      <div className="bg-[#111]/90 rounded-2xl p-12 text-center border border-white/5 animate-fade-up shadow-[0_20px_60px_rgba(0,0,0,0.6)]">
        <div className="text-4xl mb-4 opacity-50">🎫</div>
        <h2 className="text-[#DDBD68] font-black text-2xl mb-2 tracking-widest uppercase" style={{ fontFamily: "'Cinzel', serif" }}>No Tickets Yet</h2>
        <p className="text-[#DDBD68]/40 text-xs tracking-wider">Your purchased tickets will appear here.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8 animate-fade-up">
      {!selectedTicket ? (
        <>
          <h2 className="text-[#DDBD68] font-black text-2xl sm:text-3xl tracking-[0.2em] uppercase" style={{ fontFamily: "'Cinzel', serif" }}>
            My Tickets
          </h2>
          
          {/* Simple List View */}
          <div className="flex flex-col gap-3">
        {bookings.map(booking => (
          <div 
            key={booking.id} 
            onClick={() => setSelectedTicket(booking)}
            className="group flex items-center justify-between bg-white/[0.02] hover:bg-[#DDBD68]/10 border border-white/5 hover:border-[#DDBD68]/30 rounded-xl p-4 sm:p-5 transition-all duration-300 cursor-pointer"
          >
            <div className="flex items-center gap-4">
              <img src={booking.movie.img} alt={booking.movie.title} className="w-10 h-14 object-cover rounded-md shadow-sm border border-white/10" />
              <div className="flex flex-col">
                <h3 className="text-[#DDBD68] font-bold text-sm sm:text-base leading-tight uppercase tracking-widest" style={{ fontFamily: "'Cinzel', serif" }}>
                  {booking.movie.title}
                </h3>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-white/40 text-[10px] tracking-widest uppercase">{booking.showtime.date}</span>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="hidden sm:flex flex-col items-end mr-4">
                <span className="text-[#FCEEAA]/70 text-[10px] tracking-widest font-semibold">{booking.showtime.time}</span>
                <span className="text-white/30 text-[9px] uppercase tracking-[0.2em]">{booking.seats.length} Seat{booking.seats.length > 1 ? 's' : ''}</span>
              </div>
              <svg className="w-5 h-5 text-white/20 group-hover:text-[#DDBD68] transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path></svg>
            </div>
          </div>
        ))}
      </div>
      </>
      ) : (
      // ── Full Ticket View ──────────────────────────────────────
      <div className="flex flex-col items-center w-full max-w-4xl mx-auto animate-fade-up gap-6 cursor-pointer" onClick={() => setSelectedTicket(null)}>
        
        {selectedTicket.seats.map((seat) => (
          <Ticket 
            key={seat.id} 
            movie={selectedTicket.movie} 
            showtime={selectedTicket.showtime} 
            seatId={seat.id} 
            reference={selectedTicket.reference} 
          />
        ))}
      </div>
      )}
    </div>
  );
}
