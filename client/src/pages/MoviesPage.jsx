import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../services/api';
import MovieCard from '../components/MovieCard';
import { Search, Filter, SlidersHorizontal, RefreshCw } from 'lucide-react';

export default function MoviesPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);

  const search = searchParams.get('search') || '';
  const genre = searchParams.get('genre') || 'All';
  const language = searchParams.get('language') || 'All';
  const status = searchParams.get('status') || '';
  const sort = searchParams.get('sort') || 'rating';

  const genresList = ['All', 'Action', 'Sci-Fi', 'Adventure', 'Drama', 'Thriller', 'Animation', 'Biography', 'Crime'];
  const languagesList = ['All', 'English', 'Hindi', 'Tamil', 'Telugu', 'Japanese'];

  useEffect(() => {
    const fetchMovies = async () => {
      setLoading(true);
      try {
        const queryParams = new URLSearchParams();
        if (search) queryParams.append('search', search);
        if (genre && genre !== 'All') queryParams.append('genre', genre);
        if (language && language !== 'All') queryParams.append('language', language);
        if (status) queryParams.append('status', status);
        if (sort) queryParams.append('sort', sort);

        const res = await api.get(`/movies?${queryParams.toString()}`);
        setMovies(res.data.movies || []);
        setTotal(res.data.total || 0);
      } catch (err) {
        console.error('Failed to load movies:', err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchMovies();
  }, [search, genre, language, status, sort]);

  const updateFilter = (key, value) => {
    const newParams = new URLSearchParams(searchParams);
    if (value && value !== 'All') {
      newParams.set(key, value);
    } else {
      newParams.delete(key);
    }
    setSearchParams(newParams);
  };

  const clearAllFilters = () => {
    setSearchParams({});
  };

  return (
    <div className="container py-4">
      {/* Header */}
      <div className="mb-4">
        <h1 className="display-6 fw-bold text-white brand-font mb-1">Explore Movies</h1>
        <p className="text-muted small">Browse releases, filter by your favorite genres, and find showtimes</p>
      </div>

      {/* Filter Toolbar */}
      <div className="p-3 im-card-glass mb-4 shadow-sm">
        <div className="row g-3 align-items-center">
          {/* Search */}
          <div className="col-lg-4 col-md-6">
            <div className="input-group">
              <span className="input-group-text bg-dark border-secondary text-muted">
                <Search size={16} />
              </span>
              <input
                type="text"
                className="form-control bg-dark border-secondary text-white"
                placeholder="Search movies..."
                value={search}
                onChange={(e) => updateFilter('search', e.target.value)}
              />
            </div>
          </div>

          {/* Genre Dropdown */}
          <div className="col-lg-2 col-md-3 col-6">
            <select
              className="form-select bg-dark border-secondary text-white small"
              value={genre}
              onChange={(e) => updateFilter('genre', e.target.value)}
            >
              {genresList.map(g => (
                <option key={g} value={g}>{g === 'All' ? 'All Genres' : g}</option>
              ))}
            </select>
          </div>

          {/* Language Dropdown */}
          <div className="col-lg-2 col-md-3 col-6">
            <select
              className="form-select bg-dark border-secondary text-white small"
              value={language}
              onChange={(e) => updateFilter('language', e.target.value)}
            >
              {languagesList.map(l => (
                <option key={l} value={l}>{l === 'All' ? 'All Languages' : l}</option>
              ))}
            </select>
          </div>

          {/* Sort Dropdown */}
          <div className="col-lg-2 col-md-6 col-6">
            <select
              className="form-select bg-dark border-secondary text-white small"
              value={sort}
              onChange={(e) => updateFilter('sort', e.target.value)}
            >
              <option value="rating">Highest Rated</option>
              <option value="popularity">Most Popular</option>
              <option value="releaseDate">Release Date</option>
              <option value="title">Alphabetical</option>
            </select>
          </div>

          {/* Reset */}
          <div className="col-lg-2 col-md-6 col-6 d-flex justify-content-end gap-2">
            <button
              onClick={clearAllFilters}
              className="btn btn-outline-secondary text-light btn-sm d-flex align-items-center gap-1 w-100 justify-content-center"
              title="Reset all filters"
            >
              <RefreshCw size={14} /> Reset
            </button>
          </div>
        </div>

        {/* Quick Status Pills */}
        <div className="d-flex flex-wrap gap-2 mt-3 pt-2 border-top border-secondary">
          <button
            onClick={() => updateFilter('status', '')}
            className={`btn btn-sm ${!status ? 'btn-danger' : 'btn-outline-secondary text-light'}`}
          >
            All Movies
          </button>
          <button
            onClick={() => updateFilter('status', 'now_showing')}
            className={`btn btn-sm ${status === 'now_showing' ? 'btn-danger' : 'btn-outline-secondary text-light'}`}
          >
            Now Showing
          </button>
          <button
            onClick={() => updateFilter('status', 'coming_soon')}
            className={`btn btn-sm ${status === 'coming_soon' ? 'btn-danger' : 'btn-outline-secondary text-light'}`}
          >
            Coming Soon
          </button>
        </div>
      </div>

      {/* Count Info */}
      <div className="d-flex justify-content-between align-items-center mb-3 text-muted small">
        <span>Showing <strong className="text-white">{movies.length}</strong> of <strong className="text-white">{total}</strong> titles</span>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-danger" role="status"></div>
          <p className="text-muted mt-2">Loading movie releases...</p>
        </div>
      ) : movies.length === 0 ? (
        <div className="text-center py-5 im-card-glass my-4">
          <p className="fs-5 text-white mb-2">No movies match your selected filters</p>
          <p className="text-muted small mb-3">Try adjusting your search query, genre selection, or language.</p>
          <button onClick={clearAllFilters} className="btn btn-im-primary btn-sm">
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="row row-cols-1 row-cols-sm-2 row-cols-md-3 row-cols-lg-4 g-4">
          {movies.map((m) => (
            <div className="col" key={m._id}>
              <MovieCard movie={m} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}