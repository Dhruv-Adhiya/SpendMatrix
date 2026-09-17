import PropTypes from 'prop-types';
import { Icon } from './Icon';
import './IconButton.css';

export function IconButton({ 
  icon, 
  onClick, 
  variant = 'ghost', 
  size = 20, 
  className = '', 
  disabled, 
  ...props 
}) {
  return (
    <button 
      className={`icon-btn icon-btn-${variant} ${className}`} 
      onClick={onClick} 
      disabled={disabled}
      {...props}
    >
      <Icon name={icon} size={size} />
    </button>
  );
}

IconButton.propTypes = {
  icon: PropTypes.string.isRequired,
  onClick: PropTypes.func,
  variant: PropTypes.oneOf(['ghost', 'glass', 'primary']),
  size: PropTypes.number,
  className: PropTypes.string,
  disabled: PropTypes.bool,
};
