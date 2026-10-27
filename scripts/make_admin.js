const fs = require('fs');

const filePath = 'C:\\Users\\mansu\\.antigravity-ide\\IMovies\\client\\src\\pages\\AdminDashboardPage.jsx';

const content = `
import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { LayoutDashboard, Film, Calendar, Users, DollarSign, Plus, Trash2, Shield, Ticket, CheckCircle } from 'lucide-react';

export default function AdminDashboardPage() {
  const { showAlert } = useAuth();
  const [stats, setStats] = useState(null);
  const [movies, setMovies] = useState([]);
  const [cinemas, setCinemas] = useState([]);
  const [users, setUsers] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  // New Movie Form Modal
  const [movieModal, setMovieModal] = useState(false);
  const [newMovie, setNewMovie] = useState({
    title: '',
    description: '',
    duration: 120,
    genre: 'Action, Sci-Fi',
    language: 'English',
    director: '',
    releaseDate: new Date().toISOString().split('T')[0],
    rating: 8.5,
    posterUrl: '',
    backdropUrl: '',
    trailerUrl: '',
    status: 'now_showing',
    ageRating: 'UA'
  });

  // Schedule Show Form
  const [newShow, setNewShow] = useState({
    movieId: '',
    cinemaId: '',
    screenId: '',
    date: new Date().toISOString().split('T')[0],
    startTime: '19:30',
    basePrice: 280
  });
  const [availableScreens, setAvailableScreens] = useState([]);

  const fetchAdminData = async () => {
    try {
      const [statsRes, moviesRes, cinemasRes, usersRes, bookingsRes] = await Promise.all([
        api.get('/admin/stats'),
        api.get('/movies?limit=50'),
        api.get('/cinemas'),
        api.get('/admin/users'),
        api.get('/admin/bookings')
      ]);

      setStats(statsRes.data.stats);
      setMovies(moviesRes.data.movies || []);
      setCinemas(cinemasRes.data.cinemas || []);
      setUsers(usersRes.data.users || []);
      setBookings(bookingsRes.data.bookings || []);
    } catch (err) {
      console.error('Failed to load admin dashboard:', err.message);
      showAlert(err.message, 'danger');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  const handleCreateMovie = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...newMovie,
        duration: Number(newMovie.duration),
        rating: Number(newMovie.rating),
        genre: newMovie.genre.split(',').map(s => s.trim()),
        language: newMovie.language.split(',').map(s => s.trim())
      };
      await api.post('/movies', payload);
      showAlert('Movie created successfully!', 'success');
      setMovieModal(false);
      fetchAdminData();
    } catch (err) {
      showAlert(err.message, 'danger');
    }
  };

  const handleDeleteMovie = async (movieId) => {
    if (!window.confirm('Are you sure you want to delete this movie?')) return;
    try {
      await api.delete(\`/movies/\${movieId}\`);
      showAlert('Movie deleted.', 'info');
      fetchAdminData();
    } catch (err) {
      showAlert(err.message, 'danger');
    }
  };

  const handleCinemaChange = async (cinemaId) => {
    setNewShow({ ...newShow, cinemaId, screenId: '' });
    if (!cinemaId) {
      setAvailableScreens([]);
      return;
    }
    try {
      const res = await api.get(\`/cinemas/\${cinemaId}\`);
      setAvailableScreens(res.data.screens || []);
      if (res.data.screens?.length > 0) {
        setNewShow(prev => ({ ...prev, cinemaId, screenId: res.data.screens[0]._id }));
      }
    } catch (err) {
      console.error('Error fetching screens:', err.message);
    }
  };

  const handleScheduleShow = async (e) => {
    e.preventDefault();
    if (!newShow.movieId || !newShow.cinemaId || !newShow.screenId) {
      showAlert('Please select Movie, Cinema, and Screen.', 'warning');
      return;
    }
    try {
      await api.post('/shows', newShow);
      showAlert('New showtime scheduled successfully with auto-generated seat tiers!', 'success');
      fetchAdminData();
    } catch (err) {
      showAlert(err.message, 'danger');
    }
  };

  const handleToggleUserRole = async (userId, currentRole) => {
    const newRole = currentRole === 'admin' ? 'user' : 'admin';
    try {
      await api.put(\`/admin/users/\${userId}/role\`, { role: newRole });
      showAlert(\`User role changed to \${newRole}.\`, 'success');
      fetchAdminData();
    } catch (err) {
      showAlert(err.message, 'danger');
    }
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center py-5" style={{ minHeight: '60vh' }}>
        <div className="spinner-border text-danger" role="status"></div>
      </div>
    );
  }

  return (
    <div className="container py-4">
      {/* Admin Header */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4">
        <div>
          <div className="d-flex align-items-center gap-2">
            <h2 className="text-white fw-bold brand-font mb-0">Admin Management Portal</h2>
            <span className="badge bg-warning text-dark fw-bold">ADMIN ROLE</span>
          </div>
          <p className="text-muted small mb-0">Oversee movie catalogs, schedules, revenues, and registered users</p>
        </div>

        <button
          onClick={() => setMovieModal(true)}
          className="btn btn-im-primary btn-sm d-flex align-items-center gap-1"
        >
          <Plus size={16} /> Add New Movie
        </button>
      </div>

      {/* KPI Stats Cards */}
      <div className="row g-3 mb-4">
        <div className="col-md-3 col-sm-6">
          <div className="im-card p-3 border-start border-4 border-success">
            <div className="d-flex justify-content-between align-items-center mb-1">
              <span className="text-muted small">Total Revenue</span>
              <DollarSign size={18} className="text-success" />
            </div>
            <div className="fs-4 fw-bold text-white">₹{stats?.totalRevenue || 0}</div>
            <div className="text-muted small" style={{ fontSize: '0.72rem' }}>Confirmed simulated bookings</div>
          </div>
        </div>

        <div className="col-md-3 col-sm-6">
          <div className="im-card p-3 border-start border-4 border-danger">
            <div className="d-flex justify-content-between align-items-center mb-1">
              <span className="text-muted small">Total Bookings</span>
              <Ticket size={18} className="text-danger" />
            </div>
            <div className="fs-4 fw-bold text-white">{stats?.totalBookings || 0}</div>
            <div className="text-muted small" style={{ fontSize: '0.72rem' }}>{stats?.totalCancelled || 0} cancelled</div>
          </div>
        </div>

        <div className="col-md-3 col-sm-6">
          <div className="im-card p-3 border-start border-4 border-info">
            <div className="d-flex justify-content-between align-items-center mb-1">
              <span className="text-muted small">Movies in Catalog</span>
              <Film size={18} className="text-info" />
            </div>
            <div className="fs-4 fw-bold text-white">{movies.length}</div>
            <div className="text-muted small" style={{ fontSize: '0.72rem' }}>Active theater releases</div>
          </div>
        </div>

        <div className="col-md-3 col-sm-6">
          <div className="im-card p-3 border-start border-4 border-warning">
            <div className="d-flex justify-content-between align-items-center mb-1">
              <span className="text-muted small">Registered Users</span>
              <Users size={18} className="text-warning" />
            </div>
            <div className="fs-4 fw-bold text-white">{users.length}</div>
            <div className="text-muted small" style={{ fontSize: '0.72rem' }}>Customer & admin accounts</div>
          </div>
        </div>
      </div>

      {/* Admin Navigation Tabs */}
      <div className="d-flex flex-wrap gap-2 mb-4 border-bottom border-secondary pb-2">
        <button
          onClick={() => setActiveTab('overview')}
          className={\`btn btn-sm px-3 py-2 \${activeTab === 'overview' ? 'btn-danger' : 'btn-outline-secondary text-light'}\`}
        >
          <LayoutDashboard size={14} className="me-1" /> Overview & Revenue
        </button>
        <button
          onClick={() => setActiveTab('movies')}
          className={\`btn btn-sm px-3 py-2 \${activeTab === 'movies' ? 'btn-danger' : 'btn-outline-secondary text-light'}\`}
        >
          <Film size={14} className="me-1" /> Movies ({movies.length})
        </button>
        <button
          onClick={() => setActiveTab('scheduler')}
          className={\`btn btn-sm px-3 py-2 \${activeTab === 'scheduler' ? 'btn-danger' : 'btn-outline-secondary text-light'}\`}
        >
          <Calendar size={14} className="me-1" /> Schedule Shows
        </button>
        <button
          onClick={() => setActiveTab('bookings')}
          className={\`btn btn-sm px-3 py-2 \${activeTab === 'bookings' ? 'btn-danger' : 'btn-outline-secondary text-light'}\`}
        >
          <Ticket size={14} className="me-1" /> Bookings Ledger ({bookings.length})
        </button>
        <button
          onClick={() => setActiveTab('users')}
          className={\`btn btn-sm px-3 py-2 \${activeTab === 'users' ? 'btn-danger' : 'btn-outline-secondary text-light'}\`}
        >
          <Users size={14} className="me-1" /> Users ({users.length})
        </button>
      </div>

      {/* Tab 1: Overview & Popular Movies */}
      {activeTab === 'overview' && (
        <div className="row g-4">
          <div className="col-lg-6">
            <div className="im-card p-4 h-100">
              <h5 className="text-white fw-bold mb-3">Top Revenue Generating Movies</h5>
              {stats?.popularMovies?.length === 0 ? (
                <p className="text-muted small">No revenue data recorded yet.</p>
              ) : (
                <div className="d-flex flex-column gap-3">
                  {stats?.popularMovies?.map((pm, idx) => (
                    <div key={idx} className="p-2 rounded bg-dark border border-secondary d-flex justify-content-between align-items-center">
                      <div>
                        <div className="text-white fw-bold">{pm._id?.title || 'Unknown Title'}</div>
                        <div className="text-muted small">{pm.bookingsCount} bookings &bull; {pm.seatsSold} seats</div>
                      </div>
                      <div className="text-success fw-bold fs-6">₹{pm.revenue}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="col-lg-6">
            <div className="im-card p-4 h-100">
              <h5 className="text-white fw-bold mb-3">Recent Bookings Stream</h5>
              <div className="d-flex flex-column gap-2 overflow-auto" style={{ maxHeight: '350px' }}>
                {stats?.recentBookings?.map((rb) => (
                  <div key={rb._id} className="p-2 rounded bg-dark border border-secondary d-flex justify-content-between align-items-center small">
                    <div>
                      <div className="text-white fw-semibold">{rb.movieId?.title}</div>
                      <div className="text-muted" style={{ fontSize: '0.72rem' }}>
                        Customer: {rb.userId?.name} ({rb.userId?.email})
                      </div>
                    </div>
                    <div className="text-end">
                      <div className="text-warning fw-bold">₹{rb.totalAmount}</div>
                      <span className={\`badge \${rb.bookingStatus === 'confirmed' ? 'bg-success' : 'bg-danger'}\`} style={{ fontSize: '0.65rem' }}>
                        {rb.bookingStatus}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Movies Management */}
      {activeTab === 'movies' && (
        <div className="im-card p-4">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h5 className="text-white fw-bold mb-0">Movie Catalog List</h5>
            <button onClick={() => setMovieModal(true)} className="btn btn-im-primary btn-sm">
              <Plus size={14} /> Add Movie
            </button>
          </div>

          <div className="table-responsive">
            <table className="table table-dark table-hover align-middle">
              <thead>
                <tr className="text-muted small">
                  <th>Poster</th>
                  <th>Title</th>
                  <th>Genres</th>
                  <th>Duration</th>
                  <th>Rating</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {movies.map((m) => (
                  <tr key={m._id}>
                    <td>
                      <img src={m.posterUrl} alt="" className="rounded" style={{ width: '36px', height: '50px', objectFit: 'cover' }} />
                    </td>
                    <td className="text-white fw-semibold">{m.title}</td>
                    <td className="small text-muted">{m.genre?.join(', ')}</td>
                    <td className="small">{m.duration} mins</td>
                    <td className="text-warning fw-bold">{m.rating}</td>
                    <td>
                      <span className="badge bg-secondary text-uppercase" style={{ fontSize: '0.68rem' }}>
                        {m.status}
                      </span>
                    </td>
                    <td>
                      <button
                        onClick={() => handleDeleteMovie(m._id)}
                        className="btn btn-outline-danger btn-sm p-1"
                        title="Delete movie"
                      >
                        <Trash2 size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 3: Showtimes Scheduler */}
      {activeTab === 'scheduler' && (
        <div className="im-card p-4">
          <h5 className="text-white fw-bold mb-3">Schedule Showtimes & Automated Seat Pricing</h5>
          <p className="text-muted small mb-4">
            Assign movies to auditorium screens. The system automatically creates Standard (₹Base), Premium (+35%), and VIP (+80%) seat tiers.
          </p>

          <form onSubmit={handleScheduleShow}>
            <div className="row g-3">
              <div className="col-md-6">
                <label className="form-label text-muted small">Select Movie</label>
                <select
                  className="form-select bg-dark border-secondary text-white"
                  value={newShow.movieId}
                  onChange={(e) => setNewShow({ ...newShow, movieId: e.target.value })}
                  required
                >
                  <option value="">-- Choose Movie --</option>
                  {movies.map(m => (
                    <option key={m._id} value={m._id}>{m.title} ({m.duration}m)</option>
                  ))}
                </select>
              </div>

              <div className="col-md-6">
                <label className="form-label text-muted small">Select Cinema</label>
                <select
                  className="form-select bg-dark border-secondary text-white"
                  value={newShow.cinemaId}
                  onChange={(e) => handleCinemaChange(e.target.value)}
                  required
                >
                  <option value="">-- Choose Cinema --</option>
                  {cinemas.map(c => (
                    <option key={c._id} value={c._id}>{c.name} ({c.city})</option>
                  ))}
                </select>
              </div>

              <div className="col-md-4">
                <label className="form-label text-muted small">Auditorium Screen</label>
                <select
                  className="form-select bg-dark border-secondary text-white"
                  value={newShow.screenId}
                  onChange={(e) => setNewShow({ ...newShow, screenId: e.target.value })}
                  required
                >
                  <option value="">-- Select Screen --</option>
                  {availableScreens.map(s => (
                    <option key={s._id} value={s._id}>{s.screenName} ({s.screenType})</option>
                  ))}
                </select>
              </div>

              <div className="col-md-4">
                <label className="form-label text-muted small">Screening Date</label>
                <input
                  type="date"
                  className="form-control bg-dark border-secondary text-white"
                  value={newShow.date}
                  onChange={(e) => setNewShow({ ...newShow, date: e.target.value })}
                  required
                />
              </div>

              <div className="col-md-2">
                <label className="form-label text-muted small">Start Time</label>
                <input
                  type="time"
                  className="form-control bg-dark border-secondary text-white"
                  value={newShow.startTime}
                  onChange={(e) => setNewShow({ ...newShow, startTime: e.target.value })}
                  required
                />
              </div>

              <div className="col-md-2">
                <label className="form-label text-muted small">Base Ticket Price (₹)</label>
                <input
                  type="number"
                  className="form-control bg-dark border-secondary text-white"
                  value={newShow.basePrice}
                  onChange={(e) => setNewShow({ ...newShow, basePrice: Number(e.target.value) })}
                  required
                  min="100"
                />
              </div>
            </div>

            <div className="mt-4">
              <button type="submit" className="btn btn-im-primary">
                Schedule Showtime & Generate Seats
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Tab 4: Bookings Ledger */}
      {activeTab === 'bookings' && (
        <div className="im-card p-4">
          <h5 className="text-white fw-bold mb-3">All Customer Bookings</h5>
          <div className="table-responsive">
            <table className="table table-dark table-hover align-middle small">
              <thead>
                <tr className="text-muted">
                  <th>Reference</th>
                  <th>Movie</th>
                  <th>Customer</th>
                  <th>Date & Time</th>
                  <th>Seats</th>
                  <th>Total</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {bookings.map((b) => (
                  <tr key={b._id}>
                    <td className="font-monospace text-warning fw-bold">{b.bookingReference}</td>
                    <td className="text-white fw-semibold">{b.movieId?.title}</td>
                    <td>{b.userId?.name} <br/><span className="text-muted" style={{ fontSize: '0.7rem' }}>{b.userId?.email}</span></td>
                    <td>{b.showId?.date} &bull; {b.showId?.startTime}</td>
                    <td className="text-danger fw-bold">{b.seats?.map(s => s.seatId).join(', ')}</td>
                    <td className="text-white fw-bold">₹{b.totalAmount}</td>
                    <td>
                      <span className={\`badge \${b.bookingStatus === 'confirmed' ? 'bg-success' : 'bg-danger'}\`}>
                        {b.bookingStatus}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 5: Users Management */}
      {activeTab === 'users' && (
        <div className="im-card p-4">
          <h5 className="text-white fw-bold mb-3">Registered Users & Roles</h5>
          <div className="table-responsive">
            <table className="table table-dark table-hover align-middle small">
              <thead>
                <tr className="text-muted">
                  <th>Avatar</th>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>Role</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u._id}>
                    <td>
                      <img src={u.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=60&q=80'} className="rounded-circle" style={{ width: '32px', height: '32px' }} alt="" />
                    </td>
                    <td className="text-white fw-semibold">{u.name}</td>
                    <td>{u.email}</td>
                    <td className="text-muted">{u.phone || 'N/A'}</td>
                    <td>
                      <span className={\`badge \${u.role === 'admin' ? 'bg-warning text-dark' : 'bg-secondary'}\`}>
                        {u.role.toUpperCase()}
                      </span>
                    </td>
                    <td>
                      <button
                        onClick={() => handleToggleUserRole(u._id, u.role)}
                        className="btn btn-outline-secondary text-light btn-sm"
                        style={{ fontSize: '0.72rem' }}
                      >
                        Toggle {u.role === 'admin' ? 'to User' : 'to Admin'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add Movie Modal */}
      {movieModal && (
        <div
          className="modal show d-block"
          style={{ backgroundColor: 'rgba(0,0,0,0.85)', zIndex: 1060 }}
          onClick={() => setMovieModal(false)}
        >
          <div className="modal-dialog modal-dialog-centered modal-lg" onClick={(e) => e.stopPropagation()}>
            <div className="modal-content bg-dark border-secondary p-4">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h5 className="modal-title text-white fw-bold">Add New Cinema Movie</h5>
                <button type="button" className="btn-close btn-close-white" onClick={() => setMovieModal(false)}></button>
              </div>

              <form onSubmit={handleCreateMovie}>
                <div className="row g-3">
                  <div className="col-md-8">
                    <label className="form-label text-muted small">Movie Title</label>
                    <input
                      type="text"
                      className="form-control bg-dark border-secondary text-white"
                      value={newMovie.title}
                      onChange={(e) => setNewMovie({ ...newMovie, title: e.target.value })}
                      required
                    />
                  </div>
                  <div className="col-md-4">
                    <label className="form-label text-muted small">Duration (Minutes)</label>
                    <input
                      type="number"
                      className="form-control bg-dark border-secondary text-white"
                      value={newMovie.duration}
                      onChange={(e) => setNewMovie({ ...newMovie, duration: e.target.value })}
                      required
                    />
                  </div>

                  <div className="col-12">
                    <label className="form-label text-muted small">Synopsis / Description</label>
                    <textarea
                      rows="3"
                      className="form-control bg-dark border-secondary text-white"
                      value={newMovie.description}
                      onChange={(e) => setNewMovie({ ...newMovie, description: e.target.value })}
                      required
                    ></textarea>
                  </div>

                  <div className="col-md-6">
                    <label className="form-label text-muted small">Genres (comma separated)</label>
                    <input
                      type="text"
                      className="form-control bg-dark border-secondary text-white"
                      value={newMovie.genre}
                      onChange={(e) => setNewMovie({ ...newMovie, genre: e.target.value })}
                    />
                  </div>

                  <div className="col-md-6">
                    <label className="form-label text-muted small">Languages (comma separated)</label>
                    <input
                      type="text"
                      className="form-control bg-dark border-secondary text-white"
                      value={newMovie.language}
                      onChange={(e) => setNewMovie({ ...newMovie, language: e.target.value })}
                    />
                  </div>

                  <div className="col-md-6">
                    <label className="form-label text-muted small">Director</label>
                    <input
                      type="text"
                      className="form-control bg-dark border-secondary text-white"
                      value={newMovie.director}
                      onChange={(e) => setNewMovie({ ...newMovie, director: e.target.value })}
                    />
                  </div>

                  <div className="col-md-6">
                    <label className="form-label text-muted small">Status</label>
                    <select
                      className="form-select bg-dark border-secondary text-white"
                      value={newMovie.status}
                      onChange={(e) => setNewMovie({ ...newMovie, status: e.target.value })}
                    >
                      <option value="now_showing">Now Showing</option>
                      <option value="coming_soon">Coming Soon</option>
                    </select>
                  </div>

                  <div className="col-md-6">
                    <label className="form-label text-muted small">Poster Image URL</label>
                    <input
                      type="url"
                      className="form-control bg-dark border-secondary text-white"
                      value={newMovie.posterUrl}
                      onChange={(e) => setNewMovie({ ...newMovie, posterUrl: e.target.value })}
                      required
                    />
                  </div>

                  <div className="col-md-6">
                    <label className="form-label text-muted small">Trailer Video URL (YouTube Embed)</label>
                    <input
                      type="url"
                      className="form-control bg-dark border-secondary text-white"
                      value={newMovie.trailerUrl}
                      onChange={(e) => setNewMovie({ ...newMovie, trailerUrl: e.target.value })}
                    />
                  </div>
                </div>

                <div className="d-flex justify-content-end gap-2 mt-4">
                  <button type="button" onClick={() => setMovieModal(false)} className="btn btn-outline-secondary text-light">
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-im-primary">
                    Save Movie
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
console.log('AdminDashboardPage.jsx written successfully');
