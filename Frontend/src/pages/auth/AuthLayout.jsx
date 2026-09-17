import PropTypes from 'prop-types';
import { GlassCard } from '../../components/ui/GlassCard';
import { Icon } from '../../components/ui/Icon';
import { useNavigate } from 'react-router-dom';
import './AuthLayout.css';

export function AuthLayout({ children, title, subtitle }) {
  const navigate = useNavigate();

  return (
    <div className="auth-layout">
      {/* Background decoration */}
      <div className="auth-bg-orb orb-1"></div>
      <div className="auth-bg-orb orb-2"></div>

      <div className="auth-header" onClick={() => navigate('/')}>
        <Icon name="Activity" size={24} className="auth-logo-icon" />
        <span>SpendMatrix</span>
      </div>

      <main className="auth-main">
        <GlassCard className="auth-card" padding="large">
          <div className="auth-card-header">
            <h1>{title}</h1>
            {subtitle && <p className="auth-subtitle">{subtitle}</p>}
          </div>
          <div className="auth-card-body">
            {children}
          </div>
        </GlassCard>
      </main>
    </div>
  );
}

AuthLayout.propTypes = {
  children: PropTypes.node.isRequired,
  title: PropTypes.string.isRequired,
  subtitle: PropTypes.string,
};
