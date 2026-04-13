import { Link } from 'react-router-dom';
import { HiOutlineHome } from 'react-icons/hi';

export default function NotFoundPage() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center text-center animate-fade-in">
      <div>
        <h1 className="text-8xl font-bold" style={{ color: 'rgba(26, 54, 93, 0.2)' }}>404</h1>
        <h2 className="text-xl font-semibold mt-4" style={{ color: '#2d3748' }}>Page Not Found</h2>
        <p className="text-[14px] mt-2 max-w-md mx-auto" style={{ color: '#718096' }}>
          The page you are looking for does not exist or has been moved.
        </p>
        <div className="mt-6 flex justify-center">
          <Link
            to="/dashboard"
            className="btn-primary !w-auto !px-6"
          >
            <HiOutlineHome className="w-4 h-4" />
            Back to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
