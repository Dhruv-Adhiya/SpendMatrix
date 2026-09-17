import PropTypes from 'prop-types';
import './Skeleton.css';

export function Skeleton({ 
  className = '', 
  width, 
  height, 
  variant = 'rectangular',
  ...props 
}) {
  const style = {
    ...(width && { width }),
    ...(height && { height }),
  };

  return (
    <div 
      className={`skeleton skeleton-${variant} ${className}`} 
      style={style}
      aria-hidden="true"
      {...props}
    />
  );
}

Skeleton.propTypes = {
  className: PropTypes.string,
  width: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  height: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  variant: PropTypes.oneOf(['rectangular', 'circular', 'text']),
};
