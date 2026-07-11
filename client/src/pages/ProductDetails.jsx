import React, { useState, useEffect, useContext } from 'react';
import toast from 'react-hot-toast';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, Heart, Truck, RotateCcw, ShieldCheck, Ruler, Tag, Zap, Box } from 'lucide-react';
import { CartContext } from '../context/CartContext';
import { WishlistContext } from '../context/WishlistContext';
import ProductCard from '../components/ProductCard';

const ProductDetails = () => {
  const { slug } = useParams();
  const [product, setProduct] = useState(null);
  const [related, setRelated] = useState([]);
  const [activeImage, setActiveImage] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [selectedSize, setSelectedSize] = useState('M 38');
  const [zoomStyle, setZoomStyle] = useState({ display: 'none' });

  const { addToCart } = useContext(CartContext);
  const { toggleWishlist, isInWishlist } = useContext(WishlistContext);
  const navigate = useNavigate();

  useEffect(() => {
    fetch(`/api/products/${slug}`)
      .then(res => res.json())
      .then(data => {
        setProduct(data);
        if (data.images && data.images.length > 0) {
          setActiveImage(data.images[0].image_url);
        }
        if (data.category_slug) {
          fetch(`/api/products?category=${data.category_slug}`)
            .then(res => res.json())
            .then(cats => setRelated(cats.filter(p => p.id !== data.id).slice(0, 4)));
        }
      })
      .catch(console.error);
    window.scrollTo(0, 0);
  }, [slug]);

  if (!product) return <div className="container" style={{ padding: '100px 0', textAlign: 'center' }}>Loading...</div>;

  const isLiked = isInWishlist(product.id);

  const handleAdd = async () => {
    if (product.stock >= quantity) {
      const success = await addToCart(product, quantity);
      if (success) {
        navigate('/cart');
      }
    } else {
      toast.error("Not enough stock!");
    }
  };

  const handleBuyNow = async () => {
    if (product.stock >= quantity) {
      const success = await addToCart(product, quantity);
      if (success) {
        navigate('/checkout');
      }
    } else {
      toast.error("Not enough stock!");
    }
  };

  return (
    <div className="animate-fade-in" style={{ backgroundColor: '#fff', paddingBottom: '0' }}>
      
      {/* Images Section (Edge to Edge) */}
      <div style={styles.imageSection}>
        <div style={styles.mainImageContainer}>
          <img src={activeImage} alt={product.name} style={styles.mainImage} />
        </div>
        {product.images && product.images.length > 1 && (
          <div style={styles.thumbnailList}>
            {Array.from(new Set(product.images.map(img => img.image_url))).map((url, idx, arr) => (
              arr.length > 1 ? (
                <img 
                  key={idx}
                  src={url} 
                  alt="thumbnail" 
                  style={{ ...styles.thumbnail, border: activeImage === url ? '1px solid #000' : 'none' }}
                  onClick={() => setActiveImage(url)}
                />
              ) : null
            ))}
          </div>
        )}
      </div>

      {/* Details Section */}
      <div style={styles.detailsContainer}>
        
        <h1 style={styles.title}>{product.name}</h1>
        
        <div style={styles.priceRow}>
          {product.offer_price ? (
            <>
              <span style={styles.originalPrice}>Rs. {product.price.toFixed(2)}</span>
              <span style={styles.offerPrice}>Rs. {product.offer_price.toFixed(2)}</span>
              <span style={styles.saleBadge}>Sale</span>
            </>
          ) : (
            <span style={styles.offerPrice}>Rs. {product.price.toFixed(2)}</span>
          )}
        </div>
        
        <div style={styles.shippingText}>Shipping calculated at checkout.</div>



        {/* Quantity */}
        <div style={styles.qtySection}>
          <div style={styles.label}>Quantity</div>
          <div style={styles.qtyBox}>
            <button 
              style={styles.qtyBtn} 
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
              disabled={product.stock === 0}
            >-</button>
            <input 
              type="number" 
              value={quantity} 
              onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
              style={styles.qtyInput}
              disabled={product.stock === 0}
            />
            <button 
              style={styles.qtyBtn} 
              onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
              disabled={product.stock === 0}
            >+</button>
          </div>
        </div>

        {/* Buttons */}
        <div style={styles.actions}>
          <button 
            style={styles.addToCartBtn}
            onClick={handleAdd}
            disabled={product.stock === 0}
          >
            Add to cart
          </button>

          <button 
            style={styles.buyNowBtn}
            onClick={handleBuyNow}
            disabled={product.stock === 0}
          >
            <Zap size={16} fill="#fff" style={{marginRight: '8px'}}/> Buy it now
          </button>
        </div>

        {/* Stock Indicator */}
        <div style={styles.stockRow}>
          {product.stock > 0 ? (
            <span style={{ color: '#555', fontSize: '0.9rem', display: 'flex', alignItems: 'center' }}>
              <span style={{width: '8px', height: '8px', backgroundColor: '#4caf50', borderRadius: '50%', display: 'inline-block', marginRight: '8px', boxShadow: '0 0 0 2px #e8f5e9'}}></span>
              {product.stock} in stock
            </span>
          ) : (
            <span style={{ color: 'red', fontSize: '0.9rem', display: 'flex', alignItems: 'center' }}>
              <span style={{width: '8px', height: '8px', backgroundColor: 'red', borderRadius: '50%', display: 'inline-block', marginRight: '8px'}}></span>
              Out of stock
            </span>
          )}
        </div>

        {/* Delivery Tracker UI */}
        <div style={styles.deliveryTracker}>
          <div style={styles.trackerLine}></div>
          <div style={styles.trackerSteps}>
            <div style={styles.trackerStep}>
              <div style={styles.trackerIconBox}>
                <ShoppingCart size={20} />
              </div>
              <div style={styles.trackerDate}>Jul 11th</div>
              <div style={styles.trackerDesc}>Ordered</div>
            </div>
            <div style={styles.trackerStep}>
              <div style={styles.trackerIconBox}>
                <Truck size={20} />
              </div>
              <div style={styles.trackerDate}>Jul 14th</div>
              <div style={styles.trackerDesc}>Order Ready</div>
            </div>
            <div style={styles.trackerStep}>
              <div style={styles.trackerIconBox}>
                <Box size={20} />
              </div>
              <div style={styles.trackerDate}>Jul 18th</div>
              <div style={styles.trackerDesc}>Delivered</div>
            </div>
          </div>
          <div style={styles.deliveryText}>
            <Truck size={16} style={{marginRight: '6px', verticalAlign: 'middle', display: 'inline-block'}} />
            Estimated delivery between <strong>Thursday July 16th</strong> and <strong>Monday July 20th</strong>
          </div>
        </div>

      </div>



    </div>
  );
};

const styles = {
  imageSection: {
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
    backgroundColor: '#fff',
    padding: '16px'
  },
  mainImageContainer: {
    width: '100%',
    aspectRatio: '1/1',
    backgroundColor: '#f5f5f5',
    overflow: 'hidden',
    borderRadius: '12px'
  },
  mainImage: {
    width: '100%',
    height: '100%',
    objectFit: 'cover'
  },
  thumbnailList: {
    display: 'flex',
    gap: '10px',
    padding: '0'
  },
  thumbnail: {
    flex: 1,
    aspectRatio: '1/1',
    objectFit: 'cover',
    cursor: 'pointer',
    borderRadius: '8px'
  },
  detailsContainer: {
    padding: '20px 16px',
    display: 'flex',
    flexDirection: 'column'
  },
  title: {
    fontSize: '1.2rem',
    fontFamily: 'var(--font-sans)',
    fontWeight: '700',
    color: '#111',
    lineHeight: 1.3,
    marginBottom: '10px'
  },
  priceRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    marginBottom: '5px'
  },
  originalPrice: {
    fontSize: '0.9rem',
    textDecoration: 'line-through',
    color: '#888'
  },
  offerPrice: {
    fontSize: '1.1rem',
    fontWeight: '500',
    color: '#111'
  },
  saleBadge: {
    backgroundColor: '#000',
    color: '#fff',
    fontSize: '0.7rem',
    fontWeight: 'bold',
    padding: '4px 10px',
    borderRadius: '20px',
    letterSpacing: '0.5px'
  },
  shippingText: {
    fontSize: '0.75rem',
    color: '#888',
    marginBottom: '20px'
  },
  label: {
    fontSize: '0.8rem',
    color: '#555',
    marginBottom: '8px'
  },
  sizeSection: {
    marginBottom: '15px'
  },
  sizeOptions: {
    display: 'flex',
    gap: '10px',
    marginBottom: '15px'
  },
  sizePill: {
    padding: '8px 16px',
    borderRadius: '20px',
    fontSize: '0.85rem',
    cursor: 'pointer',
    transition: 'all 0.2s ease'
  },
  sizeChartRow: {
    marginBottom: '15px'
  },
  sizeChartBtn: {
    background: 'none',
    border: 'none',
    borderBottom: '1px solid #111',
    padding: '0 0 2px 0',
    fontSize: '0.85rem',
    fontWeight: '500',
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    cursor: 'pointer'
  },
  promoText: {
    color: '#c27ba0',
    fontSize: '0.85rem',
    display: 'flex',
    alignItems: 'center',
    marginBottom: '25px',
    fontWeight: '500'
  },
  qtySection: {
    marginBottom: '25px'
  },
  qtyBox: {
    display: 'flex',
    border: '1px solid #ddd',
    width: '120px',
    height: '40px'
  },
  qtyBtn: {
    flex: 1,
    background: 'none',
    border: 'none',
    fontSize: '1.2rem',
    color: '#555',
    cursor: 'pointer'
  },
  qtyInput: {
    flex: 1,
    textAlign: 'center',
    border: 'none',
    width: '100%',
    padding: 0,
    fontSize: '0.95rem',
    color: '#333'
  },
  actions: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
    marginBottom: '20px'
  },
  addToCartBtn: {
    width: '100%',
    padding: '14px',
    backgroundColor: '#fff',
    border: '1px solid #000',
    color: '#000',
    fontSize: '1rem',
    fontWeight: '500',
    cursor: 'pointer'
  },
  buyNowBtn: {
    width: '100%',
    padding: '14px',
    backgroundColor: '#000',
    border: 'none',
    color: '#fff',
    fontSize: '1rem',
    fontWeight: '600',
    cursor: 'pointer',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center'
  },
  stockRow: {
    marginBottom: '30px'
  },
  deliveryTracker: {
    padding: '20px 0',
    position: 'relative'
  },
  trackerLine: {
    position: 'absolute',
    top: '45px',
    left: '10%',
    right: '10%',
    height: '2px',
    backgroundColor: '#111',
    zIndex: 1
  },
  trackerSteps: {
    display: 'flex',
    justifyContent: 'space-between',
    position: 'relative',
    zIndex: 2,
    marginBottom: '25px'
  },
  trackerStep: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    width: '80px'
  },
  trackerIconBox: {
    width: '50px',
    height: '50px',
    backgroundColor: '#e6ecee',
    borderRadius: '50%',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: '10px'
  },
  trackerDate: {
    fontSize: '0.8rem',
    fontWeight: '600',
    color: '#333',
    marginBottom: '4px'
  },
  trackerDesc: {
    fontSize: '0.7rem',
    color: '#777'
  },
  deliveryText: {
    fontSize: '0.85rem',
    color: '#555',
    lineHeight: 1.5,
    textAlign: 'center',
    marginTop: '10px'
  },
  bottomBanner: {
    backgroundColor: '#0a2351',
    color: '#fff',
    textAlign: 'center',
    padding: '15px',
    fontSize: '1rem',
    fontWeight: '500'
  }
};

export default ProductDetails;
