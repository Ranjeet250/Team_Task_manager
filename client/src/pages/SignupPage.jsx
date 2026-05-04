import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function SignupPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { signup } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await signup(name, email, password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Signup failed');
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
        <h1>Start building<br /><span>together.</span></h1>
        <p>Join thousands of teams using Ethara AI to ship faster with clarity, structure, and real-time collaboration.</p>
        <div className="auth-features">
          <div className="auth-feature-card">
            <div className="feat-title">👥 Team-first</div>
            <div className="feat-desc">Role-based access</div>
          </div>
          <div className="auth-feature-card">
            <div className="feat-title">📊 Insights</div>
            <div className="feat-desc">Real-time dashboards</div>
          </div>
        </div>
      </div>
      <div className="auth-right">
        <div className="auth-form-container">
          <h2>Create your account</h2>
          <p className="auth-subtitle">Set up your workspace in seconds.</p>

          {error && <div className="toast error" style={{ position: 'relative', top: 0, right: 0, marginBottom: 16 }}>{error}</div>}

          <form className="auth-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Full Name</label>
              <input className="form-input" type="text" placeholder="John Doe" value={name} onChange={(e) => setName(e.target.value)} required />
            </div>
            <div className="form-group">
              <label>Work Email</label>
              <input className="form-input" type="email" placeholder="name@company.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>
            <div className="form-group">
              <label>Password</label>
              <input className="form-input" type="password" placeholder="Min. 6 characters" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} />
            </div>
            <button className="btn btn-primary" type="submit" disabled={loading}>
              {loading ? 'Creating account...' : 'Get Started'}
            </button>
            <div className="form-footer">
              Already have an account? <Link to="/login" className="auth-link">Sign in</Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
