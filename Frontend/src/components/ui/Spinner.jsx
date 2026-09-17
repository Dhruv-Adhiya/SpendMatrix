import PropTypes from 'prop-types';
import './Spinner.css';

export function Spinner({ size = 'md', color = 'primary', className = '' }) {
  return (
    <div className={`spinner spinner-${size} spinner-${color} ${className}`} role="status">
      <span className="sr-only">Loading...</span>
    </div>
  );
}

Spinner.propTypes = {
  size: PropTypes.oneOf(['sm', 'md', 'lg']),
  color: PropTypes.oneOf(['primary', 'white', 'muted']),
  className: PropTypes.string,
};
