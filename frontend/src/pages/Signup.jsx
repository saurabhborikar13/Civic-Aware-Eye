import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { UserPlus } from 'lucide-react';
import AuthLayout from '../components/AuthLayout';
import Input from '../components/Input';
import Button from '../components/Button';
import { useAuth } from '../context/AuthContext';

const initial = {
  firstName: '', lastName: '', email: '', mobile: '',
  address: '', city: '', state: '', pinCode: '', password: '',
};

export default function Signup() {
  const { signup } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState(initial);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await signup(form);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Could not create your account. Please check your details.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Open a citizen file"
      subtitle="One account, every report you file, tracked end to end."
      footer={
        <>
          Already registered?{' '}
          <Link to="/login" className="font-semibold text-teal hover:underline">
            Log in
          </Link>
        </>
      }
    >
      <form onSubmit={onSubmit} className="space-y-3.5">
        <div className="grid grid-cols-2 gap-3.5">
          <Input label="First name" name="firstName" value={form.firstName} onChange={onChange} required />
          <Input label="Last name" name="lastName" value={form.lastName} onChange={onChange} required />
        </div>
        <Input label="Email" type="email" name="email" value={form.email} onChange={onChange} required />
        <Input label="Mobile number" name="mobile" value={form.mobile} onChange={onChange} placeholder="10-digit number" required />
        <Input label="Address" name="address" value={form.address} onChange={onChange} required />
        <div className="grid grid-cols-3 gap-3.5">
          <Input label="City" name="city" value={form.city} onChange={onChange} required />
          <Input label="State" name="state" value={form.state} onChange={onChange} required />
          <Input label="PIN code" name="pinCode" value={form.pinCode} onChange={onChange} placeholder="6 digits" required />
        </div>
        <Input label="Password" type="password" name="password" value={form.password} onChange={onChange} placeholder="At least 6 characters" required />
        {error && <p className="text-sm font-medium text-status-rejected">{error}</p>}
        <Button type="submit" variant="primary" className="w-full" disabled={loading}>
          <UserPlus size={16} /> {loading ? 'Creating account…' : 'Create account'}
        </Button>
      </form>
    </AuthLayout>
  );
}
