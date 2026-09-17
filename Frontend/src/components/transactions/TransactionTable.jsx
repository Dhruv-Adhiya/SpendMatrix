import PropTypes from 'prop-types';
import { GlassCard } from '../ui/GlassCard';
import { IconButton } from '../ui/IconButton';
import { EmptyState } from '../ui/EmptyState';
import './TransactionTable.css';

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
};

export function TransactionTable({ transactions, onEdit, onDelete, onAdd }) {
  if (!transactions || transactions.length === 0) {
    return (
      <EmptyState
        icon="Inbox"
        title="No transactions found"
        description="Try adjusting your filters, or add a new transaction."
        actionLabel="Add Transaction"
        onAction={onAdd}
      />
    );
  }

  return (
    <GlassCard padding="none" className="transaction-table-card">
      <div className="table-responsive">
        <table className="transaction-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Category</th>
              <th>Description</th>
              <th>Source</th>
              <th className="amount-col">Amount</th>
              <th className="actions-col">Actions</th>
            </tr>
          </thead>
          <tbody>
            {transactions.map(tx => (
              <tr key={tx.id}>
                <td>{new Date(tx.transaction_date).toLocaleDateString()}</td>
                <td>
                  <span className={`category-badge ${tx.type}`}>
                    {tx.category_name}
                  </span>
                </td>
                <td className="desc-cell">{tx.description || '-'}</td>
                <td className="source-cell">{tx.payment_source || '-'}</td>
                <td className={`amount-col ${tx.type}`}>
                  {tx.type === 'income' ? '+' : '-'}{formatCurrency(tx.amount)}
                </td>
                <td className="actions-col">
                  <div className="action-buttons">
                    <IconButton 
                      icon="Edit2" 
                      size={16} 
                      variant="ghost" 
                      onClick={() => onEdit(tx)} 
                      aria-label="Edit transaction"
                    />
                    <IconButton 
                      icon="Trash2" 
                      size={16} 
                      variant="ghost" 
                      onClick={() => onDelete(tx)} 
                      className="danger-icon-btn"
                      aria-label="Delete transaction"
                    />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </GlassCard>
  );
}

TransactionTable.propTypes = {
  transactions: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.number.isRequired,
    transaction_date: PropTypes.string.isRequired,
    category_name: PropTypes.string,
    description: PropTypes.string,
    payment_source: PropTypes.string,
    type: PropTypes.string.isRequired,
    amount: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
  })).isRequired,
  onEdit: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
  onAdd: PropTypes.func.isRequired,
};
