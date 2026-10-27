const fs = require('fs');

const regPath = 'C:\\Users\\mansu\\.antigravity-ide\\IMovies\\client\\src\\pages\\RegisterPage.jsx';

const regContent = `
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Film, Lock, Mail, User, Phone, ArrowRight, ShieldCheck } from 'lucide-react';

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
      showAlert('Passwords do not match. Please re-enter identical passwords.', 'danger');
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
            <div className="d-inline-flex p-3 rounded-circle bg-danger bg-opacity-25 text-danger mb-2 shadow">
              <Film size={34} />
            </div>
            <h2 className="text-white fw-bold brand-font mb-1">Create an Account</h2>
            <p className="text-light text-opacity-75 small">Fill in the details below to register for IMovies</p>
          </div>

          <div className="im-card p-4 p-md-5 shadow-lg border border-secondary" style={{ backgroundColor: '#0d1527' }}>
            <form onSubmit={handleSubmit}>
              {/* Full Name */}
              <div className="mb-3">
                <label className="form-label text-white fw-semibold d-flex align-items-center gap-1">
                  <span>Full Name</span>
                  <span className="text-danger">*</span>
                </label>
                <div className="input-group">
                  <span className="input-group-text">
                    <User size={18} />
                  </span>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="e.g. Rahul Sharma"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>
              </div>

              {/* Email Address */}
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
                    placeholder="e.g. rahul@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>

              {/* Phone Number */}
              <div className="mb-3">
                <label className="form-label text-white fw-semibold d-flex align-items-center justify-content-between">
                  <span>Phone Number</span>
                  <span className="text-light text-opacity-50 small fw-normal">(Optional)</span>
                </label>
                <div className="input-group">
                  <span className="input-group-text">
                    <Phone size={18} />
                  </span>
                  <input
                    type="tel"
                    className="form-control"
                    placeholder="e.g. +91 9876543210"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                  />
                </div>
              </div>

              {/* Password */}
              <div className="mb-3">
                <label className="form-label text-white fw-semibold d-flex align-items-center gap-1">
                  <span>Create Password</span>
                  <span className="text-danger">*</span>
                  <span className="text-light text-opacity-50 small fw-normal ms-1">(min. 6 characters)</span>
                </label>
                <div className="input-group">
                  <span className="input-group-text">
                    <Lock size={18} />
                  </span>
                  <input
                    type="password"
                    className="form-control"
                    placeholder="Enter at least 6 characters"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
              </div>

              {/* Confirm Password */}
              <div className="mb-4">
                <label className="form-label text-white fw-semibold d-flex align-items-center gap-1">
                  <span>Confirm Password</span>
                  <span className="text-danger">*</span>
                </label>
                <div className="input-group">
                  <span className="input-group-text">
                    <ShieldCheck size={18} />
                  </span>
                  <input
                    type="password"
                    className="form-control"
                    placeholder="Re-enter your password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
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
                    <span>Create Account</span>
                    <ArrowRight size={18} />
                  </>
                )}
              </button>
            </form>

            <div className="text-center mt-3 pt-3 border-top border-secondary text-light text-opacity-75 small">
              Already have an account?{' '}
              <Link to="/login" className="text-danger fw-bold text-decoration-none ms-1">
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
console.log('RegisterPage.jsx updated with crystal-clear high-contrast labels & placeholders');
