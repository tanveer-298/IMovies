const fs = require('fs');

const filePath = 'C:\\Users\\mansu\\.antigravity-ide\\IMovies\\client\\src\\pages\\UserDashboardPage.jsx';

const content = `
import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { QRCodeSVG } from 'qrcode.react';
import { User, Ticket, Calendar, Clock, MapPin, QrCode, XCircle, ShieldCheck, Edit, Key } from 'lucide-react';

export default function UserDashboardPage() {
  const { user, updateProfile, showAlert } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('upcoming');
  const [ticketModal, setTicketModal] = useState(null);
  const [cancellingId, setCancellingId] = useState(null);

  // Edit profile states
  const [editModal, setEditModal] = useState(false);
  const [editName, setEditName] = useState(user?.name || '');
  const [editPhone, setEditPhone] = useState(user?.phone || '');

  // Change password states
  const [passwordModal, setPasswordModal] = useState(false);
  const [currPass, setCurrPass] = useState('');
  const [newPass, setNewPass] = useState('');

  const fetchBookings = async () => {
    try {
      const res = await api.get('/bookings/my-bookings');
      setBookings(res.data.bookings || []);
    } catch (err) {
      console.error('Failed to load bookings:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const handleCancelBooking = async (bookingId) => {
    if (!window.confirm('Are you sure you want to cancel this booking? Held seats will be unlocked.')) return;
    setCancellingId(bookingId);
    try {
      await api.put(\`/bookings/\${bookingId}/cancel\`, { reason: 'User requested cancellation' });
      showAlert('Booking cancelled successfully. Simulated refund processed.', 'success');
      fetchBookings();
    } catch (err) {
      showAlert(err.message, 'danger');
    } finally {
      setCancellingId(null);
    }
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    const res = await updateProfile({ name: editName, phone: editPhone });
    if (res.success) setEditModal(false);
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    try {
      await api.put('/auth/change-password', { currentPassword: currPass, newPassword: newPass });
      showAlert('Password updated successfully.', 'success');
      setPasswordModal(false);
      setCurrPass('');
      setNewPass('');
    } catch (err) {
      showAlert(err.message, 'danger');
    }
  };

  // Filter bookings
  const now = new Date();
  const upcomingBookings = bookings.filter(b => {
    if (b.bookingStatus === 'cancelled') return false;
    const showDateTime = new Date(\`\${b.showId?.date}T\${b.showId?.startTime}\`);
    return showDateTime >= now;
  });

  const pastBookings = bookings.filter(b => {
    if (b.bookingStatus === 'cancelled') return true;
    const showDateTime = new Date(\`\${b.showId?.date}T\${b.showId?.startTime}\`);
    return showDateTime < now;
  });

  const displayedBookings = activeTab === 'upcoming'
    ? upcomingBookings
    : activeTab === 'past'
    ? pastBookings
    : bookings;

  return (
    <div className="container py-4">
      {/* Profile Overview Card */}
      <div className="im-card p-4 mb-4">
        <div className="row align-items-center g-3">
          <div className="col-auto">
            <img
              src={user?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80'}
              alt={user?.name}
              className="rounded-circle border border-danger shadow"
              style={{ width: '70px', height: '70px', objectFit: 'cover' }}
            />
          </div>
          <div className="col">
            <div className="d-flex align-items-center gap-2">
              <h3 className="text-white fw-bold mb-0 brand-font">{user?.name}</h3>
              <span className="badge bg-danger">{user?.role?.toUpperCase()}</span>
            </div>
            <div className="text-muted small">{user?.email} &bull; {user?.phone || 'No phone added'}</div>
          </div>
          <div className="col-md-auto d-flex gap-2">
            <button
              onClick={() => {
                setEditName(user?.name || '');
                setEditPhone(user?.phone || '');
                setEditModal(true);
              }}
              className="btn btn-im-outline btn-sm"
            >
              <Edit size={14} /> Edit Profile
            </button>
            <button
              onClick={() => setPasswordModal(true)}
              className="btn btn-im-outline btn-sm"
            >
              <Key size={14} /> Password
            </button>
          </div>
        </div>
      </div>

      {/* Bookings Section */}
      <div className="mb-4">
        <h4 className="text-white fw-bold brand-font mb-3">Booking History</h4>

        {/* Tabs */}
        <div className="d-flex gap-2 mb-4 border-bottom border-secondary pb-2">
          <button
            onClick={() => setActiveTab('upcoming')}
            className={\`btn btn-sm px-3 py-2 \${activeTab === 'upcoming' ? 'btn-danger' : 'btn-outline-secondary text-light'}\`}
          >
            Upcoming Shows ({upcomingBookings.length})
          </button>
          <button
            onClick={() => setActiveTab('past')}
            className={\`btn btn-sm px-3 py-2 \${activeTab === 'past' ? 'btn-danger' : 'btn-outline-secondary text-light'}\`}
          >
            Past / Cancelled ({pastBookings.length})
          </button>
          <button
            onClick={() => setActiveTab('all')}
            className={\`btn btn-sm px-3 py-2 \${activeTab === 'all' ? 'btn-danger' : 'btn-outline-secondary text-light'}\`}
          >
            All Bookings ({bookings.length})
          </button>
        </div>

        {/* Bookings List */}
        {loading ? (
          <div className="text-center py-5">
            <div className="spinner-border text-danger" role="status"></div>
          </div>
        ) : displayedBookings.length === 0 ? (
          <div className="p-5 text-center im-card-glass">
            <Ticket size={40} className="text-muted mb-2" />
            <h5 className="text-white">No bookings in this category</h5>
            <p className="text-muted small">Explore now showing movies to reserve tickets.</p>
          </div>
        ) : (
          <div className="d-flex flex-column gap-3">
            {displayedBookings.map(b => (
              <div key={b._id} className="im-card p-3 p-md-4">
                <div className="row align-items-center g-3">
                  <div className="col-auto">
                    <img
                      src={b.movieId?.posterUrl}
                      alt={b.movieId?.title}
                      className="rounded border border-secondary"
                      style={{ width: '70px', height: '100px', objectFit: 'cover' }}
                    />
                  </div>

                  <div className="col">
                    <div className="d-flex align-items-center justify-content-between mb-1">
                      <h5 className="text-white fw-bold mb-0">{b.movieId?.title}</h5>
                      <span className={\`badge \${b.bookingStatus === 'confirmed' ? 'bg-success' : 'bg-danger'}\`}>
                        {b.bookingStatus.toUpperCase()}
                      </span>
                    </div>

                    <div className="text-danger small fw-semibold mb-2">
                      Ref: <span className="font-monospace text-warning">{b.bookingReference}</span>
                    </div>

                    <div className="row g-2 text-muted small">
                      <div className="col-md-4">
                        <MapPin size={13} className="text-danger me-1" />
                        <span>{b.cinemaId?.name}</span>
                      </div>
                      <div className="col-md-4">
                        <Calendar size={13} className="text-danger me-1" />
                        <span>{b.showId?.date} &bull; {b.showId?.startTime}</span>
                      </div>
                      <div className="col-md-4">
                        <Ticket size={13} className="text-danger me-1" />
                        <span>Seats: <strong className="text-white">{b.seats?.map(s => s.seatId).join(', ')}</strong></span>
                      </div>
                    </div>
                  </div>

                  <div className="col-md-auto d-flex flex-column align-items-md-end gap-2 border-start-md border-secondary ps-md-4">
                    <div className="text-warning fw-bold fs-5">₹{b.totalAmount}</div>

                    <div className="d-flex gap-2">
                      <button
                        onClick={() => setTicketModal(b)}
                        className="btn btn-im-outline btn-sm"
                      >
                        <QrCode size={14} /> Ticket QR
                      </button>

                      {b.bookingStatus === 'confirmed' && (
                        <button
                          onClick={() => handleCancelBooking(b._id)}
                          disabled={cancellingId === b._id}
                          className="btn btn-outline-danger btn-sm"
                          title="Cancel ticket and release seats"
                        >
                          <XCircle size={14} /> Cancel
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Ticket QR Modal */}
      {ticketModal && (
        <div
          className="modal show d-block"
          style={{ backgroundColor: 'rgba(0,0,0,0.85)', zIndex: 1060 }}
          onClick={() => setTicketModal(null)}
        >
          <div className="modal-dialog modal-dialog-centered" onClick={(e) => e.stopPropagation()}>
            <div className="modal-content bg-dark border-secondary text-center p-4">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <span className="badge bg-danger">ENTRY PASS</span>
                <span className="text-warning font-monospace fw-bold">{ticketModal.bookingReference}</span>
                <button type="button" className="btn-close btn-close-white" onClick={() => setTicketModal(null)}></button>
              </div>

              <div className="p-3 bg-white rounded-3 d-inline-block mx-auto mb-3 shadow">
                <QRCodeSVG value={ticketModal.qrCodeData || ticketModal.bookingReference} size={180} level="M" />
              </div>

              <h5 className="text-white fw-bold mb-1">{ticketModal.movieId?.title}</h5>
              <p className="text-muted small mb-2">{ticketModal.cinemaId?.name} &bull; {ticketModal.screenId?.screenName}</p>

              <div className="p-2 rounded bg-black border border-secondary small text-muted mb-3">
                <div>Date: <strong className="text-white">{ticketModal.showId?.date} at {ticketModal.showId?.startTime}</strong></div>
                <div>Seats: <strong className="text-danger">{ticketModal.seats?.map(s => s.seatId).join(', ')}</strong></div>
              </div>

              <button onClick={() => setTicketModal(null)} className="btn btn-im-primary btn-sm w-100">
                Close Ticket
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Profile Modal */}
      {editModal && (
        <div
          className="modal show d-block"
          style={{ backgroundColor: 'rgba(0,0,0,0.85)', zIndex: 1060 }}
          onClick={() => setEditModal(false)}
        >
          <div className="modal-dialog modal-dialog-centered" onClick={(e) => e.stopPropagation()}>
            <div className="modal-content bg-dark border-secondary p-4">
              <h5 className="text-white fw-bold mb-3">Update Profile Information</h5>
              <form onSubmit={handleSaveProfile}>
                <div className="mb-3">
                  <label className="form-label text-muted small">Full Name</label>
                  <input
                    type="text"
                    className="form-control bg-dark border-secondary text-white"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    required
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label text-muted small">Phone Number</label>
                  <input
                    type="text"
                    className="form-control bg-dark border-secondary text-white"
                    value={editPhone}
                    onChange={(e) => setEditPhone(e.target.value)}
                  />
                </div>
                <div className="d-flex justify-content-end gap-2">
                  <button type="button" onClick={() => setEditModal(false)} className="btn btn-outline-secondary text-light btn-sm">
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-im-primary btn-sm">
                    Save Changes
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Password Modal */}
      {passwordModal && (
        <div
          className="modal show d-block"
          style={{ backgroundColor: 'rgba(0,0,0,0.85)', zIndex: 1060 }}
          onClick={() => setPasswordModal(false)}
        >
          <div className="modal-dialog modal-dialog-centered" onClick={(e) => e.stopPropagation()}>
            <div className="modal-content bg-dark border-secondary p-4">
              <h5 className="text-white fw-bold mb-3">Change Account Password</h5>
              <form onSubmit={handleChangePassword}>
                <div className="mb-3">
                  <label className="form-label text-muted small">Current Password</label>
                  <input
                    type="password"
                    className="form-control bg-dark border-secondary text-white"
                    value={currPass}
                    onChange={(e) => setCurrPass(e.target.value)}
                    required
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label text-muted small">New Password (min 6 chars)</label>
                  <input
                    type="password"
                    className="form-control bg-dark border-secondary text-white"
                    value={newPass}
                    onChange={(e) => setNewPass(e.target.value)}
                    required
                  />
                </div>
                <div className="d-flex justify-content-end gap-2">
                  <button type="button" onClick={() => setPasswordModal(false)} className="btn btn-outline-secondary text-light btn-sm">
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-im-primary btn-sm">
                    Update Password
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
`;

fs.writeFileSync(filePath, content.trim(), 'utf8');
console.log('UserDashboardPage.jsx written successfully');
