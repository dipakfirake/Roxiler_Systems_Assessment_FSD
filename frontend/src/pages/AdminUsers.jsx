import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../utils/api';

export default function AdminUsers() {
  const navigate = useNavigate();

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [filters, setFilters] = useState({
    name: '',
    email: '',
    address: '',
    role: '',
  });

  const [sortBy, setSortBy] = useState('name');
  const [order, setOrder] = useState('asc');

  const fetchUsers = async () => {
    setLoading(true);
    setError('');
    try {
      const params = {};
      if (filters.name) params.name = filters.name;
      if (filters.email) params.email = filters.email;
      if (filters.address) params.address = filters.address;
      if (filters.role) params.role = filters.role;
      params.sortBy = sortBy;
      params.order = order;

      const res = await api.get('/users', { params });
      setUsers(res.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load users.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [sortBy, order]);

  useEffect(() => {
    const timeout = setTimeout(fetchUsers, 400);
    return () => clearTimeout(timeout);
  }, [filters.name, filters.email, filters.address, filters.role]);

  const handleFilterChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  const handleSort = (column) => {
    if (sortBy === column) {
      setOrder(order === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setOrder('asc');
    }
  };

  const getSortClass = (column) => {
    if (sortBy !== column) return 'sortable';
    return `sortable ${order}`;
  };

  const formatRole = (role) => {
    if (!role) return '';
    return role.replace(/_/g, ' ');
  };

  return (
    <div className="container page-wrapper fade-in">
      <div className="page-header">
        <h1>Users</h1>
        <Link to="/admin/users/add" className="btn btn-primary">
          + Add User
        </Link>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      <div className="table-wrapper">
        <div className="table-filters">
          <input
            type="text"
            name="name"
            className="form-input"
            placeholder="Filter by name..."
            value={filters.name}
            onChange={handleFilterChange}
          />
          <input
            type="text"
            name="email"
            className="form-input"
            placeholder="Filter by email..."
            value={filters.email}
            onChange={handleFilterChange}
          />
          <input
            type="text"
            name="address"
            className="form-input"
            placeholder="Filter by address..."
            value={filters.address}
            onChange={handleFilterChange}
          />
          <select
            name="role"
            className="form-select"
            value={filters.role}
            onChange={handleFilterChange}
          >
            <option value="">All Roles</option>
            <option value="admin">Admin</option>
            <option value="user">User</option>
            <option value="store_owner">Store Owner</option>
          </select>
        </div>

        {loading ? (
          <div className="page-loading">
            <div className="spinner spinner-lg"></div>
          </div>
        ) : (
          <table>
            <thead>
              <tr>
                <th className={getSortClass('name')} onClick={() => handleSort('name')}>
                  Name
                </th>
                <th className={getSortClass('email')} onClick={() => handleSort('email')}>
                  Email
                </th>
                <th>Address</th>
                <th className={getSortClass('role')} onClick={() => handleSort('role')}>
                  Role
                </th>
              </tr>
            </thead>
            <tbody>
              {users.length === 0 ? (
                <tr>
                  <td colSpan={4} className="table-empty">
                    No users found.
                  </td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr
                    key={user.id}
                    className="clickable"
                    onClick={() => navigate(`/admin/users/${user.id}`)}
                  >
                    <td>{user.name}</td>
                    <td>{user.email}</td>
                    <td>{user.address || '—'}</td>
                    <td>
                      <span className={`badge badge-${user.role}`}>
                        {formatRole(user.role)}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
