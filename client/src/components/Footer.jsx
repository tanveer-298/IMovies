import React from 'react';
import { Link } from 'react-router-dom';
import { Film, FolderGit2, ExternalLink, Heart, Shield, CheckCircle } from 'lucide-react';

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
                  <span className="badge bg-success">Verified</span>
                </div>
                <a href="https://github.com/tanveer-298/IMovies" target="_blank" rel="noopener noreferrer" className="text-danger fw-semibold text-decoration-none">github.com/tanveer-298/IMovies</a>
              </div>
              <div className="p-2 rounded bg-dark border border-secondary">
                <div className="text-muted d-flex align-items-center justify-content-between mb-1">
                  <span>Live Production Demo:</span>
                  <span className="badge bg-success">Localhost:5173</span>
                </div>
                <a href="http://localhost:5173" target="_blank" rel="noopener noreferrer" className="text-warning fw-semibold text-decoration-none">http://localhost:5173</a>
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