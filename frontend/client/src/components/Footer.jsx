import React from 'react';
import { Link } from 'react-router-dom';
import { Instagram, Facebook, Twitter, Mail } from 'lucide-react';

const Footer = () => {
  return (
    <footer style={styles.footer}>
      <div className="container" style={styles.container}>
        <div style={styles.column}>
          <h3 style={styles.brand}>Selvi's arts & craft</h3>
          <p style={styles.text}>
            Premium handmade jewelry, home decor, and authentic Indian hair accessories designed to celebrate elegance and craft.
          </p>
          <div style={styles.socials}>
            <a href="#" style={styles.socialIcon}><Instagram size={20} /></a>
            <a href="#" style={styles.socialIcon}><Facebook size={20} /></a>
            <a href="#" style={styles.socialIcon}><Twitter size={20} /></a>
          </div>
        </div>


        <div style={styles.column}>
          <h4 style={styles.heading}>Customer Care</h4>
          <Link to="#" style={styles.link}>Shipping Policy</Link>
          <Link to="#" style={styles.link}>Returns & Refunds</Link>
          <Link to="#" style={styles.link}>FAQ</Link>
          <Link to="/contact" style={styles.link}>Track Order</Link>
        </div>


      </div>
      <div style={styles.bottom}>
        <p>&copy; {new Date().getFullYear()} Selvi's arts & craft. All rights reserved.</p>
      </div>
    </footer>
  );
};

const styles = {
  footer: {
    backgroundColor: 'var(--color-off-white)',
    borderTop: '1px solid #f1f1f1',
    paddingTop: '60px',
    marginTop: '60px'
  },
  container: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '40px',
    marginBottom: '40px'
  },
  column: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px'
  },
  brand: {
    fontFamily: 'var(--font-serif)',
    fontSize: '1.4rem',
    color: 'var(--color-gold-dark)',
    marginBottom: '8px'
  },
  text: {
    color: 'var(--color-text-muted)',
    fontSize: '0.9rem',
    lineHeight: '1.6'
  },
  socials: {
    display: 'flex',
    gap: '15px',
    marginTop: '10px'
  },
  socialIcon: {
    color: 'var(--color-text-main)',
  },
  heading: {
    fontSize: '1.1rem',
    fontFamily: 'var(--font-sans)',
    fontWeight: '600',
    marginBottom: '10px'
  },
  link: {
    color: 'var(--color-text-muted)',
    fontSize: '0.95rem',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
    marginTop: '10px'
  },
  input: {
    padding: '12px',
    border: '1px solid #e1e1e1',
    borderRadius: '4px',
    outline: 'none'
  },
  bottom: {
    textAlign: 'center',
    padding: '20px 0',
    borderTop: '1px solid #eee',
    color: 'var(--color-text-muted)',
    fontSize: '0.85rem'
  }
};

export default Footer;
