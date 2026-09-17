import PropTypes from 'prop-types';
import { useLocation } from 'react-router-dom';
import { IconButton } from '../ui/IconButton';
import { useTheme } from '../../context/ThemeContext';
import { Icon } from '../ui/Icon';
import './Header.css';

export function Header({ onMenuClick }) {
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();

  // Simple title mapping based on route
  const getPageTitle = (pathname) => {
    const path = pathname.split('/')[1] || 'dashboard';
    if (pathname.includes('/admin')) {
      const adminPath = pathname.split('/')[2];
      return `Admin / ${adminPath.charAt(0).toUpperCase() + adminPath.slice(1)}`;
    }
    return path.charAt(0).toUpperCase() + path.slice(1);
  };

  return (
    <header className="main-header">
      <div className="header-left">
        <button className="mobile-menu-btn" onClick={onMenuClick} aria-label="Open menu">
          <Icon name="Menu" size={24} />
        </button>
        <h1 className="page-title">{getPageTitle(location.pathname)}</h1>
      </div>

      <div className="header-right">
        <IconButton 
          icon={theme === 'dark' ? 'Sun' : 'Moon'} 
          onClick={toggleTheme} 
          aria-label="Toggle theme"
          variant="ghost"
        />
        
        <div className="notification-wrapper">
          <IconButton 
            icon="Bell" 
            aria-label="Notifications"
            variant="ghost"
          />
          {/* Unread indicator */}
          <span className="unread-dot"></span>
        </div>
      </div>
    </header>
  );
}

Header.propTypes = {
  onMenuClick: PropTypes.func.isRequired,
};
