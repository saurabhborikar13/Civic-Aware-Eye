import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { LogIn } from 'lucide-react';
import AuthLayout from '../components/AuthLayout';
import Input from '../components/Input';
import Button from '../components/Button';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ emailOrMobile: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login({ emailOrMobile: form.emailOrMobile, password: form.password, role: 'Citizen' });
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid email/mobile or password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Welcome back"
      subtitle="Log in to track your filed reports."
      footer={
        <>
          New here?{' '}
          <Link to="/signup" className="font-semibold text-teal hover:underline">
            Create a citizen account
          </Link>
        </>
      }
    >
      <form onSubmit={onSubmit} className="space-y-4">
        <Input
          label="Email or mobile number"
          name="emailOrMobile"
          value={form.emailOrMobile}
          onChange={onChange}
          placeholder="you@example.com"
          required
        />
        <Input
          label="Password"
          type="password"
          name="password"
          value={form.password}
          onChange={onChange}
          placeholder="&bull;&bull;&bull;&bull;&bull;&bull;&bull;&bull;"
          required
        />
        {error && <p className="text-sm font-medium text-status-rejected">{error}</p>}
        <Button type="submit" variant="primary" className="w-full" disabled={loading}>
          <LogIn size={16} /> {loading ? 'Logging in…' : 'Log in'}
        </Button>
      </form>
    </AuthLayout>
  );
}
