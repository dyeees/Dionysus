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
  return showtimes.map(st => {
    if (st.date && (!st.month || !st.day)) {
      // Parse YYYY-MM-DD reliably in local timezone
      const parts = st.date.split('-');
      const dateObj = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
      const today = new Date();
      const isToday = dateObj.toDateString() === today.toDateString();
      const month = dateObj.toLocaleString('default', { month: 'short' }).toUpperCase();
      const day = dateObj.getDate().toString().padStart(2, '0');
      const dayOfWeek = dateObj.toLocaleString('default', { weekday: 'short' }).toUpperCase();
      return { ...st, isToday, month, day, dayOfWeek };
    }
    return st;
  });
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
    ...payload,
    created_at: new Date().toISOString(),
    status: 'pending'
  });
  
  const bookingRef = await getDoc(newBooking);
  return { id: bookingRef.id, ...bookingRef.data() } as ApiBooking;
};
