const fs = require('fs');
const path = require('path');

const filePath = 'C:\\Users\\mansu\\.antigravity-ide\\IMovies\\client\\src\\pages\\HomePage.jsx';

const content = `
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import MovieCard from '../components/MovieCard';
import { Film, Play, Star, Calendar, ShieldCheck, Ticket, Sparkles, Search, ChevronRight } from 'lucide-react';

export default function HomePage() {
  const [featured, setFeatured] = useState([]);
  const [trending, setTrending] = useState([]);
  const [nowShowing, setNowShowing] = useState([]);
  const [comingSoon, setComingSoon] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGenre, setSelectedGenre] = useState('All');
  const [trailerModal, setTrailerModal] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchHomeData = async () => {
      try {
        const res = await api.get('/movies/featured');
        setFeatured(res.data.featured || []);
        setTrending(res.data.trending || []);
        setNowShowing(res.data.nowShowing || []);
        setComingSoon(res.data.comingSoon || []);
      } catch (err) {
        console.error('Failed to load homepage movies:', err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchHomeData();
  }, []);

  const heroMovie = featured[0] || nowShowing[0];

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(\`/movies?search=\${encodeURIComponent(searchQuery.trim())}\`);
    }
  };

  const genres = ['All', 'Action', 'Sci-Fi', 'Adventure', 'Drama', 'Thriller', 'Animation'];

  return (
    <div>
      {/* Cinematic Hero Banner */}
      {heroMovie && (
        <div
          className="position-relative py-5 overflow-hidden"
          style={{
            minHeight: '75vh',
            backgroundImage: \`linear-gradient(to right, #070a13 15%, rgba(7, 10, 19, 0.75) 60%, rgba(7, 10, 19, 0.45) 100%), url(\${heroMovie.backdropUrl || heroMovie.posterUrl})\`,
            backgroundSize: 'cover',
            backgroundPosition: 'center top'
          }}
        >
          <div className="container py-lg-5">
            <div className="row align-items-center">
              <div className="col-lg-7 col-md-9">
                <div className="d-inline-flex align-items-center gap-2 px-3 py-1 rounded-pill bg-danger bg-opacity-25 border border-danger text-danger small fw-bold mb-3">
                  <Sparkles size={14} /> FEATURED PREMIERE &bull; NOW SHOWING
                </div>

                <h1 className="display-4 fw-black text-white brand-font mb-3 text-shadow">
                  {heroMovie.title}
                </h1>

                <div className="d-flex align-items-center gap-3 text-light small mb-3">
                  <span className="badge bg-warning text-dark fw-bold d-flex align-items-center gap-1">
                    <Star size={13} fill="#000" /> {heroMovie.rating?.toFixed(1) || '8.8'} / 10
                  </span>
                  <span>{heroMovie.duration} Mins</span>
                  <span>&bull;</span>
                  <span>{heroMovie.language?.join(', ') || 'English'}</span>
                  <span>&bull;</span>
                  <span className="badge bg-secondary">{heroMovie.ageRating || 'UA'}</span>
                </div>

                <p className="text-light text-opacity-75 fs-6 mb-4 pe-lg-5 line-clamp-3">
                  {heroMovie.description}
                </p>

                <div className="d-flex flex-wrap gap-3">
                  <Link to={\`/movie/\${heroMovie._id}\`} className="btn btn-im-primary px-4 py-3 fs-6">
                    <Ticket size={18} /> Book Tickets Now
                  </Link>
                  {heroMovie.trailerUrl && (
                    <button
                      className="btn btn-im-outline px-4 py-3 fs-6"
                      onClick={() => setTrailerModal(heroMovie.trailerUrl)}
                    >
                      <Play size={18} fill="#fff" /> Watch Trailer
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div
            className="position-absolute bottom-0 start-0 w-100"
            style={{ height: '80px', background: 'linear-gradient(to top, var(--im-bg-primary), transparent)' }}
          ></div>
        </div>
      )}

      {/* Quick Search & Genre Filter Bar */}
      <div className="container my-4">
        <div className="p-3 im-card-glass shadow">
          <form onSubmit={handleSearchSubmit} className="row g-2 align-items-center">
            <div className="col-md-5">
              <div className="input-group">
                <span className="input-group-text bg-dark border-secondary text-muted">
                  <Search size={18} />
                </span>
                <input
                  type="text"
                  className="form-control bg-dark border-secondary text-white"
                  placeholder="Search movies by title, director, or cast..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
            <div className="col-md-5">
              <div className="d-flex flex-wrap gap-1">
                {genres.map((g) => (
                  <button
                    key={g}
                    type="button"
                    onClick={() => {
                      setSelectedGenre(g);
                      navigate(\`/movies?genre=\${encodeURIComponent(g)}\`);
                    }}
                    className={\`btn btn-sm \${selectedGenre === g ? 'btn-danger' : 'btn-outline-secondary text-light'}\`}
                    style={{ fontSize: '0.78rem' }}
                  >
                    {g}
                  </button>
                ))}
              </div>
            </div>
            <div className="col-md-2">
              <button type="submit" className="btn btn-im-primary w-100 justify-content-center">
                Search
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Main Movie Grids */}
      <div className="container py-4">
        {/* Now Showing Section */}
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div>
            <h2 className="text-white fw-bold brand-font mb-1">Now Showing in Cinemas</h2>
            <p className="text-muted small mb-0">Book tickets for the latest blockbuster releases</p>
          </div>
          <Link to="/movies?status=now_showing" className="text-danger text-decoration-none fw-semibold small d-flex align-items-center gap-1">
            View All <ChevronRight size={16} />
          </Link>
        </div>

        {loading ? (
          <div className="text-center py-5">
            <div className="spinner-border text-danger" role="status"></div>
          </div>
        ) : (
          <div className="row row-cols-1 row-cols-sm-2 row-cols-md-3 row-cols-lg-4 g-4 mb-5">
            {nowShowing.slice(0, 8).map((m) => (
              <div className="col" key={m._id}>
                <MovieCard movie={m} />
              </div>
            ))}
          </div>
        )}

        {/* Trending Section */}
        {trending.length > 0 && (
          <div className="my-5">
            <div className="d-flex justify-content-between align-items-center mb-4">
              <div>
                <h2 className="text-white fw-bold brand-font mb-1">Trending Releases</h2>
                <p className="text-muted small mb-0">Most popular movies this week</p>
              </div>
              <Link to="/movies?sort=popularity" className="text-danger text-decoration-none fw-semibold small d-flex align-items-center gap-1">
                Explore Trending <ChevronRight size={16} />
              </Link>
            </div>

            <div className="row row-cols-1 row-cols-sm-2 row-cols-md-3 row-cols-lg-4 g-4">
              {trending.slice(0, 4).map((m) => (
                <div className="col" key={m._id}>
                  <MovieCard movie={m} />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Coming Soon Section */}
        {comingSoon.length > 0 && (
          <div className="my-5">
            <div className="d-flex justify-content-between align-items-center mb-4">
              <div>
                <h2 className="text-white fw-bold brand-font mb-1">Coming Soon</h2>
                <p className="text-muted small mb-0">Anticipated films arriving in theaters shortly</p>
              </div>
              <Link to="/movies?status=coming_soon" className="text-danger text-decoration-none fw-semibold small d-flex align-items-center gap-1">
                View Upcoming <ChevronRight size={16} />
              </Link>
            </div>

            <div className="row row-cols-1 row-cols-sm-2 row-cols-md-3 row-cols-lg-4 g-4">
              {comingSoon.slice(0, 4).map((m) => (
                <div className="col" key={m._id}>
                  <MovieCard movie={m} />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Why Choose IMovies Perks */}
        <div className="my-5 p-4 im-card-glass">
          <div className="text-center mb-4">
            <h3 className="text-white fw-bold brand-font">Why Book With IMovies?</h3>
            <p className="text-muted small">The modern standard for cinema ticket reservations</p>
          </div>
          <div className="row g-4 text-center">
            <div className="col-md-3 col-sm-6">
              <div className="p-3">
                <div className="text-danger fs-2 mb-2"><Ticket size={32} /></div>
                <h6 className="text-white fw-bold">Live Interactive Seating</h6>
                <p className="text-muted small">Choose your exact preferred seat with real-time availability updates.</p>
              </div>
            </div>
            <div className="col-md-3 col-sm-6">
              <div className="p-3">
                <div className="text-danger fs-2 mb-2"><ShieldCheck size={32} /></div>
                <h6 className="text-white fw-bold">Concurrency-Safe Hold</h6>
                <p className="text-muted small">Guaranteed 5-minute seat lock to prevent double booking or race conditions.</p>
              </div>
            </div>
            <div className="col-md-3 col-sm-6">
              <div className="p-3">
                <div className="text-danger fs-2 mb-2"><Sparkles size={32} /></div>
                <h6 className="text-white fw-bold">Premium Formats</h6>
                <p className="text-muted small">Experience IMAX Laser, Dolby Cinema, and 4DX immersive auditoriums.</p>
              </div>
            </div>
            <div className="col-md-3 col-sm-6">
              <div className="p-3">
                <div className="text-danger fs-2 mb-2"><Calendar size={32} /></div>
                <h6 className="text-white fw-bold">Instant QR Tickets</h6>
                <p className="text-muted small">Paperless QR code access and easy cancellations up to 2 hours before showtime.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Trailer Modal */}
      {trailerModal && (
        <div
          className="modal show d-block"
          style={{ backgroundColor: 'rgba(0,0,0,0.85)', zIndex: 1060 }}
          onClick={() => setTrailerModal(null)}
        >
          <div className="modal-dialog modal-dialog-centered modal-lg" onClick={(e) => e.stopPropagation()}>
            <div className="modal-content bg-dark border-secondary">
              <div className="modal-header border-secondary">
                <h5 className="modal-title text-white">Movie Trailer</h5>
                <button type="button" className="btn-close btn-close-white" onClick={() => setTrailerModal(null)}></button>
              </div>
              <div className="modal-body p-0 ratio ratio-16x9">
                <iframe
                  src={trailerModal}
                  title="Trailer"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                ></iframe>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
`;

fs.writeFileSync(filePath, content.trim(), 'utf8');
console.log('HomePage.jsx written successfully');
