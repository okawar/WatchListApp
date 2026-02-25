import { fetchData } from "./tmdb";

export const getTrending = async () => {
    return await fetchData('/trending/movie/day')
}