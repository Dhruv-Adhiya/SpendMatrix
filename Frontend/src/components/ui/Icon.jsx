import * as LucideIcons from 'lucide-react';
import PropTypes from 'prop-types';

/**
 * Centralized Icon component that wraps lucide-react.
 * Provides a single abstraction layer in case we decide to migrate fully to Iconsax later.
 */
export function Icon({ name, size = 20, className = '', ...props }) {
  // Lucide icons use PascalCase for component names (e.g., 'Home', 'ChevronDown')
  const IconComponent = LucideIcons[name];

  if (!IconComponent) {
    console.warn(`Icon "${name}" not found in lucide-react.`);
    return <span className={`fallback-icon ${className}`} style={{ width: size, height: size }} />;
  }

  return <IconComponent size={size} className={`icon ${className}`} {...props} />;
}

Icon.propTypes = {
  name: PropTypes.string.isRequired,
  size: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  className: PropTypes.string,
};
