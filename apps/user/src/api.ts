import { collection, getDocs, doc, getDoc, addDoc, query, where } from 'firebase/firestore';
import { db } from './firebase';

export interface ShowtimeDate {
  isToday?: boolean;
  dayOfWeek?: string;
  day?: string;
  month?: string;
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

// Movies
export const fetchMovies = async (): Promise<ApiMovie[]> => {
  const moviesCol = collection(db, 'movies');
  const q = query(moviesCol, where('status', '==', 'now_showing'));
  const movieSnapshot = await getDocs(q);
  return movieSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ApiMovie));
};

export const fetchComingSoon = async (): Promise<ApiMovie[]> => {
  const moviesCol = collection(db, 'movies');
  const q = query(moviesCol, where('status', '==', 'coming_soon'));
  const movieSnapshot = await getDocs(q);
  return movieSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ApiMovie));
};

export const fetchMovie = async (id: string): Promise<ApiMovie> => {
  const movieRef = doc(db, 'movies', id);
  const movieSnap = await getDoc(movieRef);
  if (movieSnap.exists()) {
    return { id: movieSnap.id, ...movieSnap.data() } as ApiMovie;
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
