import PropTypes from 'prop-types';
import { GlassInput } from '../ui/GlassInput';
import { GlassButton } from '../ui/GlassButton';
import { Icon } from '../ui/Icon';
import './TransactionFilters.css';

export function TransactionFilters({ filters, setFilters, categories, onReset }) {
  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  return (
    <div className="filters-container">
      <div className="filters-search-bar">
        <GlassInput
          icon="Search"
          placeholder="Search descriptions..."
          value={filters.search}
          onChange={(e) => handleFilterChange('search', e.target.value)}
        />
      </div>
      
      <div className="filters-row">
        <div className="filter-group">
          <label className="filter-label">Type</label>
          <select 
            className="glass-select"
            value={filters.type}
            onChange={(e) => handleFilterChange('type', e.target.value)}
          >
            <option value="">All Types</option>
            <option value="income">Income</option>
            <option value="expense">Expense</option>
          </select>
        </div>

        <div className="filter-group">
          <label className="filter-label">Category</label>
          <select 
            className="glass-select"
            value={filters.category_id}
            onChange={(e) => handleFilterChange('category_id', e.target.value)}
          >
            <option value="">All Categories</option>
            {categories.map(cat => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>
        </div>

        <div className="filter-group">
          <label className="filter-label">Min Amount</label>
          <input 
            type="number"
            className="glass-input-native"
            placeholder="Min"
            value={filters.minAmount}
            onChange={(e) => handleFilterChange('minAmount', e.target.value)}
          />
        </div>

        <div className="filter-group">
          <label className="filter-label">Max Amount</label>
          <input 
            type="number"
            className="glass-input-native"
            placeholder="Max"
            value={filters.maxAmount}
            onChange={(e) => handleFilterChange('maxAmount', e.target.value)}
          />
        </div>

        <div className="filter-group">
          <label className="filter-label">Start Date</label>
          <input 
            type="date"
            className="glass-input-native"
            value={filters.startDate}
            onChange={(e) => handleFilterChange('startDate', e.target.value)}
          />
        </div>
        
        <div className="filter-group">
          <label className="filter-label">End Date</label>
          <input 
            type="date"
            className="glass-input-native"
            value={filters.endDate}
            onChange={(e) => handleFilterChange('endDate', e.target.value)}
          />
        </div>

        <div className="filter-group actions">
          <label className="filter-label">&nbsp;</label>
          <GlassButton variant="secondary" onClick={onReset} className="reset-btn">
            <Icon name="X" size={16} style={{ marginRight: '4px' }} /> Reset
          </GlassButton>
        </div>
      </div>
    </div>
  );
}

TransactionFilters.propTypes = {
  filters: PropTypes.shape({
    search: PropTypes.string,
    type: PropTypes.string,
    category_id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    minAmount: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    maxAmount: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    startDate: PropTypes.string,
    endDate: PropTypes.string,
  }).isRequired,
  setFilters: PropTypes.func.isRequired,
  categories: PropTypes.array.isRequired,
  onReset: PropTypes.func.isRequired,
};
