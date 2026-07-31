import { useState, useEffect, Fragment } from 'react';
import { auth } from '../firebase';
import { createPaymentQR, checkPaymentStatus, createBooking, fetchOccupiedSeats } from '../api';
import type { ApiMovie as Movie, ShowtimeDate } from '../api';
import { Ticket } from './Ticket';

interface SeatSelectionProps {
  movie: Movie;
  dateObj: ShowtimeDate;
  time: string;
  onBack: () => void; // called after confirmed booking
}

type SeatType = 'standard' | 'regular' | 'premium';
type View = 'seats' | 'payment' | 'confirmed';

const ROWS: { row: string; type: SeatType }[] = [
  { row: 'A', type: 'standard' },
  { row: 'B', type: 'standard' },
  { row: 'C', type: 'regular' },
  { row: 'D', type: 'regular' },
  { row: 'E', type: 'regular' },
  { row: 'F', type: 'regular' },
  { row: 'G', type: 'regular' },
  { row: 'H', type: 'premium' },
  { row: 'I', type: 'premium' },
  { row: 'J', type: 'premium' },
];

const COL_GROUPS = [5, 6, 5];
const SEAT_AVAILABLE = 'bg-white/[0.08] border border-white/[0.14] hover:bg-[#DDBD68]/20 hover:border-[#DDBD68]/50';

function formatTime(time24: string) {
  const [hourStr, minStr] = time24.split(':');
  let hour = parseInt(hourStr, 10);
  const ampm = hour >= 12 ? 'PM' : 'AM';
  hour = hour % 12;
  if (hour === 0) hour = 12;
  return `${hour.toString().padStart(2, '0')}:${minStr} ${ampm}`;
}

// ── Lazy QR code component (only imported after payment) ──
function BookingQR({ value }: { value: string }) {
  const [QRCode, setQRCode] = useState<React.ElementType | null>(null);
  useEffect(() => {
    import('qrcode.react').then(m => setQRCode(() => m.QRCodeSVG));
  }, []);
  if (!QRCode) return <div className="w-40 h-40 bg-white/5 rounded-xl animate-pulse" />;
  return <QRCode value={value} size={160} bgColor="#FFFFFF" fgColor="#0C0C0C" level="M" />;
}

export function SeatSelection({ movie, dateObj, time, onBack }: SeatSelectionProps) {
  const [occupied, setOccupied] = useState<Set<string>>(new Set());
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [view, setView] = useState<View>('seats');

  // Payment state
  const [qrString, setQrString] = useState<string>('');
  const [isQrLoading, setIsQrLoading] = useState(false);

  // Booking reference — generated once per session
  const [bookingRef] = useState(() => `BK-${Math.random().toString(36).slice(2, 6).toUpperCase()}`);

  const todayDayName = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'][new Date().getDay()];
  const dateLabel = dateObj.isToday
    ? `TODAY · ${todayDayName}`
    : `${dateObj.month} ${dateObj.day} · ${dateObj.dayOfWeek}`;

  // Fetch real occupied seats from the database
  useEffect(() => {
    fetchOccupiedSeats(movie.id, dateLabel, formatTime(time))
      .then(seats => setOccupied(new Set(seats)))
      .catch(console.error);
  }, [movie.id, dateLabel, time]);

  const totalSeats = selected.size;

  // ── Browser back button navigation ───────────────────
  useEffect(() => {
    const handlePopState = (e: PopStateEvent) => {
      const state = e.state || {};
      if (state.payment) {
        setView('payment');
      } else if (state.seats) {
        setView('seats');
      }
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const goToPayment = async () => {
    window.history.pushState({ payment: true }, '', '#payment');
    setView('payment');
    if (!qrString) {
      setIsQrLoading(true);
      try {
        const amount = totalSeats * 350; // Fixed seat price for now
        const data = await createPaymentQR(bookingRef, amount);
        if (data.qr_string) setQrString(data.qr_string);
      } catch (e) {
        console.error(e);
      } finally {
        setIsQrLoading(false);
      }
    }
  };

  // Poll for payment success
  useEffect(() => {
    if (view === 'payment' && qrString) {
      const interval = setInterval(async () => {
        try {
          const res = await checkPaymentStatus(bookingRef);
          if (res.status === 'PAID') {
            clearInterval(interval);
            // Record in Firebase Database
            await createBooking({
              reference: bookingRef,
              user_email: auth.currentUser?.email || 'guest',
              movie: { id: movie.id, title: movie.title, img: movie.img },
              showtime: { date: dateLabel, time: formatTime(time), hall: 'Cinema 1' },
              seats: [...selected].map(id => ({ id, row: id[0], number: parseInt(id.slice(1)) })),
              status: 'confirmed',
              total_amount: totalSeats * 350,
              payment_method: 'Xendit QR',
            });
            setView('confirmed');
          }
        } catch (e) {}
      }, 3000);
      return () => clearInterval(interval);
    }
  }, [view, qrString, bookingRef, movie, dateLabel, time, selected, totalSeats]);

  const toggleSeat = (id: string) => {
    if (occupied.has(id)) return;
    setSelected(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };



  // ────────────────────────────────────────────────────────
  // VIEW: CONFIRMED
  // ────────────────────────────────────────────────────────
  if (view === 'confirmed') {
    return (
      <div className="flex flex-col items-center justify-center min-h-[55vh] gap-6 animate-fade-up text-center w-full max-w-4xl mx-auto">
        <div className="relative flex justify-center items-center mt-8 mb-6">
          <div className="absolute w-32 h-32 bg-[#DDBD68]/20 rounded-full blur-[50px] animate-pulse" />
          <div className="relative flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-tr from-[#DDBD68]/20 to-[#FCEEAA]/40 border border-[#DDBD68]/30 backdrop-blur-md shadow-[0_0_40px_rgba(221,189,104,0.3)]">
            <svg className="w-8 h-8 text-[#FCEEAA] drop-shadow-[0_0_10px_rgba(252,238,170,0.8)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
        </div>
        <div className="mb-8">
          <h2
            className="text-transparent bg-clip-text bg-gradient-to-r from-[#DDBD68] via-[#FCEEAA] to-[#DDBD68] text-3xl sm:text-4xl font-black tracking-[0.15em] m-0 drop-shadow-[0_0_15px_rgba(221,189,104,0.2)]"
            style={{ fontFamily: "'Cinzel', serif" }}
          >
            BOOKING CONFIRMED
          </h2>
          <div className="flex items-center justify-center gap-3 mt-4">
            <div className="w-12 h-[1px] bg-gradient-to-r from-transparent to-[#DDBD68]/50" />
            <p className="text-[#DDBD68]/70 text-xs sm:text-sm tracking-[0.1em] uppercase font-semibold">
              Your e-tickets are ready
            </p>
            <div className="w-12 h-[1px] bg-gradient-to-l from-transparent to-[#DDBD68]/50" />
          </div>
        </div>

        {/* Display one Ticket per seat */}
        <div className="flex flex-col gap-6 w-full">
          {[...selected].sort().map((seatId) => (
            <Ticket
              key={seatId}
              movie={{ title: movie.title, img: movie.img }}
              showtime={{ date: dateLabel, time: formatTime(time) }}
              seatId={seatId}
              reference={bookingRef}
            />
          ))}
        </div>

        <button
          onClick={onBack}
          className="mt-4 border border-[#DDBD68]/35 text-[#DDBD68] hover:bg-[#DDBD68]/10 px-8 py-2.5 rounded-full text-xs tracking-widest uppercase font-semibold transition-all cursor-pointer"
        >
          Back to Movies
        </button>
      </div>
    );
  }

  // ────────────────────────────────────────────────────────
  // VIEW: PAYMENT
  // ────────────────────────────────────────────────────────
  if (view === 'payment') {

    return (
      <div className="flex flex-col gap-8 animate-fade-up max-w-lg mx-auto w-full">

        {/* Header */}
        <div>

          <h2
            className="text-[#DDBD68] font-black tracking-wider leading-tight m-0"
            style={{ fontFamily: "'Cinzel', serif", fontSize: 'clamp(1rem, 2.2vw, 1.5rem)' }}
          >
            Payment
          </h2>
          <p className="text-[#DDBD68]/40 text-xs tracking-[0.18em] uppercase mt-0.5">
            Complete your booking
          </p>
        </div>

        {/* Order Summary */}
        <div className="bg-white/[0.03] border border-white/[0.08] rounded-xl px-5 py-4 flex flex-col gap-2">
          <p className="text-[#FCEEAA]/40 text-[9px] uppercase tracking-[0.25em] mb-1">Order Summary</p>
          <div className="flex items-start gap-3">
            <img src={movie.img} alt={movie.title} className="w-10 h-14 object-cover rounded-md shrink-0 opacity-90" />
            <div className="flex flex-col gap-0.5">
              <p className="text-[#DDBD68] font-bold text-sm leading-tight" style={{ fontFamily: "'Cinzel', serif" }}>
                {movie.title}
              </p>
              <p className="text-[#DDBD68]/45 text-[11px] tracking-wider">{dateLabel} · {formatTime(time)}</p>
              <p className="text-[#FCEEAA]/60 text-[11px] tracking-wider mt-1">
                {totalSeats} {totalSeats === 1 ? 'seat' : 'seats'} · {[...selected].sort().join(', ')}
              </p>
            </div>
          </div>
        </div>

        {/* Payment QR */}
        <div className="flex flex-col items-center gap-5 bg-white/[0.03] border border-white/[0.08] rounded-xl p-8">
          <p className="text-[#FCEEAA]/40 text-[10px] uppercase tracking-[0.3em] font-semibold">Scan to Pay</p>
          <div className="bg-white p-4 rounded-2xl shadow-[0_0_30px_rgba(221,189,104,0.15)] flex justify-center items-center" style={{ width: 192, height: 192 }}>
            {isQrLoading ? (
               <div className="w-8 h-8 rounded-full border-2 border-[#DDBD68] border-t-transparent animate-spin" />
            ) : qrString ? (
               <BookingQR value={qrString} />
            ) : (
               <div className="text-red-500 text-xs">Failed to load QR</div>
            )}
          </div>
          <p className="text-[#DDBD68]/50 text-xs tracking-wider text-center max-w-[240px] leading-relaxed">
            Scan this QR code with any supported e-wallet or banking app to complete your booking.
          </p>
        </div>

        {/* Polling Indicator */}
        <div className="flex flex-col items-center justify-center gap-3 mt-4">
          <div className="flex gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-[#DDBD68] animate-bounce" style={{ animationDelay: '0ms' }} />
            <div className="w-1.5 h-1.5 rounded-full bg-[#DDBD68] animate-bounce" style={{ animationDelay: '150ms' }} />
            <div className="w-1.5 h-1.5 rounded-full bg-[#DDBD68] animate-bounce" style={{ animationDelay: '300ms' }} />
          </div>
          <p className="text-[#DDBD68]/45 text-[10px] uppercase tracking-widest font-semibold">
            Waiting for Payment Confirmation...
          </p>
        </div>
      </div>
    );
  }

  // ────────────────────────────────────────────────────────
  // VIEW: SEATS
  // ────────────────────────────────────────────────────────
  const renderRow = (rowInfo: (typeof ROWS)[0]) => {
    const { row } = rowInfo;

    const SeatBtn = ({ col }: { col: number }) => {
      const id = `${row}${col}`;
      const isOccupied = occupied.has(id);
      const isSelected = selected.has(id);
      let cls: string;
      if (isOccupied) {
        cls = 'bg-red-900/60 border border-red-700/50 cursor-not-allowed';
      } else if (isSelected) {
        cls = 'bg-gradient-to-br from-[#DDBD68] to-[#b89840] border-0 cursor-pointer shadow-[0_0_10px_rgba(221,189,104,0.5)]';
      } else {
        cls = `${SEAT_AVAILABLE} cursor-pointer transition-all duration-150`;
      }
      return (
        <button
          onClick={() => toggleSeat(id)}
          disabled={isOccupied}
          title={isOccupied ? 'Occupied' : `${row}${col}`}
          className={`w-5 h-[15px] sm:w-6 sm:h-[18px] rounded-t-[4px] sm:rounded-t-[5px] rounded-b-[2px] transition-transform duration-150 ${cls} ${isSelected ? 'scale-110' : ''}`}
        />
      );
    };

    let colOffset = 0;
    const groups = COL_GROUPS.map((count) => {
      const start = colOffset + 1;
      colOffset += count;
      return { start, count };
    });

    return (
      <div key={row} className="flex items-center gap-1.5 sm:gap-2">
        <span className="w-3 sm:w-4 shrink-0 text-center text-[9px] font-bold text-[#DDBD68]/30">{row}</span>
        {groups.map(({ start, count }, gi) => (
          <Fragment key={`group-wrap-${gi}`}>
            {gi > 0 && <div className="w-3 sm:w-5 shrink-0" />}
            <div className="flex gap-[2px] sm:gap-[3px]">
              {Array.from({ length: count }, (_, i) => (
                <SeatBtn key={start + i} col={start + i} />
              ))}
            </div>
          </Fragment>
        ))}
        <span className="w-3 sm:w-4 shrink-0 text-center text-[9px] font-bold text-[#DDBD68]/30">{row}</span>
      </div>
    );
  };

  return (
    <div className="flex flex-col gap-8 animate-fade-up">

      {/* Header */}
      <div>
        <h2
          className="text-[#DDBD68] font-black tracking-wider leading-tight m-0"
          style={{ fontFamily: "'Cinzel', serif", fontSize: 'clamp(1rem, 2.2vw, 1.6rem)' }}
        >
          {movie.title}
        </h2>
        <p className="text-[#DDBD68]/45 text-xs tracking-[0.18em] uppercase mt-1">
          Select Your Seats &nbsp;·&nbsp; {dateLabel} &nbsp;·&nbsp; {formatTime(time)}
        </p>
      </div>

      {/* Screen */}
      <div className="flex flex-col items-center gap-1 pt-2">
        <div
          className="w-3/5 h-1 rounded-full"
          style={{
            background: 'linear-gradient(to right, transparent, rgba(252,238,170,0.7) 30%, rgba(252,238,170,0.7) 70%, transparent)',
            boxShadow: '0 0 24px 6px rgba(252,238,170,0.12)',
          }}
        />
        <p className="text-[#FCEEAA]/20 text-[9px] tracking-[0.45em] uppercase mt-1.5">Screen</p>
      </div>

      {/* Seat Map */}
      <div className="w-full flex overflow-x-auto pb-4">
        <div className="m-auto flex flex-col gap-1.5 min-w-max px-4">
          {ROWS.map((rowInfo) => (
            <div key={rowInfo.row}>{renderRow(rowInfo)}</div>
          ))}
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center flex-wrap gap-5 text-[10px] text-[#DDBD68]/45 tracking-wider pt-1">
        {[
          { label: 'Available', cls: 'bg-white/[0.08] border border-white/[0.14]' },
          { label: 'Selected',  cls: 'bg-gradient-to-br from-[#DDBD68] to-[#b89840]' },
          { label: 'Occupied',  cls: 'bg-red-900/60 border border-red-700/50' },
        ].map(({ label, cls }) => (
          <div key={label} className="flex items-center gap-1.5">
            <div className={`w-5 h-[14px] rounded-t-[4px] rounded-b-[2px] shrink-0 ${cls}`} />
            <span>{label}</span>
          </div>
        ))}
      </div>

      {/* Booking Footer */}
      {selected.size > 0 && (
        <div className="animate-fade-up sticky bottom-4 mt-2 bg-[#111]/95 backdrop-blur-xl border border-[#DDBD68]/18 rounded-2xl px-5 py-4 flex items-center justify-between gap-4 shadow-[0_8px_40px_rgba(0,0,0,0.6)]">
          <div className="flex flex-col gap-0.5 min-w-0">
            <p className="text-[#FCEEAA]/40 text-[9px] uppercase tracking-[0.25em]">Selected Seats</p>
            <p className="text-[#FCEEAA] text-xs font-semibold tracking-wider truncate">
              {[...selected].sort().join(', ')}
            </p>
            <p className="text-[#DDBD68]/45 text-[10px]">{totalSeats} {totalSeats === 1 ? 'seat' : 'seats'}</p>
          </div>
          <button
            onClick={goToPayment}
            className="bg-gradient-to-r from-[#DDBD68] via-[#FCEEAA] to-[#DDBD68] text-[#0C0C0C] font-bold text-xs tracking-[0.18em] uppercase px-7 py-3 rounded-xl cursor-pointer hover:shadow-[0_0_24px_rgba(221,189,104,0.45)] transition-shadow duration-300 whitespace-nowrap shrink-0"
          >
            Book Now
          </button>
        </div>
      )}
    </div>
  );
}
