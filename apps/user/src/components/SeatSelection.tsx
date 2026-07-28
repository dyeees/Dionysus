import { useState, useEffect } from 'react';
import type { ApiMovie as Movie, ShowtimeDate } from '../api';

interface SeatSelectionProps {
  movie: Movie;
  dateObj: ShowtimeDate;
  time: string;
  onBack: () => void; // called after confirmed booking
}

type SeatType = 'standard' | 'regular' | 'premium';
type View = 'seats' | 'payment' | 'confirmed';
type PayMethod = 'card' | 'gcash' | 'maya';

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

function getOccupied(movieId: string, time: string): Set<string> {
  const totalCols = COL_GROUPS.reduce((a, b) => a + b, 0);
  let movieIdHash = 0;
  for (let i = 0; i < movieId.length; i++) {
    movieIdHash = (movieIdHash * 31 + movieId.charCodeAt(i)) >>> 0;
  }
  let val = (movieIdHash * 397 + (time.charCodeAt(0) || 0) * 17 + (time.charCodeAt(3) || 0) * 31 + 12345) >>> 0;
  const occupied = new Set<string>();
  for (const { row } of ROWS) {
    for (let c = 1; c <= totalCols; c++) {
      val = ((val * 1664525 + 1013904223) >>> 0);
      if ((val % 100) < 42) occupied.add(`${row}${c}`);
    }
  }
  return occupied;
}

// ── Shared input field ────────────────────────────────
const Field = ({
  label, placeholder, value, onChange, type = 'text', maxLength,
}: {
  label: string; placeholder: string; value: string;
  onChange: (v: string) => void; type?: string; maxLength?: number;
}) => (
  <div className="flex flex-col gap-1.5">
    <label className="text-[#FCEEAA]/45 text-[10px] uppercase tracking-[0.2em] font-semibold">
      {label}
    </label>
    <input
      type={type}
      placeholder={placeholder}
      value={value}
      onChange={e => onChange(e.target.value)}
      maxLength={maxLength}
      className="bg-white/[0.04] border border-white/[0.10] focus:border-[#DDBD68]/50 rounded-lg px-4 py-2.5 text-[#DDBD68] text-sm placeholder:text-white/20 outline-none transition-colors duration-200 w-full"
      style={{ fontFamily: "'Inter', sans-serif" }}
    />
  </div>
);

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
  const occupied = new Set(getOccupied(movie.id, time));
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [view, setView] = useState<View>('seats');

  // Payment state
  const [payMethod, setPayMethod] = useState<PayMethod>('card');
  const [cardNum, setCardNum]     = useState('');
  const [cardName, setCardName]   = useState('');
  const [expiry, setExpiry]       = useState('');
  const [cvv, setCvv]             = useState('');
  const [phone, setPhone]         = useState('');

  // Booking reference — generated once per session
  const [bookingRef] = useState(() => `BK-${Math.random().toString(36).slice(2, 6).toUpperCase()}`);

  const todayDayName = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'][new Date().getDay()];
  const dateLabel = dateObj.isToday
    ? `TODAY · ${todayDayName}`
    : `${dateObj.month} ${dateObj.day} · ${dateObj.dayOfWeek}`;

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

  const goToPayment = () => {
    window.history.pushState({ payment: true }, '', '#payment');
    setView('payment');
  };

  const toggleSeat = (id: string) => {
    if (occupied.has(id)) return;
    setSelected(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleCardNum = (v: string) => {
    const digits = v.replace(/\D/g, '').slice(0, 16);
    setCardNum(digits.replace(/(.{4})/g, '$1 ').trim());
  };
  const handleExpiry = (v: string) => {
    const digits = v.replace(/\D/g, '').slice(0, 4);
    setExpiry(digits.length > 2 ? `${digits.slice(0, 2)}/${digits.slice(2)}` : digits);
  };

  const payValid = (() => {
    if (payMethod === 'card') return cardNum.replace(/\s/g, '').length === 16 && cardName.trim() && expiry.length === 5 && cvv.length >= 3;
    return phone.replace(/\D/g, '').length >= 10; // gcash / maya
  })();

  // QR payload — encodes all booking info so scanner can display without a DB
  const qrPayload = JSON.stringify({
    ref: 'DIONYSUS',
    id: bookingRef,
    movie: movie.title,
    date: dateLabel,
    time: formatTime(time),
    seats: [...selected].sort().join(', '),
    method: payMethod === 'card' ? 'Card' : payMethod === 'gcash' ? 'GCash' : 'Maya',
  });

  // ────────────────────────────────────────────────────────
  // VIEW: CONFIRMED
  // ────────────────────────────────────────────────────────
  if (view === 'confirmed') {
    return (
      <div className="flex flex-col items-center justify-center min-h-[55vh] gap-6 animate-fade-up text-center">
        <div className="text-5xl">🎟️</div>
        <div>
          <h2
            className="text-[#DDBD68] text-2xl sm:text-3xl font-black tracking-widest m-0"
            style={{ fontFamily: "'Cinzel', serif" }}
          >
            Booking Confirmed!
          </h2>
          <p className="text-[#DDBD68]/55 text-sm tracking-wide max-w-xs leading-relaxed mt-2">
            Show this QR code at the entrance.
          </p>
        </div>

        {/* QR Ticket card */}
        <div className="bg-white rounded-2xl p-5 shadow-[0_0_60px_rgba(221,189,104,0.2)] w-full max-w-xs">
          {/* Ticket header */}
          <div className="mb-4 text-center">
            <p className="text-[#0C0C0C] font-black tracking-[0.2em] text-sm uppercase" style={{ fontFamily: "'Cinzel', serif" }}>
              Dionysus
            </p>
            <p className="text-[#0C0C0C]/40 text-[10px] tracking-widest uppercase mt-0.5">Cinema · E-Ticket</p>
          </div>

          {/* QR code */}
          <div className="flex justify-center mb-4">
            <BookingQR value={qrPayload} />
          </div>

          {/* Booking ref */}
          <p className="text-center text-[#0C0C0C] font-mono font-bold text-sm tracking-[0.2em] mb-4">{bookingRef}</p>

          {/* Divider perforation */}
          <div className="flex items-center gap-1 my-3">
            <div className="w-4 h-4 rounded-full bg-[#0C0C0C]/8 -ml-7 shrink-0" />
            <div className="flex-1 border-t-2 border-dashed border-[#0C0C0C]/12" />
            <div className="w-4 h-4 rounded-full bg-[#0C0C0C]/8 -mr-7 shrink-0" />
          </div>

          {/* Booking details */}
          <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-left mt-3">
            {[
              { label: 'Film', value: movie.title },
              { label: 'Date', value: dateLabel },
              { label: 'Time', value: formatTime(time) },
              { label: 'Seats', value: [...selected].sort().join(', ') },
            ].map(({ label, value }) => (
              <div key={label}>
                <p className="text-[#0C0C0C]/35 text-[9px] uppercase tracking-widest font-semibold">{label}</p>
                <p className="text-[#0C0C0C] text-xs font-semibold mt-0.5 leading-tight">{value}</p>
              </div>
            ))}
          </div>
        </div>

        <button
          onClick={onBack}
          className="border border-[#DDBD68]/35 text-[#DDBD68] hover:bg-[#DDBD68]/10 px-8 py-2.5 rounded-full text-xs tracking-widest uppercase font-semibold transition-all cursor-pointer"
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
    const PAY_METHODS: { id: PayMethod; label: string; icon: string }[] = [
      { id: 'card',  label: 'Card',  icon: '💳' },
      { id: 'gcash', label: 'GCash', icon: '📱' },
      { id: 'maya',  label: 'Maya',  icon: '💜' },
    ];

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

        {/* Payment method tabs */}
        <div className="flex flex-col gap-3">
          <p className="text-[#FCEEAA]/40 text-[9px] uppercase tracking-[0.25em]">Payment Method</p>
          <div className="grid grid-cols-3 gap-2">
            {PAY_METHODS.map(m => (
              <button
                key={m.id}
                onClick={() => setPayMethod(m.id)}
                className={`flex flex-col items-center gap-1 py-3 rounded-xl border text-xs font-semibold tracking-wide transition-all duration-200 cursor-pointer ${
                  payMethod === m.id
                    ? 'bg-[#DDBD68]/15 border-[#DDBD68]/50 text-[#DDBD68]'
                    : 'bg-white/[0.03] border-white/[0.08] text-[#DDBD68]/40 hover:border-white/[0.15] hover:text-[#DDBD68]/70'
                }`}
              >
                <span className="text-lg leading-none">{m.icon}</span>
                <span className="text-[10px] tracking-widest uppercase">{m.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Dynamic form */}
        <div className="flex flex-col gap-4">
          {payMethod === 'card' && (
            <>
              <Field label="Card Number" placeholder="1234 5678 9012 3456" value={cardNum} onChange={handleCardNum} maxLength={19} />
              <Field label="Name on Card" placeholder="Juan dela Cruz" value={cardName} onChange={setCardName} />
              <div className="grid grid-cols-2 gap-3">
                <Field label="Expiry" placeholder="MM/YY" value={expiry} onChange={handleExpiry} maxLength={5} />
                <Field label="CVV" placeholder="•••" value={cvv} onChange={v => setCvv(v.replace(/\D/g, '').slice(0, 4))} type="password" maxLength={4} />
              </div>
            </>
          )}
          {(payMethod === 'gcash' || payMethod === 'maya') && (
            <>
              <Field
                label={`${payMethod === 'gcash' ? 'GCash' : 'Maya'} Mobile Number`}
                placeholder="09XX XXX XXXX"
                value={phone}
                onChange={setPhone}
                type="tel"
                maxLength={13}
              />
              <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl px-4 py-3 text-xs text-[#DDBD68]/45 leading-relaxed">
                A payment request will be sent to your{' '}
                <span className="text-[#DDBD68]/70">{payMethod === 'gcash' ? 'GCash' : 'Maya'}</span>{' '}
                account. Open the app to approve within 5 minutes.
              </div>
            </>
          )}
        </div>

        {/* Confirm */}
        <button
          onClick={() => payValid && setView('confirmed')}
          disabled={!payValid}
          className={`w-full py-3.5 rounded-xl font-bold text-xs tracking-[0.18em] uppercase transition-all duration-300 ${
            payValid
              ? 'bg-gradient-to-r from-[#DDBD68] via-[#FCEEAA] to-[#DDBD68] text-[#0C0C0C] cursor-pointer hover:shadow-[0_0_24px_rgba(221,189,104,0.4)]'
              : 'bg-white/[0.05] text-white/20 cursor-not-allowed'
          }`}
        >
          Confirm Payment
        </button>
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
          className={`w-6 h-[18px] rounded-t-[5px] rounded-b-[2px] transition-transform duration-150 ${cls} ${isSelected ? 'scale-110' : ''}`}
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
      <div key={row} className="flex items-center gap-2 w-full justify-center">
        <span className="w-4 shrink-0 text-center text-[9px] font-bold text-[#DDBD68]/30">{row}</span>
        {groups.map(({ start, count }, gi) => (
          <>
            {gi > 0 && <div key={`aisle-${gi}`} className="w-5 shrink-0" />}
            <div key={`group-${gi}`} className="flex gap-[3px]">
              {Array.from({ length: count }, (_, i) => (
                <SeatBtn key={start + i} col={start + i} />
              ))}
            </div>
          </>
        ))}
        <span className="w-4 shrink-0 text-center text-[9px] font-bold text-[#DDBD68]/30">{row}</span>
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
      <div className="flex flex-col gap-1.5 overflow-x-auto pb-1">
        {ROWS.map((rowInfo) => (
          <div key={rowInfo.row}>{renderRow(rowInfo)}</div>
        ))}
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
