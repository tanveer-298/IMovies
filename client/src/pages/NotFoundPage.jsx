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