import PropTypes from 'prop-types';
import { Icon } from './Icon';
import './EmptyState.css';

export function EmptyState({ icon = 'Inbox', title, description, actionButton, className = '' }) {
  return (
    <div className={`empty-state ${className}`}>
      <div className="empty-state-icon">
        <Icon name={icon} size={48} />
      </div>
      <h3 className="empty-state-title">{title}</h3>
      {description && <p className="empty-state-description">{description}</p>}
      {actionButton && <div className="empty-state-action">{actionButton}</div>}
    </div>
  );
}

EmptyState.propTypes = {
  icon: PropTypes.string,
  title: PropTypes.string.isRequired,
  description: PropTypes.string,
  actionButton: PropTypes.node,
  className: PropTypes.string,
};
