import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { fetchUserBookings, type ApiBooking } from '../api';
import { auth } from '../firebase';

export function MyTickets() {
  const [bookings, setBookings] = useState<ApiBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTicket, setSelectedTicket] = useState<ApiBooking | null>(null);

  // Lazy load QR code to keep bundle small until needed
  const TicketQR = ({ value }: { value: string }) => {
    const [QRCode, setQRCode] = useState<React.ElementType | null>(null);
    useEffect(() => {
      import('qrcode.react').then(m => setQRCode(() => m.QRCodeSVG));
    }, []);
    if (!QRCode) return <div className="w-48 h-48 bg-white/5 rounded-2xl animate-pulse" />;
    return <QRCode value={value} size={192} bgColor="#FFFFFF" fgColor="#0C0C0C" level="Q" className="rounded-xl" />;
  };

  useEffect(() => {
    const loadBookings = async () => {
      if (!auth.currentUser?.email) return;
      try {
        const data = await fetchUserBookings(auth.currentUser.email);
        setBookings(data);
      } catch (err) {
        console.error('Failed to load tickets', err);
      } finally {
        setLoading(false);
      }
    };
    loadBookings();
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
      <h2 className="text-[#DDBD68] font-black text-2xl sm:text-3xl tracking-[0.2em] uppercase" style={{ fontFamily: "'Cinzel', serif" }}>
        My Tickets
      </h2>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {bookings.map(booking => (
          <div 
            key={booking.id} 
            onClick={() => setSelectedTicket(booking)}
            className="relative bg-[#0A0A0A] border border-[#DDBD68]/20 rounded-2xl p-5 sm:p-6 overflow-hidden shadow-[0_10px_40px_rgba(0,0,0,0.8)] flex flex-col sm:flex-row gap-5 transition-transform hover:-translate-y-1 duration-300 cursor-pointer group"
          >
            {/* Aesthetic background glow */}
            <div className="absolute -top-20 -right-20 w-40 h-40 bg-[#DDBD68]/10 rounded-full blur-[50px] pointer-events-none" />
            
            <img src={booking.movie.img} alt={booking.movie.title} className="w-20 h-28 sm:w-24 sm:h-36 object-cover rounded-xl shadow-lg border border-white/5 shrink-0 z-10" />
            
            <div className="flex flex-col justify-between flex-1 z-10">
              <div>
                <h3 className="text-[#DDBD68] font-bold text-base sm:text-lg leading-tight uppercase tracking-widest" style={{ fontFamily: "'Cinzel', serif" }}>
                  {booking.movie.title}
                </h3>
                <div className="flex items-center gap-2 mt-2.5">
                  <span className="text-[#DDBD68]/80 text-[9px] sm:text-[10px] tracking-[0.2em] uppercase bg-[#DDBD68]/10 border border-[#DDBD68]/20 px-2 py-0.5 rounded-sm">{booking.showtime.date}</span>
                  <span className="text-[#FCEEAA]/70 text-[10px] tracking-widest font-semibold">{booking.showtime.time}</span>
                </div>
              </div>
              
              <div className="mt-4 bg-white/[0.03] rounded-xl p-3 flex justify-between items-center border border-white/5 shadow-inner">
                <div className="flex flex-col gap-0.5">
                  <span className="text-[#DDBD68]/40 text-[8px] uppercase tracking-[0.25em]">Seats</span>
                  <span className="text-[#FCEEAA] text-xs font-bold tracking-wider">
                    {booking.seats.map(s => s.id).join(', ')}
                  </span>
                </div>
                <div className="flex flex-col items-end gap-0.5">
                  <span className="text-[#DDBD68]/40 text-[8px] uppercase tracking-[0.25em]">Ref</span>
                  <span className="text-[#DDBD68]/60 text-[9px] font-mono tracking-wider">{booking.reference}</span>
                </div>
              </div>
              <div className="mt-3 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <span className="text-[#DDBD68]/60 text-[9px] tracking-widest uppercase flex items-center gap-2">
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>
                  Click to show QR
                </span>
              </div>
            </div>
            
            {/* Cutouts for ticket look */}
            <div className="hidden sm:block absolute top-1/2 -translate-y-1/2 -left-3 w-6 h-6 bg-[#0C0C0C]/75 backdrop-blur-md rounded-full border-r border-[#DDBD68]/20" />
            <div className="hidden sm:block absolute top-1/2 -translate-y-1/2 -right-3 w-6 h-6 bg-[#0C0C0C]/75 backdrop-blur-md rounded-full border-l border-[#DDBD68]/20" />
          </div>
        ))}
      </div>

      {/* ── QR Modal ────────────────────────────────────── */}
      {selectedTicket && createPortal(
        <div 
          className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-12 bg-black/80 backdrop-blur-md animate-fade-up"
          onClick={() => setSelectedTicket(null)}
        >
          <div 
            className="relative bg-[#0A0A0A] border border-[#DDBD68]/30 rounded-3xl p-8 max-w-sm w-full flex flex-col items-center gap-6 shadow-[0_20px_80px_rgba(221,189,104,0.15)]"
            onClick={e => e.stopPropagation()}
          >
            <button 
              onClick={() => setSelectedTicket(null)}
              className="absolute top-4 right-4 text-white/40 hover:text-[#DDBD68] transition-colors p-2 cursor-pointer"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
            </button>
            
            <div className="text-center">
              <h3 className="text-[#DDBD68] font-black text-xl tracking-widest uppercase font-serif leading-tight">Admit One</h3>
              <p className="text-[#DDBD68]/60 text-xs tracking-[0.2em] mt-1 uppercase">{selectedTicket.movie.title}</p>
            </div>
            
            <div className="bg-white p-4 rounded-2xl shadow-xl">
              <TicketQR value={selectedTicket.reference} />
            </div>

            <div className="flex flex-col items-center w-full bg-white/[0.03] border border-white/5 rounded-xl py-3 gap-1">
              <p className="text-white/30 text-[9px] uppercase tracking-[0.3em]">Booking Ref</p>
              <p className="text-[#FCEEAA] font-mono text-lg tracking-widest font-bold">{selectedTicket.reference}</p>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
