import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { GlassCard } from '../ui/GlassCard';
import { Icon } from '../ui/Icon';
import { formatCurrency } from './BalanceHero';
import './RecentTransactions.css';

// Helper to map category names to icons (in a real app, this might come from DB)
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

export function RecentTransactions({ transactions }) {
  return (
    <GlassCard padding="normal" className="recent-transactions-card">
      <div className="recent-header">
        <h3 className="recent-title">Recent Transactions</h3>
        <Link to="/transactions" className="view-all-link">
          View All
        </Link>
      </div>

      <div className="transactions-list">
        {!transactions || transactions.length === 0 ? (
          <div className="empty-transactions">
            <Icon name="Inbox" size={32} className="empty-icon" />
            <p>No recent transactions</p>
          </div>
        ) : (
          transactions.map((tx) => {
            const isIncome = tx.type === 'income';
            
            return (
              <div key={tx.id} className="transaction-item">
                <div className="tx-left">
                  <div className={`tx-icon-wrapper ${isIncome ? 'income' : 'expense'}`}>
                    <Icon name={getCategoryIcon(tx.category_name)} size={18} />
                  </div>
                  <div className="tx-info">
                    <span className="tx-description">{tx.description || tx.category_name}</span>
                    <div className="tx-meta">
                      <span className="tx-category">{tx.category_name}</span>
                      <span className="tx-dot">•</span>
                      <span className="tx-date">{new Date(tx.transaction_date).toLocaleDateString()}</span>
                      {tx.payment_source && (
                        <>
                          <span className="tx-dot">•</span>
                          <span className="tx-source">{tx.payment_source}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
                <div className={`tx-right ${isIncome ? 'income' : 'expense'}`}>
                  {isIncome ? '+' : '-'}{formatCurrency(tx.amount)}
                </div>
              </div>
            );
          })
        )}
      </div>
    </GlassCard>
  );
}

RecentTransactions.propTypes = {
  transactions: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.number.isRequired,
    type: PropTypes.string.isRequired,
    amount: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
    description: PropTypes.string,
    category_name: PropTypes.string,
    transaction_date: PropTypes.string.isRequired,
    payment_source: PropTypes.string,
  }))
};
