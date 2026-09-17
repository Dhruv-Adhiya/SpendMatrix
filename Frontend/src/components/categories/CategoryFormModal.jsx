import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Modal } from '../ui/Modal';
import { GlassInput } from '../ui/GlassInput';
import { GlassButton } from '../ui/GlassButton';

export function CategoryFormModal({ isOpen, onClose, onSubmit, initialData, isLoading }) {
  const [name, setName] = useState('');
  const [type, setType] = useState('expense');
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setName(initialData.name || '');
        setType(initialData.type || 'expense');
      } else {
        setName('');
        setType('expense');
      }
      setError('');
    }
  }, [isOpen, initialData]);

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (!name.trim()) {
      setError('Category name is required');
      return;
    }

    onSubmit({ name: name.trim(), type });
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={initialData ? 'Edit Category' : 'New Category'}
      maxWidth="400px"
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

        <GlassInput
          label="Category Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Groceries"
          required
        />

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--spacing-2)', marginTop: 'var(--spacing-2)' }}>
          <GlassButton type="button" variant="secondary" onClick={onClose}>
            Cancel
          </GlassButton>
          <GlassButton type="submit" variant="primary" isLoading={isLoading}>
            {initialData ? 'Save Changes' : 'Create Category'}
          </GlassButton>
        </div>
      </form>
    </Modal>
  );
}

CategoryFormModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
  initialData: PropTypes.shape({
    id: PropTypes.number,
    name: PropTypes.string,
    type: PropTypes.string,
  }),
  isLoading: PropTypes.bool,
};
