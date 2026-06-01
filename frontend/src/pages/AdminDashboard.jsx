import { useState, useEffect } from 'react';
import api from '../utils/api';
import DashboardCard from '../components/DashboardCard';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await api.get('/dashboard/admin');
        setStats(res.data);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load dashboard data.');
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
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

  return (
    <div className="container page-wrapper fade-in">
      <div className="page-header">
        <h1>Admin Dashboard</h1>
      </div>

      <div className="grid grid-3">
        <DashboardCard
          title="Total Users"
          value={stats?.totalUsers ?? 0}
          icon="👥"
          variant="accent"
        />
        <DashboardCard
          title="Total Stores"
          value={stats?.totalStores ?? 0}
          icon="🏪"
          variant="success"
        />
        <DashboardCard
          title="Total Ratings"
          value={stats?.totalRatings ?? 0}
          icon="⭐"
          variant="warning"
        />
      </div>
    </div>
  );
}
