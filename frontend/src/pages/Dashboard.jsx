import { useEffect, useMemo, useState } from 'react';
import { FilePlus2, MapPin, Clock, CheckCircle2 } from 'lucide-react';
import DashboardShell from '../components/DashboardShell';
import Button from '../components/Button';
import TicketCard from '../components/TicketCard';
import { useAuth } from '../context/AuthContext';
import api from '../lib/api';

function StatCard({ icon: Icon, label, value, color }) {
  return (
    <div className="rounded-xl border border-ink/12 bg-card p-5">
      <Icon size={20} style={{ color }} />
      <p className="mt-3 font-mono text-2xl font-bold text-ink">{value}</p>
      <p className="text-xs font-semibold uppercase tracking-wide text-ink/50">{label}</p>
    </div>
  );
}

export default function Dashboard() {
  const { user } = useAuth();
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState('');

  useEffect(() => {
    api
      .get('/api/v1/complaints')
      .then(({ data }) => setReports(data.data || []))
      .catch(() => setErr('Could not load your reports right now.'))
      .finally(() => setLoading(false));
  }, []);

  const myReports = useMemo(
    () => reports.filter((r) => (r.user?._id || r.user) === user?._id),
    [reports, user]
  );

  const stats = useMemo(() => {
    const pending = myReports.filter((r) => r.status === 'pending').length;
    const progress = myReports.filter((r) => r.status === 'in_progress').length;
    const resolved = myReports.filter((r) => r.status === 'resolved').length;
    return { total: myReports.length, pending, progress, resolved };
  }, [myReports]);

  return (
    <DashboardShell>
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="font-mono text-xs text-ink/45">CITIZEN DASHBOARD</p>
          <h1 className="font-display text-2xl font-bold text-ink md:text-3xl">
            Welcome back, {user?.firstName || 'citizen'}.
          </h1>
        </div>
        <Button to="/report" variant="amber">
          <FilePlus2 size={16} /> File a new report
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <StatCard icon={MapPin} label="Total filed" value={stats.total} color="var(--color-teal)" />
        <StatCard icon={Clock} label="Pending" value={stats.pending} color="var(--color-status-pending)" />
        <StatCard icon={Clock} label="In progress" value={stats.progress} color="var(--color-status-progress)" />
        <StatCard icon={CheckCircle2} label="Resolved" value={stats.resolved} color="var(--color-status-resolved)" />
      </div>

      <div className="mt-10">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-display text-lg font-bold text-ink">Your recent reports</h2>
          <Button to="/my-reports" variant="ghost" className="text-teal">View all</Button>
        </div>

        {loading && <p className="text-sm text-ink/50">Loading your dockets…</p>}
        {err && <p className="text-sm text-status-rejected">{err}</p>}
        {!loading && myReports.length === 0 && (
          <div className="rounded-xl border border-dashed border-ink/20 p-10 text-center">
            <p className="font-display text-lg font-bold text-ink">No reports on file yet</p>
            <p className="mt-1 text-sm text-ink/55">
              Spotted a pothole or an overflowing bin nearby? File your first docket in under a minute.
            </p>
            <Button to="/report" variant="primary" className="mt-4">
              <FilePlus2 size={16} /> File a report
            </Button>
          </div>
        )}
        <div className="grid gap-3 sm:grid-cols-2">
          {myReports.slice(0, 4).map((r) => (
            <TicketCard key={r._id} report={r} />
          ))}
        </div>
      </div>
    </DashboardShell>
  );
}
