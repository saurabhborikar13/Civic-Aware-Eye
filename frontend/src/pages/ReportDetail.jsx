import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, ThumbsUp, MapPin, Send } from 'lucide-react';
import DashboardShell from '../components/DashboardShell';
import StampBadge from '../components/StampBadge';
import Button from '../components/Button';
import Input from '../components/Input';
import api, { uploadUrl } from '../lib/api';

const STAGES = ['pending', 'in_progress', 'resolved'];

const ISSUE_LABELS = {
  pothole: 'Pothole',
  garbage: 'Garbage',
  street_light: 'Street Light',
  water_leak: 'Water Leak',
  other: 'Other',
};

export default function ReportDetail() {
  const { id } = useParams();
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [comment, setComment] = useState('');
  const [posting, setPosting] = useState(false);
  const [upvoting, setUpvoting] = useState(false);

  const load = () => {
    api.get(`/api/v1/complaints/${id}`).then(({ data }) => setReport(data.data)).finally(() => setLoading(false));
  };

  useEffect(load, [id]);

  const upvote = async () => {
    setUpvoting(true);
    try {
      await api.put(`/api/v1/complaints/${id}/upvote`);
      load();
    } finally {
      setUpvoting(false);
    }
  };

  const postComment = async (e) => {
    e.preventDefault();
    if (!comment.trim()) return;
    setPosting(true);
    try {
      await api.post(`/api/v1/complaints/${id}/comments`, { text: comment });
      setComment('');
      load();
    } finally {
      setPosting(false);
    }
  };

  if (loading) {
    return (
      <DashboardShell>
        <p className="text-sm text-ink/50">Pulling up the docket…</p>
      </DashboardShell>
    );
  }

  if (!report) {
    return (
      <DashboardShell>
        <p className="text-sm text-status-rejected">Docket not found.</p>
      </DashboardShell>
    );
  }

  const stageIndex = report.status === 'rejected' ? -1 : STAGES.indexOf(report.status);

  return (
    <DashboardShell>
      <Link to="/my-reports" className="mb-4 flex items-center gap-1.5 text-sm font-semibold text-ink/60 hover:text-ink">
        <ArrowLeft size={15} /> Back to my reports
      </Link>

      <div className="docket-notch rounded-2xl border border-ink/15 bg-card p-6 md:p-8">
        <div className="flex flex-wrap items-start justify-between gap-4 border-b border-dashed border-ink/20 pb-5">
          <div>
            <p className="font-mono text-xs text-ink/45">{report.ticketId}</p>
            <h1 className="font-display text-2xl font-bold text-ink">
              {ISSUE_LABELS[report.issueType] || report.issueType}
            </h1>
            <p className="mt-1 flex items-center gap-1 text-sm text-ink/55">
              <MapPin size={13} /> {report.location?.address}
            </p>
          </div>
          <StampBadge status={report.status} size="lg" />
        </div>

        {report.status !== 'rejected' && (
          <div className="mt-6 flex items-center">
            {STAGES.map((s, i) => (
              <div key={s} className="flex flex-1 items-center last:flex-none">
                <div
                  className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full border-2 font-mono text-xs font-bold ${
                    i <= stageIndex ? 'border-teal bg-teal text-paper' : 'border-ink/20 text-ink/30'
                  }`}
                >
                  {i + 1}
                </div>
                {i < STAGES.length - 1 && (
                  <div className={`h-0.5 flex-1 ${i < stageIndex ? 'bg-teal' : 'bg-ink/15'}`} />
                )}
              </div>
            ))}
          </div>
        )}
        {report.status !== 'rejected' && (
          <div className="mt-1 flex justify-between font-mono text-[11px] text-ink/45">
            <span>Filed</span>
            <span>In progress</span>
            <span>Resolved</span>
          </div>
        )}

        {report.images?.[0] && (
          <img src={uploadUrl(report.images[0])} alt="" className="mt-6 max-h-80 w-full rounded-lg object-cover" />
        )}

        <p className="mt-6 text-ink/75">{report.description}</p>

        <div className="mt-6 flex items-center gap-4">
          <button
            onClick={upvote}
            disabled={upvoting}
            className="flex items-center gap-1.5 rounded-md border border-ink/15 px-3 py-1.5 text-sm font-semibold text-ink/70 hover:border-teal hover:text-teal"
          >
            <ThumbsUp size={14} /> {report.upvotes || 0} residents affected
          </button>
        </div>
      </div>

      <div className="mt-8">
        <h2 className="mb-3 font-display text-lg font-bold text-ink">Discussion</h2>
        <div className="space-y-3">
          {(report.comments || []).length === 0 && (
            <p className="text-sm text-ink/45">No comments yet — be the first to add context.</p>
          )}
          {(report.comments || []).map((c, i) => (
            <div key={c._id || i} className="rounded-lg border border-ink/10 bg-card p-3">
              <p className="text-xs font-semibold text-ink/70">{c.user?.name || 'Citizen'}</p>
              <p className="text-sm text-ink/70">{c.text}</p>
            </div>
          ))}
        </div>
        <form onSubmit={postComment} className="mt-4 flex gap-2">
          <Input
            className="flex-1"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Add an update or ask a question…"
          />
          <Button type="submit" variant="primary" disabled={posting}>
            <Send size={15} />
          </Button>
        </form>
      </div>
    </DashboardShell>
  );
}
