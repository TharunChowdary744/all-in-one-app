import { Link } from 'react-router-dom';

export function NotFound() {
  return (
    <div className="empty">
      <h1>404</h1>
      <p>We couldn't find that page.</p>
      <Link to="/" className="btn btn-primary">Back to dashboard</Link>
    </div>
  );
}
