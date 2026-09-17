import { useState } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { AuthLayout } from './AuthLayout';
import { GlassInput } from '../../components/ui/GlassInput';
import { GlassButton } from '../../components/ui/GlassButton';
import { IconButton } from '../../components/ui/IconButton';
import api from '../../services/api';
import toast from 'react-hot-toast';

export function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const navigate = useNavigate();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // If no token in URL, immediately show error state
  if (!token) {
    return (
      <AuthLayout title="Invalid Link" subtitle="This reset link is invalid or has expired.">
        <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: 'var(--spacing-4)' }}>
          <p style={{ color: 'var(--color-text-secondary)', lineHeight: 1.5 }}>
            Please request a new password reset link.
          </p>
          <GlassButton variant="primary" onClick={() => navigate('/forgot-password')}>
            Request New Link
          </GlassButton>
        </div>
      </AuthLayout>
    );
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!password || !confirmPassword) {
      setError('Please fill in all fields');
      return;
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters long');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setIsLoading(true);
    try {
      await api.post('/auth/reset-password', { token, newPassword: password });
      toast.success('Password reset successfully!');
      navigate('/login');
    } catch (err) {
      if (err.response?.status === 400 || err.response?.status === 401) {
        setError('Invalid or expired reset token. Please request a new one.');
      } else {
        setError('An unexpected error occurred. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout title="Set New Password" subtitle="Enter your new password below">
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-3)' }}>
        
        {error && (
          <div style={{ color: 'var(--color-accent-expense)', fontSize: '14px', textAlign: 'center', background: 'rgba(244, 63, 94, 0.1)', padding: '10px', borderRadius: 'var(--radius-sm)' }}>
            {error}
          </div>
        )}

        <div style={{ position: 'relative' }}>
          <GlassInput
            label="New Password"
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

        <GlassInput
          label="Confirm Password"
          type={showPassword ? 'text' : 'password'}
          icon="CheckCircle"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          placeholder="••••••••"
          required
        />

        <GlassButton type="submit" variant="primary" size="lg" isLoading={isLoading} style={{ marginTop: 'var(--spacing-2)' }}>
          Reset Password
        </GlassButton>

        <div style={{ textAlign: 'center', marginTop: 'var(--spacing-3)', fontSize: '14px', color: 'var(--color-text-secondary)' }}>
          <Link to="/login" style={{ color: 'var(--color-text-primary)', textDecoration: 'none', fontWeight: 600 }}>
            Back to login
          </Link>
        </div>
      </form>
    </AuthLayout>
  );
}
