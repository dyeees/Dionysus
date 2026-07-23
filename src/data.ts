export interface ShowtimeDate {
  isToday?: boolean;
  dayOfWeek?: string;
  day?: string;
  month?: string;
  times: string[];
}

export interface Movie {
  id: number;
  title: string;
  img: string;
  showtimes: ShowtimeDate[];
  director?: string;
  cast?: string;
  synopsis?: string;
  runtime?: string;
}

const defaultDetails = {
  director: 'Christopher Nolan',
  cast: 'Leonardo DiCaprio, Joseph Gordon-Levitt, Elliot Page',
  synopsis: 'A thief who steals corporate secrets through the use of dream-sharing technology is given the inverse task of planting an idea into the mind of a C.E.O.',
  runtime: '2h 28m'
};

const defaultShowtimes: ShowtimeDate[] = [
  { isToday: true, times: ['10:00 AM', '1:15 PM', '4:30 PM', '7:45 PM', '10:30 PM'] },
  { dayOfWeek: 'FRI', day: '24', month: 'JUL', times: ['11:00 AM', '2:00 PM', '5:00 PM', '8:00 PM'] },
  { dayOfWeek: 'SAT', day: '25', month: 'JUL', times: ['9:30 AM', '12:45 PM', '4:00 PM', '7:15 PM'] },
  { dayOfWeek: 'SUN', day: '26', month: 'JUL', times: ['10:30 AM', '1:30 PM', '4:30 PM', '7:30 PM'] },
  { dayOfWeek: 'MON', day: '27', month: 'JUL', times: ['6:00 PM', '8:30 PM', '11:00 PM'] },
  { dayOfWeek: 'TUE', day: '28', month: 'JUL', times: ['7:00 PM', '9:30 PM'] }
];

export const NOW_SHOWING: Movie[] = [
  { id: 1, title: 'Neon Horizon', img: '/images/sci_fi_movie_poster_1784678342992.png', showtimes: defaultShowtimes, ...defaultDetails },
  { id: 2, title: 'Blade of Aether', img: '/images/fantasy_movie_poster_1784678352631.png', showtimes: defaultShowtimes, ...defaultDetails },
  { id: 3, title: 'Extraction Point', img: '/images/action_movie_poster_1784678361087.png', showtimes: defaultShowtimes, ...defaultDetails },
  { id: 4, title: 'Horror Movie', img: '/images/horror_movie_poster_1784679040189.png', showtimes: defaultShowtimes, ...defaultDetails },
  { id: 5, title: 'Comedy Movie', img: '/images/comedy_movie_poster_1784679050150.png', showtimes: defaultShowtimes, ...defaultDetails },
  { id: 6, title: 'Romance Movie', img: '/images/romance_movie_poster_1784679058597.png', showtimes: defaultShowtimes, ...defaultDetails },
  { id: 7, title: 'Superhero Movie', img: '/images/superhero_movie_poster_1784682091775.png', showtimes: defaultShowtimes, ...defaultDetails },
  { id: 8, title: 'Animation Movie', img: '/images/animation_movie_poster_1784683337920.png', showtimes: defaultShowtimes, ...defaultDetails },
  { id: 9, title: 'Thriller Movie', img: '/images/thriller_movie_poster_1784683348023.png', showtimes: defaultShowtimes, ...defaultDetails }
];

export const COMING_SOON: Movie[] = [
  { id: 10, title: 'Animation Movie', img: '/images/animation_movie_poster_1784683337920.png', showtimes: [], ...defaultDetails },
  { id: 11, title: 'Thriller Movie', img: '/images/thriller_movie_poster_1784683348023.png', showtimes: [], ...defaultDetails },
  { id: 12, title: 'Neon Horizon 2', img: '/images/sci_fi_movie_poster_1784678342992.png', showtimes: [], ...defaultDetails },
  { id: 13, title: 'Blade of Aether 2', img: '/images/fantasy_movie_poster_1784678352631.png', showtimes: [], ...defaultDetails }
];

