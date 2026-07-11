import React from 'react';
import { Mail, Phone, MapPin } from 'lucide-react';
import toast from 'react-hot-toast';

const Contact = () => {
  return (
    <div className="animate-fade-in" style={{ padding: '60px 20px' }}>
      <div className="container">
        <div style={{ textAlign: 'center', marginBottom: '50px' }}>
          <h1 style={{ fontSize: '2.5rem', color: 'var(--color-gold-dark)', fontFamily: 'var(--font-serif)' }}>Contact Us</h1>
          <div style={{ height: '2px', width: '60px', backgroundColor: 'var(--color-pink-accent)', margin: '15px auto' }}></div>
          <p style={{ color: 'var(--color-text-muted)' }}>We'd love to hear from you. Please reach out with any questions or custom requests.</p>
        </div>

        <div style={styles.layout}>
          <div style={styles.infoSection}>
            <div style={styles.infoCard}>
              <div style={styles.iconBox}><Phone size={24} color="white" /></div>
              <h3>Phone</h3>
              <p style={{ color: 'var(--color-text-muted)' }}>+91 70931 30724</p>
              <p style={{ fontSize: '0.8rem', color: '#999' }}>Mon-Fri, 9am - 6pm</p>
            </div>
            <div style={styles.infoCard}>
              <div style={styles.iconBox}><Mail size={24} color="white" /></div>
              <h3>Email</h3>
              <p style={{ color: 'var(--color-text-muted)' }}>support@selviarts.com</p>
              <p style={{ fontSize: '0.8rem', color: '#999' }}>We reply within 24 hrs</p>
            </div>
            <div style={styles.infoCard}>
              <div style={styles.iconBox}><MapPin size={24} color="white" /></div>
              <h3>Studio</h3>
              <p style={{ color: 'var(--color-text-muted)' }}>123 Craft Avenue, Creativity City</p>
              <p style={{ fontSize: '0.8rem', color: '#999' }}>By appointment only</p>
            </div>
          </div>

          <div style={styles.formSection}>
            <h2 style={{ fontFamily: 'var(--font-serif)', marginBottom: '20px' }}>Send us a Message</h2>
            <form style={styles.form} onSubmit={e => { e.preventDefault(); toast.success('Message sent!'); }}>
              <div style={styles.inputGroup}>
                <label style={styles.label}>Name</label>
                <input type="text" style={styles.input} required />
              </div>
              <div style={styles.inputGroup}>
                <label style={styles.label}>Email</label>
                <input type="email" style={styles.input} required />
              </div>
              <div style={styles.inputGroup}>
                <label style={styles.label}>Subject</label>
                <input type="text" style={styles.input} required />
              </div>
              <div style={styles.inputGroup}>
                <label style={styles.label}>Message</label>
                <textarea rows="5" style={styles.input} required></textarea>
              </div>
              <button type="submit" className="btn-primary" style={{ width: '100%', padding: '15px' }}>
                Send Message
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

const styles = {
  layout: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '50px',
    alignItems: 'flex-start'
  },
  infoSection: {
    flex: '1 1 300px',
    display: 'flex',
    flexDirection: 'column',
    gap: '20px'
  },
  infoCard: {
    backgroundColor: 'var(--color-cream)',
    padding: '30px',
    borderRadius: 'var(--radius-lg)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    textAlign: 'center',
    gap: '10px'
  },
  iconBox: {
    backgroundColor: 'var(--color-gold-light)',
    width: '60px',
    height: '60px',
    borderRadius: '50%',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: '10px'
  },
  formSection: {
    flex: '2 1 400px',
    backgroundColor: 'var(--color-white)',
    padding: '40px',
    borderRadius: 'var(--radius-lg)',
    boxShadow: 'var(--shadow-md)'
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px'
  },
  inputGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px'
  },
  label: {
    fontSize: '0.9rem',
    fontWeight: '500',
    color: 'var(--color-text-main)'
  },
  input: {
    // using global styles from index.css mostly, but ensure bg is white
    backgroundColor: '#fff'
  }
};

export default Contact;
