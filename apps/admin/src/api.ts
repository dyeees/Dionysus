import { collection, addDoc, getDocs, doc, updateDoc } from 'firebase/firestore';
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
  status?: 'now_showing' | 'coming_soon';
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
