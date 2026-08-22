import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

const API_BASE = import.meta.env.VITE_API_URL || (typeof window !== 'undefined' && window.location.hostname.includes('localhost') ? '' : 'https://selvi-crafts-and-art.onrender.com');

const Categories = () => {
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    const loadCats = () => {
      const saved = localStorage.getItem('shared_categories');
      if (saved) {
        try { setCategories(JSON.parse(saved)); } catch(e){}
      }
    };
    loadCats();

    fetch(`${API_BASE}/api/categories`)
      .then(res => (res.ok && res.headers.get('content-type')?.includes('application/json')) ? res.json() : null)
      .then(data => {
        if (Array.isArray(data)) {
          setCategories(data);
          localStorage.setItem('shared_categories', JSON.stringify(data));
        }
      })
      .catch(console.error);

    try {
      const bc = new BroadcastChannel('selvi_store_sync');
      bc.onmessage = (event) => {
        if (event.data?.type === 'CATEGORIES_UPDATED' && Array.isArray(event.data.data)) {
          setCategories(event.data.data);
        }
      };
      return () => bc.close();
    } catch(e){}
  }, []);

  return (
    <div className="container animate-fade-in" style={{ padding: '60px 20px' }}>
      <div style={{ textAlign: 'center', marginBottom: '50px' }}>
        <h1 style={{ fontSize: '2.5rem', color: 'var(--color-gold-dark)', fontFamily: 'var(--font-serif)' }}>Our Collections</h1>
        <div style={{ height: '2px', width: '60px', backgroundColor: 'var(--color-pink-accent)', margin: '15px auto' }}></div>
        <p style={{ color: 'var(--color-text-muted)' }}>Browse our exquisitely handcrafted selections by category.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '40px' }}>
        {categories.map(cat => (
          <div key={cat.id} style={styles.card}>
            <div style={styles.imageWrapper}>
              <img src={cat.image_url} alt={cat.name} style={styles.image} />
            </div>
            <div style={styles.content}>
              <h2 style={styles.title}>{cat.name}</h2>
              <p style={styles.desc}>{cat.description}</p>
              <Link to={`/shop?category=${cat.slug}`} className="btn-outline">
                Explore Collection
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const styles = {
  card: {
    backgroundColor: 'var(--color-white)',
    borderRadius: 'var(--radius-lg)',
    overflow: 'hidden',
    boxShadow: 'var(--shadow-sm)',
    display: 'flex',
    flexDirection: 'column'
  },
  imageWrapper: {
    width: '100%',
    aspectRatio: '4/3',
    overflow: 'hidden'
  },
  image: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    transition: 'transform var(--transition-smooth)'
  },
  content: {
    padding: '30px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
    flex: 1
  },
  title: {
    fontSize: '1.6rem',
    marginBottom: '10px'
  },
  desc: {
    color: 'var(--color-text-muted)',
    marginBottom: '25px',
    lineHeight: 1.6,
    flex: 1
  }
};

export default Categories;
