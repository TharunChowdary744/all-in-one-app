import { Link } from 'react-router-dom';

export function NotFound() {
  return (
    <div className="empty">
      <span className="label">Error 404</span>
      <h1>Not in the kit.</h1>
      <p>That page doesn't exist. It may have moved.</p>
      <Link to="/" className="btn btn-primary">Back to all tools</Link>
    </div>
  );
}
