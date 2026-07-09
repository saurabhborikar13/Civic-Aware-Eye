import { Link } from 'react-router-dom';
import { Landmark } from 'lucide-react';

export default function AuthLayout({ title, subtitle, children, footer }) {
  return (
    <div className="grid min-h-screen md:grid-cols-2">
      <div className="blueprint-grid hidden flex-col justify-between bg-ink p-10 text-paper md:flex">
        <Link to="/" className="flex items-center gap-2 font-display text-lg font-bold">
          <span className="flex h-8 w-8 items-center justify-center rounded-md bg-amber text-ink">
            <Landmark size={18} />
          </span>
          CivicSense
        </Link>
        <div>
          <p className="font-mono text-xs uppercase tracking-wide text-paper/50">Docket #TKT-4F82A1</p>
          <p className="mt-2 max-w-sm font-display text-2xl font-bold leading-snug">
            "Filed a report about our street light on Monday. Fixed by Thursday, with an SMS at every step."
          </p>
          <p className="mt-3 text-sm text-paper/50">&mdash; Verified citizen, Nagpur</p>
        </div>
        <p className="font-mono text-xs text-paper/40">&copy; CivicSense &middot; Municipal Filing System</p>
      </div>

      <div className="flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-sm">
          <Link to="/" className="mb-8 flex items-center gap-2 font-display text-lg font-bold text-ink md:hidden">
            <span className="flex h-8 w-8 items-center justify-center rounded-md bg-ink text-amber">
              <Landmark size={18} />
            </span>
            CivicSense
          </Link>
          <h1 className="font-display text-2xl font-bold text-ink">{title}</h1>
          {subtitle && <p className="mt-1.5 text-sm text-ink/60">{subtitle}</p>}
          <div className="mt-7">{children}</div>
          {footer && <div className="mt-6 text-center text-sm text-ink/60">{footer}</div>}
        </div>
      </div>
    </div>
  );
}
