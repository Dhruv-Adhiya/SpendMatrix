import PropTypes from 'prop-types';
import './Badge.css';

export function Badge({ text, type = 'info', className = '' }) {
  return (
    <span className={`badge badge-${type} ${className}`}>
      {text}
    </span>
  );
}

Badge.propTypes = {
  text: PropTypes.string.isRequired,
  type: PropTypes.oneOf(['success', 'warning', 'error', 'info']),
  className: PropTypes.string,
};
