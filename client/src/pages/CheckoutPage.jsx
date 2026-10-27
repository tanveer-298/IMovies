import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams, useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { CreditCard, ShieldAlert, CheckCircle, XCircle, ArrowLeft, Lock, Sparkles, Smartphone, Building } from 'lucide-react';

export default function CheckoutPage() {
  const { showId } = useParams();
  const [searchParams] = useSearchParams();
  const { user, showAlert } = useAuth();
  const navigate = useNavigate();

  const seatParam = searchParams.get('seats') || '';
  const seatIds = seatParam ? seatParam.split(',') : [];

  const [show, setShow] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('credit_card');

  useEffect(() => {
    const fetchShow = async () => {
      try {
        const res = await api.get(`/shows/${showId}`);
        setShow(res.data.show);
      } catch (err) {
        console.error('Error fetching show details:', err.message);
        showAlert('Show details could not be loaded.', 'danger');
      } finally {
        setLoading(false);
      }
    };
    fetchShow();
  }, [showId]);

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center py-5" style={{ minHeight: '60vh' }}>
        <div className="spinner-border text-danger" role="status"></div>
      </div>
    );
  }

  if (!show || seatIds.length === 0) {
    return (
      <div className="container py-5 text-center">
        <h4 className="text-white">Invalid checkout session</h4>
        <p className="text-muted small">No active seats selected for this showtime.</p>
        <Link to="/movies" className="btn btn-im-primary mt-2">Browse Movies</Link>
      </div>
    );
  }

  // Calculate prices from show seat tiers
  const seatObjects = show.seats.filter(s => seatIds.includes(s.seatId));
  const subtotal = seatObjects.reduce((acc, s) => acc + s.price, 0);
  const convenienceFee = seatIds.length * 30;
  const tax = Math.round(subtotal * 0.18);
  const totalAmount = subtotal + convenienceFee + tax;

  const handleSimulatePayment = async (outcome) => {
    setSubmitting(true);
    try {
      const res = await api.post('/bookings', {
        showId,
        seatIds,
        paymentMethod,
        simulateOutcome: outcome
      });

      if (outcome === 'success') {
        const createdBooking = res.data.booking;
        navigate(`/booking-confirmation/${createdBooking._id}`);
      }
    } catch (err) {
      if (outcome === 'failure') {
        showAlert('Payment Failed: As expected in failure simulation, seats have been released back to the theater.', 'warning');
      } else {
        showAlert(err.message, 'danger');
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="container py-4">
      <div className="mb-4">
        <Link to={`/seat-selection/${showId}`} className="btn btn-sm btn-outline-secondary text-light mb-2 d-inline-flex align-items-center gap-1">
          <ArrowLeft size={16} /> Back to Seat Selection
        </Link>
        <h2 className="text-white fw-bold brand-font mb-1">Simulated Checkout & Payment</h2>
        <p className="text-muted small">Finalize your ticket reservation in a secure simulated sandbox</p>
      </div>

      {/* Prominent Demo Sandbox Notice */}
      <div className="alert alert-warning border-warning p-3 mb-4 d-flex align-items-start gap-3">
        <ShieldAlert size={24} className="text-warning flex-shrink-0 mt-1" />
        <div>
          <strong className="text-dark">SIMULATED PAYMENT MODE ACTIVE</strong>
          <p className="mb-0 text-dark small">
            This is an individual educational MERN stack project. No real financial transaction will occur.
            Do NOT enter real card numbers or banking secrets. Use the provided 1-click test triggers below.
          </p>
        </div>
      </div>

      <div className="row g-4">
        {/* Left: Payment Method Selection */}
        <div className="col-lg-7">
          <div className="im-card p-4 mb-4">
            <h5 className="text-white fw-bold mb-3 d-flex align-items-center gap-2">
              <Lock size={18} className="text-danger" /> Choose Payment Option
            </h5>

            {/* Payment Method Pills */}
            <div className="d-flex flex-wrap gap-2 mb-4">
              <button
                type="button"
                onClick={() => setPaymentMethod('credit_card')}
                className={`btn btn-sm px-3 py-2 d-flex align-items-center gap-2 ${paymentMethod === 'credit_card' ? 'btn-danger' : 'btn-outline-secondary text-light'}`}
              >
                <CreditCard size={16} /> Credit / Debit Card
              </button>
              <button
                type="button"
                onClick={() => setPaymentMethod('upi')}
                className={`btn btn-sm px-3 py-2 d-flex align-items-center gap-2 ${paymentMethod === 'upi' ? 'btn-danger' : 'btn-outline-secondary text-light'}`}
              >
                <Smartphone size={16} /> UPI / QR
              </button>
              <button
                type="button"
                onClick={() => setPaymentMethod('net_banking')}
                className={`btn btn-sm px-3 py-2 d-flex align-items-center gap-2 ${paymentMethod === 'net_banking' ? 'btn-danger' : 'btn-outline-secondary text-light'}`}
              >
                <Building size={16} /> Net Banking
              </button>
            </div>

            {/* Mock Card Form */}
            {paymentMethod === 'credit_card' && (
              <div className="p-3 rounded bg-dark border border-secondary mb-4">
                <div className="mb-3">
                  <label className="form-label text-muted small mb-1">Simulated Card Number</label>
                  <input
                    type="text"
                    readOnly
                    value="4242 •••• •••• 4242"
                    className="form-control bg-dark border-secondary text-white font-monospace"
                  />
                  <div className="form-text text-muted small">Pre-filled demo VISA test card</div>
                </div>

                <div className="row g-3">
                  <div className="col-6">
                    <label className="form-label text-muted small mb-1">Expiry Date</label>
                    <input
                      type="text"
                      readOnly
                      value="12 / 28"
                      className="form-control bg-dark border-secondary text-white"
                    />
                  </div>
                  <div className="col-6">
                    <label className="form-label text-muted small mb-1">CVV / CVC</label>
                    <input
                      type="password"
                      readOnly
                      value="•••"
                      className="form-control bg-dark border-secondary text-white"
                    />
                  </div>
                </div>
              </div>
            )}

            {paymentMethod === 'upi' && (
              <div className="p-3 rounded bg-dark border border-secondary mb-4 text-center">
                <p className="text-white small mb-1">Simulated Virtual Payment Address (VPA):</p>
                <code className="text-warning fs-6">imovies.customer@demoupi</code>
                <p className="text-muted small mt-2 mb-0">Simulates instant UPI approval via simulated NPCI webhook</p>
              </div>
            )}

            {paymentMethod === 'net_banking' && (
              <div className="p-3 rounded bg-dark border border-secondary mb-4">
                <label className="form-label text-muted small">Select Simulated Bank</label>
                <select className="form-select bg-dark border-secondary text-white small" defaultValue="HDFC">
                  <option value="HDFC">HDFC Bank (Demo Simulation)</option>
                  <option value="ICICI">ICICI Bank (Demo Simulation)</option>
                  <option value="SBI">State Bank of India (Demo Simulation)</option>
                  <option value="AXIS">Axis Bank (Demo Simulation)</option>
                </select>
              </div>
            )}

            {/* 1-Click Fast Simulation Triggers */}
            <div className="border-top border-secondary pt-3">
              <h6 className="text-white small fw-bold mb-2">Simulated Outcome Controls:</h6>
              <div className="row g-2">
                <div className="col-md-7">
                  <button
                    onClick={() => handleSimulatePayment('success')}
                    disabled={submitting}
                    className="btn btn-success w-100 py-3 fw-bold d-flex align-items-center justify-content-center gap-2 shadow"
                  >
                    {submitting ? (
                      <span className="spinner-border spinner-border-sm" role="status"></span>
                    ) : (
                      <>
                        <CheckCircle size={18} />
                        <span>Simulate SUCCESSFUL Payment (₹{totalAmount})</span>
                      </>
                    )}
                  </button>
                </div>
                <div className="col-md-5">
                  <button
                    onClick={() => handleSimulatePayment('failure')}
                    disabled={submitting}
                    className="btn btn-outline-danger w-100 py-3 fw-bold d-flex align-items-center justify-content-center gap-2"
                  >
                    <XCircle size={18} />
                    <span>Simulate FAILED Payment</span>
                  </button>
                </div>
              </div>
              <div className="text-muted small mt-2 text-center">
                Testing failure scenario will verify that your held seats are cleanly unlocked on the server.
              </div>
            </div>
          </div>
        </div>

        {/* Right: Booking Summary Receipt */}
        <div className="col-lg-5">
          <div className="im-card p-4">
            <h5 className="text-white fw-bold pb-2 border-bottom border-secondary mb-3">
              Order Receipt
            </h5>

            <div className="d-flex gap-3 mb-3">
              <img
                src={show.movieId.posterUrl}
                alt={show.movieId.title}
                className="rounded border border-secondary"
                style={{ width: '65px', height: '90px', objectFit: 'cover' }}
              />
              <div>
                <h6 className="text-white fw-bold mb-1">{show.movieId.title}</h6>
                <div className="text-muted small">{show.movieId.language?.[0]} &bull; {show.movieId.duration} mins</div>
                <div className="text-danger small fw-semibold mt-1">{show.cinemaId.name}</div>
                <div className="text-muted small">{show.screenId.screenName} ({show.format})</div>
              </div>
            </div>

            <div className="p-3 rounded bg-dark border border-secondary mb-3 small">
              <div className="d-flex justify-content-between mb-1">
                <span className="text-muted">Date & Time:</span>
                <span className="text-white fw-semibold">{show.date} &bull; {show.startTime}</span>
              </div>
              <div className="d-flex justify-content-between mb-1">
                <span className="text-muted">Reserved Seats:</span>
                <span className="text-danger fw-bold">{seatIds.join(', ')}</span>
              </div>
              <div className="d-flex justify-content-between">
                <span className="text-muted">Customer:</span>
                <span className="text-white">{user?.name} ({user?.email})</span>
              </div>
            </div>

            {/* Price Calculations */}
            <div className="d-flex flex-column gap-2 text-muted small pb-3 border-bottom border-secondary">
              <div className="d-flex justify-content-between">
                <span>Tickets Subtotal ({seatIds.length} seats):</span>
                <span className="text-white">₹{subtotal}</span>
              </div>
              <div className="d-flex justify-content-between">
                <span>Convenience Fee:</span>
                <span className="text-white">₹{convenienceFee}</span>
              </div>
              <div className="d-flex justify-content-between">
                <span>Integrated GST (18%):</span>
                <span className="text-white">₹{tax}</span>
              </div>
            </div>

            <div className="d-flex justify-content-between align-items-center pt-3 text-white">
              <span className="fs-6 fw-bold">Total Payable:</span>
              <span className="fs-4 fw-bold text-warning">₹{totalAmount}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}