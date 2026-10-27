import React from 'react';
import { Link } from 'react-router-dom';
import { Star, Clock, Ticket } from 'lucide-react';

export default function MovieCard({ movie }) {
  const fallbackPoster = 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?auto=format&fit=crop&w=800&q=80';

  return (
    <div className="im-card h-100 d-flex flex-column overflow-hidden">
      <div className="movie-poster-wrap">
        <img
          src={movie.posterUrl || fallbackPoster}
          alt={movie.title}
          className="movie-poster-img"
          onError={(e) => { e.target.src = fallbackPoster; }}
          loading="lazy"
        />
        {/* Rating Badge */}
        <div className="movie-rating-badge">
          <Star size={13} fill="#fbbf24" color="#fbbf24" />
          <span>{movie.rating ? movie.rating.toFixed(1) : '8.5'}</span>
        </div>
        {/* Age Rating or Format Badge */}
        <div className="movie-format-badge">
          {movie.ageRating || 'UA'}
        </div>
      </div>

      <div className="p-3 d-flex flex-column flex-grow-1 justify-content-between">
        <div>
          <h5 className="text-white fw-bold mb-1 text-truncate" title={movie.title}>
            {movie.title}
          </h5>
          <div className="d-flex align-items-center gap-2 text-muted small mb-2">
            <span className="d-flex align-items-center gap-1">
              <Clock size={13} /> {movie.duration} mins
            </span>
            <span>&bull;</span>
            <span>{movie.language?.[0] || 'English'}</span>
          </div>
          <div className="d-flex flex-wrap gap-1 mb-3">
            {movie.genre?.slice(0, 2).map((g, idx) => (
              <span key={idx} className="badge bg-dark border border-secondary text-light small" style={{ fontSize: '0.68rem' }}>
                {g}
              </span>
            ))}
          </div>
        </div>

        <Link to={`/movie/${movie._id}`} className="btn btn-im-primary w-100 justify-content-center py-2">
          <Ticket size={16} /> Book Tickets
        </Link>
      </div>
    </div>
  );
}