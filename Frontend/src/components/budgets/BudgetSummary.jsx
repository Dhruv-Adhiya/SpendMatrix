import PropTypes from 'prop-types';
import { GlassCard } from '../ui/GlassCard';
import './BudgetSummary.css';

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
};

export function BudgetSummary({ totalBudget, totalSpent, remaining }) {
  const isOverBudget = totalSpent > totalBudget;
  const utilizationPercentage = totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0;
  
  // Cap visual percentage at 100% for the bar
  const visualPercentage = Math.min(utilizationPercentage, 100);

  // Determine status color for overall progress
  let statusClass = 'normal';
  if (utilizationPercentage >= 100) {
    statusClass = 'danger';
  } else if (utilizationPercentage >= 80) {
    statusClass = 'warning';
  }

  return (
    <GlassCard className="budget-summary-card">
      <div className="summary-metrics">
        <div className="summary-metric">
          <span className="metric-label">Total Budget</span>
          <span className="metric-value">{formatCurrency(totalBudget)}</span>
        </div>
        <div className="summary-metric">
          <span className="metric-label">Total Spent</span>
          <span className="metric-value">{formatCurrency(totalSpent)}</span>
        </div>
        <div className="summary-metric">
          <span className="metric-label">Remaining</span>
          <span className={`metric-value ${isOverBudget ? 'danger-text' : 'income-text'}`}>
            {formatCurrency(remaining)}
          </span>
        </div>
      </div>

      <div className="summary-progress-container">
        <div className="progress-labels">
          <span className="progress-label">Overall Utilization</span>
          <span className={`progress-percentage ${statusClass}-text`}>
            {utilizationPercentage.toFixed(1)}%
          </span>
        </div>
        <div className="progress-track">
          <div 
            className={`progress-fill ${statusClass}`} 
            style={{ width: `${visualPercentage}%` }}
          />
        </div>
      </div>
    </GlassCard>
  );
}

BudgetSummary.propTypes = {
  totalBudget: PropTypes.number.isRequired,
  totalSpent: PropTypes.number.isRequired,
  remaining: PropTypes.number.isRequired,
};
