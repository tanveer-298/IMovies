import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../services/api';
import confetti from 'canvas-confetti';
import { QRCodeSVG } from 'qrcode.react';
import { CheckCircle2, Printer, Ticket, Calendar, MapPin, Clock, ArrowRight } from 'lucide-react';

export default function BookingConfirmationPage() {
  const { bookingId } = useParams();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Launch celebration confetti
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 }
      });
    } catch (e) {
      console.log('Confetti failed to run', e);
    }

    const fetchBooking = async () => {
      try {
        const res = await api.get(`/bookings/${bookingId}`);
        setBooking(res.data.booking);
      } catch (err) {
        console.error('Failed to load booking:', err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchBooking();
  }, [bookingId]);

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center py-5" style={{ minHeight: '60vh' }}>
        <div className="spinner-border text-danger" role="status"></div>
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="container py-5 text-center">
        <h4 className="text-white">Booking details not found</h4>
        <Link to="/" className="btn btn-im-primary mt-3">Return Home</Link>
      </div>
    );
  }

  const qrValue = booking.qrCodeData || `IMovies Ticket: ${booking.bookingReference}`;

  return (
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-lg-8">
          {/* Success Banner */}
          <div className="text-center mb-4">
            <div className="d-inline-flex p-3 rounded-circle bg-success bg-opacity-25 text-success mb-3 shadow">
              <CheckCircle2 size={48} />
            </div>
            <h2 className="text-white fw-bold brand-font mb-1">Booking Confirmed!</h2>
            <p className="text-muted">Your tickets have been reserved and payment was successfully simulated.</p>
          </div>

          {/* Ticket Card */}
          <div className="im-card p-4 p-md-5 position-relative shadow-lg border-danger border-opacity-50">
            <div className="row g-4 align-items-center">
              {/* Left Column: Movie & Theater Details */}
              <div className="col-md-7 border-end-md border-secondary pe-md-4">
                <div className="d-flex align-items-center justify-content-between mb-3">
                  <span className="badge bg-danger">CONFIRMED TICKET</span>
                  <div className="text-muted small">
                    Ref: <strong className="text-warning font-monospace fs-6">{booking.bookingReference}</strong>
                  </div>
                </div>

                <h3 className="text-white fw-bold brand-font mb-2">{booking.movieId.title}</h3>
                <div className="d-flex align-items-center gap-2 text-muted small mb-4">
                  <span>{booking.movieId.language?.[0]}</span> &bull;
                  <span>{booking.movieId.duration} mins</span> &bull;
                  <span>{booking.screenId.screenType}</span>
                </div>

                <div className="p-3 rounded bg-dark border border-secondary mb-3 small">
                  <div className="d-flex align-items-center gap-2 mb-2 text-white">
                    <MapPin size={16} className="text-danger flex-shrink-0" />
                    <span className="fw-semibold">{booking.cinemaId.name}</span>
                  </div>
                  <div className="text-muted ps-4 mb-2">{booking.cinemaId.location}, {booking.cinemaId.city}</div>
                  <div className="d-flex align-items-center gap-2 text-light ps-4">
                    <span>{booking.screenId.screenName}</span>
                  </div>
                </div>

                <div className="row g-2 text-muted small">
                  <div className="col-6">
                    <div className="p-2 rounded bg-dark border border-secondary">
                      <div className="text-muted" style={{ fontSize: '0.75rem' }}>Show Date:</div>
                      <div className="text-white fw-bold">{booking.showId.date}</div>
                    </div>
                  </div>
                  <div className="col-6">
                    <div className="p-2 rounded bg-dark border border-secondary">
                      <div className="text-muted" style={{ fontSize: '0.75rem' }}>Show Time:</div>
                      <div className="text-white fw-bold">{booking.showId.startTime}</div>
                    </div>
                  </div>
                </div>

                <div className="mt-3 p-2 rounded bg-dark border border-secondary d-flex justify-content-between align-items-center">
                  <span className="text-muted small">Seats:</span>
                  <span className="text-danger fw-bold fs-6">{booking.seats.map(s => s.seatId).join(', ')}</span>
                </div>
              </div>

              {/* Right Column: QR Code & Actions */}
              <div className="col-md-5 text-center ps-md-4">
                <div className="p-3 bg-white rounded-3 d-inline-block shadow mb-3">
                  <QRCodeSVG value={qrValue} size={150} level="M" />
                </div>
                <div className="text-muted small mb-3">Scan this QR Code at the cinema turnstile for entry</div>

                <div className="d-flex justify-content-between text-muted small py-2 border-top border-bottom border-secondary mb-3">
                  <span>Total Paid (Simulated):</span>
                  <span className="text-warning fw-bold fs-5">₹{booking.totalAmount}</span>
                </div>

                <div className="d-flex flex-column gap-2">
                  <button
                    onClick={() => window.print()}
                    className="btn btn-im-outline w-100 justify-content-center"
                  >
                    <Printer size={16} /> Print / Save Ticket
                  </button>
                  <Link
                    to="/dashboard"
                    className="btn btn-im-primary w-100 justify-content-center"
                  >
                    <span>View in My Bookings</span>
                    <ArrowRight size={16} />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}