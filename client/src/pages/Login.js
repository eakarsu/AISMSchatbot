import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import { FiMail, FiLock, FiLogIn, FiShield } from 'react-icons/fi';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(email, password);
      toast.success('Login successful!');
      navigate('/');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Login failed');
    }
    setLoading(false);
  };

  const fillCredentials = (role) => {
    const creds = {
      admin: { email: 'admin@snapbenefits.gov', password: 'password123' },
      caseworker: { email: 'caseworker@snapbenefits.gov', password: 'password123' },
      reviewer: { email: 'reviewer@snapbenefits.gov', password: 'password123' },
    };
    setEmail(creds[role].email);
    setPassword(creds[role].password);
  };

  return (
    <div className="login-page">
      <div className="login-container">
        <div className="login-left">
          <div className="login-branding">
            <div className="login-logo">🏛️</div>
            <h1>SNAP Benefits<br />Administration System</h1>
            <p>Streamlining public benefits access for those who need it most. Our platform simplifies the application process, reduces barriers, and ensures eligible families receive timely assistance.</p>
            <div className="login-features">
              <div className="feature-item"><FiShield /> Secure & Compliant</div>
              <div className="feature-item"><FiShield /> AI-Powered Eligibility</div>
              <div className="feature-item"><FiShield /> Case Management</div>
              <div className="feature-item"><FiShield /> Real-time Analytics</div>
            </div>
          </div>
        </div>
        <div className="login-right">
          <form className="login-form" onSubmit={handleSubmit}>
            <h2>Welcome Back</h2>
            <p className="login-subtitle">Sign in to your account</p>
            <div className="form-group">
              <label><FiMail /> Email</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Enter your email" required />
            </div>
            <div className="form-group">
              <label><FiLock /> Password</label>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Enter your password" required />
            </div>
            <button type="submit" className="btn btn-primary btn-full" disabled={loading}>
              <FiLogIn /> {loading ? 'Signing in...' : 'Sign In'}
            </button>
            <div className="quick-login">
              <p>Quick Login:</p>
              <div className="quick-login-buttons">
                <button type="button" className="btn btn-outline" onClick={() => fillCredentials('admin')}>Admin</button>
                <button type="button" className="btn btn-outline" onClick={() => fillCredentials('caseworker')}>Caseworker</button>
                <button type="button" className="btn btn-outline" onClick={() => fillCredentials('reviewer')}>Reviewer</button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
