import * as Iconsax from 'iconsax-react';
import PropTypes from 'prop-types';

// Map of previously used Lucide names to Iconsax names
const iconMap = {
  Mail: 'Sms',
  Lock: 'Lock',
  Eye: 'Eye',
  EyeOff: 'EyeSlash',
  User: 'Profile',
  CheckCircle: 'TickCircle',
  XCircle: 'CloseCircle',
  Activity: 'Activity',
  X: 'CloseSquare',
  Grid: 'Element4',
  List: 'TaskSquare',
  Tag: 'Tag',
  PieChart: 'ChartSquare',
  TrendingUp: 'TrendUp',
  TrendingDown: 'TrendDown',
  Repeat: 'Repeat',
  Bell: 'Notification',
  Download: 'Import',
  Settings: 'Setting2',
  Shield: 'ShieldTick',
  Users: 'Profile2User',
  Database: 'Data',
  Clock: 'Clock',
  FileText: 'DocumentText',
  LogOut: 'Logout',
  Menu: 'HambergerMenu',
  Sun: 'Sun1',
  Moon: 'Moon',
  Coffee: 'Coffee',
  Navigation: 'Location',
  ShoppingBag: 'ShoppingBag',
  Home: 'Home',
  Heart: 'Heart',
  DollarSign: 'DollarCircle',
  Inbox: 'Box',
  Plus: 'Add',
  Briefcase: 'Briefcase',
  Edit2: 'Edit2',
  Trash2: 'Trash',
  Search: 'SearchNormal1',
  Filter: 'Filter',
  Calendar: 'Calendar',
  ArrowLeft: 'ArrowLeft',
  ArrowRight: 'ArrowRight',
  MoreVertical: 'More',
  AlertCircle: 'InfoCircle',
  ChevronDown: 'ArrowDown2',
  ChevronUp: 'ArrowUp2'
};

/**
 * Centralized Icon component that wraps iconsax-react.
 */
export function Icon({ name, size = 20, className = '', variant = 'Linear', ...props }) {
  // Use mapped name if available, otherwise assume name is already an Iconsax name
  const mappedName = iconMap[name] || name;
  const IconComponent = Iconsax[mappedName];

  if (!IconComponent) {
    console.warn(`Icon "${mappedName}" (mapped from "${name}") not found in iconsax-react.`);
    return <span className={`fallback-icon ${className}`} style={{ width: size, height: size }} />;
  }

  return <IconComponent size={size} className={`icon ${className}`} variant={variant} {...props} />;
}

Icon.propTypes = {
  name: PropTypes.string.isRequired,
  size: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  className: PropTypes.string,
  variant: PropTypes.oneOf(['Linear', 'Outline', 'Broken', 'Bold', 'Bulk', 'TwoTone']),
};

