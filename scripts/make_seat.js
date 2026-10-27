const fs = require('fs');

const filePath = 'C:\\Users\\mansu\\.antigravity-ide\\IMovies\\client\\src\\pages\\SeatSelectionPage.jsx';

const content = `
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Clock, Ticket, AlertCircle, ShieldCheck, ChevronLeft, ArrowRight } from 'lucide-react';

export default function SeatSelectionPage() {
  const { showId } = useParams();
  const { isAuthenticated, showAlert } = useAuth();
  const navigate = useNavigate();

  const [show, setShow] = useState(null);
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [holding, setHolding] = useState(false);
  const [timeLeft, setTimeLeft] = useState(300); // 5 min hold timer

  const fetchShowData = async () => {
    try {
      const res = await api.get(\`/shows/\${showId}\`);
      setShow(res.data.show);
    } catch (err) {
      console.error('Failed to load show seat map:', err.message);
      showAlert('Could not load show seat layout. Please try again.', 'danger');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchShowData();
    // Poll seat map every 20 seconds to stay sync with other users
    const interval = setInterval(fetchShowData, 20000);
    return () => clearInterval(interval);
  }, [showId]);

  // Hold timer countdown when seats are selected
  useEffect(() => {
    if (selectedSeats.length === 0) return;
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          setSelectedSeats([]);
          showAlert('Seat hold expired. Please select your seats again.', 'warning');
          return 300;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [selectedSeats]);

  const toggleSeat = (seat) => {
    if (seat.status === 'booked' || seat.status === 'held') return;

    if (selectedSeats.some(s => s.seatId === seat.seatId)) {
      setSelectedSeats(selectedSeats.filter(s => s.seatId !== seat.seatId));
    } else {
      if (selectedSeats.length >= 8) {
        showAlert('Maximum 8 seats can be selected per booking.', 'warning');
        return;
      }
      setSelectedSeats([...selectedSeats, seat]);
    }
  };

  const calculateSubtotal = () => {
    return selectedSeats.reduce((acc, s) => acc + s.price, 0);
  };

  const subtotal = calculateSubtotal();
  const convenienceFee = selectedSeats.length * 30;
  const tax = Math.round(subtotal * 0.18);
  const grandTotal = subtotal + convenienceFee + tax;

  const handleProceed = async () => {
    if (!isAuthenticated) {
      showAlert('Please sign in to complete your seat reservation.', 'info');
      navigate('/login', { state: { from: \`/seat-selection/\${showId}\` } });
      return;
    }

    if (selectedSeats.length === 0) {
      showAlert('Please select at least one seat to proceed.', 'warning');
      return;
    }

    setHolding(true);
    try {
      const seatIds = selectedSeats.map(s => s.seatId);
      await api.post('/bookings/hold', {
        showId,
        seatIds
      });

      // Proceed to checkout page
      navigate(\`/checkout/\${showId}?seats=\${seatIds.join(',')}\`);
    } catch (err) {
      showAlert(err.message, 'danger');
      // Refresh seat status
      fetchShowData();
      // Remove any conflicting seat from selection
      setSelectedSeats([]);
    } finally {
      setHolding(false);
    }
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center py-5" style={{ minHeight: '60vh' }}>
        <div className="spinner-border text-danger" role="status"></div>
      </div>
    );
  }

  if (!show) {
    return (
      <div className="container py-5 text-center">
        <h4 className="text-white">Showtime not found</h4>
        <Link to="/movies" className="btn btn-im-primary mt-3">Return to Movies</Link>
      </div>
    );
  }

  // Group seats by Row (A through F)
  const rows = {};
  show.seats.forEach(s => {
    if (!rows[s.row]) rows[s.row] = [];
    rows[s.row].push(s);
  });

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  return (
    <div className="container py-4">
      {/* Show & Movie Info Bar */}
      <div className="im-card-glass p-3 mb-4 shadow">
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3">
          <div className="d-flex align-items-center gap-3">
            <Link to={\`/movie/\${show.movieId._id}\`} className="btn btn-sm btn-outline-secondary text-light">
              <ChevronLeft size={16} />
            </Link>
            <div>
              <h4 className="text-white fw-bold mb-0 brand-font">{show.movieId.title}</h4>
              <div className="text-muted small">
                <span>{show.cinemaId.name}</span> &bull; <span>{show.screenId.screenName} ({show.format})</span>
              </div>
            </div>
          </div>

          <div className="d-flex align-items-center gap-3">
            <div className="text-md-end">
              <div className="text-white fw-bold">{show.date} &bull; {show.startTime}</div>
              <div className="text-muted small">{show.language} &bull; {show.movieId.duration} mins</div>
            </div>

            {selectedSeats.length > 0 && (
              <div className="p-2 rounded bg-danger bg-opacity-25 border border-danger text-danger small fw-bold d-flex align-items-center gap-1">
                <Clock size={16} />
                <span>{minutes}:{seconds < 10 ? '0' : ''}{seconds}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="row g-4">
        {/* Main Cinema Seating Layout */}
        <div className="col-lg-8">
          <div className="im-card p-4 text-center">
            {/* Screen Visual */}
            <div className="screen-container">
              <div className="cinema-screen"></div>
              <div className="screen-beam"></div>
              <span className="text-muted small text-uppercase tracking-wider fw-bold mt-1" style={{ letterSpacing: '4px' }}>
                All Eyes This Way &bull; Cinema Screen
              </span>
            </div>

            {/* Seat Map */}
            <div className="seat-grid my-4 overflow-auto py-2">
              {Object.keys(rows).sort().reverse().map(rowName => {
                const rowSeats = rows[rowName];
                const sampleTier = rowSeats[0]?.tier || 'Standard';

                return (
                  <div key={rowName} className="seat-row mb-1">
                    <span className="seat-row-label">{rowName}</span>

                    <div className="d-flex gap-2 justify-content-center flex-grow-1">
                      {rowSeats.sort((a,b) => a.col - b.col).map(seat => {
                        const isSelected = selectedSeats.some(s => s.seatId === seat.seatId);
                        const isBooked = seat.status === 'booked';
                        const isHeld = seat.status === 'held';

                        let seatClass = 'cinema-seat';
                        if (isSelected) seatClass += ' selected';
                        else if (isBooked) seatClass += ' booked';
                        else if (isHeld) seatClass += ' held';
                        if (seat.tier === 'VIP') seatClass += ' tier-vip';

                        return (
                          <div
                            key={seat.seatId}
                            className={seatClass}
                            onClick={() => toggleSeat(seat)}
                            title={\`\${seat.seatId} - \${seat.tier} (₹\${seat.price})\`}
                          >
                            {seat.col}
                          </div>
                        );
                      })}
                    </div>

                    <span className="seat-row-label">{rowName}</span>
                  </div>
                );
              })}
            </div>

            {/* Seat Legend */}
            <div className="d-flex flex-wrap justify-content-center gap-4 pt-4 border-top border-secondary text-muted small">
              <div className="d-flex align-items-center gap-2">
                <div className="cinema-seat" style={{ width: '20px', height: '20px', fontSize: '0.6rem' }}></div>
                <span>Available</span>
              </div>
              <div className="d-flex align-items-center gap-2">
                <div className="cinema-seat selected" style={{ width: '20px', height: '20px', fontSize: '0.6rem' }}></div>
                <span>Selected</span>
              </div>
              <div className="d-flex align-items-center gap-2">
                <div className="cinema-seat held" style={{ width: '20px', height: '20px', fontSize: '0.6rem' }}></div>
                <span>Held / Reserved</span>
              </div>
              <div className="d-flex align-items-center gap-2">
                <div className="cinema-seat booked" style={{ width: '20px', height: '20px', fontSize: '0.6rem' }}></div>
                <span>Booked</span>
              </div>
            </div>

            {/* Tier Price Guide */}
            <div className="d-flex flex-wrap justify-content-center gap-3 mt-3 text-muted small">
              <span className="badge bg-dark border border-secondary text-light">VIP Recliner (Row F): ₹500</span>
              <span className="badge bg-dark border border-secondary text-light">Premium (Rows D-E): ₹380</span>
              <span className="badge bg-dark border border-secondary text-light">Standard (Rows A-C): ₹280</span>
            </div>
          </div>
        </div>

        {/* Booking Summary Sidebar */}
        <div className="col-lg-4">
          <div className="im-card p-4 position-sticky" style={{ top: '90px' }}>
            <h5 className="text-white fw-bold brand-font pb-2 border-bottom border-secondary mb-3">
              Booking Summary
            </h5>

            {selectedSeats.length === 0 ? (
              <div className="text-center py-4 text-muted">
                <Ticket size={36} className="text-secondary mb-2" />
                <p className="small mb-0">No seats selected yet.</p>
                <p className="small text-muted">Click on the seats in the theater layout to reserve.</p>
              </div>
            ) : (
              <div>
                {/* Selected Seats Pills */}
                <div className="mb-3">
                  <div className="text-muted small mb-2">Selected Seats ({selectedSeats.length}/8):</div>
                  <div className="d-flex flex-wrap gap-2">
                    {selectedSeats.map(s => (
                      <span key={s.seatId} className="badge bg-danger p-2 small d-flex align-items-center gap-1">
                        <strong>{s.seatId}</strong> ({s.tier} ₹{s.price})
                      </span>
                    ))}
                  </div>
                </div>

                {/* Price Breakdown */}
                <div className="d-flex flex-column gap-2 py-3 border-top border-bottom border-secondary small text-muted">
                  <div className="d-flex justify-content-between">
                    <span>Ticket Subtotal:</span>
                    <span className="text-white fw-semibold">₹{subtotal}</span>
                  </div>
                  <div className="d-flex justify-content-between">
                    <span>Convenience Fee (₹30/seat):</span>
                    <span className="text-white">₹{convenienceFee}</span>
                  </div>
                  <div className="d-flex justify-content-between">
                    <span>GST (18%):</span>
                    <span className="text-white">₹{tax}</span>
                  </div>
                  <div className="d-flex justify-content-between pt-2 border-top border-secondary text-white fs-6 fw-bold">
                    <span>Grand Total:</span>
                    <span className="text-warning">₹{grandTotal}</span>
                  </div>
                </div>

                <div className="alert alert-dark border-secondary p-2 mt-3 small text-muted d-flex align-items-center gap-2">
                  <ShieldCheck size={18} className="text-success flex-shrink-0" />
                  <span>Seats are held atomically for 5 minutes during checkout to ensure zero double-booking.</span>
                </div>

                <button
                  onClick={handleProceed}
                  disabled={holding}
                  className="btn btn-im-primary w-100 justify-content-center py-3 fs-6 mt-2"
                >
                  {holding ? (
                    <>
                      <span className="spinner-border spinner-border-sm" role="status"></span>
                      <span>Holding Seats...</span>
                    </>
                  ) : (
                    <>
                      <span>Proceed to Payment</span>
                      <ArrowRight size={18} />
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
`;

fs.writeFileSync(filePath, content.trim(), 'utf8');
console.log('SeatSelectionPage.jsx written successfully');
