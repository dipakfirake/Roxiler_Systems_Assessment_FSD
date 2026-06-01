import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../utils/api';

const validators = {
  name: (val) => {
    if (!val) return 'Name is required.';
    if (val.length < 20) return 'Name must be at least 20 characters.';
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
};

export default function Signup() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    address: '',
  });
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
    setApiError('');

    // Validate on change
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

    if (!validateAll()) return;

    setLoading(true);
    try {
      await api.post('/auth/signup', form);
      navigate('/login', {
        state: { message: 'Account created successfully! Please sign in.' },
      });
    } catch (err) {
      const message = err.response?.data?.message || 'Registration failed. Please try again.';
      setApiError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-logo">
          <div className="auth-logo-icon">★</div>
          <h1>Create Account</h1>
          <p>Join the Store Rating Platform</p>
        </div>

        <div className="form-container">
          {apiError && <div className="alert alert-error">{apiError}</div>}

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
                placeholder="Enter your full name"
                value={form.name}
                onChange={handleChange}
                onBlur={handleBlur}
              />
              {errors.name && <div className="form-error">{errors.name}</div>}
              <div className="form-hint">Between 20 and 60 characters</div>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="email">
                Email Address
              </label>
              <input
                type="email"
                id="email"
                name="email"
                className={`form-input ${errors.email ? 'error' : ''}`}
                placeholder="you@example.com"
                value={form.email}
                onChange={handleChange}
                onBlur={handleBlur}
              />
              {errors.email && <div className="form-error">{errors.email}</div>}
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
                placeholder="Create a strong password"
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
                placeholder="Enter your address"
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
                  Creating Account...
                </>
              ) : (
                'Create Account'
              )}
            </button>
          </form>
        </div>

        <div className="auth-footer">
          Already have an account? <Link to="/login">Sign in</Link>
        </div>
      </div>
    </div>
  );
}
