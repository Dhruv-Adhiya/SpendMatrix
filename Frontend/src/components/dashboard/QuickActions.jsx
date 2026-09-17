import { useNavigate } from 'react-router-dom';
import { GlassCard } from '../ui/GlassCard';
import { GlassButton } from '../ui/GlassButton';
import './QuickActions.css';

export function QuickActions() {
  const navigate = useNavigate();

  return (
    <GlassCard padding="normal" className="quick-actions-card">
      <h3 className="quick-actions-title">Quick Actions</h3>
      <div className="quick-actions-grid">
        <GlassButton 
          variant="primary" 
          icon="Plus" 
          onClick={() => navigate('/transactions/new?type=expense')}
          className="quick-action-btn expense-action"
        >
          Add Expense
        </GlassButton>
        <GlassButton 
          variant="secondary" 
          icon="Download" 
          onClick={() => navigate('/transactions/new?type=income')}
          className="quick-action-btn income-action"
        >
          Add Income
        </GlassButton>
        <GlassButton 
          variant="secondary" 
          icon="List" 
          onClick={() => navigate('/transactions')}
          className="quick-action-btn"
        >
          All Transactions
        </GlassButton>
        <GlassButton 
          variant="secondary" 
          icon="PieChart" 
          onClick={() => navigate('/budgets')}
          className="quick-action-btn"
        >
          Set Budget
        </GlassButton>
      </div>
    </GlassCard>
  );
}
