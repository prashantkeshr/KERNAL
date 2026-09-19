import { Link } from 'react-router-dom';

export default function NotFoundPage() {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="font-mono text-6xl font-bold text-k-accent mb-4">404</div>
      <h1 className="text-xl font-semibold text-k-text mb-2">Page not found</h1>
      <p className="text-k-muted mb-8 max-w-sm">
        This path doesn't exist in the KERNAL knowledge graph. Yet.
      </p>
      <div className="flex gap-3">
        <Link
          to="/"
          className="px-5 py-2.5 rounded-kernal bg-k-accent text-k-bg font-semibold text-sm hover:bg-k-accent/90 transition-kernal"
        >
          Go home
        </Link>
        <Link
          to="/roadmap"
          className="px-5 py-2.5 rounded-kernal border border-k-border text-k-text font-semibold text-sm hover:border-k-accent/50 transition-kernal"
        >
          View roadmap
        </Link>
      </div>
    </div>
  );
}
