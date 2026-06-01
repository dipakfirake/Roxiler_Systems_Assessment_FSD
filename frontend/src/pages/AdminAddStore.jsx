import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';

export default function AdminAddStore() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: '',
    email: '',
    address: '',
    ownerId: '',
  });
  const [owners, setOwners] = useState([]);
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [ownersLoading, setOwnersLoading] = useState(true);

  useEffect(() => {
    const fetchOwners = async () => {
      try {
        const res = await api.get('/users', { params: { role: 'store_owner' } });
        setOwners(res.data.users || res.data || []);
      } catch (err) {
        setApiError('Failed to load store owners.');
      } finally {
        setOwnersLoading(false);
      }
    };
    fetchOwners();
  }, []);

  const validate = () => {
    const newErrors = {};
    if (!form.name) newErrors.name = 'Store name is required.';
    if (form.name && form.name.length < 2) newErrors.name = 'Name must be at least 2 characters.';
    if (!form.email) {
      newErrors.email = 'Email is required.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      newErrors.email = 'Please enter a valid email address.';
    }
    if (!form.address) newErrors.address = 'Address is required.';
    if (form.address && form.address.length > 400)
      newErrors.address = 'Address must not exceed 400 characters.';
    if (!form.ownerId) newErrors.ownerId = 'Please select a store owner.';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
    setApiError('');
    setSuccess('');
    if (errors[name]) {
      setErrors({ ...errors, [name]: '' });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setApiError('');
    setSuccess('');

    if (!validate()) return;

    setLoading(true);
    try {
      await api.post('/stores', {
        name: form.name,
        email: form.email,
        address: form.address,
        owner_id: form.ownerId || null,
      });
      setSuccess('Store created successfully!');
      setTimeout(() => navigate('/admin/stores'), 1500);
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to create store.';
      setApiError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container page-wrapper fade-in">
      <div className="page-header">
        <h1>Add New Store</h1>
        <button className="btn btn-secondary" onClick={() => navigate('/admin/stores')}>
          ← Back to Stores
        </button>
      </div>

      <div className="form-container wide">
        {apiError && <div className="alert alert-error">{apiError}</div>}
        {success && <div className="alert alert-success">{success}</div>}

        <form onSubmit={handleSubmit} noValidate>
          <div className="form-group">
            <label className="form-label" htmlFor="name">
              Store Name
            </label>
            <input
              type="text"
              id="name"
              name="name"
              className={`form-input ${errors.name ? 'error' : ''}`}
              placeholder="Enter store name"
              value={form.name}
              onChange={handleChange}
            />
            {errors.name && <div className="form-error">{errors.name}</div>}
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label" htmlFor="email">
                Store Email
              </label>
              <input
                type="email"
                id="email"
                name="email"
                className={`form-input ${errors.email ? 'error' : ''}`}
                placeholder="store@example.com"
                value={form.email}
                onChange={handleChange}
              />
              {errors.email && <div className="form-error">{errors.email}</div>}
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="ownerId">
                Store Owner
              </label>
              {ownersLoading ? (
                <div className="form-input" style={{ color: 'var(--color-text-muted)' }}>
                  Loading owners...
                </div>
              ) : (
                <select
                  id="ownerId"
                  name="ownerId"
                  className={`form-select ${errors.ownerId ? 'error' : ''}`}
                  value={form.ownerId}
                  onChange={handleChange}
                >
                  <option value="">Select an owner</option>
                  {owners.map((owner) => (
                    <option key={owner.id} value={owner.id}>
                      {owner.name} ({owner.email})
                    </option>
                  ))}
                </select>
              )}
              {errors.ownerId && <div className="form-error">{errors.ownerId}</div>}
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="address">
              Store Address
            </label>
            <textarea
              id="address"
              name="address"
              className={`form-textarea ${errors.address ? 'error' : ''}`}
              placeholder="Enter store address"
              value={form.address}
              onChange={handleChange}
              rows={3}
            />
            {errors.address && <div className="form-error">{errors.address}</div>}
            <div className="form-hint">Maximum 400 characters</div>
          </div>

          <button
            type="submit"
            className="btn btn-primary btn-block btn-lg"
            disabled={loading || ownersLoading}
          >
            {loading ? (
              <>
                <span className="spinner"></span>
                Creating Store...
              </>
            ) : (
              'Create Store'
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
