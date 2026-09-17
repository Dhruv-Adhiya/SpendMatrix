import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import PropTypes from 'prop-types';
import { IconButton } from './IconButton';
import './Drawer.css';

export function Drawer({ isOpen, onClose, title, children, position = 'right' }) {
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.addEventListener('keydown', handleEsc);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleEsc);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return createPortal(
    <div className="drawer-overlay" onClick={onClose} role="dialog" aria-modal="true" aria-labelledby="drawer-title">
      <div 
        className={`drawer-content glass-card drawer-${position}`} 
        onClick={e => e.stopPropagation()}
      >
        <div className="drawer-header">
          <h2 id="drawer-title">{title}</h2>
          <IconButton icon="X" onClick={onClose} variant="ghost" aria-label="Close drawer" />
        </div>
        <div className="drawer-body">
          {children}
        </div>
      </div>
    </div>,
    document.body
  );
}

Drawer.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  title: PropTypes.string.isRequired,
  children: PropTypes.node.isRequired,
  position: PropTypes.oneOf(['left', 'right']),
};
