import { useState, useRef } from 'react';
import { Camera, Save } from 'lucide-react';
import DashboardShell from '../components/DashboardShell';
import Input from '../components/Input';
import Button from '../components/Button';
import { useAuth } from '../context/AuthContext';
import api, { uploadUrl } from '../lib/api';

export default function Profile() {
  const { user, setUser } = useAuth();
  const fileRef = useRef(null);
  const [form, setForm] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
    mobile: user?.mobile || '',
    address: user?.address || '',
  });
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState('');

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const onSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setStatus('');
    try {
      const { data } = await api.put('/api/v1/auth/updatedetails', form);
      setUser(data.data);
      localStorage.setItem('user', JSON.stringify(data.data));
      setStatus('Saved.');
    } catch (err) {
      setStatus(err.response?.data?.message || 'Could not save changes.');
    } finally {
      setSaving(false);
    }
  };

  const onPhoto = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const fd = new FormData();
    fd.append('photo', file);
    try {
      const { data } = await api.put('/api/v1/users/photo', fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setUser(data.data);
      localStorage.setItem('user', JSON.stringify(data.data));
    } catch {
      /* best effort */
    }
  };

  return (
    <DashboardShell>
      <p className="font-mono text-xs text-ink/45">CITIZEN FILE</p>
      <h1 className="mb-6 font-display text-2xl font-bold text-ink md:text-3xl">Profile</h1>

      <div className="mb-6 flex items-center gap-4">
        <button
          onClick={() => fileRef.current?.click()}
          className="relative h-20 w-20 overflow-hidden rounded-full border-2 border-ink/15 bg-paper-dim"
        >
          {user?.photo ? (
            <img src={uploadUrl(user.photo)} alt="" className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full w-full items-center justify-center font-display text-xl font-bold text-ink/40">
              {user?.firstName?.[0]}{user?.lastName?.[0]}
            </div>
          )}
          <span className="absolute bottom-0 flex w-full items-center justify-center gap-1 bg-ink/80 py-0.5 text-[9px] font-semibold text-paper">
            <Camera size={10} /> Edit
          </span>
        </button>
        <input ref={fileRef} type="file" accept="image/*" hidden onChange={onPhoto} />
        <div>
          <p className="font-display text-lg font-bold text-ink">{user?.firstName} {user?.lastName}</p>
          <p className="text-sm text-ink/50">{user?.role}</p>
        </div>
      </div>

      <form onSubmit={onSave} className="max-w-lg space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <Input label="First name" name="firstName" value={form.firstName} onChange={onChange} />
          <Input label="Last name" name="lastName" value={form.lastName} onChange={onChange} />
        </div>
        <Input label="Email" name="email" value={form.email} onChange={onChange} />
        <Input label="Mobile" name="mobile" value={form.mobile} onChange={onChange} />
        <Input label="Address" name="address" value={form.address} onChange={onChange} textarea />
        {status && <p className="text-sm font-medium text-ink/60">{status}</p>}
        <Button type="submit" variant="primary" disabled={saving}>
          <Save size={16} /> {saving ? 'Saving…' : 'Save changes'}
        </Button>
      </form>
    </DashboardShell>
  );
}
