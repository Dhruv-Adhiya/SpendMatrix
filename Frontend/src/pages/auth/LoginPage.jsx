import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthLayout } from './AuthLayout';
import { GlassInput } from '../../components/ui/GlassInput';
import { GlassButton } from '../../components/ui/GlassButton';
import { IconButton } from '../../components/ui/IconButton';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

export function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }

    setIsLoading(true);
    try {
      await login(email, password);
      toast.success('Welcome back!');
      navigate('/dashboard');
    } catch (err) {
      // Handle specific API errors
      if (err.response?.status === 403) {
        setError('Your account is blocked or email is not verified.');
      } else if (err.response?.status === 401) {
        setError('Invalid email or password.');
      } else {
        setError('An unexpected error occurred. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout title="Welcome Back" subtitle="Sign in to your SpendMatrix account">
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-3)' }}>
        
        {error && (
          <div style={{ color: 'var(--color-accent-expense)', fontSize: '14px', textAlign: 'center', background: 'rgba(244, 63, 94, 0.1)', padding: '10px', borderRadius: 'var(--radius-sm)' }}>
            {error}
          </div>
        )}

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

        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <Link to="/forgot-password" style={{ color: 'var(--color-accent-primary)', fontSize: '13px', textDecoration: 'none' }}>
            Forgot password?
          </Link>
        </div>

        <GlassButton type="submit" variant="primary" size="lg" isLoading={isLoading} style={{ marginTop: 'var(--spacing-2)' }}>
          Sign In
        </GlassButton>

        <div style={{ textAlign: 'center', marginTop: 'var(--spacing-3)', fontSize: '14px', color: 'var(--color-text-secondary)' }}>
          Don't have an account?{' '}
          <Link to="/register" style={{ color: 'var(--color-text-primary)', textDecoration: 'none', fontWeight: 600 }}>
            Create one
          </Link>
        </div>
      </form>
    </AuthLayout>
  );
}
