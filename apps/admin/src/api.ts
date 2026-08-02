import { collection, addDoc, getDocs, doc, updateDoc, query, where } from 'firebase/firestore';
import { db } from './firebase';

export interface ShowtimeDate {
  date: string;
  times: string[];
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
  return movieSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ApiMovie));
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
