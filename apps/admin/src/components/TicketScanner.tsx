import { useEffect, useRef, useState } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { fetchTicketByRef, type ApiTicket } from '../api';
import { CheckCircle2, XCircle, RotateCcw } from 'lucide-react';

type ScanState = 'scanning' | 'loading' | 'valid' | 'invalid';

export function TicketScanner() {
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const [scanState, setScanState] = useState<ScanState>('scanning');
  const [ticket, setTicket] = useState<ApiTicket | null>(null);
  const [errorMsg, setErrorMsg] = useState('');
  const isProcessing = useRef(false);

  const startScanner = () => {
    const html5QrCode = new Html5Qrcode('qr-reader');
    scannerRef.current = html5QrCode;

    html5QrCode.start(
      { facingMode: 'environment' },
      { fps: 10, qrbox: { width: 250, height: 250 } },
      async (decodedText) => {
        if (isProcessing.current) return;
        isProcessing.current = true;

        setScanState('loading');
        try {
          await html5QrCode.stop();
        } catch (_) {}

        try {
          const found = await fetchTicketByRef(decodedText.trim());
          if (found) {
            setTicket(found);
            setScanState('valid');
          } else {
            setErrorMsg(`No ticket found for ref: ${decodedText}`);
            setScanState('invalid');
          }
        } catch (err) {
          setErrorMsg('Error looking up ticket. Please try again.');
          setScanState('invalid');
        }
      },
      () => {}
    ).catch(() => {
      setErrorMsg('Could not access camera. Please allow camera permissions.');
      setScanState('invalid');
    });
  };

  useEffect(() => {
    startScanner();
    return () => {
      scannerRef.current?.stop().catch(() => {});
    };
  }, []);

  const reset = () => {
    setTicket(null);
    setErrorMsg('');
    isProcessing.current = false;
    setScanState('scanning');
    setTimeout(() => startScanner(), 100);
  };

  const isShowtimePast = (ticket: ApiTicket): boolean => {
    const ref = ticket.ticket_ref;
    if (!ref || ref.length < 8) return false;
    const year = parseInt(ref.substring(0, 4));
    const day = parseInt(ref.substring(4, 6));
    const month = parseInt(ref.substring(6, 8)) - 1;
    const timeStr = ticket.showtime.time;
    const parts = timeStr.split(' ');
    if (parts.length !== 2) return false;
    const [time, modifier] = parts;
    let [hours, minutes] = time.split(':').map(Number);
    if (modifier === 'PM' && hours < 12) hours += 12;
    if (modifier === 'AM' && hours === 12) hours = 0;
    const showDate = new Date(year, month, day, hours, minutes);
    return showDate.getTime() < Date.now();
  };

  return (
    <div className="max-w-lg mx-auto pt-32 pb-20 px-6 animate-fade-in">
      <div className="mb-10">
        <h1 className="font-serif text-3xl sm:text-4xl font-black text-[#DDBD68] tracking-[0.15em] uppercase">
          Scan Ticket
        </h1>
        <p className="text-white/30 tracking-[0.3em] text-[10px] uppercase mt-2 font-medium">
          Point camera at a customer's QR code
        </p>
      </div>

      {/* Scanner Viewport */}
      {(scanState === 'scanning' || scanState === 'loading') && (
        <div className="relative rounded-2xl overflow-hidden border border-white/[0.08] shadow-[0_4px_40px_rgba(0,0,0,0.6)] bg-[#0E0E0E]">
          <div id="qr-reader" className="w-full" />

          {/* Corner brackets overlay */}
          <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
            <div className="relative w-[250px] h-[250px]">
              {/* TL */}
              <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-[#DDBD68] rounded-tl-md" />
              {/* TR */}
              <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-[#DDBD68] rounded-tr-md" />
              {/* BL */}
              <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-[#DDBD68] rounded-bl-md" />
              {/* BR */}
              <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-[#DDBD68] rounded-br-md" />
              {/* Scanning line */}
              {scanState === 'scanning' && (
                <div className="absolute left-2 right-2 h-[2px] bg-gradient-to-r from-transparent via-[#DDBD68] to-transparent animate-[scan_2s_ease-in-out_infinite]" style={{ top: '50%' }} />
              )}
            </div>
          </div>

          {scanState === 'loading' && (
            <div className="absolute inset-0 bg-black/70 backdrop-blur-sm flex flex-col items-center justify-center gap-3">
              <div className="w-8 h-8 rounded-full border-2 border-[#DDBD68] border-t-transparent animate-spin" />
              <p className="text-[#DDBD68]/70 text-xs tracking-widest uppercase">Looking up ticket...</p>
            </div>
          )}
        </div>
      )}

      {/* Valid Ticket Result */}
      {scanState === 'valid' && ticket && (() => {
        const past = isShowtimePast(ticket);
        return (
          <div className="animate-scale-in flex flex-col gap-6">
            {/* Status banner */}
            <div className={`flex items-center gap-4 p-5 rounded-2xl border ${
              past
                ? 'bg-yellow-500/10 border-yellow-500/20'
                : 'bg-green-500/10 border-green-500/20'
            }`}>
              {past
                ? <XCircle className="w-10 h-10 text-yellow-400 shrink-0" />
                : <CheckCircle2 className="w-10 h-10 text-green-400 shrink-0" />
              }
              <div>
                <p className={`font-serif font-black text-xl tracking-wider uppercase ${past ? 'text-yellow-400' : 'text-green-400'}`}>
                  {past ? 'Ticket Expired' : 'Valid Ticket'}
                </p>
                <p className="text-white/40 text-xs tracking-wider mt-0.5">
                  {past ? 'This showtime has already passed.' : 'Customer may proceed to the cinema.'}
                </p>
              </div>
            </div>

            {/* Ticket Details */}
            <div className="bg-[#0E0E0E] rounded-2xl border border-white/[0.06] overflow-hidden">
              {ticket.movie.img && (
                <div className="relative h-32 overflow-hidden">
                  <img src={ticket.movie.img} alt={ticket.movie.title} className="w-full h-full object-cover object-top" />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0E0E0E] to-transparent" />
                </div>
              )}
              <div className="p-6 space-y-4">
                <h2 className="font-serif font-black text-[#DDBD68] text-xl tracking-wider uppercase leading-tight">
                  {ticket.movie.title}
                </h2>
                <div className="grid grid-cols-2 gap-4 pt-2">
                  {[
                    { label: 'Date', value: ticket.showtime.date },
                    { label: 'Time', value: ticket.showtime.time },
                    { label: 'Seat', value: `${ticket.seat.row}${ticket.seat.number}` },
                    { label: 'Hall', value: ticket.showtime.hall },
                  ].map(({ label, value }) => (
                    <div key={label}>
                      <p className="text-white/30 text-[9px] uppercase tracking-widest mb-1">{label}</p>
                      <p className="text-white text-sm font-semibold">{value}</p>
                    </div>
                  ))}
                </div>
                <div className="pt-2 border-t border-white/5">
                  <p className="text-white/30 text-[9px] uppercase tracking-widest mb-1">Reference</p>
                  <p className="text-[#DDBD68]/80 font-mono text-sm tracking-wider">{ticket.ticket_ref}</p>
                </div>
              </div>
            </div>

            <button
              onClick={reset}
              className="w-full flex items-center justify-center gap-2 py-3 border border-[#DDBD68]/25 rounded-xl text-[#DDBD68] hover:bg-[#DDBD68]/10 text-xs font-bold tracking-widest uppercase transition-all cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
              Scan Another Ticket
            </button>
          </div>
        );
      })()}

      {/* Invalid result */}
      {scanState === 'invalid' && (
        <div className="animate-scale-in flex flex-col gap-6">
          <div className="flex items-center gap-4 p-5 rounded-2xl bg-red-500/10 border border-red-500/20">
            <XCircle className="w-10 h-10 text-red-400 shrink-0" />
            <div>
              <p className="font-serif font-black text-xl text-red-400 tracking-wider uppercase">Invalid Ticket</p>
              <p className="text-white/40 text-xs tracking-wider mt-0.5">{errorMsg}</p>
            </div>
          </div>
          <button
            onClick={reset}
            className="w-full flex items-center justify-center gap-2 py-3 border border-[#DDBD68]/25 rounded-xl text-[#DDBD68] hover:bg-[#DDBD68]/10 text-xs font-bold tracking-widest uppercase transition-all cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
            Try Again
          </button>
        </div>
      )}

      <style>{`
        @keyframes scan {
          0%, 100% { top: 10%; }
          50% { top: 90%; }
        }
        #qr-reader video { border-radius: 0 !important; }
        #qr-reader__scan_region { border: none !important; }
        #qr-reader__dashboard { display: none !important; }
      `}</style>
    </div>
  );
}
