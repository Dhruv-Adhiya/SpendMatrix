import PropTypes from 'prop-types';
import { Icon } from './Icon';
import './GlassButton.css';

export function GlassButton({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  icon,
  className = '',
  disabled,
  type = 'button',
  ...props
}) {
  return (
    <button
      type={type}
      className={`glass-btn btn-${variant} btn-${size} ${isLoading ? 'loading' : ''} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <span className="spinner-icon"></span>
      ) : icon ? (
        <Icon name={icon} size={size === 'sm' ? 16 : 20} className="btn-icon" />
      ) : null}
      <span className="btn-content">{children}</span>
    </button>
  );
}

GlassButton.propTypes = {
  children: PropTypes.node.isRequired,
  variant: PropTypes.oneOf(['primary', 'secondary', 'danger', 'ghost']),
  size: PropTypes.oneOf(['sm', 'md', 'lg']),
  isLoading: PropTypes.bool,
  icon: PropTypes.string,
  className: PropTypes.string,
  disabled: PropTypes.bool,
  type: PropTypes.oneOf(['button', 'submit', 'reset']),
};
