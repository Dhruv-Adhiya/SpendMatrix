import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Modal } from '../ui/Modal';
import { GlassInput } from '../ui/GlassInput';
import { GlassButton } from '../ui/GlassButton';
import api from '../../services/api';

export function BudgetFormModal({ isOpen, onClose, onSubmit, initialData, currentMonth, currentYear, isLoading }) {
  const [categoryId, setCategoryId] = useState('');
  const [amount, setAmount] = useState('');
  const [error, setError] = useState('');
  
  // We need categories (expense only) to choose from
  const [categories, setCategories] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const fetchCategories = async () => {
        setLoadingCategories(true);
        try {
          // Budgets are only for expenses
          const res = await api.get('/categories?type=expense');
          setCategories(res.data.data || []);
        } catch (err) {
          console.error('Failed to load categories', err);
        } finally {
          setLoadingCategories(false);
        }
      };
      
      // Only fetch if we don't have them yet, or if it's the first time
      if (categories.length === 0) {
        fetchCategories();
      }

      if (initialData) {
        setCategoryId(initialData.category_id || '');
        setAmount(initialData.amount || '');
      } else {
        setCategoryId('');
        setAmount('');
      }
      setError('');
    }
  }, [isOpen, initialData, categories.length]);

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (!categoryId) {
      setError('Please select a category');
      return;
    }
    
    if (!amount || Number(amount) <= 0) {
      setError('Amount must be a positive number');
      return;
    }

    onSubmit({
      category_id: parseInt(categoryId),
      amount: Number(amount),
      month: currentMonth,
      year: currentYear
    });
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={initialData ? 'Edit Budget' : 'Set Budget'}
      maxWidth="400px"
    >
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-4)' }}>
        {error && (
          <div style={{ color: 'var(--color-accent-expense)', fontSize: '14px', background: 'rgba(244, 63, 94, 0.1)', padding: '10px', borderRadius: 'var(--radius-sm)' }}>
            {error}
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-1)' }}>
          <label style={{ fontSize: '12px', textTransform: 'uppercase', color: 'var(--color-text-secondary)', fontWeight: 600 }}>
            Category
          </label>
          <select 
            className="glass-select"
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            required
            disabled={!!initialData || loadingCategories} // Don't allow changing category on edit, it acts as an upsert per category
            style={{ width: '100%', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--color-border-glass)', color: 'var(--color-text-primary)', padding: '10px 12px', borderRadius: 'var(--radius-md)' }}
          >
            <option value="">{loadingCategories ? 'Loading...' : 'Select category'}</option>
            {categories.map(cat => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>
        </div>

        <GlassInput
          label="Budget Amount"
          type="number"
          min="1"
          step="0.01"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="0.00"
          required
        />
        
        <p style={{ fontSize: '12px', color: 'var(--color-text-muted)', margin: 0 }}>
          This budget will apply to {new Date(currentYear, currentMonth - 1).toLocaleString('default', { month: 'long', year: 'numeric' })}.
        </p>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--spacing-2)', marginTop: 'var(--spacing-2)' }}>
          <GlassButton type="button" variant="secondary" onClick={onClose}>
            Cancel
          </GlassButton>
          <GlassButton type="submit" variant="primary" isLoading={isLoading || loadingCategories}>
            {initialData ? 'Update Budget' : 'Save Budget'}
          </GlassButton>
        </div>
      </form>
    </Modal>
  );
}

BudgetFormModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
  initialData: PropTypes.object,
  currentMonth: PropTypes.number.isRequired,
  currentYear: PropTypes.number.isRequired,
  isLoading: PropTypes.bool,
};
