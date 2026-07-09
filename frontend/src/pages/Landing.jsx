import { MapPin, Camera, Bell, TrendingUp, ShieldCheck, Award, ArrowRight } from 'lucide-react';
import Navbar from '../components/Navbar';
import Button from '../components/Button';
import StampBadge from '../components/StampBadge';

const ISSUES = [
  { icon: MapPin, label: 'Pothole', dept: 'Roads & Infrastructure' },
  { icon: Camera, label: 'Garbage', dept: 'Sanitation' },
  { icon: Bell, label: 'Street Light', dept: 'Electrical' },
  { icon: TrendingUp, label: 'Water Leak', dept: 'Water Works' },
];

const STEPS = [
  { title: 'Spot it', body: 'See a pothole, overflowing bin, or broken light. Open CivicSense and point your camera at it.' },
  { title: 'File it', body: 'Snap a photo, drop a pin, add a line of description. We auto-fill your GPS location and address.' },
  { title: 'Track it', body: 'Get a docket number instantly. Watch the stamp move from Pending to In Progress to Resolved.' },
];

export default function Landing() {
  return (
    <div className="bg-paper">
      <Navbar />

      {/* HERO — oversized docket ticket */}
      <section className="blueprint-grid relative overflow-hidden border-b border-ink/10 px-6 py-20 md:py-28">
        <div className="mx-auto grid max-w-6xl items-center gap-12 md:grid-cols-2">
          <div>
            <span className="mb-5 inline-block rounded-full border border-ink/20 bg-card px-3 py-1 font-mono text-xs text-ink/60">
              MUNICIPAL FILING SYSTEM &middot; EST. FOR CITIZENS
            </span>
            <h1 className="font-display text-4xl font-bold leading-[1.05] text-ink md:text-6xl">
              Every pothole
              <br />
              deserves a <span className="text-teal">case number.</span>
            </h1>
            <p className="mt-5 max-w-md text-lg text-ink/65">
              CivicSense turns a two-minute complaint into a tracked municipal docket &mdash;
              routed to the right department, stamped at every stage, resolved in the open.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button to="/signup" variant="primary" className="text-base">
                File your first report <ArrowRight size={16} />
              </Button>
              <Button to="/map" variant="outline" className="text-base">
                See the live map
              </Button>
            </div>
            <div className="mt-10 flex gap-8 font-mono text-xs text-ink/50">
              <div><span className="block text-xl font-bold text-ink">12,480</span>reports filed</div>
              <div><span className="block text-xl font-bold text-ink">9,102</span>resolved</div>
              <div><span className="block text-xl font-bold text-ink">48</span>municipalities</div>
            </div>
          </div>

          {/* Docket stub card */}
          <div className="docket-notch mx-auto w-full max-w-sm rounded-2xl border border-ink/15 bg-card p-6 shadow-xl">
            <div className="flex items-center justify-between border-b border-dashed border-ink/20 pb-4">
              <div>
                <p className="font-mono text-[11px] text-ink/45">DOCKET NO.</p>
                <p className="font-mono text-lg font-bold text-ink">TKT-4F82A1</p>
              </div>
              <StampBadge status="in_progress" />
            </div>
            <div className="py-4">
              <p className="font-mono text-[11px] text-ink/45">ISSUE</p>
              <p className="font-display text-xl font-bold text-ink">Pothole, MG Road</p>
              <p className="mt-1 text-sm text-ink/60">
                Deep pothole near the flyover exit, causing two-wheeler accidents during monsoon.
              </p>
            </div>
            <div className="docket-perf my-3" />
            <div className="flex items-center justify-between pt-1 font-mono text-xs text-ink/50">
              <span>Routed &rarr; Roads Dept.</span>
              <span>ETA 5 days</span>
            </div>
          </div>
        </div>
      </section>

      {/* ISSUE TYPES */}
      <section id="departments" className="mx-auto max-w-6xl px-6 py-16">
        <h2 className="font-display text-2xl font-bold text-ink">Filed by category, routed automatically</h2>
        <p className="mt-2 max-w-xl text-ink/60">
          Our classifier reads your photo and description, then sends the docket straight to the
          department that owns it &mdash; no more forwarding emails between offices.
        </p>
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {ISSUES.map((it) => (
            <div key={it.label} className="rounded-xl border border-ink/12 bg-card p-5">
              <it.icon className="text-teal" size={22} />
              <p className="mt-3 font-display text-base font-bold text-ink">{it.label}</p>
              <p className="text-xs text-ink/50">{it.dept}</p>
            </div>
          ))}
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how-it-works" className="border-y border-ink/10 bg-card px-6 py-16">
        <div className="mx-auto max-w-6xl">
          <h2 className="font-display text-2xl font-bold text-ink">Three steps, one docket</h2>
          <div className="mt-10 grid gap-8 md:grid-cols-3">
            {STEPS.map((s, i) => (
              <div key={s.title}>
                <div className="mb-3 font-mono text-3xl font-bold text-ink/15">0{i + 1}</div>
                <h3 className="font-display text-lg font-bold text-ink">{s.title}</h3>
                <p className="mt-1.5 text-sm text-ink/60">{s.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* TRUST + REWARDS */}
      <section className="mx-auto grid max-w-6xl gap-6 px-6 py-16 md:grid-cols-2">
        <div className="rounded-2xl border border-ink/12 bg-card p-8">
          <ShieldCheck className="text-teal" size={26} />
          <h3 className="mt-3 font-display text-xl font-bold text-ink">Transparent by default</h3>
          <p className="mt-2 text-sm text-ink/60">
            Every status change is timestamped and visible to you and your neighbours on the live
            map. No report disappears into a queue.
          </p>
        </div>
        <div className="rounded-2xl border border-ink/12 bg-card p-8">
          <Award className="text-amber-dark" size={26} />
          <h3 className="mt-3 font-display text-xl font-bold text-ink">Civic points that pay off</h3>
          <p className="mt-2 text-sm text-ink/60">
            Earn points for verified reports and redeem them for transit credits and local
            business discounts through the Rewards desk.
          </p>
        </div>
      </section>

      <section className="border-t border-ink/10 px-6 py-16 text-center">
        <h2 className="font-display text-3xl font-bold text-ink">Your city keeps a record. Now so do you.</h2>
        <Button to="/signup" variant="amber" className="mt-6 text-base">
          Create your citizen account <ArrowRight size={16} />
        </Button>
      </section>

      <footer className="border-t border-ink/10 px-6 py-8 text-center text-xs text-ink/40">
        CivicSense &middot; A citizen-first civic issue reporting platform
      </footer>
    </div>
  );
}
