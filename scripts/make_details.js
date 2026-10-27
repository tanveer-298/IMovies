const fs = require('fs');

const filePath = 'C:\\Users\\mansu\\.antigravity-ide\\IMovies\\client\\src\\pages\\MovieDetailsPage.jsx';

const content = `
import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { Star, Clock, Calendar, MapPin, Play, Ticket, Sparkles } from 'lucide-react';

export default function MovieDetailsPage() {
  const { id } = useParams();
  const [movie, setMovie] = useState(null);
  const [shows, setShows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState('');
  const [trailerModal, setTrailerModal] = useState(false);
  const navigate = useNavigate();

  const dateOptions = [];
  const today = new Date();
  for (let i = 0; i < 4; i++) {
    const d = new Date(today);
    d.setDate(d.getDate() + i);
    const dateStr = d.toISOString().split('T')[0];
    const dayName = i === 0 ? 'Today' : i === 1 ? 'Tomorrow' : d.toLocaleDateString('en-US', { weekday: 'short' });
    const formatted = d.toLocaleDateString('en-US', { day: 'numeric', month: 'short' });
    dateOptions.push({ dateStr, dayName, formatted });
  }

  useEffect(() => {
    setSelectedDate(dateOptions[0].dateStr);
  }, []);

  useEffect(() => {
    const fetchMovieDetails = async () => {
      try {
        const res = await api.get(\`/movies/\${id}\`);
        setMovie(res.data.movie);

        const showsRes = await api.get(\`/shows?movieId=\${id}\`);
        setShows(showsRes.data.shows || []);
      } catch (err) {
        console.error('Failed to load movie details:', err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchMovieDetails();
  }, [id]);

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center py-5" style={{ minHeight: '60vh' }}>
        <div className="spinner-border text-danger" role="status"></div>
      </div>
    );
  }

  if (!movie) {
    return (
      <div className="container py-5 text-center">
        <h3 className="text-white">Movie not found</h3>
        <Link to="/movies" className="btn btn-im-primary mt-3">Back to Catalog</Link>
      </div>
    );
  }

  const filteredShows = shows.filter(s => s.date === selectedDate);

  const showsByCinema = {};
  filteredShows.forEach(s => {
    const cinemaId = s.cinemaId?._id || 'unknown';
    if (!showsByCinema[cinemaId]) {
      showsByCinema[cinemaId] = {
        cinema: s.cinemaId,
        shows: []
      };
    }
    showsByCinema[cinemaId].shows.push(s);
  });

  return (
    <div>
      {/* Backdrop Hero Header */}
      <div
        className="position-relative py-5"
        style={{
          backgroundImage: \`linear-gradient(to right, #070a13 25%, rgba(7, 10, 19, 0.85) 60%, rgba(7, 10, 19, 0.6) 100%), url(\${movie.backdropUrl || movie.posterUrl})\`,
          backgroundSize: 'cover',
          backgroundPosition: 'center top'
        }}
      >
        <div className="container py-lg-4">
          <div className="row align-items-center g-4">
            <div className="col-lg-3 col-md-4 text-center text-md-start">
              <img
                src={movie.posterUrl}
                alt={movie.title}
                className="rounded-3 shadow-lg img-fluid border border-secondary"
                style={{ maxHeight: '380px', objectFit: 'cover' }}
              />
            </div>

            <div className="col-lg-9 col-md-8 text-white">
              <div className="d-flex align-items-center gap-2 mb-2">
                <span className="badge bg-danger text-uppercase">{movie.status.replace('_', ' ')}</span>
                <span className="badge bg-secondary">{movie.ageRating || 'UA'}</span>
                <span className="badge bg-warning text-dark fw-bold d-flex align-items-center gap-1">
                  <Star size={12} fill="#000" /> {movie.rating?.toFixed(1) || '8.5'}
                </span>
              </div>

              <h1 className="display-5 fw-bold brand-font mb-2">{movie.title}</h1>

              <div className="d-flex flex-wrap align-items-center gap-3 text-muted small mb-3">
                <span className="d-flex align-items-center gap-1 text-light"><Clock size={14} /> {movie.duration} minutes</span>
                <span>&bull;</span>
                <span className="text-light">{movie.language?.join(', ')}</span>
                <span>&bull;</span>
                <span className="text-light">Director: {movie.director}</span>
              </div>

              <div className="d-flex flex-wrap gap-1 mb-3">
                {movie.genre?.map((g, idx) => (
                  <span key={idx} className="badge bg-dark border border-secondary text-light">
                    {g}
                  </span>
                ))}
              </div>

              <p className="text-light text-opacity-80 fs-6 pe-lg-5 mb-4">
                {movie.description}
              </p>

              {movie.cast && movie.cast.length > 0 && (
                <div className="small text-muted mb-4">
                  <strong className="text-white">Starring: </strong>
                  {movie.cast.join(', ')}
                </div>
              )}

              {movie.trailerUrl && (
                <button
                  className="btn btn-im-outline"
                  onClick={() => setTrailerModal(true)}
                >
                  <Play size={16} fill="#fff" /> Watch Official Trailer
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Date Selector & Showtimes Section */}
      <div className="container py-5">
        <div className="mb-4">
          <h3 className="text-white fw-bold brand-font mb-1">Select Showtime & Cinema</h3>
          <p className="text-muted small">Choose your preferred screening date and auditorium</p>
        </div>

        {/* Date Selector Pills */}
        <div className="d-flex flex-wrap gap-2 mb-4">
          {dateOptions.map(d => (
            <button
              key={d.dateStr}
              onClick={() => setSelectedDate(d.dateStr)}
              className={\`btn px-4 py-2 text-start \${selectedDate === d.dateStr ? 'btn-danger shadow' : 'btn-outline-secondary text-light'}\`}
              style={{ minWidth: '110px' }}
            >
              <div className="small text-uppercase opacity-75">{d.dayName}</div>
              <div className="fw-bold fs-6">{d.formatted}</div>
            </button>
          ))}
        </div>

        {/* Cinemas & Shows List */}
        {Object.keys(showsByCinema).length === 0 ? (
          <div className="p-5 text-center im-card-glass my-4">
            <h5 className="text-white mb-2">No shows scheduled for {selectedDate}</h5>
            <p className="text-muted small">Please choose another date or check back later for schedule updates.</p>
          </div>
        ) : (
          <div className="d-flex flex-column gap-4">
            {Object.values(showsByCinema).map(({ cinema, shows: cinemaShows }) => (
              <div key={cinema._id} className="im-card p-4">
                <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-2 pb-3 mb-3 border-bottom border-secondary">
                  <div>
                    <h5 className="text-white fw-bold mb-1">{cinema.name}</h5>
                    <div className="d-flex align-items-center gap-2 text-muted small">
                      <MapPin size={14} className="text-danger" />
                      <span>{cinema.location}, {cinema.city}</span>
                    </div>
                  </div>

                  <div className="d-flex flex-wrap gap-1">
                    {cinema.amenities?.map((a, i) => (
                      <span key={i} className="badge bg-dark border border-secondary text-muted small" style={{ fontSize: '0.68rem' }}>
                        {a}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="d-flex flex-wrap gap-3">
                  {cinemaShows.map(show => (
                    <button
                      key={show._id}
                      onClick={() => navigate(\`/seat-selection/\${show._id}\`)}
                      className="btn btn-outline-danger p-3 text-start position-relative border-secondary"
                      style={{ minWidth: '150px', background: '#0b101c' }}
                    >
                      <div className="fs-5 fw-bold text-white mb-1">{show.startTime}</div>
                      <div className="d-flex justify-content-between align-items-center text-muted small">
                        <span className="badge bg-secondary" style={{ fontSize: '0.65rem' }}>{show.format}</span>
                        <span className="text-warning fw-semibold">₹{show.basePrice}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Trailer Modal */}
      {trailerModal && movie.trailerUrl && (
        <div
          className="modal show d-block"
          style={{ backgroundColor: 'rgba(0,0,0,0.85)', zIndex: 1060 }}
          onClick={() => setTrailerModal(false)}
        >
          <div className="modal-dialog modal-dialog-centered modal-lg" onClick={(e) => e.stopPropagation()}>
            <div className="modal-content bg-dark border-secondary">
              <div className="modal-header border-secondary">
                <h5 className="modal-title text-white">{movie.title} — Official Trailer</h5>
                <button type="button" className="btn-close btn-close-white" onClick={() => setTrailerModal(false)}></button>
              </div>
              <div className="modal-body p-0 ratio ratio-16x9">
                <iframe
                  src={movie.trailerUrl}
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
console.log('MovieDetailsPage.jsx written successfully');
