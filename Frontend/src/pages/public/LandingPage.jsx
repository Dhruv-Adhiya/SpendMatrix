import { useNavigate } from 'react-router-dom';
import { GlassCard } from '../../components/ui/GlassCard';
import { GlassButton } from '../../components/ui/GlassButton';
import { Icon } from '../../components/ui/Icon';
import './LandingPage.css';

export function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="landing-page">
      <header className="landing-header">
        <div className="logo">
          <Icon name="Activity" size={24} className="logo-icon" />
          <span>SpendMatrix</span>
        </div>
        <nav className="landing-nav">
          <GlassButton variant="ghost" onClick={() => navigate('/login')}>Log In</GlassButton>
          <GlassButton variant="primary" onClick={() => navigate('/register')}>Get Started</GlassButton>
        </nav>
      </header>

      <main className="landing-main">
        {/* Hero Section */}
        <section className="hero-section">
          <div className="hero-content">
            <h1 className="hero-title">
              Financial Intelligence, <br />
              <span className="text-gradient">Automated.</span>
            </h1>
            <p className="hero-subtitle">
              Take complete control of your financial health with premium tracking, 
              deep analytics, and automated recurring budgets in a visually stunning interface.
            </p>
            <div className="hero-actions">
              <GlassButton variant="primary" size="lg" onClick={() => navigate('/register')} icon="ArrowRight">
                Start Tracking Free
              </GlassButton>
            </div>
          </div>
          
          <div className="hero-visual">
            <div className="glow-orb"></div>
            <GlassCard className="dashboard-preview" padding="large">
              <div className="preview-header">
                <div className="preview-stat">
                  <span className="stat-label">Total Balance</span>
                  <span className="stat-value hero-value">$24,592.00</span>
                </div>
                <div className="preview-badges">
                  <span className="badge badge-success">+ Income</span>
                  <span className="badge badge-error">- Expense</span>
                </div>
              </div>
              <div className="preview-chart-mock">
                <div className="bar bar-1"></div>
                <div className="bar bar-2"></div>
                <div className="bar bar-3"></div>
                <div className="bar bar-4"></div>
                <div className="bar bar-5"></div>
              </div>
            </GlassCard>
          </div>
        </section>

        {/* Features Section */}
        <section className="features-section">
          <div className="section-header">
            <h2>Everything you need for financial clarity</h2>
          </div>
          <div className="features-grid">
            <GlassCard className="feature-card">
              <div className="feature-icon"><Icon name="PieChart" size={24} /></div>
              <h3>Deep Analytics</h3>
              <p>Visualize your spending habits with beautiful, interactive charts and automatic categorization.</p>
            </GlassCard>
            <GlassCard className="feature-card">
              <div className="feature-icon"><Icon name="Target" size={24} /></div>
              <h3>Smart Budgeting</h3>
              <p>Set monthly limits per category and receive alerts before you overspend.</p>
            </GlassCard>
            <GlassCard className="feature-card">
              <div className="feature-icon"><Icon name="Repeat" size={24} /></div>
              <h3>Recurring Automation</h3>
              <p>Never miss a subscription. Automate recurring transactions with advance notifications.</p>
            </GlassCard>
            <GlassCard className="feature-card">
              <div className="feature-icon"><Icon name="Download" size={24} /></div>
              <h3>Seamless Export</h3>
              <p>Download your financial data as CSV or PDF reports for your accountant or personal records.</p>
            </GlassCard>
          </div>
        </section>

        {/* CTA Section */}
        <section className="cta-section">
          <GlassCard className="cta-card" padding="large">
            <h2>Ready to transform your finances?</h2>
            <p>Join SpendMatrix today and get a clearer picture of your wealth.</p>
            <GlassButton variant="primary" size="lg" onClick={() => navigate('/register')}>
              Create Your Account
            </GlassButton>
          </GlassCard>
        </section>
      </main>

      <footer className="landing-footer">
        <div className="footer-content">
          <div className="logo">
            <Icon name="Activity" size={20} className="logo-icon" />
            <span>SpendMatrix</span>
          </div>
          <div className="footer-links">
            <span className="footer-link">Privacy Policy</span>
            <span className="footer-link">Terms of Service</span>
            <span className="footer-link">Security</span>
          </div>
        </div>
        <div className="footer-bottom">
          &copy; {new Date().getFullYear()} SpendMatrix. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
