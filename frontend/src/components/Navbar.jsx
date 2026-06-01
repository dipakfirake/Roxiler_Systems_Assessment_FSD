import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useState } from 'react';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getInitials = (name) => {
    if (!name) return '?';
    return name
      .split(' ')
      .map((w) => w[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const formatRole = (role) => {
    if (!role) return '';
    return role.replace(/_/g, ' ');
  };

  const closeMenu = () => setMenuOpen(false);

  return (
    <nav className="navbar">
      <div className="navbar-content">
        <NavLink to="/" className="navbar-brand" onClick={closeMenu}>
          <span className="navbar-brand-icon">★</span>
          Store Rating Platform
        </NavLink>

        <button
          className="navbar-toggle"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle menu"
        >
          {menuOpen ? '✕' : '☰'}
        </button>

        <ul className={`navbar-links ${menuOpen ? 'open' : ''}`}>
          {user?.role === 'admin' && (
            <>
              <li>
                <NavLink
                  to="/admin/dashboard"
                  className={({ isActive }) => isActive ? 'active' : ''}
                  onClick={closeMenu}
                >
                  Dashboard
                </NavLink>
              </li>
              <li>
                <NavLink
                  to="/admin/users"
                  className={({ isActive }) => isActive ? 'active' : ''}
                  onClick={closeMenu}
                >
                  Users
                </NavLink>
              </li>
              <li>
                <NavLink
                  to="/admin/stores"
                  className={({ isActive }) => isActive ? 'active' : ''}
                  onClick={closeMenu}
                >
                  Stores
                </NavLink>
              </li>
            </>
          )}
          {user?.role === 'user' && (
            <li>
              <NavLink
                to="/stores"
                className={({ isActive }) => isActive ? 'active' : ''}
                onClick={closeMenu}
              >
                Stores
              </NavLink>
            </li>
          )}
          {user?.role === 'store_owner' && (
            <li>
              <NavLink
                to="/store-owner/dashboard"
                className={({ isActive }) => isActive ? 'active' : ''}
                onClick={closeMenu}
              >
                Dashboard
              </NavLink>
            </li>
          )}
          <li>
            <NavLink
              to="/change-password"
              className={({ isActive }) => isActive ? 'active' : ''}
              onClick={closeMenu}
            >
              Change Password
            </NavLink>
          </li>
        </ul>

        <div className="navbar-user">
          <div className="navbar-user-info">
            <span className="navbar-user-name">{user?.name}</span>
            <span className="navbar-user-role">{formatRole(user?.role)}</span>
          </div>
          <div className="navbar-avatar">{getInitials(user?.name)}</div>
          <button className="navbar-logout" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
}
