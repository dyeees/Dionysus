export interface Movie {
  id: number;
  title: string;
  img: string;
}

export const NOW_SHOWING: Movie[] = [
  { id: 1, title: 'Neon Horizon', img: '/images/sci_fi_movie_poster_1784678342992.png' },
  { id: 2, title: 'Blade of Aether', img: '/images/fantasy_movie_poster_1784678352631.png' },
  { id: 3, title: 'Extraction Point', img: '/images/action_movie_poster_1784678361087.png' },
  { id: 4, title: 'Horror Movie', img: '/images/horror_movie_poster_1784679040189.png' },
  { id: 5, title: 'Comedy Movie', img: '/images/comedy_movie_poster_1784679050150.png' },
  { id: 6, title: 'Romance Movie', img: '/images/romance_movie_poster_1784679058597.png' },
  { id: 7, title: 'Superhero Movie', img: '/images/superhero_movie_poster_1784682091775.png' },
  { id: 8, title: 'Animation Movie', img: '/images/animation_movie_poster_1784683337920.png' },
  { id: 9, title: 'Thriller Movie', img: '/images/thriller_movie_poster_1784683348023.png' }
];

export const COMING_SOON: Movie[] = [
  { id: 10, title: 'Animation Movie', img: '/images/animation_movie_poster_1784683337920.png' },
  { id: 11, title: 'Thriller Movie', img: '/images/thriller_movie_poster_1784683348023.png' },
  { id: 12, title: 'Neon Horizon 2', img: '/images/sci_fi_movie_poster_1784678342992.png' },
  { id: 13, title: 'Blade of Aether 2', img: '/images/fantasy_movie_poster_1784678352631.png' }
];

