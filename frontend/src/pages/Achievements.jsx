import { useEffect, useState } from 'react';
import { Award, Star, Trophy } from 'lucide-react';
import DashboardShell from '../components/DashboardShell';
import api from '../lib/api';

export default function Achievements() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get('/api/v1/achievements')
      .then(({ data }) => setData(data.data))
      .finally(() => setLoading(false));
  }, []);

  return (
    <DashboardShell>
      <p className="font-mono text-xs text-ink/45">CIVIC RECORD</p>
      <h1 className="mb-6 font-display text-2xl font-bold text-ink md:text-3xl">Achievements</h1>

      {loading && <p className="text-sm text-ink/50">Tallying your civic points…</p>}

      {data && (
        <>
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="rounded-xl border border-ink/12 bg-card p-5">
              <Star className="text-amber-dark" size={20} />
              <p className="mt-2 font-mono text-2xl font-bold text-ink">{data.points}</p>
              <p className="text-xs font-semibold uppercase tracking-wide text-ink/50">Total points</p>
            </div>
            <div className="rounded-xl border border-ink/12 bg-card p-5">
              <Trophy className="text-teal" size={20} />
              <p className="mt-2 font-mono text-2xl font-bold text-ink">{data.badges.length}</p>
              <p className="text-xs font-semibold uppercase tracking-wide text-ink/50">Badges earned</p>
            </div>
            <div className="rounded-xl border border-ink/12 bg-card p-5">
              <Award className="text-status-resolved" size={20} />
              <p className="mt-2 font-mono text-2xl font-bold text-ink">{data.resolvedReports}</p>
              <p className="text-xs font-semibold uppercase tracking-wide text-ink/50">Reports resolved</p>
            </div>
          </div>

          <h2 className="mb-3 mt-8 font-display text-lg font-bold text-ink">Badges</h2>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {data.badges.map((b) => (
              <div key={b.name} className="rounded-xl border border-ink/12 bg-card p-4">
                <div className="flex items-center justify-between">
                  <p className="font-display font-bold text-ink">{b.name}</p>
                  <span className="stamp px-2 py-0.5 text-[10px] text-teal">EARNED</span>
                </div>
                <p className="mt-1 text-xs text-ink/55">{b.description}</p>
                <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-paper-dim">
                  <div
                    className="h-full bg-teal"
                    style={{ width: `${Math.min(100, (b.progress.current / b.progress.total) * 100)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>

          <h2 className="mb-3 mt-8 font-display text-lg font-bold text-ink">Points history</h2>
          <div className="divide-y divide-ink/10 rounded-xl border border-ink/12 bg-card">
            {data.pointsHistory
              .slice()
              .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
              .slice(0, 12)
              .map((p, i) => (
                <div key={i} className="flex items-center justify-between px-4 py-2.5 text-sm">
                  <span className="text-ink/70">{p.reason}</span>
                  <span className="font-mono font-semibold text-status-resolved">+{p.points}</span>
                </div>
              ))}
          </div>
        </>
      )}
    </DashboardShell>
  );
}
