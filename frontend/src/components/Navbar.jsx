import { Link } from 'react-router-dom';
import { Landmark } from 'lucide-react';
import Button from './Button';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { isAuthenticated } = useAuth();
  return (
    <header className="sticky top-0 z-40 border-b border-ink/10 bg-paper/90 backdrop-blur">
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link to="/" className="flex items-center gap-2 font-display text-lg font-bold text-ink">
          <span className="flex h-8 w-8 items-center justify-center rounded-md bg-ink text-amber">
            <Landmark size={18} />
          </span>
          CivicSense
        </Link>
        <div className="hidden items-center gap-8 text-sm font-semibold text-ink/70 md:flex">
          <a href="/#how-it-works" className="hover:text-ink">How it works</a>
          <a href="/#departments" className="hover:text-ink">Departments</a>
          <Link to="/map" className="hover:text-ink">Live map</Link>
          <Link to="/admin-login" className="hover:text-ink">Municipal login</Link>
        </div>
        <div className="flex items-center gap-3">
          {isAuthenticated ? (
            <Button to="/dashboard" variant="amber">Dashboard</Button>
          ) : (
            <>
              <Button to="/login" variant="ghost">Log in</Button>
              <Button to="/signup" variant="primary">File a report</Button>
            </>
          )}
        </div>
      </nav>
    </header>
  );
}
