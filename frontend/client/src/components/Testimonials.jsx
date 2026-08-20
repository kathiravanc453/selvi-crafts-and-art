import React from 'react';
import { Star } from 'lucide-react';

const REVIEWS = [
  { id: 1, name: "Priya S.", comment: "The silk thread bangles are absolutely gorgeous! Will definitely buy more." },
  { id: 2, name: "Anita K.", comment: "Beautiful craftsmanship. The invisible chain looks so elegant!" },
  { id: 3, name: "Lakshmi M.", comment: "Received my artificial jasmine flower set today. It looks so real!" },
  { id: 4, name: "Divya R.", comment: "Fast shipping and amazing quality. Highly recommend Selvi's Arts!" },
  { id: 5, name: "Meera V.", comment: "I love the detailed work on the jewelry. Truly premium." },
  { id: 6, name: "Sneha T.", comment: "Perfect for weddings. The gold finish is perfect and doesn't fade." }
];

const Testimonials = () => {
  return (
    <section style={styles.section}>
      <div style={styles.header}>
        <h2 style={styles.title}>What Our Customers Say</h2>
        <div style={styles.divider}></div>
      </div>
      
      <div style={styles.marqueeContainer}>
        <div className="marquee-content">
          {/* First set of reviews */}
          {REVIEWS.map(review => (
            <div key={`a-${review.id}`} style={styles.card}>
              <div style={styles.stars}>
                {[...Array(5)].map((_, i) => <Star key={i} size={16} fill="#cca34d" color="#cca34d" />)}
              </div>
              <p style={styles.comment}>"{review.comment}"</p>
              <p style={styles.name}>- {review.name}</p>
            </div>
          ))}
          {/* Duplicate set of reviews for seamless infinite scrolling */}
          {REVIEWS.map(review => (
            <div key={`b-${review.id}`} style={styles.card}>
              <div style={styles.stars}>
                {[...Array(5)].map((_, i) => <Star key={i} size={16} fill="#cca34d" color="#cca34d" />)}
              </div>
              <p style={styles.comment}>"{review.comment}"</p>
              <p style={styles.name}>- {review.name}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

const styles = {
  section: {
    padding: '60px 0',
    backgroundColor: '#fff',
    overflow: 'hidden'
  },
  header: {
    textAlign: 'center',
    marginBottom: '40px',
    padding: '0 20px'
  },
  title: {
    fontFamily: 'var(--font-serif)',
    fontSize: '2rem',
    color: 'var(--color-gold-dark)'
  },
  divider: {
    height: '3px',
    width: '60px',
    backgroundColor: 'var(--color-gold-light)',
    margin: '15px auto 0'
  },
  marqueeContainer: {
    display: 'flex',
    width: '100%',
    overflow: 'hidden',
    position: 'relative'
  },
  card: {
    flexShrink: 0,
    width: '300px',
    backgroundColor: 'var(--color-off-white)',
    padding: '24px',
    borderRadius: '12px',
    margin: '0 15px',
    boxShadow: '0 4px 15px rgba(0,0,0,0.03)',
    display: 'flex',
    flexDirection: 'column',
    gap: '12px'
  },
  stars: {
    display: 'flex',
    gap: '4px'
  },
  comment: {
    fontStyle: 'italic',
    color: '#555',
    fontSize: '0.95rem',
    lineHeight: '1.5'
  },
  name: {
    fontWeight: 'bold',
    color: 'var(--color-gold-dark)',
    fontSize: '0.9rem',
    marginTop: 'auto'
  }
};

export default Testimonials;
