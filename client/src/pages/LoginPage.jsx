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