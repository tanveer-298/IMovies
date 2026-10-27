import React, { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Film, User, LogOut, LayoutDashboard, Kanban, ShieldCheck } from 'lucide-react';

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
                <Kanban size={16} className="text-danger" />
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
                      <span className={`badge mt-1 ${isAdmin ? 'bg-warning text-dark' : 'bg-primary'}`}>
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
                      <Kanban size={16} /> Project Kanban
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