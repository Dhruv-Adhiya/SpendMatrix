import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthLayout } from './AuthLayout';
import { GlassInput } from '../../components/ui/GlassInput';
import { GlassButton } from '../../components/ui/GlassButton';
import { IconButton } from '../../components/ui/IconButton';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

export function RegisterPage() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!fullName || !email || !password) {
      setError('Please fill in all fields');
      return;
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters long');
      return;
    }

    setIsLoading(true);
    try {
      await register({ full_name: fullName, email, password });
      setIsSuccess(true);
      toast.success('Registration successful!');
    } catch (err) {
      if (err.response?.status === 400) {
        setError(err.response.data.message || 'Invalid data provided.');
      } else {
        setError('An unexpected error occurred. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <AuthLayout title="Check your email" subtitle="We've sent a verification link to your email.">
        <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: 'var(--spacing-4)' }}>
          <p style={{ color: 'var(--color-text-secondary)', lineHeight: 1.5 }}>
            Please click the link in the email to verify your account before logging in.
          </p>
          <GlassButton variant="primary" onClick={() => navigate('/login')}>
            Go to Login
          </GlassButton>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout title="Create an Account" subtitle="Join SpendMatrix to track your finances">
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-3)' }}>
        
        {error && (
          <div style={{ color: 'var(--color-accent-expense)', fontSize: '14px', textAlign: 'center', background: 'rgba(244, 63, 94, 0.1)', padding: '10px', borderRadius: 'var(--radius-sm)' }}>
            {error}
          </div>
        )}

        <GlassInput
          label="Full Name"
          type="text"
          icon="User"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          placeholder="John Doe"
          required
        />

        <GlassInput
          label="Email Address"
          type="email"
          icon="Mail"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          required
        />

        <div style={{ position: 'relative' }}>
          <GlassInput
            label="Password"
            type={showPassword ? 'text' : 'password'}
            icon="Lock"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            required
          />
          <div style={{ position: 'absolute', right: '10px', top: '28px' }}>
            <IconButton
              type="button"
              icon={showPassword ? 'EyeOff' : 'Eye'}
              size={18}
              onClick={() => setShowPassword(!showPassword)}
              aria-label={showPassword ? "Hide password" : "Show password"}
            />
          </div>
        </div>

        <GlassButton type="submit" variant="primary" size="lg" isLoading={isLoading} style={{ marginTop: 'var(--spacing-2)' }}>
          Create Account
        </GlassButton>

        <div style={{ textAlign: 'center', marginTop: 'var(--spacing-3)', fontSize: '14px', color: 'var(--color-text-secondary)' }}>
          Already have an account?{' '}
          <Link to="/login" style={{ color: 'var(--color-text-primary)', textDecoration: 'none', fontWeight: 600 }}>
            Sign in
          </Link>
        </div>
      </form>
    </AuthLayout>
  );
}
