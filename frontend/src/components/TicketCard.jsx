import { Link } from 'react-router-dom';
import { MapPin, MessageSquare, ThumbsUp } from 'lucide-react';
import StampBadge from './StampBadge';
import { uploadUrl } from '../lib/api';

const ISSUE_LABELS = {
  pothole: 'Pothole',
  garbage: 'Garbage',
  street_light: 'Street Light',
  water_leak: 'Water Leak',
  other: 'Other',
};

export default function TicketCard({ report }) {
  const image = report.images?.[0];
  return (
    <Link
      to={`/reports/${report._id || report.id}`}
      className="docket-notch group block overflow-hidden rounded-xl border border-ink/15 bg-card shadow-[0_1px_0_rgba(18,38,44,0.05)] transition hover:-translate-y-0.5 hover:shadow-md"
    >
      <div className="flex gap-4 p-4">
        <div className="h-20 w-20 shrink-0 overflow-hidden rounded-lg bg-paper-dim">
          {image ? (
            <img src={uploadUrl(image)} alt="" className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-ink/30">
              <MapPin size={22} />
            </div>
          )}
        </div>
        <div className="min-w-0 flex-1">
          <div className="mb-1 flex items-center justify-between gap-2">
            <span className="font-mono text-[11px] tracking-wide text-ink/45">
              {report.ticketId || `TKT-${(report._id || '').slice(-6).toUpperCase()}`}
            </span>
            <StampBadge status={report.status} size="sm" />
          </div>
          <h3 className="truncate font-display text-base font-bold text-ink">
            {ISSUE_LABELS[report.issueType] || report.issueType}
          </h3>
          <p className="mt-0.5 line-clamp-2 text-sm text-ink/60">{report.description}</p>
          <div className="mt-2 flex items-center gap-4 text-xs text-ink/45">
            <span className="flex items-center gap-1">
              <MapPin size={12} /> {report.location?.address || 'Location pinned'}
            </span>
            <span className="flex items-center gap-1">
              <ThumbsUp size={12} /> {report.upvotes || 0}
            </span>
            <span className="flex items-center gap-1">
              <MessageSquare size={12} /> {report.comments?.length || 0}
            </span>
          </div>
        </div>
      </div>
      <div className="docket-perf" />
    </Link>
  );
}
