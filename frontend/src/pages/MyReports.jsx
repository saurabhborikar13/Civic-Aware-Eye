import { useEffect, useMemo, useState } from 'react';
import { FilePlus2 } from 'lucide-react';
import DashboardShell from '../components/DashboardShell';
import TicketCard from '../components/TicketCard';
import Button from '../components/Button';
import { useAuth } from '../context/AuthContext';
import api from '../lib/api';

const TABS = [
  { key: 'all', label: 'All' },
  { key: 'pending', label: 'Pending' },
  { key: 'in_progress', label: 'In Progress' },
  { key: 'resolved', label: 'Resolved' },
  { key: 'rejected', label: 'Rejected' },
];

export default function MyReports() {
  const { user } = useAuth();
  const [reports, setReports] = useState([]);
  const [tab, setTab] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get('/api/v1/complaints')
      .then(({ data }) => setReports(data.data || []))
      .finally(() => setLoading(false));
  }, []);

  const myReports = useMemo(
    () => reports.filter((r) => (r.user?._id || r.user) === user?._id),
    [reports, user]
  );

  const filtered = useMemo(
    () => (tab === 'all' ? myReports : myReports.filter((r) => r.status === tab)),
    [myReports, tab]
  );

  return (
    <DashboardShell>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="font-mono text-xs text-ink/45">CASE FILE</p>
          <h1 className="font-display text-2xl font-bold text-ink md:text-3xl">My reports</h1>
        </div>
        <Button to="/report" variant="amber"><FilePlus2 size={16} /> File a new report</Button>
      </div>

      <div className="mb-6 flex gap-2 overflow-x-auto">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`shrink-0 rounded-full border px-4 py-1.5 text-sm font-semibold transition ${
              tab === t.key ? 'border-ink bg-ink text-paper' : 'border-ink/15 text-ink/60 hover:border-ink/40'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {loading && <p className="text-sm text-ink/50">Loading your dockets…</p>}
      {!loading && filtered.length === 0 && (
        <div className="rounded-xl border border-dashed border-ink/20 p-10 text-center">
          <p className="font-display text-lg font-bold text-ink">Nothing here yet</p>
          <p className="mt-1 text-sm text-ink/55">No reports match this filter.</p>
        </div>
      )}
      <div className="grid gap-3 sm:grid-cols-2">
        {filtered.map((r) => (
          <TicketCard key={r._id} report={r} />
        ))}
      </div>
    </DashboardShell>
  );
}
