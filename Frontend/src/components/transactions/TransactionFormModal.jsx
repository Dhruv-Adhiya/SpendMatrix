import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Modal } from '../ui/Modal';
import { GlassInput } from '../ui/GlassInput';
import { GlassButton } from '../ui/GlassButton';

export function TransactionFormModal({ isOpen, onClose, onSubmit, initialData, categories, isLoading }) {
  const [type, setType] = useState('expense');
  const [amount, setAmount] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [date, setDate] = useState('');
  const [description, setDescription] = useState('');
  const [paymentSource, setPaymentSource] = useState('credit_card');
  const [error, setError] = useState('');

  // When modal opens or initial data changes, reset/hydrate form
  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setType(initialData.type || 'expense');
        setAmount(initialData.amount || '');
        setCategoryId(initialData.category_id || '');
        // Format date to YYYY-MM-DD for native input
        const formattedDate = initialData.transaction_date 
          ? new Date(initialData.transaction_date).toISOString().split('T')[0]
          : new Date().toISOString().split('T')[0];
        setDate(formattedDate);
        setDescription(initialData.description || '');
        setPaymentSource(initialData.payment_source || 'credit_card');
      } else {
        setType('expense');
        setAmount('');
        setCategoryId('');
        setDate(new Date().toISOString().split('T')[0]);
        setDescription('');
        setPaymentSource('credit_card');
      }
      setError('');
    }
  }, [isOpen, initialData]);

  // When type changes, clear category if it doesn't match the new type
  useEffect(() => {
    if (categoryId) {
      const selectedCategory = categories.find(c => c.id === parseInt(categoryId));
      if (selectedCategory && selectedCategory.type !== type) {
        setCategoryId('');
      }
    }
  }, [type, categoryId, categories]);

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (!amount || Number(amount) <= 0) {
      setError('Amount must be a positive number');
      return;
    }
    if (!categoryId) {
      setError('Please select a category');
      return;
    }
    if (!date) {
      setError('Transaction date is required');
      return;
    }

    onSubmit({
      type,
      amount: Number(amount),
      category_id: parseInt(categoryId),
      transaction_date: date,
      description: description.trim(),
      payment_source: paymentSource,
    });
  };

  const filteredCategories = categories.filter(c => c.type === type);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={initialData ? 'Edit Transaction' : 'New Transaction'}
      maxWidth="500px"
    >
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-4)' }}>
        {error && (
          <div style={{ color: 'var(--color-accent-expense)', fontSize: '14px', background: 'rgba(244, 63, 94, 0.1)', padding: '10px', borderRadius: 'var(--radius-sm)' }}>
            {error}
          </div>
        )}

        <div style={{ display: 'flex', gap: 'var(--spacing-3)' }}>
          <button
            type="button"
            className={`type-toggle-btn ${type === 'income' ? 'active income' : ''}`}
            onClick={() => setType('income')}
            style={{
              flex: 1,
              padding: '10px',
              borderRadius: 'var(--radius-md)',
              border: `1px solid ${type === 'income' ? 'var(--color-accent-income)' : 'var(--color-border-glass)'}`,
              background: type === 'income' ? 'rgba(16, 185, 129, 0.1)' : 'transparent',
              color: type === 'income' ? 'var(--color-accent-income)' : 'var(--color-text-secondary)',
              cursor: 'pointer',
              fontWeight: 500,
              transition: 'all var(--transition-fast)'
            }}
          >
            Income
          </button>
          <button
            type="button"
            className={`type-toggle-btn ${type === 'expense' ? 'active expense' : ''}`}
            onClick={() => setType('expense')}
            style={{
              flex: 1,
              padding: '10px',
              borderRadius: 'var(--radius-md)',
              border: `1px solid ${type === 'expense' ? 'var(--color-accent-expense)' : 'var(--color-border-glass)'}`,
              background: type === 'expense' ? 'rgba(244, 63, 94, 0.1)' : 'transparent',
              color: type === 'expense' ? 'var(--color-accent-expense)' : 'var(--color-text-secondary)',
              cursor: 'pointer',
              fontWeight: 500,
              transition: 'all var(--transition-fast)'
            }}
          >
            Expense
          </button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--spacing-3)' }}>
          <GlassInput
            label="Amount"
            type="number"
            min="0.01"
            step="0.01"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0.00"
            required
          />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-1)' }}>
            <label style={{ fontSize: '12px', textTransform: 'uppercase', color: 'var(--color-text-secondary)', fontWeight: 600 }}>
              Date
            </label>
            <input 
              type="date"
              className="glass-input-native"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
              style={{ width: '100%', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--color-border-glass)', color: 'var(--color-text-primary)', padding: '10px 12px', borderRadius: 'var(--radius-md)' }}
            />
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--spacing-3)' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-1)' }}>
            <label style={{ fontSize: '12px', textTransform: 'uppercase', color: 'var(--color-text-secondary)', fontWeight: 600 }}>
              Category
            </label>
            <select 
              className="glass-select"
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              required
              style={{ width: '100%', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--color-border-glass)', color: 'var(--color-text-primary)', padding: '10px 12px', borderRadius: 'var(--radius-md)' }}
            >
              <option value="">Select category</option>
              {filteredCategories.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-1)' }}>
            <label style={{ fontSize: '12px', textTransform: 'uppercase', color: 'var(--color-text-secondary)', fontWeight: 600 }}>
              Payment Source
            </label>
            <select 
              className="glass-select"
              value={paymentSource}
              onChange={(e) => setPaymentSource(e.target.value)}
              style={{ width: '100%', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--color-border-glass)', color: 'var(--color-text-primary)', padding: '10px 12px', borderRadius: 'var(--radius-md)' }}
            >
              <option value="cash">Cash</option>
              <option value="credit_card">Credit Card</option>
              <option value="debit_card">Debit Card</option>
              <option value="bank_transfer">Bank Transfer</option>
            </select>
          </div>
        </div>

        <GlassInput
          label="Description (Optional)"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="What was this for?"
        />

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--spacing-2)', marginTop: 'var(--spacing-2)' }}>
          <GlassButton type="button" variant="secondary" onClick={onClose}>
            Cancel
          </GlassButton>
          <GlassButton type="submit" variant="primary" isLoading={isLoading}>
            {initialData ? 'Save Changes' : 'Save Transaction'}
          </GlassButton>
        </div>
      </form>
    </Modal>
  );
}

TransactionFormModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
  initialData: PropTypes.object,
  categories: PropTypes.array.isRequired,
  isLoading: PropTypes.bool,
};
