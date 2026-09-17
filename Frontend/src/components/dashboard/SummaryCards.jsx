import PropTypes from 'prop-types';
import { GlassCard } from '../ui/GlassCard';
import { Icon } from '../ui/Icon';
import { formatCurrency } from './BalanceHero';
import './SummaryCards.css';

export function SummaryCards({ income, expense, balance }) {
  const cards = [
    {
      title: 'Total Income',
      amount: income,
      icon: 'TrendingUp',
      colorVar: 'var(--color-accent-income)',
      bgVar: 'rgba(16, 185, 129, 0.1)'
    },
    {
      title: 'Total Expense',
      amount: expense,
      icon: 'TrendingDown',
      colorVar: 'var(--color-accent-expense)',
      bgVar: 'rgba(244, 63, 94, 0.1)'
    },
    {
      title: 'Net Balance',
      amount: balance,
      icon: 'Briefcase',
      colorVar: 'var(--color-accent-primary)',
      bgVar: 'rgba(139, 92, 246, 0.1)'
    }
  ];

  return (
    <div className="summary-cards-grid">
      {cards.map((card, idx) => (
        <GlassCard key={idx} className="summary-card" padding="normal">
          <div className="summary-card-header">
            <span className="summary-card-title">{card.title}</span>
            <div 
              className="summary-card-icon" 
              style={{ color: card.colorVar, backgroundColor: card.bgVar }}
            >
              <Icon name={card.icon} size={18} />
            </div>
          </div>
          <h3 className="summary-card-amount">{formatCurrency(card.amount)}</h3>
        </GlassCard>
      ))}
    </div>
  );
}

SummaryCards.propTypes = {
  income: PropTypes.number.isRequired,
  expense: PropTypes.number.isRequired,
  balance: PropTypes.number.isRequired,
};
