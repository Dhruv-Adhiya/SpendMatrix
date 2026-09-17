import PropTypes from 'prop-types';
import { Modal } from './Modal';
import { GlassButton } from './GlassButton';
import './ConfirmDialog.css';

export function ConfirmDialog({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title, 
  message, 
  confirmText = 'Confirm', 
  cancelText = 'Cancel',
  isDestructive = false,
  isLoading = false 
}) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title}>
      <div className="confirm-dialog-content">
        <p>{message}</p>
        <div className="confirm-dialog-actions">
          <GlassButton 
            variant="secondary" 
            onClick={onClose} 
            disabled={isLoading}
          >
            {cancelText}
          </GlassButton>
          <GlassButton 
            variant={isDestructive ? 'danger' : 'primary'} 
            onClick={onConfirm} 
            isLoading={isLoading}
          >
            {confirmText}
          </GlassButton>
        </div>
      </div>
    </Modal>
  );
}

ConfirmDialog.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onConfirm: PropTypes.func.isRequired,
  title: PropTypes.string.isRequired,
  message: PropTypes.string.isRequired,
  confirmText: PropTypes.string,
  cancelText: PropTypes.string,
  isDestructive: PropTypes.bool,
  isLoading: PropTypes.bool,
};
