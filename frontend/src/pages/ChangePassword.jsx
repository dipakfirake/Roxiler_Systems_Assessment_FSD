import { useState } from 'react';
import api from '../utils/api';

export default function ChangePassword() {
  const [form, setForm] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const validatePassword = (val) => {
    if (!val) return 'Password is required.';
    if (val.length < 8) return 'Password must be at least 8 characters.';
    if (val.length > 16) return 'Password must not exceed 16 characters.';
    if (!/[A-Z]/.test(val)) return 'Password must contain at least one uppercase letter.';
    if (!/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(val))
      return 'Password must contain at least one special character.';
    return '';
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

  const validateAll = () => {
    const newErrors = {};

    if (!form.oldPassword) {
      newErrors.oldPassword = 'Current password is required.';
    }

    const newPwdErr = validatePassword(form.newPassword);
    if (newPwdErr) {
      newErrors.newPassword = newPwdErr;
    }

    if (!form.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your new password.';
    } else if (form.newPassword !== form.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match.';
    }

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
      await api.put('/auth/change-password', {
        oldPassword: form.oldPassword,
        newPassword: form.newPassword,
      });
      setSuccess('Password changed successfully!');
      setForm({ oldPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to change password.';
      setApiError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container page-wrapper fade-in">
      <div className="page-header">
        <h1>Change Password</h1>
      </div>

      <div className="form-container">
        {apiError && <div className="alert alert-error">{apiError}</div>}
        {success && <div className="alert alert-success">{success}</div>}

        <form onSubmit={handleSubmit} noValidate>
          <div className="form-group">
            <label className="form-label" htmlFor="oldPassword">
              Current Password
            </label>
            <input
              type="password"
              id="oldPassword"
              name="oldPassword"
              className={`form-input ${errors.oldPassword ? 'error' : ''}`}
              placeholder="Enter your current password"
              value={form.oldPassword}
              onChange={handleChange}
              autoComplete="current-password"
            />
            {errors.oldPassword && <div className="form-error">{errors.oldPassword}</div>}
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="newPassword">
              New Password
            </label>
            <input
              type="password"
              id="newPassword"
              name="newPassword"
              className={`form-input ${errors.newPassword ? 'error' : ''}`}
              placeholder="Enter your new password"
              value={form.newPassword}
              onChange={handleChange}
              autoComplete="new-password"
            />
            {errors.newPassword && <div className="form-error">{errors.newPassword}</div>}
            <div className="form-hint">
              8-16 characters, at least 1 uppercase and 1 special character
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="confirmPassword">
              Confirm New Password
            </label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              className={`form-input ${errors.confirmPassword ? 'error' : ''}`}
              placeholder="Confirm your new password"
              value={form.confirmPassword}
              onChange={handleChange}
              autoComplete="new-password"
            />
            {errors.confirmPassword && (
              <div className="form-error">{errors.confirmPassword}</div>
            )}
          </div>

          <button
            type="submit"
            className="btn btn-primary btn-block btn-lg"
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="spinner"></span>
                Updating Password...
              </>
            ) : (
              'Update Password'
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
