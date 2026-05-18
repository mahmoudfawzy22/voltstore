import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './AuthPages.css';

const RegisterPage = () => {
  const { register, loading } = useAuth();
  const navigate              = useNavigate();

  const [form, setForm]     = useState({ name: '', email: '', password: '', confirm: '' });
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState('');

  const validate = () => {
    const errs = {};
    if (!form.name || form.name.trim().length < 2) errs.name = 'Name must be at least 2 characters';
    if (!form.email)    errs.email    = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(form.email)) errs.email = 'Enter a valid email';
    if (!form.password) errs.password = 'Password is required';
    else if (form.password.length < 6) errs.password = 'Password must be at least 6 characters';
    if (form.password !== form.confirm) errs.confirm = 'Passwords do not match';
    return errs;
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: '' });
    setApiError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }

    const result = await register(form.name.trim(), form.email, form.password);
    if (result.success) {
      navigate('/');
    } else {
      setApiError(result.message);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card card fade-in">
        <div className="auth-header">
          <img src="/logo.svg" alt="VoltStore" className="auth-logo-img" />
          <h1 className="auth-title">Create account</h1>
          <p className="auth-subtitle">Join VoltStore today — it's free</p>
        </div>

        {apiError && <div className="alert alert-error">{apiError}</div>}

        <form onSubmit={handleSubmit} noValidate>
          <div className="form-group">
            <label htmlFor="name">Full name</label>
            <input
              id="name" name="name" type="text"
              autoComplete="name"
              value={form.name} onChange={handleChange}
              placeholder="Jane Smith"
              className={errors.name ? 'input-error' : ''}
            />
            {errors.name && <span className="error-text">{errors.name}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="email">Email address</label>
            <input
              id="email" name="email" type="email"
              autoComplete="email"
              value={form.email} onChange={handleChange}
              placeholder="you@example.com"
              className={errors.email ? 'input-error' : ''}
            />
            {errors.email && <span className="error-text">{errors.email}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              id="password" name="password" type="password"
              autoComplete="new-password"
              value={form.password} onChange={handleChange}
              placeholder="Min. 6 characters"
              className={errors.password ? 'input-error' : ''}
            />
            {errors.password && <span className="error-text">{errors.password}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="confirm">Confirm password</label>
            <input
              id="confirm" name="confirm" type="password"
              autoComplete="new-password"
              value={form.confirm} onChange={handleChange}
              placeholder="Repeat password"
              className={errors.confirm ? 'input-error' : ''}
            />
            {errors.confirm && <span className="error-text">{errors.confirm}</span>}
          </div>

          <button type="submit" className="btn btn-primary btn-full" disabled={loading}>
            {loading ? 'Creating account…' : 'Create Account'}
          </button>
        </form>

        <p className="auth-switch">
          Already have an account? <Link to="/login">Sign in</Link>
        </p>
      </div>
    </div>
  );
};

export default RegisterPage;
