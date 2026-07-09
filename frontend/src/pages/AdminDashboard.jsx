import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut, Landmark, MapPin } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import StampBadge from '../components/StampBadge';
import { useAuth } from '../context/AuthContext';
import api, { uploadUrl } from '../lib/api';

const STATUS_OPTIONS = ['pending', 'in_progress', 'resolved', 'rejected'];

export default function AdminDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  const load = () => {
    api.get('/api/v1/complaints').then(({ data }) => setReports(data.data || [])).finally(() => setLoading(false));
  };

  useEffect(load, []);

  const updateStatus = async (id, status) => {
    setReports((prev) => prev.map((r) => (r._id === id ? { ...r, status } : r)));
    try {
      await api.put(`/api/v1/complaints/${id}/status`, { status });
    } catch {
      load(); // revert on failure
    }
  };

  const chartData = useMemo(() => {
    const byDept = {};
    reports.forEach((r) => {
      const key = r.issueType || 'other';
      byDept[key] = (byDept[key] || 0) + 1;
    });
    return Object.entries(byDept).map(([name, count]) => ({ name, count }));
  }, [reports]);

  const filtered = filter === 'all' ? reports : reports.filter((r) => r.status === filter);

  const handleLogout = () => {
    logout();
    navigate('/admin-login');
  };

  return (
    <div className="min-h-screen bg-paper">
      <header className="flex items-center justify-between border-b border-ink/10 bg-ink px-6 py-4 text-paper">
        <div className="flex items-center gap-2 font-display text-lg font-bold">
          <span className="flex h-8 w-8 items-center justify-center rounded-md bg-amber text-ink">
            <Landmark size={18} />
          </span>
          Control Room
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm text-paper/60">{user?.firstName} &middot; {user?.role}</span>
          <button onClick={handleLogout} className="flex items-center gap-1.5 text-sm font-semibold text-status-rejected">
            <LogOut size={14} /> Log out
          </button>
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-6 py-8">
        <div className="mb-8 grid gap-4 sm:grid-cols-4">
          {STATUS_OPTIONS.map((s) => (
            <div key={s} className="rounded-xl border border-ink/12 bg-card p-4">
              <p className="font-mono text-2xl font-bold text-ink">{reports.filter((r) => r.status === s).length}</p>
              <StampBadge status={s} size="sm" />
            </div>
          ))}
        </div>

        <div className="mb-8 rounded-xl border border-ink/12 bg-card p-5">
          <h2 className="mb-3 font-display text-base font-bold text-ink">Reports by category</h2>
          <div style={{ width: '100%', height: 220 }}>
            <ResponsiveContainer>
              <BarChart data={chartData}>
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: 'var(--color-ink)' }} />
                <YAxis tick={{ fontSize: 11, fill: 'var(--color-ink)' }} allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="count" fill="var(--color-teal)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="mb-4 flex gap-2 overflow-x-auto">
          {['all', ...STATUS_OPTIONS].map((s) => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={`shrink-0 rounded-full border px-4 py-1.5 text-sm font-semibold capitalize transition ${
                filter === s ? 'border-ink bg-ink text-paper' : 'border-ink/15 text-ink/60 hover:border-ink/40'
              }`}
            >
              {s.replace('_', ' ')}
            </button>
          ))}
        </div>

        {loading && <p className="text-sm text-ink/50">Loading dockets…</p>}
        <div className="space-y-3">
          {filtered.map((r) => (
            <div key={r._id} className="flex flex-wrap items-center gap-4 rounded-xl border border-ink/12 bg-card p-4">
              {r.images?.[0] && (
                <img src={uploadUrl(r.images[0])} alt="" className="h-14 w-14 rounded-lg object-cover" />
              )}
              <div className="min-w-[180px] flex-1">
                <p className="font-mono text-[11px] text-ink/45">{r.ticketId}</p>
                <p className="font-display font-bold text-ink">{r.issueType}</p>
                <p className="flex items-center gap-1 text-xs text-ink/50">
                  <MapPin size={11} /> {r.location?.address}
                </p>
              </div>
              <p className="hidden max-w-xs flex-1 text-sm text-ink/60 md:block">{r.description}</p>
              <select
                value={r.status}
                onChange={(e) => updateStatus(r._id, e.target.value)}
                className="rounded-md border border-ink/20 bg-paper px-3 py-1.5 text-sm font-semibold text-ink"
              >
                {STATUS_OPTIONS.map((s) => (
                  <option key={s} value={s}>{s.replace('_', ' ')}</option>
                ))}
              </select>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
