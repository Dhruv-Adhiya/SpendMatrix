import React from 'react';
import PropTypes from 'prop-types';
import { Icon } from './Icon';
import './GlassInput.css'; // We'll reuse the input styles for the wrapper/label

export const GlassSelect = React.forwardRef(({
  label,
  error,
  icon,
  className = '',
  id,
  children,
  ...props
}, ref) => {
  const selectId = id || `select-${Math.random().toString(36).substr(2, 9)}`;

  return (
    <div className={`glass-input-wrapper ${className}`}>
      {label && (
        <label htmlFor={selectId} className="glass-input-label">
          {label}
        </label>
      )}
      <div className="glass-input-container">
        {icon && (
          <span className="glass-input-icon">
            <Icon name={icon} size={18} />
          </span>
        )}
        <select
          ref={ref}
          id={selectId}
          className={`glass-input ${icon ? 'with-icon' : ''} ${error ? 'has-error' : ''}`}
          aria-invalid={!!error}
          aria-describedby={error ? `${selectId}-error` : undefined}
          {...props}
        >
          {children}
        </select>
        {/* Custom dropdown chevron (optional, could use CSS for this) */}
        <span className="glass-select-chevron">
          <Icon name="ChevronDown" size={16} />
        </span>
      </div>
      {error && (
        <span id={`${selectId}-error`} className="glass-input-error">
          {error}
        </span>
      )}
    </div>
  );
});

GlassSelect.displayName = 'GlassSelect';

GlassSelect.propTypes = {
  label: PropTypes.string,
  error: PropTypes.string,
  icon: PropTypes.string,
  className: PropTypes.string,
  id: PropTypes.string,
  children: PropTypes.node.isRequired,
};
