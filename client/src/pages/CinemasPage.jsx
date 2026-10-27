import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { MapPin, Film, Star, Check } from 'lucide-react';

export default function CinemasPage() {
  const [cinemas, setCinemas] = useState([]);
  const [cities, setCities] = useState([]);
  const [selectedCity, setSelectedCity] = useState('All');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCinemas = async () => {
      try {
        const res = await api.get('/cinemas');
        setCinemas(res.data.cinemas || []);
        setCities(res.data.cities || []);
      } catch (err) {
        console.error('Failed to load cinemas:', err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchCinemas();
  }, []);

  const filteredCinemas = selectedCity === 'All'
    ? cinemas
    : cinemas.filter(c => c.city === selectedCity);

  return (
    <div className="container py-4">
      <div className="mb-4">
        <h1 className="display-6 fw-bold text-white brand-font mb-1">Partner Cinemas</h1>
        <p className="text-muted small">Experience state-of-the-art IMAX, Dolby Atmos, and luxury auditoriums</p>
      </div>

      {/* City Filters */}
      <div className="d-flex flex-wrap gap-2 mb-4">
        <button
          onClick={() => setSelectedCity('All')}
          className={`btn btn-sm ${selectedCity === 'All' ? 'btn-danger' : 'btn-outline-secondary text-light'}`}
        >
          All Cities ({cinemas.length})
        </button>
        {cities.map(city => (
          <button
            key={city}
            onClick={() => setSelectedCity(city)}
            className={`btn btn-sm ${selectedCity === city ? 'btn-danger' : 'btn-outline-secondary text-light'}`}
          >
            {city}
          </button>
        ))}
      </div>

      {/* Cinemas Grid */}
      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-danger" role="status"></div>
        </div>
      ) : (
        <div className="row g-4">
          {filteredCinemas.map(c => (
            <div className="col-md-6" key={c._id}>
              <div className="im-card p-4 h-100 d-flex flex-column justify-content-between">
                <div>
                  <div className="d-flex justify-content-between align-items-start mb-2">
                    <h5 className="text-white fw-bold mb-0">{c.name}</h5>
                    <span className="badge bg-warning text-dark fw-bold d-flex align-items-center gap-1">
                      <Star size={12} fill="#000" /> {c.rating || 4.8}
                    </span>
                  </div>

                  <div className="text-danger small fw-medium mb-1 d-flex align-items-center gap-1">
                    <MapPin size={14} /> {c.location}, {c.city}
                  </div>
                  <p className="text-muted small mb-3">{c.address}</p>

                  <h6 className="text-light small fw-bold mb-2">Premium Features:</h6>
                  <div className="d-flex flex-wrap gap-1 mb-4">
                    {c.amenities?.map((a, i) => (
                      <span key={i} className="badge bg-dark border border-secondary text-light">
                        <Check size={10} className="text-danger me-1" /> {a}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="pt-3 border-top border-secondary d-flex justify-content-between align-items-center">
                  <span className="badge bg-secondary">Auditorium Formats: IMAX Laser &bull; Dolby</span>
                  <a href="/movies" className="btn btn-im-primary btn-sm">
                    View Movies
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}