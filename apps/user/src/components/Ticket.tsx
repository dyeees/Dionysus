import { useState, useEffect } from 'react';

export interface TicketProps {
  movie: {
    title: string;
    img: string;
  };
  showtime: {
    date: string;
    time: string;
  };
  seatId: string;
  reference: string;
}

const TicketQR = ({ value }: { value: string }) => {
  const [QRCode, setQRCode] = useState<React.ElementType | null>(null);
  useEffect(() => {
    import('qrcode.react').then(m => setQRCode(() => m.QRCodeSVG));
  }, []);
  if (!QRCode) return <div className="w-full aspect-square bg-white/50 rounded-xl animate-pulse" />;
  return <QRCode value={value} size={256} style={{ width: "100%", height: "auto" }} bgColor="#FFFFFF" fgColor="#000000" level="Q" className="rounded-md" />;
};

export function Ticket({ movie, showtime, seatId, reference }: TicketProps) {

  return (
    <div onClick={(e) => e.stopPropagation()} className="flex w-full h-[220px] sm:h-[280px] relative text-white text-left drop-shadow-[0_20px_40px_rgba(221,189,104,0.15)] filter cursor-default">
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
          <img src={movie.img} alt={movie.title} className="h-full w-auto object-cover" />
          <div className="absolute inset-0 bg-gradient-to-r from-transparent to-[#0A0A0A]/80 opacity-80 pointer-events-none" />
        </div>

        {/* Middle: Details */}
        <div className="flex-1 flex flex-col p-5 sm:p-8 justify-between relative z-20">
          {/* Top half */}
          <div className="mt-2">
            <h2 className="text-lg sm:text-xl lg:text-2xl font-black uppercase leading-tight tracking-widest w-full line-clamp-3 text-[#DDBD68]" style={{ fontFamily: "'Cinzel', serif" }}>
              {movie.title}
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
                    const str = showtime.date;
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
                  {seatId}
                </p>
              </div>
              <div className="flex-1 px-3 py-2 sm:px-4 sm:py-2.5 flex flex-col justify-center items-end text-right overflow-hidden">
                <span className="text-[#DDBD68]/40 text-[8px] uppercase tracking-[0.2em] mb-0.5">Time</span>
                <p className="text-[10px] sm:text-[11px] font-black tracking-widest text-[#FCEEAA] truncate">
                  {showtime.time}
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

        <div className="bg-white p-1.5 sm:p-2 rounded-xl w-[130px] sm:w-[190px]">
          <TicketQR value={reference} />
        </div>
        <span className="text-xs sm:text-sm font-mono tracking-widest whitespace-nowrap text-[#DDBD68] font-bold leading-none mt-1.5 sm:mt-4">
          REF: {reference}
        </span>
      </div>
    </div>
  );
}
