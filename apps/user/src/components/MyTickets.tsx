import { useState, useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { fetchUserTickets, type ApiTicket } from '../api';
import { auth } from '../firebase';

import { Ticket } from './Ticket';

function isTicketPast(ticket: ApiTicket): boolean {
  const ref = ticket.ticket_ref;
  if (!ref || ref.length < 8) return false;
  const year = parseInt(ref.substring(0, 4));
  const day = parseInt(ref.substring(4, 6));
  const month = parseInt(ref.substring(6, 8)) - 1;
  
  const timeStr = ticket.showtime.time;
  if (!timeStr) return false;
  const parts = timeStr.split(' ');
  if (parts.length !== 2) return false;
  const [time, modifier] = parts;
  let [hours, minutes] = time.split(':').map(Number);
  if (modifier === 'PM' && hours < 12) hours += 12;
  if (modifier === 'AM' && hours === 12) hours = 0;
  
  const showDate = new Date(year, month, day, hours, minutes);
  return showDate.getTime() < Date.now();
}

export function MyTickets() {
  const [activeTab, setActiveTab] = useState<'UPCOMING' | 'PAST'>('UPCOMING');
  const [tickets, setTickets] = useState<ApiTicket[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedGroup, setSelectedGroup] = useState<{ booking_id: string, movie: any, showtime: any, tickets: ApiTicket[] } | null>(null);

  // Browser back button navigation for ticket view
  useEffect(() => {
    const handlePopState = (e: PopStateEvent) => {
      const state = e.state || {};
      if (!state.ticketView) {
        setSelectedGroup(null);
      }
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user?.email) {
        setLoading(false);
        return;
      }
      try {
        const data = await fetchUserTickets(user.email);
        setTickets(data);
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

  if (tickets.length === 0) {
    return (
      <div className="bg-[#111]/90 rounded-2xl p-12 text-center border border-white/5 animate-fade-up shadow-[0_20px_60px_rgba(0,0,0,0.6)]">
        <div className="text-4xl mb-4 opacity-50">🎫</div>
        <h2 className="text-[#DDBD68] font-black text-2xl mb-2 tracking-widest uppercase" style={{ fontFamily: "'Cinzel', serif" }}>No Tickets Yet</h2>
        <p className="text-[#DDBD68]/40 text-xs tracking-wider">Your purchased tickets will appear here.</p>
      </div>
    );
  }

  // Group tickets by movie and showtime
  const groupedTickets = Object.values(
    tickets.reduce((acc, ticket) => {
      const groupKey = `${ticket.movie.id}-${ticket.showtime.date}-${ticket.showtime.time}`;
      if (!acc[groupKey]) {
        acc[groupKey] = {
          booking_id: groupKey,
          movie: ticket.movie,
          showtime: ticket.showtime,
          tickets: []
        };
      }
      acc[groupKey].tickets.push(ticket);
      return acc;
    }, {} as Record<string, { booking_id: string, movie: any, showtime: any, tickets: ApiTicket[] }>)
  ).filter(group => {
    const isPast = isTicketPast(group.tickets[0]);
    return activeTab === 'UPCOMING' ? !isPast : isPast;
  });

  return (
    <div className="flex flex-col gap-8 animate-fade-up">
      {!selectedGroup ? (
        <>
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 sm:gap-8 border-b border-white/[0.06] pb-4 mb-2">
            <h2 className="text-[#DDBD68] font-black text-2xl sm:text-3xl tracking-[0.2em] uppercase leading-none" style={{ fontFamily: "'Cinzel', serif" }}>
              My Tickets
            </h2>
            <div className="flex gap-6 sm:gap-8 w-full sm:w-auto items-baseline">
              <button
                onClick={() => setActiveTab('UPCOMING')}
                className={`relative pb-2 text-xs sm:text-sm tracking-[0.2em] font-bold uppercase transition-all duration-300 origin-bottom-left ${
                  activeTab === 'UPCOMING' ? 'text-[#DDBD68] scale-110' : 'text-white/30 hover:text-white/60 scale-90'
                }`}
              >
                Upcoming
              </button>
              <button
                onClick={() => setActiveTab('PAST')}
                className={`relative pb-2 text-xs sm:text-sm tracking-[0.2em] font-bold uppercase transition-all duration-300 origin-bottom-left ${
                  activeTab === 'PAST' ? 'text-[#DDBD68] scale-110' : 'text-white/30 hover:text-white/60 scale-90'
                }`}
              >
                Past
              </button>
            </div>
          </div>
          
          {/* Simple List View */}
          <div className="flex flex-col gap-3">
            {groupedTickets.length === 0 && (
              <div className="text-center py-10 text-white/40 text-sm tracking-widest uppercase">
                No {activeTab.toLowerCase()} tickets found.
              </div>
            )}
        {groupedTickets.map(group => (
          <div 
            key={group.booking_id} 
            onClick={() => {
              window.history.pushState({ ticketView: true }, '', '#ticket');
              setSelectedGroup(group);
            }}
            className="group flex items-center justify-between bg-white/[0.02] hover:bg-[#DDBD68]/10 border border-white/5 hover:border-[#DDBD68]/30 rounded-xl p-4 sm:p-5 transition-all duration-300 cursor-pointer"
          >
            <div className="flex items-center gap-4">
              <img src={group.movie.img} alt={group.movie.title} className="w-10 h-14 object-cover rounded-md shadow-sm border border-white/10" />
              <div className="flex flex-col">
                <h3 className="text-[#DDBD68] font-bold text-sm sm:text-base leading-tight uppercase tracking-widest" style={{ fontFamily: "'Cinzel', serif" }}>
                  {group.movie.title}
                </h3>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-white/40 text-[10px] tracking-widest uppercase">{group.showtime.date}</span>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="hidden sm:flex flex-col items-end mr-4">
                <span className="text-[#FCEEAA]/70 text-[10px] tracking-widest font-semibold">{group.showtime.time}</span>
                <span className="text-white/30 text-[9px] uppercase tracking-[0.2em]">{group.tickets.length} Seat{group.tickets.length > 1 ? 's' : ''}</span>
              </div>
              <svg className="w-5 h-5 text-white/20 group-hover:text-[#DDBD68] transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path></svg>
            </div>
          </div>
        ))}
      </div>
      </>
      ) : (
      // ── Full Ticket View ──────────────────────────────────────
      <div className="flex flex-col items-center w-full max-w-4xl mx-auto animate-fade-up gap-6">
        {selectedGroup.tickets.map((ticket) => (
          <Ticket 
            key={ticket.id} 
            movie={selectedGroup.movie} 
            showtime={selectedGroup.showtime} 
            seatId={ticket.seat.id} 
            reference={ticket.ticket_ref}
          />
        ))}
      </div>
      )}
    </div>
  );
}
