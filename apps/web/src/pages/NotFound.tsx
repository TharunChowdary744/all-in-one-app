import { Link } from 'react-router-dom';

export function NotFound() {
  return (
    <div className="empty">
      <h1>Page not found</h1>
      <p>This page doesn’t exist or may have moved. Every tool is listed on the All tools page.</p>
      <Link to="/" className="btn btn-primary">
        Go to All tools
      </Link>
    </div>
  );
}
