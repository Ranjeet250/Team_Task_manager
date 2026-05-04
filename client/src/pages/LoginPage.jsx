import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-left">
        <div className="auth-brand">
          <div className="brand-icon" style={{ width: 38, height: 38, background: 'linear-gradient(135deg, #7c5cfc, #a78bfa)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 16, color: '#fff' }}>E</div>
          <span style={{ fontWeight: 700, fontSize: '1.1rem' }}>Ethara AI</span>
        </div>
        <h1>Engineer your<br /><span>productivity.</span></h1>
        <p>Experience the next generation of task management. Built for high-performance teams that demand precision and fluid execution.</p>
        <div className="auth-features">
          <div className="auth-feature-card">
            <div className="feat-title">⚡ Ultra Fast</div>
            <div className="feat-desc">Zero latency updates</div>
          </div>
          <div className="auth-feature-card">
            <div className="feat-title">🏢 Enterprise</div>
            <div className="feat-desc">SSO & vault ready</div>
          </div>
        </div>
      </div>
      <div className="auth-right">
        <div className="auth-form-container">
          <h2>Welcome back</h2>
          <p className="auth-subtitle">Enter your credentials to access your workspace.</p>

          {error && <div className="toast error" style={{ position: 'relative', top: 0, right: 0, marginBottom: 16 }}>{error}</div>}

          <form className="auth-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Work Email</label>
              <input className="form-input" type="email" placeholder="name@company.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>
            <div className="form-group">
              <label>Password</label>
              <input className="form-input" type="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} required />
            </div>
            <button className="btn btn-primary" type="submit" disabled={loading}>
              {loading ? 'Signing in...' : 'Login to Ethara AI'}
            </button>
            <div className="form-footer">
              Don't have an account? <Link to="/signup" className="auth-link">Create one</Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
