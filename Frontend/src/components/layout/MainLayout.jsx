import { useState } from 'react';
import PropTypes from 'prop-types';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import './MainLayout.css';

export function MainLayout({ children }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);
  const closeSidebar = () => setIsSidebarOpen(false);

  return (
    <div className="main-layout">
      <Sidebar isOpen={isSidebarOpen} onClose={closeSidebar} />
      
      <div className="main-content-wrapper">
        <Header onMenuClick={toggleSidebar} />
        
        <main className="main-content">
          <div className="content-container">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}

MainLayout.propTypes = {
  children: PropTypes.node.isRequired,
};
