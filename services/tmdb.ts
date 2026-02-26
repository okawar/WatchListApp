const BASE_URL: string = "https://api.themoviedb.org/3";

export const fetchData = async (endpoint: string) => {
  const separator = endpoint.includes("?") ? "&" : "?";

  const response = await fetch(
    BASE_URL +
      endpoint +
      separator +
      "api_key=" +
      process.env.EXPO_PUBLIC_TMDB_KEY +
      "&language=ru-RU",
  );
  const data = await response.json();
  return data;
};
