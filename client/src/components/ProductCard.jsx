import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCart, Heart } from 'lucide-react';
import { CartContext } from '../context/CartContext';
import { WishlistContext } from '../context/WishlistContext';

const ProductCard = ({ product }) => {
  const { addToCart } = useContext(CartContext);
  const { toggleWishlist, isInWishlist } = useContext(WishlistContext);

  const isLiked = isInWishlist(product.id);
  
  let stockBadge = null;
  if (product.offer_price && product.offer_price < product.price) {
    stockBadge = <span style={{ ...styles.badge, backgroundColor: '#000', color: '#fff' }}>Sale</span>;
  }

  const handleAddToCart = (e) => {
    e.preventDefault();
    if (product.stock > 0) {
      addToCart(product, 1);
    }
  };

  const handleWishlist = (e) => {
    e.preventDefault();
    toggleWishlist(product);
  };

  return (
    <Link to={`/product/${product.slug}`} style={styles.card}>
      <div style={styles.imageContainer}>
        {stockBadge}
        <img src={product.image} alt={product.name} style={styles.image} />
      </div>
      
      <div style={styles.content}>
        <h3 style={styles.title}>{product.name}</h3>
        <div style={styles.priceContainer}>
          {product.offer_price ? (
            <>
              <span style={styles.originalPrice}>Rs. {product.price.toFixed(2)}</span>
              <span style={styles.offerPrice}>Rs. {product.offer_price.toFixed(2)}</span>
            </>
          ) : (
            <span style={styles.offerPrice}>Rs. {product.price.toFixed(2)}</span>
          )}
        </div>
      </div>
    </Link>
  );
};

const styles = {
  card: {
    display: 'flex',
    flexDirection: 'column',
    backgroundColor: 'var(--color-white)',
    position: 'relative',
    textDecoration: 'none',
    borderRadius: '12px',
    boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
    overflow: 'hidden'
  },
  imageContainer: {
    position: 'relative',
    paddingTop: '120%', /* 4:5 Aspect Ratio */
    overflow: 'hidden',
    backgroundColor: '#f5f5f5'
  },
  image: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    objectFit: 'cover'
  },
  badge: {
    position: 'absolute',
    bottom: '8px',
    left: '8px',
    zIndex: 2,
    padding: '4px 12px',
    borderRadius: '20px',
    fontSize: '0.75rem',
    fontWeight: 'bold',
    letterSpacing: '0.5px'
  },
  content: {
    padding: '10px 12px 12px 12px',
    display: 'flex',
    flexDirection: 'column',
    gap: '6px'
  },
  title: {
    fontSize: '0.85rem',
    fontFamily: 'var(--font-sans)',
    fontWeight: '400',
    color: '#333',
    lineHeight: '1.4',
    display: '-webkit-box',
    WebkitLineClamp: 2,
    WebkitBoxOrient: 'vertical',
    overflow: 'hidden'
  },
  priceContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px'
  },
  offerPrice: {
    fontWeight: '500',
    color: '#111',
    fontSize: '0.95rem'
  },
  originalPrice: {
    textDecoration: 'line-through',
    color: '#888',
    fontSize: '0.85rem'
  }
};

export default ProductCard;
