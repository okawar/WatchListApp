import { fetchData } from "./tmdb";

export const getTrending = async () => {
    return await fetchData('/trending/movie/day')
}

export const searchMovies = async (query: string) => {
    return await fetchData(`/search/movie?query=${query}`)
}

export const getMovieDetails = async (id: number) => {
    return await fetchData(`/movie/${id}`)
}

export const getMovieCredits = async (id: number) => {
    return await fetchData(`/movie/${id}/credits`)
}

export const getPopularMovies = async (page: number = 1) => {
    return await fetchData(`/movie/popular?page=${page}`)
}

export const getPopularTVShows = async (page: number = 1) => {
    return await fetchData(`/tv/popular?page=${page}`)
}