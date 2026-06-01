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
      <div className="navbar-inner">
        <NavLink to="/" className="navbar-brand" onClick={closeMenu}>
          <span className="navbar-brand-icon">★</span>
          Store Rating Platform
        </NavLink>

        <button
          className="navbar-hamburger"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle menu"
        >
          {menuOpen ? '✕' : '☰'}
        </button>

        <div className={`navbar-menu ${menuOpen ? 'open' : ''}`}>
          <div className="navbar-links">
            {user?.role === 'admin' && (
              <>
                <NavLink
                  to="/admin/dashboard"
                  className={({ isActive }) =>
                    `navbar-link ${isActive ? 'active' : ''}`
                  }
                  onClick={closeMenu}
                >
                  Dashboard
                </NavLink>
                <NavLink
                  to="/admin/users"
                  className={({ isActive }) =>
                    `navbar-link ${isActive ? 'active' : ''}`
                  }
                  onClick={closeMenu}
                >
                  Users
                </NavLink>
                <NavLink
                  to="/admin/stores"
                  className={({ isActive }) =>
                    `navbar-link ${isActive ? 'active' : ''}`
                  }
                  onClick={closeMenu}
                >
                  Stores
                </NavLink>
              </>
            )}
            {user?.role === 'user' && (
              <NavLink
                to="/stores"
                className={({ isActive }) =>
                  `navbar-link ${isActive ? 'active' : ''}`
                }
                onClick={closeMenu}
              >
                Stores
              </NavLink>
            )}
            {user?.role === 'store_owner' && (
              <NavLink
                to="/store-owner/dashboard"
                className={({ isActive }) =>
                  `navbar-link ${isActive ? 'active' : ''}`
                }
                onClick={closeMenu}
              >
                Dashboard
              </NavLink>
            )}
            <NavLink
              to="/change-password"
              className={({ isActive }) =>
                `navbar-link ${isActive ? 'active' : ''}`
              }
              onClick={closeMenu}
            >
              Change Password
            </NavLink>
          </div>

          <div className="navbar-right">
            <div className="navbar-user">
              <div className="navbar-avatar">{getInitials(user?.name)}</div>
              <div className="navbar-user-info">
                <span className="navbar-user-name">{user?.name}</span>
                <span className="navbar-user-role">{formatRole(user?.role)}</span>
              </div>
            </div>
            <button className="navbar-logout" onClick={handleLogout}>
              Logout
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
