import React from 'react';
import { useLocation } from 'react-router-dom';
import PriceTracker from './PriceTracker';
import ProgressIndicator from './ProgressIndicator';
import './Layout.css';

const Layout = ({ children }) => {
  const location = useLocation();

  const [userInfo, setUserInfo] = React.useState('');
  const [isLoggedIn, setIsLoggedIn] = React.useState(false);


  React.useEffect(() => {
    const checkLogin = async () => {
      try {
      const res = await fetch('api/user/me');
      if (res.ok) {
      const data = await res.json();
      setUserInfo(data);
      setIsLoggedIn(true);
      }
      else {
        setIsLoggedIn(false);
      }
    } catch (error) {
      console.error('Error checking login status:', error);
    }
  };

  checkLogin();

}, []);


  if (isLoggedIn) {
    document.getElementById("login-link-container").innerHTML = "<a id=\"login-link\" href=\"/login\">Logged in as " + userInfo.email + "</a>";
  }

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
        <p>&copy; 2025 Carpet & Upholstery Cleaning Service <a href="/quote" id="quote-link">Quote</a></p>
        
        <div id="login-link-container">
          <a href="/login" id="login-link">Login </a>
        </div>

        <div className="container-fluid">
          <span className="text-reset">Author Name(s)</span>
          <a className="text-reset" href="https://github.com/WeishiBYU/Scheduler/tree/New-Stuff">Source</a>
        </div>
      </footer>
    </div>
  );
};

export default Layout;