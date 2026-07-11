import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const LoginRegister = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const url = isLogin ? '/api/auth/login' : '/api/auth/register';
    const payload = isLogin 
      ? { email: formData.email, password: formData.password }
      : formData;

    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      
      if (res.ok) {
        login(data.token, data.user);
        navigate('/');
      } else {
        setError(data.error || 'Authentication failed');
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
    }
  };

  return (
    <div className="container animate-fade-in" style={styles.page}>
      <div style={styles.card}>
        <div style={styles.header}>
          <button 
            style={{ ...styles.tabBtn, borderBottom: isLogin ? '2px solid var(--color-gold-dark)' : 'none', color: isLogin ? 'var(--color-gold-dark)' : 'var(--color-text-muted)' }}
            onClick={() => setIsLogin(true)}
          >
            Login
          </button>
          <button 
            style={{ ...styles.tabBtn, borderBottom: !isLogin ? '2px solid var(--color-gold-dark)' : 'none', color: !isLogin ? 'var(--color-gold-dark)' : 'var(--color-text-muted)' }}
            onClick={() => setIsLogin(false)}
          >
            Register
          </button>
        </div>

        <div style={styles.formContainer}>
          <h2 style={{ fontFamily: 'var(--font-serif)', marginBottom: '20px', color: 'var(--color-text-main)' }}>
            {isLogin ? 'Welcome Back' : 'Create an Account'}
          </h2>
          
          {error && <div style={styles.error}>{error}</div>}

          <form onSubmit={handleSubmit} style={styles.form}>
            {!isLogin && (
              <div style={styles.inputGroup}>
                <label style={styles.label}>Full Name</label>
                <input type="text" name="name" value={formData.name} onChange={handleChange} required={!isLogin} style={styles.input} />
              </div>
            )}
            <div style={styles.inputGroup}>
              <label style={styles.label}>Email Address</label>
              <input type="email" name="email" value={formData.email} onChange={handleChange} required style={styles.input} />
            </div>
            <div style={styles.inputGroup}>
              <label style={styles.label}>Password</label>
              <input type="password" name="password" value={formData.password} onChange={handleChange} required style={styles.input} />
            </div>

            <button type="submit" className="btn-primary" style={{ width: '100%', padding: '12px', marginTop: '10px' }}>
              {isLogin ? 'Sign In' : 'Register'}
            </button>
          </form>
          
          {isLogin && (
            <div style={{ textAlign: 'center', marginTop: '15px' }}>
              <a href="#" style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>Forgot your password?</a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const styles = {
  page: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '70vh',
    padding: '40px 20px',
    backgroundColor: 'var(--color-off-white)'
  },
  card: {
    width: '100%',
    maxWidth: '400px',
    backgroundColor: 'var(--color-white)',
    borderRadius: 'var(--radius-lg)',
    boxShadow: 'var(--shadow-md)',
    overflow: 'hidden'
  },
  header: {
    display: 'flex',
    borderBottom: '1px solid #eee'
  },
  tabBtn: {
    flex: 1,
    padding: '15px',
    backgroundColor: 'transparent',
    border: 'none',
    fontSize: '1.1rem',
    fontFamily: 'var(--font-sans)',
    fontWeight: '500',
    cursor: 'pointer'
  },
  formContainer: {
    padding: '30px'
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '15px'
  },
  inputGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '5px'
  },
  label: {
    fontSize: '0.9rem',
    color: 'var(--color-text-main)',
    fontWeight: '500'
  },
  input: {
    backgroundColor: '#fff'
  },
  error: {
    padding: '10px',
    backgroundColor: '#fff1f0',
    color: '#cf1322',
    border: '1px solid #ffa39e',
    borderRadius: 'var(--radius-sm)',
    marginBottom: '15px',
    fontSize: '0.9rem'
  }
};

export default LoginRegister;
