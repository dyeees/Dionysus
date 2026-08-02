import { useState, useEffect } from 'react';
import { fetchAllTickets, type ApiTicket } from '../api';
import { Search, X } from 'lucide-react';

export function TicketList() {
  const [tickets, setTickets] = useState<ApiTicket[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTicket, setSelectedTicket] = useState<ApiTicket | null>(null);

  useEffect(() => {
    const loadTickets = async () => {
      try {
        const data = await fetchAllTickets();
        setTickets(data);
      } catch (error) {
        console.error('Failed to load tickets', error);
      } finally {
        setLoading(false);
      }
    };
    loadTickets();
  }, []);

  const filteredTickets = tickets.filter(ticket => {
    const query = searchQuery.toLowerCase();
    return (
      ticket.ticket_ref?.toLowerCase().includes(query) ||
      ticket.user_email?.toLowerCase().includes(query) ||
      ticket.movie?.title?.toLowerCase().includes(query)
    );
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center pt-32 pb-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#DDBD68]"></div>
      </div>
    );
  }

  return (
    <div className="pt-28 pb-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
        <div>
          <h1 className="font-serif text-3xl sm:text-4xl font-black text-[#DDBD68] tracking-[0.15em] uppercase">
            All Tickets
          </h1>
          <p className="text-white/30 tracking-[0.3em] text-[10px] uppercase mt-2 font-medium">
            {tickets.length} bookings total
          </p>
        </div>
        <div className="hidden md:block flex-1 h-px mx-8 bg-gradient-to-l from-[#DDBD68]/20 to-transparent" />
        <div className="relative group w-full sm:w-72 shrink-0">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-[#DDBD68]/40 group-focus-within:text-[#DDBD68] transition-colors" />
          </div>
          <input
            type="text"
            className="block w-full pl-10 pr-3 py-2.5 border border-white/[0.08] rounded-lg bg-[#0E0E0E] text-white text-sm placeholder-white/20 focus:outline-none focus:border-[#DDBD68]/40 focus:ring-1 focus:ring-[#DDBD68]/20 transition-all"
            placeholder="Search email, ref or movie..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <div className="bg-[#0E0E0E] rounded-2xl border border-white/[0.06] overflow-hidden shadow-[0_4px_40px_rgba(0,0,0,0.6)]">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-white/70 whitespace-nowrap">
            <thead className="bg-[#1A1A1A] text-[#DDBD68] uppercase tracking-wider text-[10px] font-semibold border-b border-white/10">
              <tr>
                <th className="px-6 py-4">Reference</th>
                <th className="px-6 py-4">Movie</th>
                <th className="px-6 py-4">Showtime</th>
                <th className="px-6 py-4">Seat</th>
                <th className="px-6 py-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredTickets.length > 0 ? (
                filteredTickets.map((ticket) => (
                  <tr 
                    key={ticket.id} 
                    onClick={() => setSelectedTicket(ticket)}
                    className="hover:bg-white/[0.04] transition-colors cursor-pointer"
                  >
                    <td className="px-6 py-4 font-mono text-[#DDBD68]/90 text-xs">
                      {ticket.ticket_ref}
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-medium text-white">{ticket.movie?.title}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-white/90">{ticket.showtime?.date}</div>
                      <div className="text-white/40 text-xs mt-0.5">{ticket.showtime?.time} · {ticket.showtime?.hall}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-white/5 text-white/80 border border-white/10">
                        {ticket.seat?.row}{ticket.seat?.number}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                        ticket.status === 'confirmed' 
                          ? 'bg-green-500/10 text-green-400 border-green-500/20'
                          : 'bg-red-500/10 text-red-400 border-red-500/20'
                      }`}>
                        {ticket.status?.toUpperCase() || 'UNKNOWN'}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-white/30">
                    No tickets found matching your search.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {selectedTicket && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in" onClick={() => setSelectedTicket(null)}>
          <div className="bg-[#111] border border-white/10 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden relative" onClick={e => e.stopPropagation()}>
            <button 
              onClick={() => setSelectedTicket(null)}
              className="absolute top-4 right-4 text-white/40 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="p-6 sm:p-8">
              <h3 className="text-[#DDBD68] font-serif text-xl tracking-widest uppercase mb-8">
                Ticket Details
              </h3>
              
              <div className="space-y-5">
                <div>
                  <p className="text-white/40 text-[10px] uppercase tracking-widest mb-1.5 font-semibold">Customer Email</p>
                  <p className="text-white text-base">{selectedTicket.user_email}</p>
                </div>
                <div>
                  <p className="text-white/40 text-[10px] uppercase tracking-widest mb-1.5 font-semibold">Reference Code</p>
                  <p className="text-[#DDBD68] font-mono text-sm tracking-wider">{selectedTicket.ticket_ref}</p>
                </div>
                <div>
                  <p className="text-white/40 text-[10px] uppercase tracking-widest mb-1.5 font-semibold">Movie</p>
                  <p className="text-white text-base font-medium">{selectedTicket.movie?.title}</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-white/40 text-[10px] uppercase tracking-widest mb-1.5 font-semibold">Showtime</p>
                    <p className="text-white text-sm">{selectedTicket.showtime?.date}</p>
                    <p className="text-white/60 text-xs mt-0.5">{selectedTicket.showtime?.time}</p>
                  </div>
                  <div>
                    <p className="text-white/40 text-[10px] uppercase tracking-widest mb-1.5 font-semibold">Seat</p>
                    <p className="text-white text-sm">{selectedTicket.seat?.row}{selectedTicket.seat?.number}</p>
                  </div>
                </div>
                <div className="pt-2">
                   <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold tracking-wider border ${
                     selectedTicket.status === 'confirmed' 
                       ? 'bg-green-500/10 text-green-400 border-green-500/20'
                       : 'bg-red-500/10 text-red-400 border-red-500/20'
                   }`}>
                     {selectedTicket.status?.toUpperCase() || 'UNKNOWN'}
                   </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
