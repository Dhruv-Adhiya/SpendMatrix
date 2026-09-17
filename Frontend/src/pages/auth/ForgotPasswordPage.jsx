import { useState } from 'react';
import { Link } from 'react-router-dom';
import { AuthLayout } from './AuthLayout';
import { GlassInput } from '../../components/ui/GlassInput';
import { GlassButton } from '../../components/ui/GlassButton';
import api from '../../services/api';

export function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!email) {
      setError('Please enter your email address');
      return;
    }

    setIsLoading(true);
    try {
      await api.post('/auth/forgot-password', { email });
      setIsSuccess(true);
    } catch (err) {
      if (err.response?.status === 404) {
        // For security, it's often better not to reveal if an email exists, 
        // but if the API returns 404, we can handle it or just show success anyway.
        // Let's assume the API handles generic success messages for security.
        setError('If an account with that email exists, a reset link was sent.');
      } else {
        setError('An unexpected error occurred. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <AuthLayout title="Check your email" subtitle="We've sent a password reset link to your email.">
        <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: 'var(--spacing-4)' }}>
          <p style={{ color: 'var(--color-text-secondary)', lineHeight: 1.5 }}>
            Please click the link in the email to set a new password. If you don't see it, check your spam folder.
          </p>
          <Link to="/login" style={{ color: 'var(--color-accent-primary)', textDecoration: 'none', fontWeight: 600 }}>
            Back to Login
          </Link>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout title="Reset Password" subtitle="Enter your email to receive a reset link">
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

        <GlassButton type="submit" variant="primary" size="lg" isLoading={isLoading} style={{ marginTop: 'var(--spacing-2)' }}>
          Send Reset Link
        </GlassButton>

        <div style={{ textAlign: 'center', marginTop: 'var(--spacing-3)', fontSize: '14px', color: 'var(--color-text-secondary)' }}>
          Remember your password?{' '}
          <Link to="/login" style={{ color: 'var(--color-text-primary)', textDecoration: 'none', fontWeight: 600 }}>
            Back to login
          </Link>
        </div>
      </form>
    </AuthLayout>
  );
}
