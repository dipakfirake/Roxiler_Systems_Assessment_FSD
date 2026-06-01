import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../utils/api';
import StarRating from '../components/StarRating';

export default function UserDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await api.get(`/users/${id}`);
        setUser(res.data);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load user details.');
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, [id]);

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
        <button className="btn btn-secondary" onClick={() => navigate('/admin/users')}>
          ← Back to Users
        </button>
      </div>
    );
  }

  const formatRole = (role) => {
    if (!role) return '';
    return role.replace(/_/g, ' ');
  };

  return (
    <div className="container page-wrapper fade-in">
      <div className="page-header">
        <h1>User Details</h1>
        <button className="btn btn-secondary" onClick={() => navigate('/admin/users')}>
          ← Back to Users
        </button>
      </div>

      <div className="detail-card">
        <div className="detail-row">
          <div className="detail-label">Name</div>
          <div className="detail-value">{user.name}</div>
        </div>

        <div className="detail-row">
          <div className="detail-label">Email</div>
          <div className="detail-value">{user.email}</div>
        </div>

        <div className="detail-row">
          <div className="detail-label">Address</div>
          <div className="detail-value">{user.address || '—'}</div>
        </div>

        <div className="detail-row">
          <div className="detail-label">Role</div>
          <div className="detail-value">
            <span className={`badge badge-${user.role}`}>{formatRole(user.role)}</span>
          </div>
        </div>

        {user.role === 'store_owner' && user.storeRating !== undefined && (
          <div className="detail-row">
            <div className="detail-label">Store Rating</div>
            <div className="detail-value">
              <StarRating value={user.storeRating || 0} readonly />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
