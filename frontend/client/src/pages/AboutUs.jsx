import React from 'react';
import { Sparkles, HeartHandshake, ShieldCheck } from 'lucide-react';

const AboutUs = () => {
  return (
    <div className="animate-fade-in" style={{ backgroundColor: 'var(--color-cream)', minHeight: '80vh', paddingBottom: '60px' }}>
      {/* Header */}
      <div style={styles.header}>
        <div className="container" style={styles.headerContent}>
          <h1 style={styles.title}>Our Story</h1>
          <p style={styles.subtitle}>Bringing the elegance of handmade Indian craftsmanship to the world.</p>
        </div>
      </div>

      <div className="container" style={styles.content}>
        <div style={styles.textSection}>
          <h2 style={{ fontFamily: 'var(--font-serif)', color: 'var(--color-gold-dark)', marginBottom: '20px' }}>
            The Essence of Selvi's arts & craft
          </h2>
          <p style={{ marginBottom: '20px', color: 'var(--color-text-muted)', fontSize: '1.05rem', lineHeight: 1.8 }}>
            Selvi's arts & craft was born out of a deep passion for traditional artistry and the delicate beauty of handmade accessories. What started as a small, passionate endeavor has blossomed into a premium boutique for exquisite silk thread jewelry, stunning artificial flower venis, and contemporary wire decor.
          </p>
          <p style={{ marginBottom: '20px', color: 'var(--color-text-muted)', fontSize: '1.05rem', lineHeight: 1.8 }}>
            Every single piece you see in our collection is meticulously handcrafted by skilled artisans. We believe that true luxury lies in the details—the perfectly wrapped silk thread, the precisely placed stones, and the careful selection of colors that complement every occasion.
          </p>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '1.05rem', lineHeight: 1.8 }}>
            Whether you are a bride looking for the perfect hair garland, or someone seeking an elegant invisible chain for daily wear, our creations are designed to add a touch of timeless elegance to your life.
          </p>
        </div>

        <div style={styles.valuesGrid}>
          <div style={styles.valueCard}>
            <Sparkles size={40} color="var(--color-gold-light)" style={{ marginBottom: '15px' }} />
            <h3 style={{ marginBottom: '10px' }}>Exquisite Quality</h3>
            <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>We source only the finest materials, ensuring every bangle, necklace, and basket is durable and beautiful.</p>
          </div>
          <div style={styles.valueCard}>
            <HeartHandshake size={40} color="var(--color-gold-light)" style={{ marginBottom: '15px' }} />
            <h3 style={{ marginBottom: '10px' }}>Handmade with Love</h3>
            <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>Mass production is not in our vocabulary. Every item is crafted by hand, carrying the artisan's personal touch.</p>
          </div>
          <div style={styles.valueCard}>
            <ShieldCheck size={40} color="var(--color-gold-light)" style={{ marginBottom: '15px' }} />
            <h3 style={{ marginBottom: '10px' }}>Customer First</h3>
            <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>Your satisfaction is our priority. We offer secure checkout and dedicated support for a seamless experience.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

const styles = {
  header: {
    backgroundColor: 'var(--color-pink-light)',
    padding: '80px 0',
    textAlign: 'center',
    borderBottom: '1px solid #f2e3db'
  },
  headerContent: {
    maxWidth: '800px',
    margin: '0 auto'
  },
  title: {
    fontSize: '3rem',
    color: 'var(--color-gold-dark)',
    marginBottom: '15px'
  },
  subtitle: {
    fontSize: '1.2rem',
    color: 'var(--color-text-main)',
    fontWeight: '300'
  },
  content: {
    marginTop: '60px'
  },
  textSection: {
    maxWidth: '800px',
    margin: '0 auto 60px',
    textAlign: 'center'
  },
  valuesGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
    gap: '30px'
  },
  valueCard: {
    backgroundColor: 'var(--color-white)',
    padding: '40px 30px',
    borderRadius: 'var(--radius-lg)',
    boxShadow: 'var(--shadow-sm)',
    textAlign: 'center'
  }
};

export default AboutUs;
