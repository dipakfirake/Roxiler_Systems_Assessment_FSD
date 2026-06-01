import { useState, useEffect } from 'react';
import api from '../utils/api';
import StarRating from '../components/StarRating';

export default function StoreOwnerDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await api.get('/dashboard/store-owner');
        setData(res.data);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load dashboard data.');
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  if (loading) {
    return (
      <div className="page-loading">
        <div className="spinner spinner-lg"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container page-wrapper">
        <div className="alert alert-error">{error}</div>
      </div>
    );
  }

  const ratings = data?.raters || data?.ratings || [];
  const averageRating = data?.store?.average_rating ?? data?.averageRating ?? 0;

  return (
    <div className="container page-wrapper fade-in">
      <div className="page-header">
        <h1>Store Dashboard</h1>
      </div>

      {/* Average Rating Display */}
      <div className="card" style={{ textAlign: 'center', marginBottom: 'var(--space-xl)' }}>
        <h3 style={{ marginBottom: 'var(--space-sm)', color: 'var(--color-text-secondary)' }}>
          Average Store Rating
        </h3>
        <div style={{ fontSize: '3rem', fontWeight: '800', lineHeight: 1.2, marginBottom: 'var(--space-sm)' }}>
          {Number(averageRating).toFixed(1)}
        </div>
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <StarRating value={Math.round(averageRating)} readonly />
        </div>
        <p style={{ marginTop: 'var(--space-sm)', fontSize: '0.875rem' }}>
          Based on {ratings.length} {ratings.length === 1 ? 'review' : 'reviews'}
        </p>
      </div>

      {/* Ratings Table */}
      <div className="table-wrapper">
        <table>
          <thead>
            <tr>
              <th>User Name</th>
              <th>Email</th>
              <th>Rating</th>
            </tr>
          </thead>
          <tbody>
            {ratings.length === 0 ? (
              <tr>
                <td colSpan={3} className="table-empty">
                  No ratings yet.
                </td>
              </tr>
            ) : (
              ratings.map((entry, index) => (
                <tr key={entry.id || index}>
                  <td>{entry.user_name || entry.userName || entry.name || '—'}</td>
                  <td>{entry.user_email || entry.userEmail || entry.email || '—'}</td>
                  <td>
                    <StarRating value={entry.rating} readonly />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
