import { collection, getDocs, doc, getDoc, addDoc, query, where } from 'firebase/firestore';
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
  reference: string;
  user_email: string;
  movie: ApiMovie;
  showtime: {
    date: string;
    time: string;
    hall: string;
  };
  seats: ApiSeat[];
  status: 'pending' | 'confirmed' | 'cancelled';
  total_amount: number;
  payment_method: string;
  created_at: string;
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

// Bookings
export const createBooking = async (payload: any): Promise<ApiBooking> => {
  const bookingsCol = collection(db, 'bookings');
  const newBooking = await addDoc(bookingsCol, {
    status: 'pending',
    ...payload,
    created_at: new Date().toISOString(),
  });
  
  const bookingRef = await getDoc(newBooking);
  return { id: bookingRef.id, ...bookingRef.data() } as ApiBooking;
};

export const fetchUserBookings = async (email: string): Promise<ApiBooking[]> => {
  const bookingsCol = collection(db, 'bookings');
  const q = query(bookingsCol, where('user_email', '==', email));
  const snapshot = await getDocs(q);
  const bookings: ApiBooking[] = [];
  snapshot.forEach(doc => {
    bookings.push({ id: doc.id, ...doc.data() } as ApiBooking);
  });
  // Sort by created_at descending (newest first)
  bookings.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  return bookings;
};

export const fetchOccupiedSeats = async (movieId: string, date: string, time: string): Promise<string[]> => {
  const bookingsCol = collection(db, 'bookings');
  const q = query(bookingsCol, where('movie.id', '==', movieId));
  const snapshot = await getDocs(q);
  
  const occupied: string[] = [];
  snapshot.forEach(doc => {
    const data = doc.data() as ApiBooking;
    if (data.status === 'confirmed' && data.showtime.date === date && data.showtime.time === time) {
      data.seats.forEach(s => occupied.push(s.id));
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
