import PropTypes from 'prop-types';
import { Icon } from './Icon';
import { GlassButton } from './GlassButton';
import './ErrorState.css';

export function ErrorState({ title = 'Something went wrong', message, onRetry, className = '' }) {
  return (
    <div className={`error-state ${className}`}>
      <div className="error-state-icon">
        <Icon name="AlertTriangle" size={48} />
      </div>
      <h3 className="error-state-title">{title}</h3>
      {message && <p className="error-state-message">{message}</p>}
      {onRetry && (
        <GlassButton variant="secondary" onClick={onRetry} className="error-state-retry">
          Try Again
        </GlassButton>
      )}
    </div>
  );
}

ErrorState.propTypes = {
  title: PropTypes.string,
  message: PropTypes.string,
  onRetry: PropTypes.func,
  className: PropTypes.string,
};
