import { collection, getDocs, doc, getDoc, query, where, writeBatch } from 'firebase/firestore';
import { db } from './firebase';

export interface ShowtimeDate {
  isToday?: boolean;
  dayOfWeek?: string;
  day?: string;
  month?: string;
  date?: string;
  times: string[];
}

export interface ApiMovie {
  id: string;
  title: string;
  img: string;
  showtimes: ShowtimeDate[];
  director?: string;
  cast?: string;
  synopsis?: string;
  runtime?: string;
  trailerUrl?: string;
  status?: 'now_showing' | 'coming_soon';
}

export interface ApiSeat {
  id: string;
  row: string;
  number: number;
  type: 'standard' | 'regular' | 'premium';
  price: number;
  is_occupied: boolean;
}

export interface ApiBooking {
  id: string;
  booking_id: string;
  user_email: string;
  movie: { id: string; title: string; img: string };
  showtime: {
    date: string;
    time: string;
    hall: string;
  };
  status: 'pending' | 'confirmed' | 'cancelled';
  total_amount: number;
  payment_method: string;
  created_at: string;
}

export interface ApiTicket {
  id: string;
  ticket_ref: string;
  booking_id: string;
  user_email: string;
  movie: { id: string; title: string; img: string };
  showtime: { date: string; time: string; hall: string };
  seat: { id: string; row: string; number: number };
  status: 'confirmed' | 'cancelled';
}

function parseShowtimes(showtimes: any[] = []): ShowtimeDate[] {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return showtimes
    .map(st => {
      let dateObj: Date | null = null;
      
      if (st.date) {
        const parts = st.date.split('-');
        if (parts.length === 3) {
          dateObj = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
        } else {
          dateObj = new Date(st.date);
        }
      } else if (st.month && st.day) {
        dateObj = new Date(`${st.month} ${st.day}, ${today.getFullYear()}`);
        // If parsed date is in the deep past (e.g. Jan vs Dec), assume next year
        if (today.getTime() - dateObj.getTime() > 180 * 24 * 60 * 60 * 1000) {
          dateObj.setFullYear(today.getFullYear() + 1);
        }
      }

      if (dateObj && !isNaN(dateObj.getTime())) {
        if (dateObj.getTime() < today.getTime()) {
          return null;
        }
        const isToday = dateObj.toDateString() === today.toDateString();
        const month = dateObj.toLocaleString('default', { month: 'short' }).toUpperCase();
        const day = dateObj.getDate().toString().padStart(2, '0');
        const dayOfWeek = dateObj.toLocaleString('default', { weekday: 'short' }).toUpperCase();
        return { ...st, isToday, month, day, dayOfWeek };
      }
      return st;
    })
    .filter(Boolean) as ShowtimeDate[];
}

function processMovie(doc: any): ApiMovie {
  const data = doc.data();
  return {
    ...data,
    id: doc.id,
    showtimes: parseShowtimes(data.showtimes)
  } as ApiMovie;
}

// Movies
export const fetchMovies = async (): Promise<ApiMovie[]> => {
  const moviesCol = collection(db, 'movies');
  const q = query(moviesCol, where('status', '==', 'now_showing'));
  const movieSnapshot = await getDocs(q);
  return movieSnapshot.docs.map(processMovie);
};

export const fetchComingSoon = async (): Promise<ApiMovie[]> => {
  const moviesCol = collection(db, 'movies');
  const q = query(moviesCol, where('status', '==', 'coming_soon'));
  const movieSnapshot = await getDocs(q);
  return movieSnapshot.docs.map(processMovie);
};

export const fetchMovie = async (id: string): Promise<ApiMovie> => {
  const movieRef = doc(db, 'movies', id);
  const movieSnap = await getDoc(movieRef);
  if (movieSnap.exists()) {
    return processMovie(movieSnap);
  }
  throw new Error("Movie not found");
};

export function generateCustomRef(dateLabel: string, seatId: string): string {
  const d = new Date();
  const year = d.getFullYear().toString();
  
  let mm = (d.getMonth() + 1).toString().padStart(2, '0');
  let dd = d.getDate().toString().padStart(2, '0');
  
  if (!dateLabel.startsWith('TODAY')) {
    const [monthDay] = dateLabel.split('·').map(s => s.trim());
    if (monthDay) {
      const parts = monthDay.split(' ');
      if (parts.length === 2) {
        const monthMap: Record<string, string> = {
          'JAN': '01', 'FEB': '02', 'MAR': '03', 'APR': '04',
          'MAY': '05', 'JUN': '06', 'JUL': '07', 'AUG': '08',
          'SEP': '09', 'OCT': '10', 'NOV': '11', 'DEC': '12'
        };
        if (monthMap[parts[0]]) mm = monthMap[parts[0]];
        dd = parts[1].padStart(2, '0');
      }
    }
  }

  const rowLetter = seatId.charAt(0).toUpperCase();
  const letterIndex = Math.max(1, rowLetter.charCodeAt(0) - 64).toString().padStart(2, '0');
  
  const seatNumStr = seatId.slice(1);
  const seatNum = parseInt(seatNumStr, 10).toString().padStart(2, '0');

  return `${year}${dd}${mm}${letterIndex}${seatNum}`;
}

// Bookings
export const createBooking = async (payload: Omit<ApiBooking, 'id' | 'created_at'>, seats: ApiSeat[]): Promise<ApiBooking> => {
  const batch = writeBatch(db);
  
  const bookingRef = doc(collection(db, 'bookings'));
  const createdAt = new Date().toISOString();
  
  const bookingData = {
    ...payload,
    created_at: createdAt,
  };
  batch.set(bookingRef, bookingData);
  
  seats.forEach(seat => {
    const ticketRefDoc = doc(collection(db, 'tickets'));
    const ticketRefStr = generateCustomRef(payload.showtime.date, seat.id);
    const ticketData = {
      ticket_ref: ticketRefStr,
      booking_id: payload.booking_id,
      user_email: payload.user_email,
      movie: payload.movie,
      showtime: payload.showtime,
      seat: { id: seat.id, row: seat.row, number: seat.number },
      status: payload.status,
    };
    batch.set(ticketRefDoc, ticketData);
  });
  
  await batch.commit();
  
  return { id: bookingRef.id, ...bookingData } as ApiBooking;
};

export const fetchUserTickets = async (email: string): Promise<ApiTicket[]> => {
  const ticketsCol = collection(db, 'tickets');
  const q = query(ticketsCol, where('user_email', '==', email));
  const snapshot = await getDocs(q);
  const tickets: ApiTicket[] = [];
  snapshot.forEach(doc => {
    tickets.push({ id: doc.id, ...doc.data() } as ApiTicket);
  });
  // Sort or handle order if needed
  return tickets;
};

export const fetchOccupiedSeats = async (movieId: string, date: string, time: string): Promise<string[]> => {
  const ticketsCol = collection(db, 'tickets');
  const q = query(ticketsCol, where('movie.id', '==', movieId));
  const snapshot = await getDocs(q);
  
  const occupied: string[] = [];
  snapshot.forEach(doc => {
    const data = doc.data() as ApiTicket;
    if (data.status === 'confirmed' && data.showtime.date === date && data.showtime.time === time) {
      occupied.push(data.seat.id);
    }
  });
  return occupied;
};

// Payments (via backend)
const BACKEND_URL = 'http://localhost:3001';

export const createPaymentQR = async (referenceId: string, amount: number) => {
  const response = await fetch(`${BACKEND_URL}/api/payment/qr`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ reference_id: referenceId, amount })
  });
  if (!response.ok) {
    throw new Error('Failed to create payment QR');
  }
  return response.json();
};

export const checkPaymentStatus = async (referenceId: string) => {
  const response = await fetch(`${BACKEND_URL}/api/payment/status/${referenceId}`);
  if (!response.ok) {
    throw new Error('Failed to check payment status');
  }
  return response.json();
};
