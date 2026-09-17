import { NavLink } from 'react-router-dom';
import PropTypes from 'prop-types';
import { Icon } from '../ui/Icon';
import { useAuth } from '../../context/AuthContext';
import './Sidebar.css';

export function Sidebar({ isOpen, onClose }) {
  const { user, logout } = useAuth();
  
  const navItems = [
    { label: 'Dashboard', path: '/dashboard', icon: 'Grid' },
    { label: 'Transactions', path: '/transactions', icon: 'List' },
    { label: 'Categories', path: '/categories', icon: 'Tag' },
    { label: 'Budgets', path: '/budgets', icon: 'PieChart' },
    { label: 'Analytics', path: '/analytics', icon: 'TrendingUp' },
    { label: 'Recurring', path: '/recurring', icon: 'Repeat' },
    { label: 'Notifications', path: '/notifications', icon: 'Bell' },
    { label: 'Export', path: '/export', icon: 'Download' },
    { label: 'Settings', path: '/settings', icon: 'Settings' },
    { label: 'Profile', path: '/profile', icon: 'User' },
  ];

  const adminItems = [
    { label: 'Admin Dashboard', path: '/admin/dashboard', icon: 'Shield' },
    { label: 'Users', path: '/admin/users', icon: 'Users' },
    { label: 'All Transactions', path: '/admin/transactions', icon: 'Database' },
    { label: 'All Recurring', path: '/admin/recurring', icon: 'Clock' },
    { label: 'System Logs', path: '/admin/logs', icon: 'FileText' },
  ];

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && <div className="sidebar-overlay" onClick={onClose}></div>}
      
      <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <Icon name="Activity" size={24} className="sidebar-logo-icon" />
          <span className="sidebar-logo-text">SpendMatrix</span>
          <button className="sidebar-close-btn" onClick={onClose} aria-label="Close menu">
            <Icon name="X" size={20} />
          </button>
        </div>

        <div className="sidebar-content">
          <nav className="sidebar-nav">
            <div className="nav-section-title">Main Menu</div>
            {navItems.map((item) => (
              <NavLink 
                key={item.path} 
                to={item.path} 
                className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
                onClick={onClose}
              >
                <Icon name={item.icon} size={18} />
                <span>{item.label}</span>
              </NavLink>
            ))}

            {user?.role === 'admin' && (
              <>
                <div className="nav-section-title admin-title">Administration</div>
                {adminItems.map((item) => (
                  <NavLink 
                    key={item.path} 
                    to={item.path} 
                    className={({ isActive }) => `nav-item admin-item ${isActive ? 'active' : ''}`}
                    onClick={onClose}
                  >
                    <Icon name={item.icon} size={18} />
                    <span>{item.label}</span>
                  </NavLink>
                ))}
              </>
            )}
          </nav>
        </div>

        <div className="sidebar-footer">
          <div className="user-mini-profile">
            <div className="user-avatar">
              {user?.full_name?.charAt(0) || 'U'}
            </div>
            <div className="user-info">
              <span className="user-name">{user?.full_name || 'User'}</span>
              <span className="user-email">{user?.email || ''}</span>
            </div>
          </div>
          <button className="logout-btn" onClick={() => { logout(); onClose(); }}>
            <Icon name="LogOut" size={18} />
            <span>Log out</span>
          </button>
        </div>
      </aside>
    </>
  );
}

Sidebar.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
};
