import { useState } from 'react';
import { KeyRound } from 'lucide-react';
import DashboardShell from '../components/DashboardShell';
import Input from '../components/Input';
import Button from '../components/Button';
import api from '../lib/api';

export default function Settings() {
  const [form, setForm] = useState({ currentPassword: '', newPassword: '', confirm: '' });
  const [status, setStatus] = useState('');
  const [saving, setSaving] = useState(false);

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const onSubmit = async (e) => {
    e.preventDefault();
    setStatus('');
    if (form.newPassword !== form.confirm) {
      setStatus('New password and confirmation do not match.');
      return;
    }
    setSaving(true);
    try {
      await api.put('/api/v1/auth/updatepassword', {
        currentPassword: form.currentPassword,
        newPassword: form.newPassword,
      });
      setStatus('Password updated.');
      setForm({ currentPassword: '', newPassword: '', confirm: '' });
    } catch (err) {
      setStatus(err.response?.data?.message || 'Could not update password.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <DashboardShell>
      <p className="font-mono text-xs text-ink/45">ACCOUNT</p>
      <h1 className="mb-6 font-display text-2xl font-bold text-ink md:text-3xl">Settings</h1>

      <div className="max-w-md rounded-xl border border-ink/12 bg-card p-6">
        <h2 className="mb-4 font-display text-lg font-bold text-ink">Change password</h2>
        <form onSubmit={onSubmit} className="space-y-4">
          <Input label="Current password" type="password" name="currentPassword" value={form.currentPassword} onChange={onChange} required />
          <Input label="New password" type="password" name="newPassword" value={form.newPassword} onChange={onChange} required />
          <Input label="Confirm new password" type="password" name="confirm" value={form.confirm} onChange={onChange} required />
          {status && <p className="text-sm font-medium text-ink/70">{status}</p>}
          <Button type="submit" variant="primary" disabled={saving}>
            <KeyRound size={16} /> {saving ? 'Updating…' : 'Update password'}
          </Button>
        </form>
      </div>
    </DashboardShell>
  );
}
