import PropTypes from 'prop-types';
import { GlassCard } from '../ui/GlassCard';
import { Icon } from '../ui/Icon';
import { IconButton } from '../ui/IconButton';
import './BudgetCard.css';

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0
  }).format(amount);
};

// Helper to map category names to icons
const getCategoryIcon = (categoryName = '') => {
  const name = categoryName.toLowerCase();
  if (name.includes('food') || name.includes('dining')) return 'Coffee';
  if (name.includes('transport') || name.includes('car')) return 'Navigation';
  if (name.includes('shop') || name.includes('grocery')) return 'ShoppingBag';
  if (name.includes('home') || name.includes('rent')) return 'Home';
  if (name.includes('health')) return 'Heart';
  if (name.includes('salary') || name.includes('income')) return 'DollarSign';
  return 'Tag';
};

export function BudgetCard({ budget, onEdit, onDelete }) {
  const { category_name, amount, spent_amount, percentage_used, remaining } = budget;
  
  // Cap visual percentage at 100% for the bar
  const visualPercentage = Math.min(percentage_used || 0, 100);

  // Determine status color
  let statusClass = 'normal';
  if (percentage_used >= 100) {
    statusClass = 'danger';
  } else if (percentage_used >= 80) {
    statusClass = 'warning';
  }

  const isOverBudget = remaining < 0;

  return (
    <GlassCard className="budget-card" padding="normal">
      <div className="budget-card-header">
        <div className="budget-category-info">
          <div className="budget-icon-wrapper">
            <Icon name={getCategoryIcon(category_name)} size={20} />
          </div>
          <h3 className="budget-category-name">{category_name}</h3>
        </div>
        <div className="budget-actions">
          <IconButton 
            icon="Edit2" 
            size={16} 
            variant="ghost" 
            onClick={() => onEdit(budget)}
            aria-label="Edit Budget"
          />
          <IconButton 
            icon="Trash2" 
            size={16} 
            variant="ghost" 
            onClick={() => onDelete(budget)}
            aria-label="Delete Budget"
            className="danger-icon-btn"
          />
        </div>
      </div>

      <div className="budget-amounts">
        <div className="budget-amount-item">
          <span className="budget-amount-label">Spent</span>
          <span className="budget-amount-value">{formatCurrency(spent_amount || 0)}</span>
        </div>
        <div className="budget-amount-item right">
          <span className="budget-amount-label">Budget</span>
          <span className="budget-amount-value text-muted">{formatCurrency(amount)}</span>
        </div>
      </div>

      <div className="budget-progress-container">
        <div className="budget-progress-track">
          <div 
            className={`budget-progress-fill ${statusClass}`} 
            style={{ width: `${visualPercentage}%` }}
          />
        </div>
      </div>

      <div className="budget-card-footer">
        <span className={`budget-remaining ${isOverBudget ? 'danger-text' : 'income-text'}`}>
          {isOverBudget ? 'Over budget by ' : 'Remaining: '}
          {formatCurrency(Math.abs(remaining || 0))}
        </span>
        <span className={`budget-percentage ${statusClass}-text`}>
          {percentage_used?.toFixed(1) || 0}%
        </span>
      </div>
    </GlassCard>
  );
}

BudgetCard.propTypes = {
  budget: PropTypes.shape({
    id: PropTypes.number.isRequired,
    category_id: PropTypes.number.isRequired,
    category_name: PropTypes.string.isRequired,
    amount: PropTypes.number.isRequired,
    month: PropTypes.number.isRequired,
    year: PropTypes.number.isRequired,
    spent_amount: PropTypes.number,
    remaining: PropTypes.number,
    percentage_used: PropTypes.number
  }).isRequired,
  onEdit: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
};
