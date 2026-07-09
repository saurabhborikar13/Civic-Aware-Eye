import { useEffect, useState } from 'react';
import { Bus, Percent, Ticket, Gift } from 'lucide-react';
import DashboardShell from '../components/DashboardShell';
import Button from '../components/Button';
import api from '../lib/api';

const CATALOG = [
  { icon: Bus, title: 'Transit credit', cost: 200, desc: '₹100 towards your city bus/metro card.' },
  { icon: Percent, title: 'Local business discount', cost: 150, desc: '10% off at participating neighbourhood stores.' },
  { icon: Ticket, title: 'Municipal event pass', cost: 300, desc: 'Entry to the next civic town hall event.' },
  { icon: Gift, title: 'Tax rebate voucher', cost: 500, desc: 'Small rebate applied to your next property tax cycle.' },
];

export default function Rewards() {
  const [points, setPoints] = useState(null);
  const [redeemed, setRedeemed] = useState(null);

  useEffect(() => {
    api.get('/api/v1/achievements').then(({ data }) => setPoints(data.data.points)).catch(() => setPoints(0));
  }, []);

  return (
    <DashboardShell>
      <p className="font-mono text-xs text-ink/45">CIVIC POINTS DESK</p>
      <h1 className="font-display text-2xl font-bold text-ink md:text-3xl">Rewards</h1>

      <div className="mt-4 mb-8 inline-flex items-center gap-3 rounded-xl border border-ink/12 bg-card px-5 py-3">
        <span className="font-mono text-2xl font-bold text-amber-dark">{points ?? '—'}</span>
        <span className="text-sm text-ink/60">points available to redeem</span>
      </div>

      {redeemed && (
        <div className="mb-6 rounded-lg border border-status-resolved/30 bg-status-resolved/10 px-4 py-3 text-sm font-semibold text-status-resolved">
          Redeemed "{redeemed}" — check your email for the voucher code.
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        {CATALOG.map((item) => {
          const canAfford = points != null && points >= item.cost;
          return (
            <div key={item.title} className="docket-notch rounded-xl border border-ink/12 bg-card p-5">
              <item.icon className="text-teal" size={22} />
              <p className="mt-3 font-display text-lg font-bold text-ink">{item.title}</p>
              <p className="text-sm text-ink/60">{item.desc}</p>
              <div className="docket-perf my-3" />
              <div className="flex items-center justify-between">
                <span className="font-mono text-sm font-bold text-ink/70">{item.cost} pts</span>
                <Button
                  variant={canAfford ? 'primary' : 'outline'}
                  disabled={!canAfford}
                  onClick={() => setRedeemed(item.title)}
                >
                  {canAfford ? 'Redeem' : 'Not enough points'}
                </Button>
              </div>
            </div>
          );
        })}
      </div>
    </DashboardShell>
  );
}
