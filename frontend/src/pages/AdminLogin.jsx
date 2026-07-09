import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { LogIn, Landmark } from 'lucide-react';
import Input from '../components/Input';
import Button from '../components/Button';
import { useAuth } from '../context/AuthContext';

export default function AdminLogin() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ emailOrMobile: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await login({ ...form, role: 'MunicipalOfficial' });
      const user = res.data || res.user;
      if (user?.role !== 'MunicipalOfficial' && user?.role !== 'Admin') {
        setError('This account is not registered as a municipal official.');
        return;
      }
      navigate('/admin');
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-ink px-6">
      <div className="w-full max-w-sm rounded-2xl border border-paper/15 bg-ink-soft p-8 text-paper">
        <div className="mb-6 flex items-center gap-2 font-display text-lg font-bold">
          <span className="flex h-8 w-8 items-center justify-center rounded-md bg-amber text-ink">
            <Landmark size={18} />
          </span>
          CivicSense &middot; Municipal
        </div>
        <h1 className="font-display text-xl font-bold">Officer sign-in</h1>
        <p className="mt-1 text-sm text-paper/55">Access the department control room.</p>

        <form onSubmit={onSubmit} className="mt-6 space-y-4">
          <label className="block">
            <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-paper/50">
              Official email
            </span>
            <input
              className="w-full rounded-md border border-paper/20 bg-ink px-3.5 py-2.5 text-sm text-paper outline-none focus:border-amber"
              value={form.emailOrMobile}
              onChange={(e) => setForm({ ...form, emailOrMobile: e.target.value })}
              required
            />
          </label>
          <label className="block">
            <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-paper/50">
              Password
            </span>
            <input
              type="password"
              className="w-full rounded-md border border-paper/20 bg-ink px-3.5 py-2.5 text-sm text-paper outline-none focus:border-amber"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              required
            />
          </label>
          {error && <p className="text-sm font-medium text-status-rejected">{error}</p>}
          <Button type="submit" variant="amber" className="w-full" disabled={loading}>
            <LogIn size={16} /> {loading ? 'Signing in…' : 'Sign in'}
          </Button>
        </form>
        <Link to="/" className="mt-6 block text-center text-xs text-paper/40 hover:text-paper/70">
          &larr; Back to citizen site
        </Link>
      </div>
    </div>
  );
}
