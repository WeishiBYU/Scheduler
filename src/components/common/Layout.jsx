import React from 'react';
import { useLocation } from 'react-router-dom';
import PriceTracker from './PriceTracker';
import ProgressIndicator from './ProgressIndicator';
import './Layout.css';

const Layout = ({ children }) => {
  const location = useLocation();

  return (
    <div className="layout">
      <header className="layout-header">
        <h1>Carpet & Upholstery Cleaning Service</h1>
        <ProgressIndicator currentPath={location.pathname} />
      </header>
      
      <main className="layout-main">
        <div className="content-area">
          {children}
        </div>
        <aside className="price-sidebar">
          <PriceTracker />
        </aside>
      </main>
      
      <footer className="layout-footer">
        <p>&copy; 2025 Carpet & Upholstery Cleaning Service</p>
        <div className="container-fluid">
          <span className="text-reset">Author Name(s)</span>
          <a className="text-reset" href="https://github.com/WeishiBYU/Scheduler/compare/New-Stuff?expand=1">Source</a>
        </div>
      </footer>
    </div>
  );
};

export default Layout;