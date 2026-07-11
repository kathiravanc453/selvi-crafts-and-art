import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import ProductCard from '../components/ProductCard';
import Testimonials from '../components/Testimonials';

const Home = () => {
  const [banners, setBanners] = useState([]);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    fetch('/api/banners')
      .then(res => res.json())
      .then(data => setBanners(data))
      .catch(console.error);

    fetch('/api/categories')
      .then(res => res.json())
      .then(data => setCategories(data))
      .catch(console.error);

    fetch('/api/products')
      .then(res => res.json())
      .then(data => setProducts(data))
      .catch(console.error);
  }, []);

  useEffect(() => {
    if (banners.length > 1) {
      const interval = setInterval(() => {
        setCurrentSlide(prev => (prev + 1) % banners.length);
      }, 3000);
      return () => clearInterval(interval);
    }
  }, [banners.length]);

  return (
    <div className="animate-fade-in">
      {/* Hero Section Carousel */}
      {banners.length > 0 && (
        <section className="hero-mobile" style={{ position: 'relative', overflow: 'hidden' }}>
          <div style={{ 
            display: 'flex', 
            transition: 'transform 0.5s ease-in-out',
            transform: `translateX(-${currentSlide * 100}%)`
          }}>
            {banners.map((banner, index) => (
              <div key={banner.id || index} style={{ ...styles.hero, backgroundImage: `url(${banner.image_url})`, minWidth: '100%', flexShrink: 0 }}>
                <div style={styles.heroOverlay}>
                  <div style={styles.heroContent}>
                    <h1 className="hero-title-mobile" style={styles.heroTitle}>{banner.title || 'Elegance Redefined'}</h1>
                    <p style={styles.heroSubtitle}>{banner.subtitle || 'Exquisite Handmade Silk Thread\nJewellery & Accessories'}</p>
                    <Link to={banner.link || "/shop"} className="btn-primary" style={styles.heroBtn}>
                      SHOP NOW
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Dots Indicator */}
          {banners.length > 1 && (
            <div style={styles.dotsContainer}>
              {banners.map((_, idx) => (
                <button 
                  key={idx} 
                  onClick={() => setCurrentSlide(idx)}
                  style={{
                    ...styles.dot,
                    backgroundColor: currentSlide === idx ? '#cca34d' : 'rgba(255,255,255,0.6)'
                  }}
                />
              ))}
            </div>
          )}
        </section>
      )}

      {/* Collections / Featured Categories */}
      <section className="container" style={{ ...styles.section, padding: '40px 16px' }}>
        <div style={{ marginBottom: '20px' }}>
          <h2 style={{ fontSize: '1.4rem', fontFamily: 'var(--font-sans)', fontWeight: '600' }}>Collections</h2>
        </div>
        <div style={styles.categoryGrid}>
          {categories.map(cat => (
            <Link to={`/shop?category=${cat.slug}`} key={cat.id} style={styles.categoryCard}>
              <div style={styles.categoryImgWrapper}>
                <img src={cat.image_url} alt={cat.name} style={styles.categoryImg} />
              </div>
              <div style={styles.categoryTitleWrapper}>
                <span>{cat.name}</span>
                <span style={{ fontSize: '1.2rem', lineHeight: '1' }}>➔</span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* New Arrivals */}
      <section className="container" style={styles.section}>
        <div style={styles.sectionHeader}>
          <h2>New Arrivals</h2>
          <div style={styles.divider}></div>
        </div>
        <div style={styles.productGrid}>
          {products.slice(0, 4).map(product => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
        <div style={{ textAlign: 'center', marginTop: '40px' }}>
          <Link to="/shop" className="btn-outline">View All Products</Link>
        </div>
      </section>

      {/* Narrative Section */}
      <section style={styles.narrativeSection}>
        <div className="container flex-col-mobile" style={styles.narrativeContainer}>
          <div style={styles.narrativeContent}>
            <h2 style={{ fontFamily: 'var(--font-serif)', color: 'var(--color-gold-dark)', marginBottom: '20px' }}>Crafting Elegance</h2>
            <p style={{ color: 'var(--color-text-muted)', marginBottom: '20px' }}>
              At Selvi's arts & craft, we believe in the beauty of handmade artistry. Every piece is carefully crafted with premium materials, bringing you exquisite jewelry and decor that tells a story.
            </p>
            <Link to="/about" className="btn-secondary">Our Story</Link>
          </div>
          <div style={styles.narrativeImage}>
            {/* Displaying one of the banners or a static image here */}
            {banners.length > 1 ? (
               <img src={banners[1].image_url} alt="Our Craft" style={{ width: '100%', borderRadius: 'var(--radius-lg)' }} />
            ) : (
               <div style={{ width: '100%', height: '300px', backgroundColor: 'var(--color-pink-soft)', borderRadius: 'var(--radius-lg)' }}></div>
            )}
          </div>
        </div>
      </section>

      {/* Testimonials Marquee */}
      <Testimonials />
    </div>
  );
};

const styles = {
  hero: {
    height: '65vh',
    minHeight: '450px',
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    position: 'relative'
  },
  heroOverlay: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '24px' /* Adds the space around the white box */
  },
  heroContent: {
    width: '100%',
    padding: '20px',
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
    borderRadius: '8px',
    textAlign: 'left'
  },
  heroTitle: {
    fontSize: '2rem',
    color: 'var(--color-gold-dark)',
    marginBottom: '6px',
    fontFamily: 'var(--font-serif)',
    lineHeight: 1.15
  },
  heroSubtitle: {
    fontSize: '0.9rem',
    color: '#444',
    marginBottom: '15px',
    lineHeight: 1.4
  },
  heroBtn: {
    backgroundColor: '#cca34d',
    color: '#fff',
    padding: '10px 20px',
    borderRadius: '6px',
    fontSize: '0.85rem',
    fontWeight: '700',
    letterSpacing: '0.5px',
    border: 'none',
    cursor: 'pointer'
  },
  dotsContainer: {
    position: 'absolute',
    bottom: '20px',
    left: '0',
    right: '0',
    display: 'flex',
    justifyContent: 'center',
    gap: '8px',
    zIndex: 10
  },
  dot: {
    width: '10px',
    height: '10px',
    borderRadius: '50%',
    border: 'none',
    cursor: 'pointer',
    transition: 'background-color 0.3s ease'
  },
  section: {
    padding: '80px 20px'
  },
  sectionHeader: {
    textAlign: 'center',
    marginBottom: '40px'
  },
  divider: {
    height: '3px',
    width: '60px',
    backgroundColor: 'var(--color-gold-light)',
    margin: '15px auto 0'
  },
  categoryGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '5px' /* Very tight gap like the image */
  },
  categoryCard: {
    display: 'flex',
    flexDirection: 'column',
    gap: '5px', /* Bring text closer to image */
    textDecoration: 'none',
    color: 'var(--color-text-main)',
    marginBottom: '15px' /* Give bottom spacing since grid gap is small */
  },
  categoryImgWrapper: {
    width: '100%',
    aspectRatio: '3/4',
    overflow: 'hidden',
    backgroundColor: '#f5f5f5' // placeholder if image fails
  },
  categoryImg: {
    width: '100%',
    height: '100%',
    objectFit: 'cover'
  },
  categoryTitleWrapper: {
    display: 'flex',
    justifyContent: 'flex-start',
    alignItems: 'center',
    gap: '8px',
    fontSize: '0.95rem',
    fontWeight: '500',
    fontFamily: 'var(--font-sans)',
    color: '#333'
  },
  productGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
    gap: '30px'
  },
  narrativeSection: {
    backgroundColor: 'var(--color-cream)',
    padding: '80px 0'
  },
  narrativeContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: '60px',
    flexWrap: 'wrap'
  },
  narrativeContent: {
    flex: '1 1 400px'
  },
  narrativeImage: {
    flex: '1 1 400px'
  }
};

export default Home;
