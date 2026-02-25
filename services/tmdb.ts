// const BASE_URL = `/trending/movie/day?api_key=${process.env.EXPO_PUBLIC_TMDB_KEY}`;

const BASE_URL: string = "https://api.themoviedb.org/3";

export const fetchData = async (endpoint: string) => {
  const response = await fetch(
    BASE_URL + endpoint + "?api_key=" + process.env.EXPO_PUBLIC_TMDB_KEY,
  );
  const data = await response.json();
  return data;
};
