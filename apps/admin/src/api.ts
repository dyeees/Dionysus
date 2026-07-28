import { collection, addDoc } from 'firebase/firestore';
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
