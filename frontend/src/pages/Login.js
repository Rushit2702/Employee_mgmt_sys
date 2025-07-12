import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { motion } from 'framer-motion';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login, user } = useContext(AuthContext);

  React.useEffect(() => {
    if (user) {
      if (user.role === 'admin') {
        navigate('/dashboard');
      } else {
        navigate('/employee-dashboard');
      }
    }
  }, [user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email, password })
      });
      
      const data = await res.json();
      
      if (res.ok) {
        localStorage.setItem('token', data.token);
        login(data.user, data.sessionId);
        if (data.user.role === 'admin') {
          navigate('/dashboard');
        } else {
          navigate('/employee-dashboard');
        }
      } else {
        setError(data.message || 'Login failed');
      }
    } catch (err) {
      setError('Network error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #e0eafc 0%, #cfdef3 100%)' }}>
      <motion.div
        initial={{ opacity: 0, y: 32 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="card"
        style={{ width: 380, maxWidth: '90vw', padding: 36 }}
      >
        <h2 style={{ textAlign: 'center', marginBottom: 24 }}>Login</h2>
        <form onSubmit={handleSubmit}>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
            disabled={loading}
            style={{ width: '100%', marginBottom: 14, padding: 10, borderRadius: 6, border: '1px solid #ccc' }}
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
            disabled={loading}
            style={{ width: '100%', marginBottom: 18, padding: 10, borderRadius: 6, border: '1px solid #ccc' }}
          />
          <button type="submit" className="animated-btn" disabled={loading} style={{ width: '100%', marginBottom: 10 }}>
            {loading ? 'Logging in...' : 'Login'}
          </button>
          {error && <div className="alert-error">{error}</div>}
        </form>
        <div style={{ marginTop: '1rem', textAlign: 'center' }}>
          Don't have an account? <Link to="/register">Register</Link>
        </div>
      </motion.div>
    </div>
  );
}

export default Login; 