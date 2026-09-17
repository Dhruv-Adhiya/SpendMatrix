import React from 'react';
import PropTypes from 'prop-types';
import { Icon } from './Icon';
import './GlassInput.css';

export const GlassInput = React.forwardRef(({
  label,
  error,
  icon,
  className = '',
  id,
  type = 'text',
  ...props
}, ref) => {
  const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;

  return (
    <div className={`glass-input-wrapper ${className}`}>
      {label && (
        <label htmlFor={inputId} className="glass-input-label">
          {label}
        </label>
      )}
      <div className="glass-input-container">
        {icon && (
          <span className="glass-input-icon">
            <Icon name={icon} size={18} />
          </span>
        )}
        <input
          ref={ref}
          id={inputId}
          type={type}
          className={`glass-input ${icon ? 'with-icon' : ''} ${error ? 'has-error' : ''}`}
          aria-invalid={!!error}
          aria-describedby={error ? `${inputId}-error` : undefined}
          {...props}
        />
      </div>
      {error && (
        <span id={`${inputId}-error`} className="glass-input-error">
          {error}
        </span>
      )}
    </div>
  );
});

GlassInput.displayName = 'GlassInput';

GlassInput.propTypes = {
  label: PropTypes.string,
  error: PropTypes.string,
  icon: PropTypes.string,
  className: PropTypes.string,
  id: PropTypes.string,
  type: PropTypes.string,
};
