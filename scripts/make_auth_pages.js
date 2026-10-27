const fs = require('fs');

const loginPath = 'C:\\Users\\mansu\\.antigravity-ide\\IMovies\\client\\src\\pages\\LoginPage.jsx';
const loginContent = `
import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Film, Lock, Mail, ArrowRight, ShieldCheck, UserCheck } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    const res = await login(email, password);
    setSubmitting(false);
    if (res.success) {
      navigate(from, { replace: true });
    }
  };

  const fillDemoCustomer = () => {
    setEmail('demo@imovies.com');
    setPassword('User@123password');
  };

  const fillAdmin = () => {
    setEmail('admin@imovies.com');
    setPassword('Admin@123password');
  };

  return (
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-md-7 col-lg-5">
          <div className="text-center mb-4">
            <div className="d-inline-flex p-3 rounded-circle bg-danger bg-opacity-25 text-danger mb-2">
              <Film size={32} />
            </div>
            <h2 className="text-white fw-bold brand-font mb-1">Welcome Back</h2>
            <p className="text-muted small">Sign in to your IMovies account to book and manage tickets</p>
          </div>

          <div className="im-card p-4 p-md-5 shadow-lg">
            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label className="form-label text-muted small">Email Address</label>
                <div className="input-group">
                  <span className="input-group-text bg-dark border-secondary text-muted">
                    <Mail size={16} />
                  </span>
                  <input
                    type="email"
                    className="form-control bg-dark border-secondary text-white"
                    placeholder="name@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="mb-4">
                <div className="d-flex justify-content-between align-items-center mb-1">
                  <label className="form-label text-muted small mb-0">Password</label>
                </div>
                <div className="input-group">
                  <span className="input-group-text bg-dark border-secondary text-muted">
                    <Lock size={16} />
                  </span>
                  <input
                    type="password"
                    className="form-control bg-dark border-secondary text-white"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="btn btn-im-primary w-100 justify-content-center py-2 fs-6 mb-3"
              >
                {submitting ? (
                  <span className="spinner-border spinner-border-sm" role="status"></span>
                ) : (
                  <>
                    <span>Sign In</span>
                    <ArrowRight size={16} />
                  </>
                )}
              </button>
            </form>

            {/* Quick Fill Credentials Buttons for Mentor Testing */}
            <div className="pt-3 border-top border-secondary text-center">
              <div className="text-muted small mb-2 fw-medium">Quick Fill Demo Accounts:</div>
              <div className="d-flex gap-2">
                <button
                  type="button"
                  onClick={fillDemoCustomer}
                  className="btn btn-outline-primary btn-sm flex-grow-1 d-flex align-items-center justify-content-center gap-1"
                  style={{ fontSize: '0.75rem' }}
                >
                  <UserCheck size={14} /> Demo Customer
                </button>
                <button
                  type="button"
                  onClick={fillAdmin}
                  className="btn btn-outline-warning btn-sm flex-grow-1 d-flex align-items-center justify-content-center gap-1"
                  style={{ fontSize: '0.75rem' }}
                >
                  <ShieldCheck size={14} /> Admin
                </button>
              </div>
            </div>

            <div className="text-center mt-4 text-muted small">
              Don't have an account?{' '}
              <Link to="/register" className="text-danger fw-semibold text-decoration-none">
                Sign Up
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
`;
fs.writeFileSync(loginPath, loginContent.trim(), 'utf8');

const regPath = 'C:\\Users\\mansu\\.antigravity-ide\\IMovies\\client\\src\\pages\\RegisterPage.jsx';
const regContent = `
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Film, Lock, Mail, User, Phone, ArrowRight } from 'lucide-react';

export default function RegisterPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const { register, showAlert } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      showAlert('Passwords do not match.', 'danger');
      return;
    }
    if (password.length < 6) {
      showAlert('Password must be at least 6 characters long.', 'danger');
      return;
    }

    setSubmitting(true);
    const res = await register(name, email, password, phone);
    setSubmitting(false);
    if (res.success) {
      navigate('/dashboard');
    }
  };

  return (
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-md-7 col-lg-5">
          <div className="text-center mb-4">
            <div className="d-inline-flex p-3 rounded-circle bg-danger bg-opacity-25 text-danger mb-2">
              <Film size={32} />
            </div>
            <h2 className="text-white fw-bold brand-font mb-1">Create an Account</h2>
            <p className="text-muted small">Join IMovies to book cinema seats, save history, and earn rewards</p>
          </div>

          <div className="im-card p-4 p-md-5 shadow-lg">
            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label className="form-label text-muted small">Full Name</label>
                <div className="input-group">
                  <span className="input-group-text bg-dark border-secondary text-muted">
                    <User size={16} />
                  </span>
                  <input
                    type="text"
                    className="form-control bg-dark border-secondary text-white"
                    placeholder="John Doe"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="mb-3">
                <label className="form-label text-muted small">Email Address</label>
                <div className="input-group">
                  <span className="input-group-text bg-dark border-secondary text-muted">
                    <Mail size={16} />
                  </span>
                  <input
                    type="email"
                    className="form-control bg-dark border-secondary text-white"
                    placeholder="name@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="mb-3">
                <label className="form-label text-muted small">Phone Number (Optional)</label>
                <div className="input-group">
                  <span className="input-group-text bg-dark border-secondary text-muted">
                    <Phone size={16} />
                  </span>
                  <input
                    type="tel"
                    className="form-control bg-dark border-secondary text-white"
                    placeholder="+91 9876543210"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                  />
                </div>
              </div>

              <div className="mb-3">
                <label className="form-label text-muted small">Password (min 6 characters)</label>
                <div className="input-group">
                  <span className="input-group-text bg-dark border-secondary text-muted">
                    <Lock size={16} />
                  </span>
                  <input
                    type="password"
                    className="form-control bg-dark border-secondary text-white"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="mb-4">
                <label className="form-label text-muted small">Confirm Password</label>
                <div className="input-group">
                  <span className="input-group-text bg-dark border-secondary text-muted">
                    <Lock size={16} />
                  </span>
                  <input
                    type="password"
                    className="form-control bg-dark border-secondary text-white"
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="btn btn-im-primary w-100 justify-content-center py-2 fs-6 mb-3"
              >
                {submitting ? (
                  <span className="spinner-border spinner-border-sm" role="status"></span>
                ) : (
                  <>
                    <span>Create Account</span>
                    <ArrowRight size={16} />
                  </>
                )}
              </button>
            </form>

            <div className="text-center mt-3 text-muted small">
              Already have an account?{' '}
              <Link to="/login" className="text-danger fw-semibold text-decoration-none">
                Sign In
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
`;
fs.writeFileSync(regPath, regContent.trim(), 'utf8');

const notFoundPath = 'C:\\Users\\mansu\\.antigravity-ide\\IMovies\\client\\src\\pages\\NotFoundPage.jsx';
const notFoundContent = `
import React from 'react';
import { Link } from 'react-router-dom';
import { Film, Home } from 'lucide-react';

export default function NotFoundPage() {
  return (
    <div className="container py-5 text-center my-5">
      <div className="d-inline-flex p-4 rounded-circle bg-danger bg-opacity-10 text-danger mb-3">
        <Film size={48} />
      </div>
      <h1 className="display-4 fw-bold text-white brand-font mb-2">404</h1>
      <h4 className="text-white mb-3">Scene Not Found</h4>
      <p className="text-muted small mb-4">The page or movie showtime you are looking for does not exist or has been moved.</p>
      <Link to="/" className="btn btn-im-primary">
        <Home size={16} /> Return to Home
      </Link>
    </div>
  );
}
`;
fs.writeFileSync(notFoundPath, notFoundContent.trim(), 'utf8');

console.log('LoginPage, RegisterPage, and NotFoundPage created successfully');
