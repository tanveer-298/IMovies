const fs = require('fs');
const path = require('path');

const clientSrc = 'C:\\Users\\mansu\\.antigravity-ide\\IMovies\\client\\src';

function writeFile(relPath, content) {
  const fullPath = path.join(clientSrc, relPath);
  fs.mkdirSync(path.dirname(fullPath), { recursive: true });
  fs.writeFileSync(fullPath, content.trim(), 'utf8');
  console.log('Created: ' + relPath);
}

// 1. services/api.js
writeFile('services/api.js', `
import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request Interceptor: Attach JWT Token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('imovies_token');
    if (token) {
      config.headers.Authorization = \`Bearer \${token}\`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Format error messages
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message = error.response?.data?.message || error.message || 'Something went wrong';
    return Promise.reject(new Error(message));
  }
);

export default api;
`);

// 2. context/AuthContext.jsx
writeFile('context/AuthContext.jsx', `
import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('imovies_token') || null);
  const [loading, setLoading] = useState(true);
  const [alert, setAlert] = useState(null);

  const showAlert = (message, type = 'info') => {
    setAlert({ message, type });
    setTimeout(() => setAlert(null), 4500);
  };

  useEffect(() => {
    const fetchMe = async () => {
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        const res = await api.get('/auth/me');
        setUser(res.data.user);
      } catch (err) {
        console.error('Session expired:', err.message);
        logout();
      } finally {
        setLoading(false);
      }
    };
    fetchMe();
  }, [token]);

  const login = async (email, password) => {
    try {
      const res = await api.post('/auth/login', { email, password });
      const { token: receivedToken, user: receivedUser } = res.data;
      localStorage.setItem('imovies_token', receivedToken);
      setToken(receivedToken);
      setUser(receivedUser);
      showAlert('Welcome back, ' + receivedUser.name + '!', 'success');
      return { success: true };
    } catch (err) {
      showAlert(err.message, 'danger');
      return { success: false, error: err.message };
    }
  };

  const register = async (name, email, password, phone) => {
    try {
      const res = await api.post('/auth/register', { name, email, password, phone });
      const { token: receivedToken, user: receivedUser } = res.data;
      localStorage.setItem('imovies_token', receivedToken);
      setToken(receivedToken);
      setUser(receivedUser);
      showAlert('Account created successfully! Welcome to IMovies.', 'success');
      return { success: true };
    } catch (err) {
      showAlert(err.message, 'danger');
      return { success: false, error: err.message };
    }
  };

  const logout = () => {
    localStorage.removeItem('imovies_token');
    setToken(null);
    setUser(null);
    showAlert('You have been logged out safely.', 'info');
  };

  const updateProfile = async (data) => {
    try {
      const res = await api.put('/auth/profile', data);
      setUser(res.data.user);
      showAlert('Profile updated successfully!', 'success');
      return { success: true };
    } catch (err) {
      showAlert(err.message, 'danger');
      return { success: false, error: err.message };
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      token,
      loading,
      alert,
      showAlert,
      login,
      register,
      logout,
      updateProfile,
      isAuthenticated: !!user,
      isAdmin: user?.role === 'admin'
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
`);

// 3. components/Navbar.jsx
writeFile('components/Navbar.jsx', `
import React, { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Film, User, LogOut, LayoutDashboard, KanBan, ShieldCheck } from 'lucide-react';

export default function Navbar() {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  return (
    <nav className="navbar navbar-expand-lg im-navbar py-2">
      <div className="container">
        {/* Brand */}
        <Link className="navbar-brand d-flex align-items-center gap-2 text-decoration-none" to="/">
          <div className="d-flex align-items-center justify-content-center bg-danger rounded-3 p-2 text-white shadow-sm" style={{ width: '38px', height: '38px' }}>
            <Film size={20} />
          </div>
          <div>
            <span className="brand-font fw-bold text-white fs-4 tracking-tight">I<span className="text-danger">MOVIES</span></span>
          </div>
        </Link>

        {/* Mobile Toggle */}
        <button
          className="navbar-toggler border-0 text-white"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#imoviesNavbar"
          aria-controls="imoviesNavbar"
          aria-expanded="false"
        >
          <span className="bi bi-list fs-2"></span>
        </button>

        {/* Links */}
        <div className="collapse navbar-collapse" id="imoviesNavbar">
          <ul className="navbar-nav me-auto mb-2 mb-lg-0 ms-lg-4 gap-1">
            <li className="nav-item">
              <NavLink className="nav-link px-3" to="/">Home</NavLink>
            </li>
            <li className="nav-item">
              <NavLink className="nav-link px-3" to="/movies">Movies</NavLink>
            </li>
            <li className="nav-item">
              <NavLink className="nav-link px-3" to="/cinemas">Cinemas</NavLink>
            </li>
            <li className="nav-item">
              <NavLink className="nav-link px-3 d-flex align-items-center gap-1" to="/workspace">
                <KanBan size={16} className="text-danger" />
                <span>Workspace & Kanban</span>
                <span className="badge bg-danger rounded-pill ms-1" style={{ fontSize: '0.65rem' }}>19 Tasks</span>
              </NavLink>
            </li>
          </ul>

          {/* Auth Actions */}
          <div className="d-flex align-items-center gap-2">
            {isAuthenticated ? (
              <div className="position-relative">
                <button
                  className="btn btn-im-outline d-flex align-items-center gap-2 py-2 px-3"
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                >
                  <img
                    src={user.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=80&q=80'}
                    alt={user.name}
                    className="rounded-circle"
                    style={{ width: '26px', height: '26px', objectFit: 'cover' }}
                  />
                  <span className="text-white small fw-medium">{user.name.split(' ')[0]}</span>
                  {isAdmin && <ShieldCheck size={16} className="text-warning" />}
                  <i className="bi bi-chevron-down text-muted small"></i>
                </button>

                {dropdownOpen && (
                  <div
                    className="position-absolute end-0 mt-2 p-2 im-card-glass shadow-lg"
                    style={{ minWidth: '220px', zIndex: 1050 }}
                    onClick={() => setDropdownOpen(false)}
                  >
                    <div className="px-3 py-2 border-bottom border-secondary mb-1">
                      <div className="fw-semibold text-white">{user.name}</div>
                      <div className="text-muted small text-truncate">{user.email}</div>
                      <span className={\`badge mt-1 \${isAdmin ? 'bg-warning text-dark' : 'bg-primary'}\`}>
                        {user.role.toUpperCase()}
                      </span>
                    </div>

                    <Link to="/dashboard" className="dropdown-item py-2 px-3 text-light d-flex align-items-center gap-2 rounded">
                      <User size={16} /> My Bookings & Profile
                    </Link>

                    {isAdmin && (
                      <Link to="/admin" className="dropdown-item py-2 px-3 text-warning d-flex align-items-center gap-2 rounded">
                        <LayoutDashboard size={16} /> Admin Dashboard
                      </Link>
                    )}

                    <Link to="/workspace" className="dropdown-item py-2 px-3 text-light d-flex align-items-center gap-2 rounded">
                      <KanBan size={16} /> Project Kanban
                    </Link>

                    <hr className="my-1 border-secondary" />

                    <button
                      onClick={logout}
                      className="dropdown-item py-2 px-3 text-danger d-flex align-items-center gap-2 rounded w-100 border-0 bg-transparent"
                    >
                      <LogOut size={16} /> Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="d-flex align-items-center gap-2">
                <Link to="/login" className="btn btn-im-outline py-2 px-3">
                  Sign In
                </Link>
                <Link to="/register" className="btn btn-im-primary py-2 px-3">
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
`);

// 4. components/Footer.jsx
writeFile('components/Footer.jsx', `
import React from 'react';
import { Link } from 'react-router-dom';
import { Film, Github, ExternalLink, Heart, Shield, CheckCircle } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="pt-5 pb-4 mt-5 border-top border-secondary" style={{ backgroundColor: '#05070d' }}>
      <div className="container">
        <div className="row g-4 mb-4">
          {/* Brand Info */}
          <div className="col-lg-4 col-md-6">
            <div className="d-flex align-items-center gap-2 mb-3">
              <div className="d-flex align-items-center justify-content-center bg-danger rounded-3 p-2 text-white">
                <Film size={20} />
              </div>
              <span className="brand-font fw-bold text-white fs-4">I<span className="text-danger">MOVIES</span></span>
            </div>
            <p className="text-muted small pe-lg-3">
              IMovies is a premier cinema ticket booking platform built with the MERN stack. Discover trending releases, reserve seats in real time, and experience cinematic entertainment.
            </p>
            <div className="d-flex flex-wrap gap-2 pt-1">
              <span className="badge bg-secondary">MongoDB</span>
              <span className="badge bg-secondary">Express.js</span>
              <span className="badge bg-secondary">React 19 + Vite</span>
              <span className="badge bg-secondary">Node.js</span>
            </div>
          </div>

          {/* Quick Links */}
          <div className="col-lg-2 col-md-6">
            <h6 className="text-white fw-bold mb-3">Quick Links</h6>
            <ul className="list-unstyled small d-flex flex-column gap-2">
              <li><Link to="/" className="text-muted text-decoration-none hover-white">Now Showing</Link></li>
              <li><Link to="/movies" className="text-muted text-decoration-none hover-white">Explore All Movies</Link></li>
              <li><Link to="/cinemas" className="text-muted text-decoration-none hover-white">Cinemas & Formats</Link></li>
              <li><Link to="/workspace" className="text-muted text-decoration-none hover-white">Project Workspace</Link></li>
              <li><Link to="/workspace#kanban" className="text-muted text-decoration-none hover-white">Kanban Board (19 Tasks)</Link></li>
            </ul>
          </div>

          {/* Mentor Submission Links Status */}
          <div className="col-lg-3 col-md-6">
            <h6 className="text-white fw-bold mb-3">Mentor Review Links</h6>
            <div className="d-flex flex-column gap-2 small">
              <div className="p-2 rounded bg-dark border border-secondary">
                <div className="text-muted d-flex align-items-center justify-content-between mb-1">
                  <span>GitHub Repository:</span>
                  <span className="badge bg-secondary">Pending URL</span>
                </div>
                <div className="text-white fw-semibold">Not published yet.</div>
              </div>
              <div className="p-2 rounded bg-dark border border-secondary">
                <div className="text-muted d-flex align-items-center justify-content-between mb-1">
                  <span>Live Production Demo:</span>
                  <span className="badge bg-secondary">Pending Deploy</span>
                </div>
                <div className="text-white fw-semibold">Not deployed yet.</div>
              </div>
            </div>
          </div>

          {/* Project Credentials */}
          <div className="col-lg-3 col-md-6">
            <h6 className="text-white fw-bold mb-3">Demo Accounts</h6>
            <div className="p-3 rounded im-card-glass small">
              <div className="mb-2">
                <div className="text-danger fw-bold">Admin Account:</div>
                <div className="text-muted">admin@imovies.com</div>
                <div className="text-muted">Pass: <code>Admin@123password</code></div>
              </div>
              <div>
                <div className="text-primary fw-bold">Customer Account:</div>
                <div className="text-muted">demo@imovies.com</div>
                <div className="text-muted">Pass: <code>User@123password</code></div>
              </div>
            </div>
          </div>
        </div>

        <hr className="border-secondary my-4" />

        <div className="d-flex flex-column flex-md-row justify-content-between align-items-center gap-3 text-muted small">
          <div>
            &copy; {new Date().getFullYear()} IMovies — Movie Ticket Booking Made Simple. All rights reserved.
          </div>
          <div className="d-flex align-items-center gap-3">
            <span>Category: Entertainment</span>
            <span>&bull;</span>
            <span>Type: Individual MERN Stack</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
`);

// 5. components/MovieCard.jsx
writeFile('components/MovieCard.jsx', `
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

        <Link to={\`/movie/\${movie._id}\`} className="btn btn-im-primary w-100 justify-content-center py-2">
          <Ticket size={16} /> Book Tickets
        </Link>
      </div>
    </div>
  );
}
`);

// 6. components/ProtectedRoute.jsx & AdminRoute.jsx
writeFile('components/ProtectedRoute.jsx', `
import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center py-5" style={{ minHeight: '60vh' }}>
        <div className="spinner-border text-danger" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
}
`);

writeFile('components/AdminRoute.jsx', `
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function AdminRoute({ children }) {
  const { isAuthenticated, isAdmin, loading } = useAuth();

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center py-5" style={{ minHeight: '60vh' }}>
        <div className="spinner-border text-danger" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !isAdmin) {
    return <Navigate to="/" replace />;
  }

  return children;
}
`);

console.log('Client core services and components created successfully');
