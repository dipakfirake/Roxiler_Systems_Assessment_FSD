import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/api';
import StarRating from '../components/StarRating';

export default function AdminStores() {
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [filters, setFilters] = useState({
    name: '',
    email: '',
    address: '',
  });

  const [sortBy, setSortBy] = useState('name');
  const [order, setOrder] = useState('asc');

  const fetchStores = async () => {
    setLoading(true);
    setError('');
    try {
      const params = { sortBy, order };
      if (filters.name) params.name = filters.name;
      if (filters.email) params.email = filters.email;
      if (filters.address) params.address = filters.address;

      // Combine search for the backend if it uses a single `search` param
      const searchParts = [];
      if (filters.name) searchParts.push(filters.name);
      if (filters.address) searchParts.push(filters.address);
      if (searchParts.length > 0) params.search = searchParts.join(' ');

      const res = await api.get('/stores', { params });
      const list = res.data.stores || res.data || [];
      setStores(list.map(s => ({
        ...s,
        averageRating: s.average_rating ?? s.averageRating ?? 0,
      })));
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load stores.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStores();
  }, [sortBy, order]);

  useEffect(() => {
    const timeout = setTimeout(fetchStores, 400);
    return () => clearTimeout(timeout);
  }, [filters.name, filters.email, filters.address]);

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

  return (
    <div className="container page-wrapper fade-in">
      <div className="page-header">
        <h1>Stores</h1>
        <Link to="/admin/stores/add" className="btn btn-primary">
          + Add Store
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
                <th className={getSortClass('average_rating')} onClick={() => handleSort('average_rating')}>
                  Rating
                </th>
              </tr>
            </thead>
            <tbody>
              {stores.length === 0 ? (
                <tr>
                  <td colSpan={4} className="table-empty">
                    No stores found.
                  </td>
                </tr>
              ) : (
                stores.map((store) => (
                  <tr key={store.id}>
                    <td>{store.name}</td>
                    <td>{store.email}</td>
                    <td>{store.address || '—'}</td>
                    <td>
                      <StarRating
                        value={store.averageRating || store.rating || 0}
                        readonly
                      />
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
