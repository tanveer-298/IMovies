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
            <div className="d-inline-flex p-3 rounded-circle bg-danger bg-opacity-25 text-danger mb-2 shadow">
              <Film size={34} />
            </div>
            <h2 className="text-white fw-bold brand-font mb-1">Welcome Back</h2>
            <p className="text-light text-opacity-75 small">Sign in to your IMovies account to book tickets</p>
          </div>

          <div className="im-card p-4 p-md-5 shadow-lg border border-secondary" style={{ backgroundColor: '#0d1527' }}>
            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label className="form-label text-white fw-semibold d-flex align-items-center gap-1">
                  <span>Email Address</span>
                  <span className="text-danger">*</span>
                </label>
                <div className="input-group">
                  <span className="input-group-text">
                    <Mail size={18} />
                  </span>
                  <input
                    type="email"
                    className="form-control"
                    placeholder="e.g. demo@imovies.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="mb-4">
                <label className="form-label text-white fw-semibold d-flex align-items-center justify-content-between">
                  <span>Password</span>
                  <span className="text-danger">*</span>
                </label>
                <div className="input-group">
                  <span className="input-group-text">
                    <Lock size={18} />
                  </span>
                  <input
                    type="password"
                    className="form-control"
                    placeholder="Enter your account password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="btn btn-im-primary w-100 justify-content-center py-3 fs-6 mb-3 shadow"
              >
                {submitting ? (
                  <span className="spinner-border spinner-border-sm" role="status"></span>
                ) : (
                  <>
                    <span>Sign In</span>
                    <ArrowRight size={18} />
                  </>
                )}
              </button>
            </form>

            {/* Quick Fill Buttons */}
            <div className="pt-3 border-top border-secondary text-center">
              <div className="text-light text-opacity-80 small mb-2 fw-medium">Quick 1-Click Test Accounts:</div>
              <div className="d-flex gap-2">
                <button
                  type="button"
                  onClick={fillDemoCustomer}
                  className="btn btn-outline-primary btn-sm flex-grow-1 d-flex align-items-center justify-content-center gap-1 py-2 fw-semibold"
                  style={{ fontSize: '0.78rem' }}
                >
                  <UserCheck size={14} /> Demo Customer
                </button>
                <button
                  type="button"
                  onClick={fillAdmin}
                  className="btn btn-outline-warning btn-sm flex-grow-1 d-flex align-items-center justify-content-center gap-1 py-2 fw-semibold"
                  style={{ fontSize: '0.78rem' }}
                >
                  <ShieldCheck size={14} /> Admin Account
                </button>
              </div>
            </div>

            <div className="text-center mt-4 pt-2 border-top border-secondary text-light text-opacity-75 small">
              Don't have an account?{' '}
              <Link to="/register" className="text-danger fw-bold text-decoration-none ms-1">
                Sign Up
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}