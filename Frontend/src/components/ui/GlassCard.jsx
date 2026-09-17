import PropTypes from 'prop-types';
import './GlassCard.css';

export function GlassCard({ children, className = '', padding = 'normal', ...props }) {
  return (
    <div className={`glass-card padding-${padding} ${className}`} {...props}>
      {children}
    </div>
  );
}

GlassCard.propTypes = {
  children: PropTypes.node.isRequired,
  className: PropTypes.string,
  padding: PropTypes.oneOf(['none', 'small', 'normal', 'large']),
};
