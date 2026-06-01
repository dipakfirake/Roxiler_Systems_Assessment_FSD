import { useState, useEffect } from 'react';
import api from '../utils/api';
import StarRating from '../components/StarRating';

export default function UserStores() {
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [order, setOrder] = useState('asc');

  // Rating modal state
  const [ratingModal, setRatingModal] = useState(null);
  const [pendingRating, setPendingRating] = useState(0);
  const [ratingLoading, setRatingLoading] = useState(false);
  const [ratingMessage, setRatingMessage] = useState('');

  const fetchStores = async () => {
    setLoading(true);
    setError('');
    try {
      const params = { sortBy, order };
      if (search) params.search = search;

      const res = await api.get('/stores', { params });
      const list = res.data.stores || res.data || [];
      setStores(list.map(s => ({
        ...s,
        averageRating: s.average_rating ?? s.averageRating ?? 0,
        userRating: s.my_rating ?? s.userRating ?? null,
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
  }, [search]);

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

  const openRatingModal = (store) => {
    setRatingModal(store);
    setPendingRating(store.userRating || 0);
    setRatingMessage('');
  };

  const closeRatingModal = () => {
    setRatingModal(null);
    setPendingRating(0);
    setRatingMessage('');
  };

  const submitRating = async () => {
    if (!pendingRating || pendingRating < 1 || pendingRating > 5) {
      setRatingMessage('Please select a rating between 1 and 5.');
      return;
    }

    setRatingLoading(true);
    setRatingMessage('');
    try {
      await api.post(`/stores/${ratingModal.id}/rate`, { rating: pendingRating });

      // Update the store in the local list
      setStores((prev) =>
        prev.map((s) =>
          s.id === ratingModal.id ? { ...s, userRating: pendingRating } : s
        )
      );

      setRatingMessage('Rating submitted!');
      setTimeout(() => {
        closeRatingModal();
        fetchStores(); // Refresh to get updated averages
      }, 800);
    } catch (err) {
      setRatingMessage(err.response?.data?.message || 'Failed to submit rating.');
    } finally {
      setRatingLoading(false);
    }
  };

  return (
    <div className="container page-wrapper fade-in">
      <div className="page-header">
        <h1>Browse Stores</h1>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      <div className="table-wrapper">
        <div className="table-filters">
          <input
            type="text"
            className="form-input"
            placeholder="Search by name or address..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ flex: 2 }}
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
                <th>Address</th>
                <th
                  className={getSortClass('average_rating')}
                  onClick={() => handleSort('average_rating')}
                >
                  Overall Rating
                </th>
                <th>Your Rating</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {stores.length === 0 ? (
                <tr>
                  <td colSpan={5} className="table-empty">
                    No stores found.
                  </td>
                </tr>
              ) : (
                stores.map((store) => (
                  <tr key={store.id}>
                    <td>{store.name}</td>
                    <td>{store.address || '—'}</td>
                    <td>
                      <StarRating
                        value={store.averageRating || store.rating || 0}
                        readonly
                      />
                    </td>
                    <td>
                      {store.userRating ? (
                        <StarRating value={store.userRating} readonly />
                      ) : (
                        <span style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem' }}>
                          Not rated
                        </span>
                      )}
                    </td>
                    <td>
                      <button
                        className="btn btn-sm btn-outline"
                        onClick={() => openRatingModal(store)}
                      >
                        {store.userRating ? 'Modify' : 'Rate'}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* Rating Modal */}
      {ratingModal && (
        <div className="modal-overlay" onClick={closeRatingModal}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">
                {ratingModal.userRating ? 'Update Rating' : 'Rate Store'}
              </h3>
              <button className="modal-close" onClick={closeRatingModal}>
                ✕
              </button>
            </div>

            <div className="modal-body">
              <p style={{ marginBottom: 'var(--space-md)', color: 'var(--color-text-secondary)' }}>
                How would you rate <strong style={{ color: 'var(--color-text-primary)' }}>{ratingModal.name}</strong>?
              </p>

              <div style={{ display: 'flex', justifyContent: 'center', padding: 'var(--space-lg) 0' }}>
                <StarRating value={pendingRating} onChange={setPendingRating} />
              </div>

              {ratingMessage && (
                <div
                  className={`alert ${
                    ratingMessage.includes('submitted') ? 'alert-success' : 'alert-error'
                  }`}
                  style={{ marginBottom: 0 }}
                >
                  {ratingMessage}
                </div>
              )}
            </div>

            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={closeRatingModal}>
                Cancel
              </button>
              <button
                className="btn btn-primary"
                onClick={submitRating}
                disabled={ratingLoading || !pendingRating}
              >
                {ratingLoading ? (
                  <>
                    <span className="spinner"></span>
                    Submitting...
                  </>
                ) : (
                  'Submit Rating'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
