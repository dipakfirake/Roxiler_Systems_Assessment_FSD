import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';

const validators = {
  name: (val) => {
    if (!val) return 'Name is required.';
    if (val.length < 2) return 'Name must be at least 2 characters.';
    if (val.length > 60) return 'Name must not exceed 60 characters.';
    return '';
  },
  email: (val) => {
    if (!val) return 'Email is required.';
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(val)) return 'Please enter a valid email address.';
    return '';
  },
  password: (val) => {
    if (!val) return 'Password is required.';
    if (val.length < 8) return 'Password must be at least 8 characters.';
    if (val.length > 16) return 'Password must not exceed 16 characters.';
    if (!/[A-Z]/.test(val)) return 'Password must contain at least one uppercase letter.';
    if (!/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(val))
      return 'Password must contain at least one special character.';
    return '';
  },
  address: (val) => {
    if (!val) return 'Address is required.';
    if (val.length > 400) return 'Address must not exceed 400 characters.';
    return '';
  },
  role: (val) => {
    if (!val) return 'Role is required.';
    return '';
  },
};

export default function AdminAddUser() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    address: '',
    role: '',
  });
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
    setApiError('');
    setSuccess('');

    if (errors[name]) {
      setErrors({ ...errors, [name]: validators[name](value) });
    }
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    setErrors({ ...errors, [name]: validators[name](value) });
  };

  const validateAll = () => {
    const newErrors = {};
    Object.keys(form).forEach((key) => {
      const err = validators[key](form[key]);
      if (err) newErrors[key] = err;
    });
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setApiError('');
    setSuccess('');

    if (!validateAll()) return;

    setLoading(true);
    try {
      await api.post('/users', form);
      setSuccess('User created successfully!');
      setTimeout(() => navigate('/admin/users'), 1500);
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to create user.';
      setApiError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container page-wrapper fade-in">
      <div className="page-header">
        <h1>Add New User</h1>
        <button className="btn btn-secondary" onClick={() => navigate('/admin/users')}>
          ← Back to Users
        </button>
      </div>

      <div className="form-container wide">
        {apiError && <div className="alert alert-error">{apiError}</div>}
        {success && <div className="alert alert-success">{success}</div>}

        <form onSubmit={handleSubmit} noValidate>
          <div className="form-group">
            <label className="form-label" htmlFor="name">
              Full Name
            </label>
            <input
              type="text"
              id="name"
              name="name"
              className={`form-input ${errors.name ? 'error' : ''}`}
              placeholder="Enter full name"
              value={form.name}
              onChange={handleChange}
              onBlur={handleBlur}
            />
            {errors.name && <div className="form-error">{errors.name}</div>}
            <div className="form-hint">Between 2 and 60 characters</div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label" htmlFor="email">
                Email Address
              </label>
              <input
                type="email"
                id="email"
                name="email"
                className={`form-input ${errors.email ? 'error' : ''}`}
                placeholder="user@example.com"
                value={form.email}
                onChange={handleChange}
                onBlur={handleBlur}
              />
              {errors.email && <div className="form-error">{errors.email}</div>}
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="role">
                Role
              </label>
              <select
                id="role"
                name="role"
                className={`form-select ${errors.role ? 'error' : ''}`}
                value={form.role}
                onChange={handleChange}
                onBlur={handleBlur}
              >
                <option value="">Select a role</option>
                <option value="admin">Admin</option>
                <option value="user">User</option>
                <option value="store_owner">Store Owner</option>
              </select>
              {errors.role && <div className="form-error">{errors.role}</div>}
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="password">
              Password
            </label>
            <input
              type="password"
              id="password"
              name="password"
              className={`form-input ${errors.password ? 'error' : ''}`}
              placeholder="Create a password"
              value={form.password}
              onChange={handleChange}
              onBlur={handleBlur}
            />
            {errors.password && <div className="form-error">{errors.password}</div>}
            <div className="form-hint">
              8-16 characters, at least 1 uppercase and 1 special character
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="address">
              Address
            </label>
            <textarea
              id="address"
              name="address"
              className={`form-textarea ${errors.address ? 'error' : ''}`}
              placeholder="Enter address"
              value={form.address}
              onChange={handleChange}
              onBlur={handleBlur}
              rows={3}
            />
            {errors.address && <div className="form-error">{errors.address}</div>}
            <div className="form-hint">Maximum 400 characters</div>
          </div>

          <button
            type="submit"
            className="btn btn-primary btn-block btn-lg"
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="spinner"></span>
                Creating User...
              </>
            ) : (
              'Create User'
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
