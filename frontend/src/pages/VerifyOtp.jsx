import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ShieldCheck } from 'lucide-react';
import AuthLayout from '../components/AuthLayout';
import Input from '../components/Input';
import Button from '../components/Button';
import api from '../lib/api';

export default function VerifyOtp() {
  const navigate = useNavigate();
  const location = useLocation();
  const contact = location.state?.email || location.state?.mobile || '';
  const [otp, setOtp] = useState('');
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setStatus('');
    try {
      await api.post('/api/v1/auth/verify-otp', {
        email: location.state?.email,
        mobile: location.state?.mobile,
        otp,
      });
      setStatus('success');
      setTimeout(() => navigate('/login'), 1200);
    } catch (err) {
      setStatus(err.response?.data?.message || 'That code did not match. Try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Confirm it's you"
      subtitle={contact ? `Enter the 6-digit code we sent to ${contact}` : 'Enter the 6-digit code we sent you'}
    >
      <form onSubmit={onSubmit} className="space-y-4">
        <Input
          label="Verification code"
          name="otp"
          value={otp}
          onChange={(e) => setOtp(e.target.value)}
          placeholder="000000"
          maxLength={6}
          className="text-center font-mono text-lg tracking-[0.4em]"
          required
        />
        {status && status !== 'success' && (
          <p className="text-sm font-medium text-status-rejected">{status}</p>
        )}
        {status === 'success' && (
          <p className="text-sm font-medium text-status-resolved">Verified. Redirecting to login…</p>
        )}
        <Button type="submit" variant="primary" className="w-full" disabled={loading}>
          <ShieldCheck size={16} /> {loading ? 'Verifying…' : 'Verify account'}
        </Button>
      </form>
    </AuthLayout>
  );
}
