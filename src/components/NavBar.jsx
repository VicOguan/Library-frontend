import { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import {
  BookOpen,
  BookmarkCheck,
  LogOut,
  LogIn,
  UserPlus,
  Sun,
  Moon,
  Menu,
  X,
  Shield,
  User,
} from 'lucide-react';

const NavBar = () => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
    setMobileMenuOpen(false);
  };

  return (
    <nav className="navbar-wrapper">
      <div className="navbar-container">
        {/* Brand Logo */}
        <Link to="/" className="navbar-brand" onClick={() => setMobileMenuOpen(false)}>
          <div className="brand-icon-box">
            <BookOpen size={22} strokeWidth={2.5} />
          </div>
          <div className="brand-text">
            <span className="brand-title">OHARA</span>
            <span className="brand-subtitle">Library Portal</span>
          </div>
        </Link>

        {/* Center / Navigation Links */}
        <div className={`navbar-menu ${mobileMenuOpen ? 'open' : ''}`}>
          <NavLink
            to="/"
            end
            className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
            onClick={() => setMobileMenuOpen(false)}
          >
            <BookOpen size={18} />
            <span>Catalog</span>
          </NavLink>

          {user && (
            <NavLink
              to="/my-books"
              className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
              onClick={() => setMobileMenuOpen(false)}
            >
              <BookmarkCheck size={18} />
              <span>My Books</span>
            </NavLink>
          )}
        </div>

        {/* Right Actions */}
        <div className="nav-right-actions">
          {/* Theme Switcher */}
          <button
            className="theme-toggle-btn"
            onClick={toggleTheme}
            aria-label="Toggle theme"
            title={`Switch to ${theme === 'light' ? 'Dark' : 'Light'} Mode`}
          >
            {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
          </button>

          {user ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div className="user-profile-badge">
                <div className="user-avatar">
                  {user.username ? user.username.charAt(0).toUpperCase() : <User size={16} />}
                </div>
                <div className="user-info">
                  <span className="user-name">{user.username}</span>
                  <span className={`role-pill ${user.role === 'ADMIN' ? 'admin' : 'user'}`}>
                    {user.role === 'ADMIN' ? (
                      <>
                        <Shield size={10} style={{ marginRight: '2px', display: 'inline' }} />
                        Admin
                      </>
                    ) : (
                      'Reader'
                    )}
                  </span>
                </div>
              </div>

              <button onClick={handleLogout} className="btn-logout" title="Sign Out">
                <LogOut size={16} />
                <span>Logout</span>
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Link to="/login" className="btn-ghost-nav">
                <LogIn size={16} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '4px' }} />
                Login
              </Link>
              <Link to="/register" className="btn-primary-nav">
                <UserPlus size={16} />
                <span>Register</span>
              </Link>
            </div>
          )}

          {/* Mobile hamburger menu toggle */}
          <button
            className="mobile-menu-btn"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle Navigation Menu"
          >
            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>
    </nav>
  );
};

export default NavBar;