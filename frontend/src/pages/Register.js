import React, { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { motion } from 'framer-motion';

function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('employee');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  React.useEffect(() => {
    if (user) navigate('/dashboard');
  }, [user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess(false);
    try {
      const res = await fetch('http://localhost:5000/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password, role })
      });
      const data = await res.json();
      if (res.ok) {
        setSuccess(true);
      } else {
        setError(data.message || 'Registration failed');
      }
    } catch (err) {
      setError('Network error');
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #e0eafc 0%, #cfdef3 100%)' }}>
      <motion.div
        initial={{ opacity: 0, y: 32 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="card"
        style={{ width: 400, maxWidth: '90vw', padding: 36 }}
      >
        <h2 style={{ textAlign: 'center', marginBottom: 24 }}>Register</h2>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Name"
            value={name}
            onChange={e => setName(e.target.value)}
            required
            style={{ width: '100%', marginBottom: 14, padding: 10, borderRadius: 6, border: '1px solid #ccc' }}
          />
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
            style={{ width: '100%', marginBottom: 14, padding: 10, borderRadius: 6, border: '1px solid #ccc' }}
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
            style={{ width: '100%', marginBottom: 14, padding: 10, borderRadius: 6, border: '1px solid #ccc' }}
          />
          <select value={role} onChange={e => setRole(e.target.value)} style={{ width: '100%', marginBottom: 18, padding: 10, borderRadius: 6, border: '1px solid #ccc' }}>
            <option value="employee">Employee</option>
            <option value="admin">Admin</option>
          </select>
          <button type="submit" className="animated-btn" style={{ width: '100%', marginBottom: 10 }}>
            Register
          </button>
          {error && <div className="alert-error">{error}</div>}
          {success && <div className="alert-success">Registration successful! You can now login.</div>}
        </form>
        <div style={{ marginTop: '1rem', textAlign: 'center' }}>
          Already have an account? <Link to="/login">Login</Link>
        </div>
      </motion.div>
    </div>
  );
}

export default Register; 