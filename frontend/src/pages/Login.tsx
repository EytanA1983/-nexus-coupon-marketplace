import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../api/client';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const { data } = await apiClient.post('/admin/auth/login', { username, password });
      localStorage.setItem('adminToken', data.data.token);
      navigate('/admin');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app-shell" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ width: '100%', maxWidth: '420px' }}>
        <div className="panel">
          <h1 style={{ textAlign: 'center', marginBottom: '8px', fontSize: '28px', fontWeight: '600' }}>Admin Login</h1>
          <p style={{ textAlign: 'center', marginBottom: '32px', color: 'var(--text-soft)', fontSize: '14px' }}>Sign in to manage coupon products</p>
          <form onSubmit={handleSubmit} className="form-grid">
            {error ? <div className="alert alert-error">{error}</div> : null}
            <div className="form-row">
              <label className="label">Username:</label>
              <input
                type="text"
                className="input"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                placeholder="admin"
              />
            </div>
            <div className="form-row">
              <label className="label">Password:</label>
              <input
                type="password"
                className="input"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="admin123"
              />
            </div>
            <button className="btn btn-primary" type="submit" disabled={loading} style={{ width: '100%', padding: '12px' }}>
              {loading ? 'Logging in...' : 'Login'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
