import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const Navigation = () => {
  const location = useLocation();

  const isActive = (path) => {
    if (path === '/' && location.pathname === '/') return true;
    if (path !== '/' && location.pathname.startsWith(path)) return true;
    return false;
  };

  return (
    <nav className="navbar">
      <div className="container">
        <div className="nav-content">
          <Link to="/" className="nav-brand">
            <h1>TALENTFLOW</h1>
          </Link>
          <div className="nav-links">
            <Link 
              to="/" 
              className={`nav-link ${isActive('/') ? 'active' : ''}`}
            >
              Jobs
            </Link>
            <Link 
              to="/candidates" 
              className={`nav-link ${isActive('/candidates') ? 'active' : ''}`}
            >
              Candidates
            </Link>
            <Link 
              to="/assessments" 
              className={`nav-link ${isActive('/assessments') ? 'active' : ''}`}
            >
              Assessments
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
