import { collection, addDoc, getDocs, doc, updateDoc, query, where } from 'firebase/firestore';
import { db } from './firebase';

export interface ShowtimeDate {
  date: string;
  times: string[];
  // derived display fields (populated after fetch)
  isToday?: boolean;
  dayOfWeek?: string;
  day?: string;
  month?: string;
}

export interface ApiMovie {
  id?: string;
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

function parseShowtimes(showtimes: ShowtimeDate[] = []): ShowtimeDate[] {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return showtimes.map(st => {
    if (!st.date) return st;
    const parts = st.date.split('-');
    const dateObj = parts.length === 3
      ? new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]))
      : new Date(st.date);

    if (isNaN(dateObj.getTime())) return st;

    const isToday = dateObj.toDateString() === today.toDateString();
    const month = dateObj.toLocaleString('default', { month: 'short' }).toUpperCase();
    const day = dateObj.getDate().toString().padStart(2, '0');
    const dayOfWeek = dateObj.toLocaleString('default', { weekday: 'short' }).toUpperCase();
    return { ...st, isToday, month, day, dayOfWeek };
  });
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

export const addMovie = async (movie: ApiMovie) => {
  const moviesRef = collection(db, 'movies');
  const docRef = await addDoc(moviesRef, movie);
  return docRef.id;
};

export const fetchAllMovies = async (): Promise<ApiMovie[]> => {
  const moviesCol = collection(db, 'movies');
  const movieSnapshot = await getDocs(moviesCol);
  return movieSnapshot.docs.map(doc => {
    const data = doc.data() as ApiMovie;
    return { ...data, id: doc.id, showtimes: parseShowtimes(data.showtimes || []) };
  });
};

export const updateMovie = async (id: string, movie: Partial<ApiMovie>) => {
  const movieRef = doc(db, 'movies', id);
  await updateDoc(movieRef, movie);
};

export const fetchAllTickets = async (): Promise<ApiTicket[]> => {
  const ticketsCol = collection(db, 'tickets');
  const ticketSnapshot = await getDocs(ticketsCol);
  return ticketSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ApiTicket));
};

export const fetchTicketByRef = async (ref: string): Promise<ApiTicket | null> => {
  const ticketsCol = collection(db, 'tickets');
  const q = query(ticketsCol, where('ticket_ref', '==', ref));
  const snapshot = await getDocs(q);
  if (snapshot.empty) return null;
  const docSnap = snapshot.docs[0];
  return { id: docSnap.id, ...docSnap.data() } as ApiTicket;
};
