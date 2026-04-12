import { Link } from 'react-router-dom';
import { HiOutlineHome } from 'react-icons/hi';

export default function NotFoundPage() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center text-center animate-fade-in">
      <div>
        <h1 className="text-8xl font-bold text-nitj-navy/20">404</h1>
        <h2 className="text-xl font-semibold text-text-heading mt-4">Page Not Found</h2>
        <p className="text-text-muted text-sm mt-2 max-w-md mx-auto">
          The page you are looking for does not exist or has been moved.
        </p>
        <Link
          to="/dashboard"
          className="inline-flex items-center gap-2 bg-nitj-navy hover:bg-nitj-navy-light text-white px-6 py-2.5 rounded-lg text-sm font-semibold mt-6 transition-colors"
        >
          <HiOutlineHome className="w-4 h-4" />
          Back to Dashboard
        </Link>
      </div>
    </div>
  );
}
