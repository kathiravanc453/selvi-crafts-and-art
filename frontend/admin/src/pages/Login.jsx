import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { ShieldCheck, Eye, EyeOff } from 'lucide-react';
import toast from 'react-hot-toast';

const Login = () => {
  const { login } = useAuth();
  const [email, setEmail] = useState('admin@selviarts.com');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(email, password);
      toast.success('Welcome back, Admin!');
    } catch (err) {
      toast.error(err.message);
    }
    setLoading(false);
  };

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        {/* Logo */}
        <div style={styles.logo}>
          <div style={styles.iconBox}><ShieldCheck size={28} color="#fff" /></div>
          <div>
            <h1 style={styles.brand}>Selvi's Arts & Craft</h1>
            <p style={styles.brandSub}>Admin Portal</p>
          </div>
        </div>

        <h2 style={styles.title}>Sign in to Dashboard</h2>
        <p style={styles.subtitle}>Only authorized administrators can access this panel.</p>

        <form onSubmit={handleSubmit}>
          <div style={styles.field}>
            <label style={styles.label}>Email Address</label>
            <input
              type="email" value={email} onChange={e => setEmail(e.target.value)}
              required style={styles.input} placeholder="admin@selviarts.com"
            />
          </div>
          <div style={styles.field}>
            <label style={styles.label}>Password</label>
            <div style={{ position: 'relative' }}>
              <input
                type={showPw ? 'text' : 'password'} value={password}
                onChange={e => setPassword(e.target.value)}
                required style={{ ...styles.input, paddingRight: '44px' }} placeholder="Enter admin password"
              />
              <button type="button" onClick={() => setShowPw(!showPw)} style={styles.eyeBtn}>
                {showPw ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>
          <button type="submit" disabled={loading} style={styles.submitBtn}>
            {loading ? 'Signing in...' : '🔐 Sign In to Admin Panel'}
          </button>
        </form>

        <p style={styles.footer}>🛡️ Secured admin access only. Unauthorized access is prohibited.</p>
      </div>
    </div>
  );
};

const styles = {
  page: {
    minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
    background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)', padding: '20px'
  },
  card: {
    background: '#fff', borderRadius: '20px', padding: '48px 40px',
    width: '100%', maxWidth: '420px', boxShadow: '0 25px 60px rgba(0,0,0,0.4)'
  },
  logo: { display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '32px' },
  iconBox: { width: '52px', height: '52px', borderRadius: '14px', background: 'linear-gradient(135deg, #b8860b, #cca34d)', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  brand: { fontFamily: "'Playfair Display', serif", fontSize: '1.1rem', color: '#1a1a2e', margin: 0 },
  brandSub: { fontSize: '0.75rem', color: '#999', margin: '2px 0 0', textTransform: 'uppercase', letterSpacing: '1px' },
  title: { fontFamily: "'Playfair Display', serif", fontSize: '1.5rem', color: '#1a1a2e', marginBottom: '8px' },
  subtitle: { color: '#888', fontSize: '0.85rem', marginBottom: '28px', lineHeight: 1.5 },
  field: { marginBottom: '18px' },
  label: { display: 'block', fontWeight: '600', fontSize: '0.82rem', color: '#555', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.4px' },
  input: {
    width: '100%', padding: '13px 16px', border: '1.5px solid #e8e8e8',
    borderRadius: '10px', fontSize: '0.95rem', outline: 'none', boxSizing: 'border-box', background: '#fafafa'
  },
  eyeBtn: { position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#aaa', display: 'flex' },
  submitBtn: {
    width: '100%', padding: '14px', background: 'linear-gradient(135deg, #8b6914, #cca34d)',
    color: '#fff', border: 'none', borderRadius: '12px', fontSize: '1rem',
    fontWeight: '700', cursor: 'pointer', marginTop: '8px', letterSpacing: '0.3px'
  },
  footer: { textAlign: 'center', fontSize: '0.78rem', color: '#bbb', marginTop: '24px', lineHeight: 1.5 }
};

export default Login;
