import { useState, useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
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
    if (!QRCode) return <div className="w-full aspect-square bg-[#DDBD68]/50 rounded-xl animate-pulse" />;
    return <QRCode value={value} size={256} style={{ width: "100%", height: "auto" }} bgColor="#DDBD68" fgColor="#000000" level="Q" className="rounded-md" />;
  };

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
        
        {selectedTicket.seats.map((seat, index) => (
        <div key={seat.id} onClick={(e) => e.stopPropagation()} className="flex w-full h-[220px] sm:h-[280px] relative text-white drop-shadow-[0_20px_40px_rgba(221,189,104,0.15)] filter cursor-default">
          
          {/* Main Ticket Body (Left + Middle) */}
          <div 
            className="flex flex-1 bg-[#0A0A0A] border border-[#DDBD68]/20 border-r-0 rounded-l-3xl overflow-hidden relative"
            style={{
              WebkitMaskImage: 'radial-gradient(circle at top right, transparent 16px, black 16.5px), radial-gradient(circle at bottom right, transparent 16px, black 16.5px)',
              WebkitMaskPosition: 'top left, bottom left',
              WebkitMaskSize: '100% 51%, 100% 51%',
              WebkitMaskRepeat: 'no-repeat, no-repeat',
              maskImage: 'radial-gradient(circle at top right, transparent 16px, black 16.5px), radial-gradient(circle at bottom right, transparent 16px, black 16.5px)',
              maskPosition: 'top left, bottom left',
              maskSize: '100% 51%, 100% 51%',
              maskRepeat: 'no-repeat, no-repeat'
            }}
          >
            {/* Aesthetic background glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-[#DDBD68]/5 rounded-full blur-[80px] pointer-events-none" />

            {/* Left: Poster */}
            <div className="h-full shrink-0 flex items-center justify-center relative z-10 border-r border-white/5">
              <img src={selectedTicket.movie.img} alt={selectedTicket.movie.title} className="h-full w-auto object-cover" />
              <div className="absolute inset-0 bg-gradient-to-r from-transparent to-[#0A0A0A]/80 opacity-80 pointer-events-none" />
            </div>

            {/* Middle: Details */}
            <div className="flex-1 flex flex-col p-5 sm:p-8 justify-between relative z-20">
              
              {/* Top half */}
              <div className="mt-2">
                <h2 className="text-lg sm:text-xl lg:text-2xl font-black uppercase leading-tight tracking-widest w-full line-clamp-3 text-[#DDBD68]" style={{ fontFamily: "'Cinzel', serif" }}>
                  {selectedTicket.movie.title}
                </h2>
              </div>

              {/* Bottom half tabular data */}
              <div className="flex flex-col w-full mt-auto mb-1 bg-white/[0.02] border border-white/5 rounded-xl overflow-hidden backdrop-blur-sm">
                <div className="flex border-b border-white/5">
                  <div className="flex-1 px-3 py-2 sm:px-4 sm:py-2.5 border-r border-white/5 flex flex-col justify-center overflow-hidden">
                    <span className="text-[#DDBD68]/40 text-[8px] uppercase tracking-[0.2em] mb-0.5">Cinema</span>
                    <p className="text-[10px] sm:text-[11px] font-black tracking-widest text-[#FCEEAA] uppercase truncate">DIONYSUS THEATERS</p>
                  </div>
                  <div className="flex-1 px-3 py-2 sm:px-4 sm:py-2.5 flex flex-col justify-center items-end text-right overflow-hidden">
                    <span className="text-[#DDBD68]/40 text-[8px] uppercase tracking-[0.2em] mb-0.5">Date</span>
                    <p className="text-[10px] sm:text-[11px] font-black tracking-widest text-[#FCEEAA] truncate">
                      {(() => {
                        const str = selectedTicket.showtime.date;
                        const [monthDay] = str.split('·').map(s => s.trim());
                        if (!monthDay) return str;
                        const parts = monthDay.split(' ');
                        if (parts.length !== 2) return str;
                        const months: Record<string, string> = {
                          'JAN': 'JANUARY', 'FEB': 'FEBRUARY', 'MAR': 'MARCH', 'APR': 'APRIL',
                          'MAY': 'MAY', 'JUN': 'JUNE', 'JUL': 'JULY', 'AUG': 'AUGUST',
                          'SEP': 'SEPTEMBER', 'OCT': 'OCTOBER', 'NOV': 'NOVEMBER', 'DEC': 'DECEMBER'
                        };
                        return `${months[parts[0]] || parts[0]} ${parts[1]}, ${new Date().getFullYear()}`;
                      })()}
                    </p>
                  </div>
                </div>
                <div className="flex bg-[#DDBD68]/[0.02]">
                  <div className="flex-1 px-3 py-2 sm:px-4 sm:py-2.5 border-r border-white/5 flex flex-col justify-center overflow-hidden">
                    <span className="text-[#DDBD68]/40 text-[8px] uppercase tracking-[0.2em] mb-0.5">Seat</span>
                    <p className="text-[11px] sm:text-xs font-black tracking-widest text-[#FCEEAA] truncate">
                      {seat.id}
                    </p>
                  </div>
                  <div className="flex-1 px-3 py-2 sm:px-4 sm:py-2.5 flex flex-col justify-center items-end text-right overflow-hidden">
                    <span className="text-[#DDBD68]/40 text-[8px] uppercase tracking-[0.2em] mb-0.5">Time</span>
                    <p className="text-[10px] sm:text-[11px] font-black tracking-widest text-[#FCEEAA] truncate">
                      {selectedTicket.showtime.time}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right: QR Only */}
          <div 
            className="w-[180px] sm:w-[250px] shrink-0 flex flex-col items-center justify-center relative z-10 bg-[#0A0A0A] border border-[#DDBD68]/20 border-l-0 rounded-r-3xl p-4 sm:p-6"
            style={{
              WebkitMaskImage: 'radial-gradient(circle at top left, transparent 16px, black 16.5px), radial-gradient(circle at bottom left, transparent 16px, black 16.5px)',
              WebkitMaskPosition: 'top right, bottom right',
              WebkitMaskSize: '100% 51%, 100% 51%',
              WebkitMaskRepeat: 'no-repeat, no-repeat',
              maskImage: 'radial-gradient(circle at top left, transparent 16px, black 16.5px), radial-gradient(circle at bottom left, transparent 16px, black 16.5px)',
              maskPosition: 'top right, bottom right',
              maskSize: '100% 51%, 100% 51%',
              maskRepeat: 'no-repeat, no-repeat'
            }}
          >
            {/* Custom Perforation Broken Line */}
            <div className="absolute left-0 inset-y-0 w-[2px] opacity-40" style={{
              backgroundImage: 'repeating-linear-gradient(to bottom, transparent, transparent 8px, #DDBD68 8px, #DDBD68 15px)'
            }} />

            <div className="bg-[#DDBD68] p-1.5 sm:p-2 rounded-xl w-[130px] sm:w-[190px]">
              <TicketQR value={selectedTicket.reference} />
            </div>
            <span className="text-xs sm:text-sm font-mono tracking-widest whitespace-nowrap text-[#DDBD68] font-bold leading-none mt-1.5 sm:mt-4">
              REF: {selectedTicket.reference}
            </span>
          </div>
        </div>
        ))}
      </div>
      )}
    </div>
  );
}
